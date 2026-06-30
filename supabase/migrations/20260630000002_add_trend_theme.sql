-- Add trend_theme column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS trend_theme text[] DEFAULT '{}'::text[];
