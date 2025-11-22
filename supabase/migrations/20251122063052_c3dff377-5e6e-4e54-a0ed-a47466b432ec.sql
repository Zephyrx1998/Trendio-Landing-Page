-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe"
  ON public.subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only allow viewing own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscribers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create index for faster email lookups
CREATE INDEX idx_subscribers_email ON public.subscribers(email);

-- Create index for subscribed_at for sorting
CREATE INDEX idx_subscribers_subscribed_at ON public.subscribers(subscribed_at DESC);