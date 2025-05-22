import { supabase } from '../lib/supabase';

// Types
export interface Stock {
  id: string;
  ticker: string;
  name: string;
  market: string;
  is_compliant: boolean;
  about_stock?: any;
  price?: number;
  change_percent?: number;
  last_updated?: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields from MarketStack
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  date?: string;
  adj_close?: number;
  adj_high?: number;
  adj_low?: number;
  adj_open?: number;
  exchange_country?: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  stock_id: string;
  created_at?: string;
  updated_at?: string;
}

// Client-side cache for stock data
const stockCache: Record<string, { data: Stock, timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Get all stocks from the database
 */
export const getAllStocks = async (options?: {
  compliantOnly?: boolean,
  market?: string,
  refreshPrices?: boolean
}): Promise<{ data: Stock[] | null, error: string | null }> => {
  try {
    // Build the query
    let query = supabase
      .from('stocks')
      .select('*');

    // Apply filters if provided
    if (options?.compliantOnly) {
      query = query.eq('is_compliant', true);
    }

    if (options?.market && options.market !== 'all') {
      query = query.eq('market', options.market);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) throw error;

    if (data && options?.refreshPrices) {
      // Get tickers for all stocks
      const tickers = data.map(stock => stock.ticker);

      // Update prices in batches of 100 (MarketStack limit)
      if (tickers.length > 0) {
        await updateStockPrices(tickers);

        // Fetch the updated data
        const { data: refreshedData, error: refreshError } = await query;

        if (refreshError) throw refreshError;

        return { data: refreshedData, error: null };
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get a single stock by ticker
 */
export const getStockByTicker = async (ticker: string): Promise<{ data: Stock | null, error: string | null }> => {
  try {
    // Check cache first
    const cachedStock = stockCache[ticker];
    if (cachedStock && Date.now() - cachedStock.timestamp < CACHE_EXPIRY) {
      return { data: cachedStock.data, error: null };
    }

    // Fetch from database
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('ticker', ticker)
      .single();

    if (error) throw error;

    // Update cache
    if (data) {
      stockCache[ticker] = {
        data,
        timestamp: Date.now()
      };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching stock ${ticker}:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Update stock prices using the Edge Function
 */
export const updateStockPrices = async (tickers: string[]): Promise<{ success: boolean, error: string | null }> => {
  try {
    // Call the Edge Function to update prices
    const { data, error } = await supabase.functions.invoke('update-stock-prices', {
      body: { tickers }
    });

    if (error) throw error;

    // Clear cache for updated stocks
    tickers.forEach(ticker => {
      delete stockCache[ticker];
    });

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating stock prices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Search stocks by keyword
 */
export const searchStocks = async (query: string): Promise<{ data: Stock[] | null, error: string | null }> => {
  try {
    if (!query || query.trim() === '') {
      return { data: [], error: null };
    }

    const searchTerm = query.toLowerCase().trim();

    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .or(`ticker.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error searching stocks:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Add a stock to user's watchlist
 */
export const addToWatchlist = async (stockId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('watchlist')
      .insert({
        stock_id: stockId,
        user_id: userId
      });

    if (error) {
      // If it's a duplicate entry error, we can consider this a success
      if (error.code === '23505') { // Unique violation code
        return { success: true, error: null };
      }
      throw error;
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Remove a stock from user's watchlist
 */
export const removeFromWatchlist = async (stockId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .match({ stock_id: stockId, user_id: userId });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Check if a stock is in user's watchlist
 */
export const isInWatchlist = async (stockId: string): Promise<{ isWatchlisted: boolean, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      return { isWatchlisted: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('id')
      .match({ stock_id: stockId, user_id: userId })
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return { isWatchlisted: false, error: null };
      }
      throw error;
    }

    return { isWatchlisted: !!data, error: null };
  } catch (error) {
    console.error('Error checking watchlist status:', error);
    return {
      isWatchlisted: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Get all stocks in user's watchlist
 */
export const getWatchlistItems = async (): Promise<{ data: Stock[] | null, error: string | null }> => {
  try {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      return { data: null, error: 'User not authenticated' };
    }

    // First get the watchlist items
    const { data: watchlistItems, error: watchlistError } = await supabase
      .from('watchlist')
      .select('stock_id')
      .eq('user_id', userId);

    if (watchlistError) throw watchlistError;

    if (!watchlistItems || watchlistItems.length === 0) {
      return { data: [], error: null };
    }

    // Get the stock IDs
    const stockIds = watchlistItems.map(item => item.stock_id);

    // Then get the actual stocks
    const { data: stocks, error: stocksError } = await supabase
      .from('stocks')
      .select('*')
      .in('id', stockIds);

    if (stocksError) throw stocksError;

    return { data: stocks || [], error: null };
  } catch (error) {
    console.error('Error fetching watchlist stocks:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
