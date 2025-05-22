-- Create stocks table
CREATE TABLE IF NOT EXISTS public.stocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticker TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  market TEXT NOT NULL, -- 'NYSE', 'NASDAQ', etc.
  is_compliant BOOLEAN DEFAULT false,
  about_stock JSONB,
  price DECIMAL(18, 4),
  change_percent DECIMAL(8, 4),
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS stocks_ticker_idx ON public.stocks (ticker);
CREATE INDEX IF NOT EXISTS stocks_market_idx ON public.stocks (market);
CREATE INDEX IF NOT EXISTS stocks_is_compliant_idx ON public.stocks (is_compliant);

-- Enable Row Level Security
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (stock data is not sensitive)
CREATE POLICY "Allow public read access" 
  ON public.stocks 
  FOR SELECT 
  USING (true);

-- Create policy for service role to update stocks
-- Only the backend service should update stock prices
CREATE POLICY "Allow service role to update stocks" 
  ON public.stocks 
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ) OR auth.jwt() ? 'service_role');

-- Create policy for service role to insert stocks
-- Only the backend service should insert new stocks
CREATE POLICY "Allow service role to insert stocks" 
  ON public.stocks 
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM public.profiles WHERE is_admin = true
  ) OR auth.jwt() ? 'service_role');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stocks_updated_at
BEFORE UPDATE ON public.stocks
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
