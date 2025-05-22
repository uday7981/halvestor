-- Create a table for user watchlists
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, stock_id)
);

-- Enable Row Level Security
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view only their own watchlist items
CREATE POLICY "Users can view their own watchlist items"
  ON watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own watchlist items
CREATE POLICY "Users can add stocks to their watchlist"
  ON watchlist
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own watchlist items
CREATE POLICY "Users can remove stocks from their watchlist"
  ON watchlist
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX watchlist_stock_id_idx ON watchlist(stock_id);