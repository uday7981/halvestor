// Follow this Deno deployment guide: https://supabase.com/docs/guides/functions/deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Get environment variables
const MARKETSTACK_API_KEY = Deno.env.get('MARKETSTACK_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Create a Supabase client with the service role key
const supabase = createClient(
  SUPABASE_URL || '', 
  SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Helper function to map ticker symbols to MarketStack format if needed
const getMarketStackSymbol = (ticker: string, market: string): string => {
  // For US markets, use the ticker as is
  if (market === 'NYSE' || market === 'NASDAQ' || market === 'US') {
    return ticker;
  }
  
  // For UK/LSE stocks, try to convert to a format MarketStack understands
  if (market === 'LSE' || market === 'UK') {
    // If it's already in a format with .L suffix, use it
    if (ticker.endsWith('.L')) {
      return ticker;
    }
    
    // If it's in the 0XXX-LN format, try to extract the base ticker
    if (ticker.includes('-LN')) {
      // Return a common format for UK stocks
      return ticker.replace('-LN', '') + '.L';
    }
    
    // Default fallback - add .L suffix
    return ticker + '.L';
  }
  
  // Default - return ticker as is
  return ticker;
};

serve(async (req) => {
  try {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers });
    }
    
    // Fetch all stocks from the database
    console.log('Fetching all stocks from database');
    const { data: stocks, error: dbError } = await supabase
      .from('stocks')
      .select('ticker, name, market')
      .throwOnError();
    
    if (dbError) {
      console.error('Error fetching stocks from database:', dbError);
      return new Response(
        JSON.stringify({ error: 'Database error fetching stocks', details: dbError }),
        { headers, status: 500 }
      );
    }
    
    if (!stocks || stocks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No stocks found in database' }),
        { headers, status: 404 }
      );
    }
    
    console.log(`Found ${stocks.length} stocks in database`);
    
    // Process stocks in batches of 10 to avoid rate limits
    const batchSize = 10;
    const allUpdates = [];
    const allResults = [];
    
    for (let i = 0; i < stocks.length; i += batchSize) {
      const batch = stocks.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(stocks.length/batchSize)}`);
      
      // Map database tickers to MarketStack format
      const marketStackSymbols = batch.map((stock) => {
        const msSymbol = getMarketStackSymbol(stock.ticker, stock.market);
        console.log(`Mapping ${stock.ticker} (${stock.market}) to ${msSymbol}`);
        return msSymbol;
      });
      
      // Join symbols for API call
      const symbolsString = marketStackSymbols.join(',');
      // Use more comprehensive endpoint with additional data
      // Include exchange info, dividends, and splits data
      const apiUrl = `https://api.marketstack.com/v1/eod/latest?symbols=${symbolsString}&access_key=${MARKETSTACK_API_KEY}&limit=1000&include=exchange,dividends,splits`;
      
      console.log(`Fetching data from MarketStack for symbols: ${symbolsString}`);
      console.log(`API URL: ${apiUrl.replace(MARKETSTACK_API_KEY || '', '[REDACTED]')}`);
      
      try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MarketStack API error: ${response.status}`, errorText);
          continue; // Skip this batch but continue with others
        }

        const marketStackData = await response.json();
        
        if (!marketStackData.data || !Array.isArray(marketStackData.data)) {
          console.error('Invalid response from MarketStack API:', JSON.stringify(marketStackData));
          continue; // Skip this batch but continue with others
        }
        
        console.log(`Received data for ${marketStackData.data.length} symbols from MarketStack`);

        // Create a mapping from MarketStack symbols back to our database tickers
        const symbolToTickerMap = new Map();
        batch.forEach((stock, index) => {
          symbolToTickerMap.set(marketStackSymbols[index], stock.ticker);
        });

        // Prepare database updates
        const updates = [];
        for (const stock of marketStackData.data) {
          // Get the original ticker from our database
          const originalTicker = symbolToTickerMap.get(stock.symbol) || stock.symbol;
          
          // Calculate price change percentage
          const priceChangePercent = stock.open > 0 
            ? ((stock.close - stock.open) / stock.open) * 100 
            : 0;

          // Get additional data from MarketStack
          const volume = stock.volume || 0;
          const high = stock.high || stock.close;
          const low = stock.low || stock.close;
          const date = stock.date || new Date().toISOString();
          const open = stock.open || stock.close;
          const adjClose = stock.adj_close || stock.close;
          const adjHigh = stock.adj_high || high;
          const adjLow = stock.adj_low || low;
          const adjOpen = stock.adj_open || open;
          
          // Get exchange data if available
          const exchange = stock.exchange || {};
          const exchangeName = exchange.name || stock.exchange_name || '';
          const exchangeMic = exchange.mic || '';
          const exchangeCountry = exchange.country || '';
          
          // Get latest dividend info if available
          let dividendInfo = null;
          if (stock.dividends && Array.isArray(stock.dividends) && stock.dividends.length > 0) {
            // Sort by date descending to get the most recent dividend
            const latestDividend = stock.dividends.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];
            dividendInfo = {
              amount: latestDividend.amount,
              date: latestDividend.date,
              yield: latestDividend.yield
            };
          }
          
          // Get latest split info if available
          let splitInfo = null;
          if (stock.splits && Array.isArray(stock.splits) && stock.splits.length > 0) {
            // Sort by date descending to get the most recent split
            const latestSplit = stock.splits.sort((a: any, b: any) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0];
            splitInfo = {
              ratio: latestSplit.ratio,
              date: latestSplit.date,
              to_factor: latestSplit.to_factor,
              from_factor: latestSplit.from_factor
            };
          }

          // Create stock data object with more comprehensive data
          const stockData: Record<string, any> = {
            ticker: originalTicker, // Use our database ticker
            price: stock.close,
            change_percent: priceChangePercent,
            last_updated: new Date().toISOString()
          };
          
          // Add name and market data
          if (stock.symbol) {
            if (exchangeName) {
              stockData.name = `${stock.symbol} (${exchangeName})`;
            } else {
              stockData.name = stock.symbol;
            }
          }
          
          if (exchangeMic) {
            stockData.market = exchangeMic;
          } else if (stock.exchange) {
            stockData.market = stock.exchange;
          }
          
          // Add price data
          if (volume) stockData.volume = volume;
          if (high) stockData.high = high;
          if (low) stockData.low = low;
          if (open) stockData.open = open;
          if (date) stockData.date = date;
          if (adjClose) stockData.adj_close = adjClose;
          if (adjHigh) stockData.adj_high = adjHigh;
          if (adjLow) stockData.adj_low = adjLow;
          if (adjOpen) stockData.adj_open = adjOpen;
          
          // Add exchange data
          if (exchangeCountry) stockData.exchange_country = exchangeCountry;
          
          // Add dividend and split data to about_stock if they exist
          if (dividendInfo || splitInfo) {
            // First, fetch the current about_stock data to preserve existing fields
            try {
              const { data: currentStock } = await supabase
                .from('stocks')
                .select('about_stock')
                .eq('ticker', originalTicker)
                .single();
              
              // Create a new about_stock object, preserving existing data
              const aboutStock = currentStock?.about_stock || {};
              
              // Add dividend and split info
              if (dividendInfo) aboutStock.latest_dividend = dividendInfo;
              if (splitInfo) aboutStock.latest_split = splitInfo;
              
              // Update the stockData with the new about_stock
              stockData.about_stock = aboutStock;
            } catch (error) {
              console.error(`Error fetching about_stock for ${originalTicker}:`, error);
              // If we can't fetch the current data, just add the new data
              const aboutStock: Record<string, any> = {};
              if (dividendInfo) aboutStock.latest_dividend = dividendInfo;
              if (splitInfo) aboutStock.latest_split = splitInfo;
              stockData.about_stock = aboutStock;
            }
          }

          // Add to database updates
          updates.push(stockData);
          allResults.push(stockData);
        }

        // Update database in batch
        if (updates.length > 0) {
          console.log(`Updating ${updates.length} stocks in database`);
          console.log('Update data sample:', JSON.stringify(updates[0]));
          
          try {
            const { error } = await supabase
              .from('stocks')
              .upsert(updates, { 
                onConflict: 'ticker',
                ignoreDuplicates: false
              })
              .throwOnError();
              
            if (error) {
              throw error;
            }
            
            console.log(`Successfully updated ${updates.length} stocks in database`);
            allUpdates.push(...updates);
          } catch (dbError) {
            console.error('Error updating stock prices in database:', dbError);
          }
        } else {
          console.log('No updates to apply to database for this batch');
        }
      } catch (error) {
        console.error(`Error processing batch ${Math.floor(i/batchSize) + 1}:`, error);
        // Continue with next batch
      }
      
      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < stocks.length) {
        console.log('Waiting 1 second before processing next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Stock price update completed',
        total_stocks: stocks.length,
        updated_stocks: allUpdates.length,
        sample_data: allResults.slice(0, 5) // Return sample of updated data
      }),
      { headers, status: 200 }
    );
  } catch (error) {
    console.error('Error in update-stock-prices function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : null
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }, 
        status: 500 
      }
    );
  }
});
