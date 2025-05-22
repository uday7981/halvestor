// Supabase Edge Function for processing market orders
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Helper function to process a market order directly
async function processMarketOrder(supabase: any, order: any, currentPrice: number) {
  console.log('Processing market order directly')
  console.log('Order ID:', order.id)
  console.log('User ID:', order.user_id)
  console.log('Stock ID:', order.stock_id)
  console.log('Transaction Type:', order.transaction_type)
  console.log('Quantity:', order.quantity)
  console.log('Current Price:', currentPrice)
  
  // Calculate total amount
  const totalAmount = Number(order.quantity) * currentPrice
  console.log('Total Amount:', totalAmount)
  
  try {
    // Step 1: Update the order status to completed
    console.log('Updating order status to completed')
    const { error: updateOrderError } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        price_per_share: currentPrice,
        executed_at: new Date().toISOString()
      })
      .eq('id', order.id)
    
    if (updateOrderError) {
      console.error('Error updating order status:', updateOrderError)
      throw new Error(`Error updating order status: ${updateOrderError.message}`)
    }
    
    // Step 2: Insert the transaction record
    console.log('Recording transaction with explicit user_id:', order.user_id)
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        order_id: order.id,
        user_id: order.user_id,
        stock_id: order.stock_id,
        transaction_type: order.transaction_type,
        quantity: order.quantity,
        price_per_share: currentPrice,
        total_amount: totalAmount
      })
    
    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      throw new Error(`Error recording transaction: ${transactionError.message}`)
    }
    
    console.log('Transaction recorded successfully')
    
    // Step 3: Update holdings
    if (order.transaction_type === 'buy') {
      await handleBuyTransaction(supabase, order.user_id, order.stock_id, order.quantity, currentPrice)
    } else if (order.transaction_type === 'sell') {
      await handleSellTransaction(supabase, order.user_id, order.stock_id, order.quantity)
    }
    
    // Step 4: Update user's cash balance in profiles table
    await updateCashBalance(supabase, order.user_id, totalAmount, order.transaction_type === 'buy')
    
    console.log('Market order processed successfully')
    return true
  } catch (error) {
    console.error('Error processing market order:', error)
    throw error
  }
}

// Helper function to handle buy transactions
async function handleBuyTransaction(supabase: any, userId: string, stockId: string, quantity: number, price: number) {
  console.log('Handling buy transaction for user:', userId)
  
  // Check if user already has holdings for this stock
  const { data: existingHolding, error: holdingError } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .eq('stock_id', stockId)
    .maybeSingle()
  
  if (holdingError && holdingError.code !== 'PGRST116') {
    console.error('Error checking holdings:', holdingError)
    throw new Error(`Error checking holdings: ${holdingError.message}`)
  }
  
  if (existingHolding) {
    // Update existing holding
    const newShares = Number(existingHolding.shares || 0) + Number(quantity)
    
    const { error: updateError } = await supabase
      .from('holdings')
      .update({
        shares: newShares,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingHolding.id)
    
    if (updateError) {
      console.error('Error updating holdings:', updateError)
      throw new Error(`Error updating holdings: ${updateError.message}`)
    }
  } else {
    // Create new holding
    const { error: insertError } = await supabase
      .from('holdings')
      .insert({
        user_id: userId,
        stock_id: stockId,
        shares: Number(quantity)
      })
    
    if (insertError) {
      console.error('Error creating holdings:', insertError)
      throw new Error(`Error creating holdings: ${insertError.message}`)
    }
  }
}

// Helper function to handle sell transactions
async function handleSellTransaction(supabase: any, userId: string, stockId: string, quantity: number) {
  console.log('Handling sell transaction for user:', userId)
  
  // Check if user has enough shares to sell
  const { data: existingHolding, error: holdingError } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', userId)
    .eq('stock_id', stockId)
    .single()
  
  if (holdingError) {
    console.error('Error checking holdings for sell:', holdingError)
    throw new Error(`Error checking holdings for sell: ${holdingError.message}`)
  }
  
  if (!existingHolding || Number(existingHolding.shares || 0) < Number(quantity)) {
    throw new Error('Not enough shares to sell')
  }
  
  // Update holding
  const newShares = Number(existingHolding.shares || 0) - Number(quantity)
  
  if (newShares > 0) {
    // Update existing holding
    const { error: updateError } = await supabase
      .from('holdings')
      .update({
        shares: newShares,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingHolding.id)
    
    if (updateError) {
      console.error('Error updating holdings for sell:', updateError)
      throw new Error(`Error updating holdings for sell: ${updateError.message}`)
    }
  } else {
    // Remove holding if quantity is zero
    const { error: deleteError } = await supabase
      .from('holdings')
      .delete()
      .eq('id', existingHolding.id)
    
    if (deleteError) {
      console.error('Error deleting holdings:', deleteError)
      throw new Error(`Error deleting holdings: ${deleteError.message}`)
    }
  }
}

// Helper function to update cash balance
async function updateCashBalance(supabase: any, userId: string, amount: number, isDebit: boolean) {
  console.log('Updating cash balance for user:', userId)
  
  // Get current balance
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('cash_balance')
    .eq('id', userId)
    .single()
  
  if (profileError) {
    console.error('Error fetching profile:', profileError)
    throw new Error(`Error fetching profile: ${profileError.message}`)
  }
  
  let currentBalance = Number(profile.cash_balance || 0)
  
  if (isDebit) {
    // Check if user has enough funds
    if (currentBalance < amount) {
      throw new Error('Insufficient funds')
    }
    
    // Debit (reduce) balance
    currentBalance -= amount
  } else {
    // Credit (increase) balance
    currentBalance += amount
  }
  
  // Update profile
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      cash_balance: currentBalance
    })
    .eq('id', userId)
  
  if (updateError) {
    console.error('Error updating cash balance:', updateError)
    throw new Error(`Error updating cash balance: ${updateError.message}`)
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { orderId } = await req.json()
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Processing order:', orderId)
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Get order details
    console.log('Fetching order details for orderId:', orderId)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
    
    console.log('Order details:', JSON.stringify(order, null, 2))
    
    if (orderError) {
      console.error('Error fetching order:', orderError)
      return new Response(
        JSON.stringify({ success: false, error: `Error fetching order: ${orderError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Get stock details
    const { data: stock, error: stockError } = await supabase
      .from('stocks')
      .select('*')
      .eq('id', order.stock_id)
      .single()
    
    if (stockError) {
      console.error('Error fetching stock:', stockError)
      return new Response(
        JSON.stringify({ success: false, error: `Error fetching stock: ${stockError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Use current stock price
    const currentPrice = stock.price
    
    // Process based on transaction type
    if (order.transaction_type === 'buy') {
      // Check if user already has holdings for this stock
      const { data: existingHolding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('stock_id', order.stock_id)
        .maybeSingle()
      
      if (holdingError && holdingError.code !== 'PGRST116') {
        console.error('Error checking holdings:', holdingError)
        return new Response(
          JSON.stringify({ success: false, error: `Error checking holdings: ${holdingError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (existingHolding) {
        // Update existing holding
        const newQuantity = Number(existingHolding.quantity) + Number(order.quantity)
        const newAveragePrice = (
          (Number(existingHolding.quantity) * Number(existingHolding.average_price)) + 
          (Number(order.quantity) * currentPrice)
        ) / newQuantity
        
        const { error: updateError } = await supabase
          .from('holdings')
          .update({
            quantity: newQuantity,
            average_price: newAveragePrice
          })
          .eq('id', existingHolding.id)
        
        if (updateError) {
          console.error('Error updating holdings:', updateError)
          return new Response(
            JSON.stringify({ success: false, error: `Error updating holdings: ${updateError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        // Create new holding
        const { error: insertError } = await supabase
          .from('holdings')
          .insert({
            user_id: order.user_id,
            stock_id: order.stock_id,
            quantity: order.quantity,
            average_price: currentPrice
          })
        
        if (insertError) {
          console.error('Error creating holdings:', insertError)
          return new Response(
            JSON.stringify({ success: false, error: `Error creating holdings: ${insertError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    } else if (order.transaction_type === 'sell') {
      // Check if user has enough shares to sell
      const { data: existingHolding, error: holdingError } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', order.user_id)
        .eq('stock_id', order.stock_id)
        .single()
      
      if (holdingError) {
        console.error('Error checking holdings for sell:', holdingError)
        return new Response(
          JSON.stringify({ success: false, error: `Error checking holdings for sell: ${holdingError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      if (!existingHolding || Number(existingHolding.quantity) < Number(order.quantity)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Not enough shares to sell' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Update holding
      const newQuantity = Number(existingHolding.quantity) - Number(order.quantity)
      
      if (newQuantity > 0) {
        // Update existing holding
        const { error: updateError } = await supabase
          .from('holdings')
          .update({
            quantity: newQuantity
          })
          .eq('id', existingHolding.id)
        
        if (updateError) {
          console.error('Error updating holdings for sell:', updateError)
          return new Response(
            JSON.stringify({ success: false, error: `Error updating holdings for sell: ${updateError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } else {
        // Remove holding if quantity is zero
        const { error: deleteError } = await supabase
          .from('holdings')
          .delete()
          .eq('id', existingHolding.id)
        
        if (deleteError) {
          console.error('Error deleting holdings:', deleteError)
          return new Response(
            JSON.stringify({ success: false, error: `Error deleting holdings: ${deleteError.message}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }
    
    // Check if user_id is null or undefined
    if (!order.user_id) {
      console.error('ERROR: order.user_id is null or undefined!')
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is missing from the order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    try {
      // Process the market order using our helper function
      await processMarketOrder(supabase, order, currentPrice)
    } catch (error) {
      console.error('Error in market order processing:', error)
      return new Response(
        JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          status: 'completed',
          price_per_share: currentPrice,
          total_amount: currentPrice * order.quantity
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing market order:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
