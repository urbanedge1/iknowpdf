/*
  # Create subscriptions table

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `razorpay_subscription_id` (text)
      - `razorpay_customer_id` (text)
      - `plan_id` (text)
      - `status` (enum: active, canceled, past_due, incomplete)
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `subscriptions` table
    - Add policies for users to read their own subscription data
*/

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  razorpay_subscription_id text UNIQUE,
  razorpay_customer_id text,
  plan_id text NOT NULL CHECK (plan_id IN ('free', 'pro', 'premium')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id ON subscriptions(razorpay_subscription_id);