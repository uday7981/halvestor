const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample stock data to update (replace with your actual data)
const stockUpdates = [
  {
    ticker: 'AAPL',
    price: 202.09,
    change_percent: -1.50,
    volume: 59211774,
    high: 207.04,
    low: 200.71,
    open: 205.17,
    date: '2025-05-21T00:00:00+0000',
    adj_close: 202.09,
    adj_high: 207.04,
    adj_low: 200.71,
    adj_open: 205.17,
    last_updated: new Date().toISOString()
  },
  {
    ticker: 'NVDA',
    price: 131.80,
    change_percent: -0.95,
    volume: 270608738,
    high: 137.40,
    low: 130.59,
    open: 133.06,
    date: '2025-05-21T00:00:00+0000',
    adj_close: 131.80,
    adj_high: 137.40,
    adj_low: 130.59,
    adj_open: 133.06,
    last_updated: new Date().toISOString()
  },
  {
    ticker: 'TSLA',
    price: 334.62,
    change_percent: -2.85,
    volume: 102354844,
    high: 347.35,
    low: 332.20,
    open: 344.43,
    date: '2025-05-21T00:00:00+0000',
    adj_close: 334.62,
    adj_high: 347.35,
    adj_low: 332.20,
    adj_open: 344.43,
    last_updated: new Date().toISOString()
  }
];

async function updateStocks() {
  try {
    console.log('Starting direct stock update...');
    
    // First, run the migration to ensure the columns exist
    console.log('Checking if we need to add new columns...');
    const { error: migrationError } = await supabase.rpc('run_sql', { 
      sql: `
        ALTER TABLE public.stocks 
          ADD COLUMN IF NOT EXISTS volume BIGINT,
          ADD COLUMN IF NOT EXISTS high DECIMAL(18, 4),
          ADD COLUMN IF NOT EXISTS low DECIMAL(18, 4),
          ADD COLUMN IF NOT EXISTS open DECIMAL(18, 4),
          ADD COLUMN IF NOT EXISTS date TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS adj_close DECIMAL(18, 4),
          ADD COLUMN IF NOT EXISTS adj_high DECIMAL(18, 4),
          ADD COLUMN IF NOT EXISTS adj_low DECIMAL(18, 4),
          ADD COLUMN IF NOT EXISTS adj_open DECIMAL(18, 4),
          ADD COLUMN IF NOT EXISTS exchange_country TEXT;
      `
    });
    
    if (migrationError) {
      console.error('Error adding columns:', migrationError);
      // Continue anyway, as columns might already exist
    } else {
      console.log('Columns added successfully or already exist');
    }
    
    // Update stocks one by one to better track errors
    for (const stock of stockUpdates) {
      console.log(`Updating ${stock.ticker}...`);
      
      const { error } = await supabase
        .from('stocks')
        .update({
          price: stock.price,
          change_percent: stock.change_percent,
          volume: stock.volume,
          high: stock.high,
          low: stock.low,
          open: stock.open,
          date: stock.date,
          adj_close: stock.adj_close,
          adj_high: stock.adj_high,
          adj_low: stock.adj_low,
          adj_open: stock.adj_open,
          last_updated: stock.last_updated
        })
        .eq('ticker', stock.ticker);
      
      if (error) {
        console.error(`Error updating ${stock.ticker}:`, error);
      } else {
        console.log(`Successfully updated ${stock.ticker}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Stock update completed');
  } catch (error) {
    console.error('Error updating stocks:', error);
  }
}

// Run the update function
updateStocks()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
