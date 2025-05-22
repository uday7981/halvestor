import { supabase } from '../lib/supabase';
import { updateCashBalance } from './profileService';

export interface Order {
  id: string;
  user_id: string;
  stock_id: string;
  order_type: 'market' | 'limit';
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price_per_share: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  created_at: string;
  executed_at?: string;
  stock?: {
    ticker: string;
    name: string;
    price?: number;
  };
}

export interface MarketOrderParams {
  stock_id: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
}

/**
 * Place a market order
 */
export const placeMarketOrder = async (params: MarketOrderParams): Promise<{ data: Order | null, error: string | null, updatedCashBalance?: number }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }
    
    console.log('Placing market order for user:', userId);
    
    // Get the current stock price
    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('price')
      .eq('id', params.stock_id)
      .single();
    
    if (stockError) {
      console.error('Error fetching stock price:', stockError);
      return { data: null, error: `Error fetching stock price: ${stockError.message}` };
    }
    
    const currentPrice = stock.price;
    if (!currentPrice) {
      return { data: null, error: 'Stock price not available' };
    }
    
    // Calculate total amount
    const totalAmount = params.quantity * currentPrice;
    
    // Check if user has enough cash for buy orders
    if (params.transaction_type === 'buy') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cash_balance')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return { data: null, error: `Error fetching user profile: ${profileError.message}` };
      }
      
      const cashBalance = Number(profile.cash_balance || 0);
      if (cashBalance < totalAmount) {
        return { data: null, error: 'Insufficient funds to place this order' };
      }
    }
    
    // For sell orders, check if user has enough quantity
    if (params.transaction_type === 'sell') {
      const { data: holding, error: holdingError } = await supabase
        .from('holdings')
        .select('quantity')
        .eq('user_id', userId)
        .eq('stock_id', params.stock_id)
        .maybeSingle();
      
      if (holdingError && holdingError.code !== 'PGRST116') {
        console.error('Error checking holdings:', holdingError);
        return { data: null, error: `Error checking holdings: ${holdingError.message}` };
      }
      
      const quantity = Number(holding?.quantity || 0);
      if (quantity < params.quantity) {
        return { data: null, error: 'Not enough quantity to sell' };
      }
    }
    
    // Start a transaction by creating the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        stock_id: params.stock_id,
        order_type: 'market',
        transaction_type: params.transaction_type,
        quantity: params.quantity,
        price_per_share: currentPrice,
        status: 'completed',
        executed_at: new Date().toISOString()
      })
      .select('*')
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return { data: null, error: `Error creating order: ${orderError.message}` };
    }
    
    console.log('Order created:', order.id);
    
    // Record the transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        order_id: order.id,
        user_id: userId,
        stock_id: params.stock_id,
        transaction_type: params.transaction_type,
        quantity: params.quantity,
        price_per_share: currentPrice,
        total_amount: totalAmount
      });
    
    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // Even if transaction recording fails, continue with the process
    }
    
    // Update holdings
    if (params.transaction_type === 'buy') {
      // Check if user already has holdings for this stock
      const { data: existingHolding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('stock_id', params.stock_id)
        .maybeSingle();
      
      if (holdingError && holdingError.code !== 'PGRST116') {
        console.error('Error checking holdings:', holdingError);
        // Continue even if there's an error
      }
      
      if (existingHolding) {
        // Update existing holding
        const newShares = Number(existingHolding.quantity || 0) + Number(params.quantity);
        
        const { error: updateError } = await supabase
          .from('holdings')
          .update({
            quantity: newShares
          })
          .eq('id', existingHolding.id);
        
        if (updateError) {
          console.error('Error updating holdings:', updateError);
          // Continue even if there's an error
        }
      } else {
        // Create new holding
        const { error: insertError } = await supabase
          .from('holdings')
          .insert({
            user_id: userId,
            stock_id: params.stock_id,
            quantity: Number(params.quantity)
          });
        
        if (insertError) {
          console.error('Error creating holdings:', insertError);
          // Continue even if there's an error
        }
      }
      
      // Get current cash balance
      const { data: currentProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('cash_balance')
        .eq('id', userId)
        .single();
      
      if (profileFetchError) {
        console.error('Error fetching current cash balance:', profileFetchError);
      } else {
        // Calculate new balance (deduct for buy)
        const currentBalance = Number(currentProfile?.cash_balance || 0);
        const newBalance = Math.max(0, currentBalance - totalAmount);
        console.log('Updating cash balance from', currentBalance, 'to', newBalance);
        
        // Update cash balance using the dedicated function
        const { success, error: balanceError } = await updateCashBalance(newBalance);
        
        if (!success) {
          console.error('Error updating cash balance:', balanceError);
          // Continue even if there's an error
        } else {
          console.log('Cash balance updated successfully to', newBalance);
        }
      }
    } else if (params.transaction_type === 'sell') {
      // Update holdings for sell
      const { data: existingHolding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', userId)
        .eq('stock_id', params.stock_id)
        .single();
      
      if (holdingError) {
        console.error('Error checking holdings for sell:', holdingError);
        // Continue even if there's an error
      } else {
        // Update holding
        const newShares = Number(existingHolding.quantity || 0) - Number(params.quantity);
        
        if (newShares > 0) {
          // Update existing holding
          const { error: updateError } = await supabase
            .from('holdings')
            .update({
              quantity: newShares
            })
            .eq('id', existingHolding.id);
          
          if (updateError) {
            console.error('Error updating holdings for sell:', updateError);
            // Continue even if there's an error
          }
        } else {
          // Remove holding if quantity is zero
          const { error: deleteError } = await supabase
            .from('holdings')
            .delete()
            .eq('id', existingHolding.id);
          
          if (deleteError) {
            console.error('Error deleting holdings:', deleteError);
            // Continue even if there's an error
          }
        }
      }
      
      // Get current cash balance
      const { data: currentProfile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('cash_balance')
        .eq('id', userId)
        .single();
      
      if (profileFetchError) {
        console.error('Error fetching current cash balance:', profileFetchError);
      } else {
        // Calculate new balance (add for sell)
        const currentBalance = Number(currentProfile?.cash_balance || 0);
        const newBalance = currentBalance + totalAmount;
        console.log('Updating cash balance from', currentBalance, 'to', newBalance);
        
        // Update cash balance using the dedicated function
        const { success, error: balanceError } = await updateCashBalance(newBalance);
        
        if (!success) {
          console.error('Error updating cash balance:', balanceError);
          // Continue even if there's an error
        } else {
          console.log('Cash balance updated successfully to', newBalance);
        }
      }
    }
    
    // Fetch the stock details
    const { data: stockDetails, error: stockFetchError } = await supabase
      .from('stocks')
      .select('ticker, name, price')
      .eq('id', order.stock_id)
      .single();
    
    if (stockFetchError) {
      console.error('Error fetching stock details:', stockFetchError);
      // Return the order without stock details
      return { data: order, error: null };
    }
    
    // Fetch the updated cash balance
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .select('cash_balance')
      .eq('id', userId)
      .single();
    
    let updatedCashBalance;
    if (!profileError && updatedProfile) {
      updatedCashBalance = updatedProfile.cash_balance;
    }
    
    // Combine the order and stock information
    return { 
      data: {
        ...order,
        stock: stockDetails
      }, 
      error: null,
      updatedCashBalance 
    };
  } catch (error) {
    console.error('Error placing market order:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Get user orders
 */
export const getUserOrders = async (): Promise<{ data: Order[] | null, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }
    
    // First get the orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (ordersError) throw ordersError;
    
    if (!orders || orders.length === 0) {
      return { data: [], error: null };
    }
    
    // Get all unique stock IDs from the orders
    const stockIds = [...new Set(orders.map(order => order.stock_id))];
    
    // Fetch all stocks in one query
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('id, ticker, name, price')
      .in('id', stockIds);
    
    if (stocksError) {
      console.error('Error fetching stocks for orders:', stocksError);
      // Return orders without stock details
      return { data: orders, error: null };
    }
    
    // Create a map of stock_id to stock details for quick lookup
    const stockMap: Record<string, any> = {};
    stocks.forEach(stock => {
      stockMap[stock.id] = stock;
    });
    
    // Combine orders with their stock information
    const ordersWithStocks = orders.map(order => ({
      ...order,
      stock: stockMap[order.stock_id] || null
    }));
    
    return { data: ordersWithStocks, error: null };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: string): Promise<{ data: Order | null, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }
    
    // Get the order
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    
    // Get the stock details
    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('ticker, name, price')
      .eq('id', order.stock_id)
      .single();
    
    if (stockError) {
      console.error('Error fetching stock for order:', stockError);
      // Return order without stock details
      return { data: order, error: null };
    }
    
    // Combine order with stock information
    return { 
      data: {
        ...order,
        stock
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error fetching order:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Cancel a pending order
 */
export const cancelOrder = async (orderId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    // Check if the order is pending and belongs to the user
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    if (order.status !== 'pending') {
      return { success: false, error: `Cannot cancel order with status: ${order.status}` };
    }
    
    // Update the order status to cancelled
    const { error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
