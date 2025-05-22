-- Create watchlists table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stocks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stock_id)
);

-- Enable RLS on watchlists
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

-- Create policies for watchlists
CREATE POLICY "Users can view their own watchlists" 
  ON public.watchlists 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlists" 
  ON public.watchlists 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlists" 
  ON public.watchlists 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all watchlists" 
  ON public.watchlists 
  FOR ALL
  USING (auth.jwt() ? 'service_role');

-- Create holdings table for portfolio
CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stocks(id) ON DELETE CASCADE,
  quantity DECIMAL(18, 8) NOT NULL,
  average_price DECIMAL(18, 4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stock_id)
);

-- Enable RLS on holdings
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- Create policies for holdings
CREATE POLICY "Users can view their own holdings" 
  ON public.holdings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings" 
  ON public.holdings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all holdings" 
  ON public.holdings 
  FOR ALL
  USING (auth.jwt() ? 'service_role');

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stocks(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit')),
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(18, 8) NOT NULL,
  price DECIMAL(18, 4),
  status TEXT NOT NULL CHECK (status IN ('pending', 'filled', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
  ON public.orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
  ON public.orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all orders" 
  ON public.orders 
  FOR ALL
  USING (auth.jwt() ? 'service_role');

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_id UUID NOT NULL REFERENCES public.stocks(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'dividend', 'deposit', 'withdrawal', 'purification')),
  quantity DECIMAL(18, 8),
  price DECIMAL(18, 4),
  total_amount DECIMAL(18, 4) NOT NULL,
  fee DECIMAL(18, 4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
  ON public.transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all transactions" 
  ON public.transactions 
  FOR ALL
  USING (auth.jwt() ? 'service_role');

-- Create purification_wallet table
CREATE TABLE IF NOT EXISTS public.purification_wallet (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(18, 4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on purification_wallet
ALTER TABLE public.purification_wallet ENABLE ROW LEVEL SECURITY;

-- Create policies for purification_wallet
CREATE POLICY "Users can view their own purification wallet" 
  ON public.purification_wallet 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all purification wallets" 
  ON public.purification_wallet 
  FOR ALL
  USING (auth.jwt() ? 'service_role');

-- Create charities table
CREATE TABLE IF NOT EXISTS public.charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on charities
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to charities
CREATE POLICY "Allow public read access to charities" 
  ON public.charities 
  FOR SELECT 
  USING (true);

-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
  amount DECIMAL(18, 4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on donations
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations
CREATE POLICY "Users can view their own donations" 
  ON public.donations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own donations" 
  ON public.donations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all donations" 
  ON public.donations 
  FOR ALL
  USING (auth.jwt() ? 'service_role');

-- Create triggers for updating timestamps
CREATE TRIGGER update_holdings_updated_at
BEFORE UPDATE ON public.holdings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_purification_wallet_updated_at
BEFORE UPDATE ON public.purification_wallet
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_charities_updated_at
BEFORE UPDATE ON public.charities
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
