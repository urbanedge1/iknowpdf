/*
  # Create authentication related tables

  1. New Tables
    - `refresh_tokens` - Store JWT refresh tokens
    - `password_reset_tokens` - Store password reset tokens
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own refresh tokens"
  ON refresh_tokens
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage password reset tokens"
  ON password_reset_tokens
  FOR ALL
  TO service_role;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Clean up expired tokens function
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM refresh_tokens WHERE expires_at < now();
  DELETE FROM password_reset_tokens WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;