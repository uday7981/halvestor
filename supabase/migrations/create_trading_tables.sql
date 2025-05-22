-- Create trading tables with enhanced RLS policies
-- This migration creates the necessary tables for market orders functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stock_id UUID NOT NULL REFERENCES stocks(id),
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_per_share NUMERIC NOT NULL CHECK (price_per_share >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_stock FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- Holdings Table
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stock_id UUID NOT NULL REFERENCES stocks(id),
  quantity NUMERIC NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  average_price NUMERIC NOT NULL DEFAULT 0 CHECK (average_price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_stock FOREIGN KEY (stock_id) REFERENCES stocks(id),
  CONSTRAINT unique_user_stock UNIQUE (user_id, stock_id)
);

-- Transactions Table (for history)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stock_id UUID NOT NULL REFERENCES stocks(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  price_per_share NUMERIC NOT NULL CHECK (price_per_share > 0),
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT fk_stock FOREIGN KEY (stock_id) REFERENCES stocks(id)
);

-- Create a function to automatically set user_id to auth.uid() on insert
CREATE OR REPLACE FUNCTION set_user_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically set user_id on insert
CREATE TRIGGER set_orders_user_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION set_user_id_on_insert();

CREATE TRIGGER set_holdings_user_id
BEFORE INSERT ON holdings
FOR EACH ROW
EXECUTE FUNCTION set_user_id_on_insert();

CREATE TRIGGER set_transactions_user_id
BEFORE INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_user_id_on_insert();

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at
BEFORE UPDATE ON holdings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Orders table policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Holdings table policies
CREATE POLICY "Users can view their own holdings"
  ON holdings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own holdings"
  ON holdings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own holdings"
  ON holdings FOR UPDATE
  USING (auth.uid() = user_id);

-- Transactions table policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No UPDATE policy for transactions to prevent modification of financial records

-- Create an audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to log changes to the audit_logs table
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (table_name, record_id, user_id, action, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    auth.uid(),
    TG_OP,
    CASE
      WHEN TG_OP = 'INSERT' THEN NULL
      ELSE to_jsonb(OLD)
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN NULL
      ELSE to_jsonb(NEW)
    END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log triggers
CREATE TRIGGER orders_audit
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_audit();

CREATE TRIGGER holdings_audit
AFTER INSERT OR UPDATE OR DELETE ON holdings
FOR EACH ROW
EXECUTE FUNCTION log_audit();

CREATE TRIGGER transactions_audit
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE FUNCTION log_audit();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON holdings TO authenticated;
GRANT SELECT, INSERT ON transactions TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;
