import { supabase } from '../lib/supabase';

export interface Holding {
  id: string;
  user_id: string;
  stock_id: string;
  quantity: number;
  average_price: number;
  created_at: string;
  updated_at: string;
  stock?: {
    ticker: string;
    name: string;
    price?: number;
    change_percent?: number;
    is_compliant: boolean;
  };
}

/**
 * Get all holdings for the current user
 */
export const getUserHoldings = async (): Promise<{ data: Holding[] | null, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get holdings without joining the stock table
    const { data: holdings, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .gt('quantity', 0); // Only get holdings with quantity > 0

    if (error) {
      console.error('Error fetching holdings:', error);
      return { data: null, error: error.message };
    }

    if (!holdings || holdings.length === 0) {
      return { data: [], error: null };
    }

    // Get all unique stock IDs from the holdings
    const stockIds = [...new Set(holdings.map(holding => holding.stock_id))];

    // Fetch all stocks in one query
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('id, ticker, name, price, change_percent, is_compliant')
      .in('id', stockIds);

    if (stocksError) {
      console.error('Error fetching stocks for holdings:', stocksError);
      // Return holdings without stock details
      return { data: holdings, error: null };
    }

    // Create a map of stock_id to stock details for quick lookup
    const stockMap: Record<string, any> = {};
    stocks.forEach(stock => {
      stockMap[stock.id] = stock;
    });

    // Combine holdings with their stock information
    const holdingsWithStocks = holdings.map(holding => ({
      ...holding,
      stock: stockMap[holding.stock_id] || null
    }));

    return { data: holdingsWithStocks, error: null };
  } catch (error) {
    console.error('Error fetching user holdings:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get a specific holding by stock ID
 */
export const getHoldingByStockId = async (stockId: string): Promise<{ data: Holding | null, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get the holding without joining the stock table
    const { data: holding, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('stock_id', stockId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return { data: null, error: null };
      }
      console.error('Error fetching holding:', error);
      return { data: null, error: error.message };
    }

    // Fetch the stock information separately
    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('ticker, name, price, change_percent, is_compliant')
      .eq('id', stockId)
      .single();

    if (stockError) {
      console.error('Error fetching stock details:', stockError);
      // Return the holding without stock details
      return { data: holding, error: null };
    }

    // Combine the holding and stock information
    return {
      data: {
        ...holding,
        stock: stock
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching holding:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get a specific holding by ticker symbol
 */
export const getHoldingByTicker = async (ticker: string): Promise<{ data: Holding | null, error: string | null }> => {
  try {
    console.log('Fetching user holdings for ticker:', ticker);
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    // First, get the stock ID from the ticker
    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('id, ticker, name, price, change_percent, is_compliant')
      .eq('ticker', ticker.toUpperCase())
      .single();

    if (stockError) {
      console.error('Error fetching stock by ticker:', stockError);
      return { data: null, error: `Stock not found: ${ticker}` };
    }

    if (!stock) {
      return { data: null, error: `Stock not found: ${ticker}` };
    }

    // Now get the holding using the stock ID
    const { data: holding, error } = await supabase
      .from('holdings')
      .select('*')
      .eq('user_id', userId)
      .eq('stock_id', stock.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return { data: null, error: null };
      }
      console.error('Error fetching holding by ticker:', error);
      return { data: null, error: error.message };
    }

    // Combine the holding and stock information
    return {
      data: {
        ...holding,
        stock: stock
      },
      error: null
    };
  } catch (error) {
    console.error('Exception in fetchUserHolding:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Clean up any holdings with zero quantity
 */
export const cleanupZeroHoldings = async (): Promise<{ success: boolean, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;
    
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    console.log('Cleaning up zero quantity holdings for user:', userId);
    
    // Find any holdings with zero or negative quantity
    const { data: zeroHoldings, error: findError } = await supabase
      .from('holdings')
      .select('id, stock_id, quantity')
      .eq('user_id', userId)
      .lte('quantity', 0); // Less than or equal to 0
    
    if (findError) {
      console.error('Error finding zero holdings:', findError);
      return { success: false, error: findError.message };
    }
    
    console.log(`Found ${zeroHoldings?.length || 0} holdings with zero or negative quantity`);
    
    if (zeroHoldings && zeroHoldings.length > 0) {
      // Delete all zero holdings
      const holdingIds = zeroHoldings.map(h => h.id);
      console.log('Deleting holdings with IDs:', holdingIds);
      
      const { error: deleteError } = await supabase
        .from('holdings')
        .delete()
        .in('id', holdingIds);
      
      if (deleteError) {
        console.error('Error deleting zero holdings:', deleteError);
        return { success: false, error: deleteError.message };
      }
      
      console.log(`Successfully deleted ${holdingIds.length} zero quantity holdings`);
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error cleaning up zero holdings:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Calculate the total portfolio value
 */
export const calculatePortfolioValue = async (): Promise<{ totalValue: number, totalCost: number, error: string | null }> => {
  try {
    const { data: holdings, error } = await getUserHoldings();

    if (error) throw new Error(error);

    if (!holdings || holdings.length === 0) {
      return { totalValue: 0, totalCost: 0, error: null };
    }

    let totalValue = 0;
    let totalCost = 0;

    holdings.forEach(holding => {
      const currentPrice = holding.stock?.price || holding.average_price;
      totalValue += holding.quantity * currentPrice;
      totalCost += holding.quantity * holding.average_price;
    });

    return { totalValue, totalCost, error: null };
  } catch (error) {
    console.error('Error calculating portfolio value:', error);
    return {
      totalValue: 0,
      totalCost: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
