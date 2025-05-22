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

// Sample stock data to update (using only existing columns)
const stockUpdates = [
  {
    ticker: 'AAPL',
    price: 202.09,
    change_percent: -1.50,
    last_updated: new Date().toISOString()
  },
  {
    ticker: 'NVDA',
    price: 131.80,
    change_percent: -0.95,
    last_updated: new Date().toISOString()
  },
  {
    ticker: 'TSLA',
    price: 334.62,
    change_percent: -2.85,
    last_updated: new Date().toISOString()
  }
];

async function updateStocks() {
  try {
    console.log('Starting basic stock update...');
    
    // Update stocks one by one to better track errors
    for (const stock of stockUpdates) {
      console.log(`Updating ${stock.ticker}...`);
      
      const { error } = await supabase
        .from('stocks')
        .update({
          price: stock.price,
          change_percent: stock.change_percent,
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
