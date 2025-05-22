-- Create the increment and decrement functions if they don't exist
CREATE OR REPLACE FUNCTION increment(x numeric)
RETURNS numeric
LANGUAGE sql
AS $$
  SELECT coalesce(cash_balance, 0) + x FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION decrement(x numeric)
RETURNS numeric
LANGUAGE sql
AS $$
  SELECT GREATEST(0, coalesce(cash_balance, 0) - x) FROM profiles WHERE id = auth.uid()
$$;
