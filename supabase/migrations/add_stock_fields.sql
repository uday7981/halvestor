-- Add additional fields to stocks table for MarketStack data
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

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS stocks_high_idx ON public.stocks (high);
CREATE INDEX IF NOT EXISTS stocks_low_idx ON public.stocks (low);
CREATE INDEX IF NOT EXISTS stocks_date_idx ON public.stocks (date);
CREATE INDEX IF NOT EXISTS stocks_open_idx ON public.stocks (open);
CREATE INDEX IF NOT EXISTS stocks_adj_close_idx ON public.stocks (adj_close);
CREATE INDEX IF NOT EXISTS stocks_exchange_country_idx ON public.stocks (exchange_country);
