/*
  # Create users table

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text, hashed)
      - `name` (text)
      - `plan` (enum: free, pro, premium)
      - `tasks_used` (integer, default 0)
      - `tasks_limit` (integer, default 3)
      - `is_active` (boolean, default true)
      - `email_verified` (boolean, default false)
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)
  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  tasks_used integer DEFAULT 0,
  tasks_limit integer DEFAULT 3,
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();