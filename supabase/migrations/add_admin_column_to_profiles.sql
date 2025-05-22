-- Add is_admin column to profiles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END
$$;
