# Halvestor Stock Data Setup

This guide explains how to set up the dynamic stock data feature for the Halvestor app.

## Database Setup

1. **Run the SQL Migration Scripts**

   Run these SQL scripts in the Supabase SQL Editor in the following order:

   ```
   /supabase/migrations/add_admin_column_to_profiles.sql
   /supabase/migrations/create_stocks_table.sql
   /supabase/migrations/create_additional_tables.sql
   ```

2. **Deploy the Edge Function**

   ```bash
   cd /Users/udaykiran/Downloads/hal
   npx supabase functions deploy update-stock-prices
   ```

   Set the following environment variables in Supabase:
   - `MARKETSTACK_API_KEY`: Your MarketStack API key
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. **Seed the Stocks Table**

   ```bash
   cd /Users/udaykiran/Downloads/hal
   npm install dotenv @supabase/supabase-js
   npx ts-node scripts/seed-stocks.ts
   ```

   Create a `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Stock Data Structure

The stocks table has been simplified to include only the essential fields:

- `ticker`: Stock symbol (e.g., AAPL)
- `name`: Company name
- `market`: Exchange (e.g., NASDAQ, NYSE)
- `is_compliant`: Whether the stock is Shariah compliant
- `about_stock`: JSON object with additional details
- `price`: Current stock price (updated by Edge Function)
- `change_percent`: Price change percentage (updated by Edge Function)

## Using the Stock Service

The `stockService.ts` file provides functions to interact with the stock data:

```typescript
// Get all stocks
const { data: stocks } = await getAllStocks({ 
  compliantOnly: true, 
  refreshPrices: true 
});

// Get a specific stock
const { data: stock } = await getStockByTicker('AAPL');

// Search for stocks
const { data: searchResults } = await searchStocks('Apple');

// Get watchlist stocks
const { data: watchlistStocks } = await getWatchlistStocks(userId);
```

## Updating Stock Prices

Stock prices are automatically updated when you fetch stocks with the `refreshPrices: true` option. You can also manually update prices:

```typescript
await updateStockPrices(['AAPL', 'MSFT', 'GOOGL']);
```

The Edge Function uses caching to minimize API calls to MarketStack, with a cache expiry of 5 minutes.

## Troubleshooting

- If you encounter database errors, check that all tables are created correctly
- If stock prices aren't updating, verify your MarketStack API key and Edge Function deployment
- For Edge Function issues, check the Supabase Function logs
