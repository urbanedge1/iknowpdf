/*
  # Create files table

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `original_name` (text)
      - `file_name` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `s3_key` (text)
      - `s3_url` (text)
      - `status` (enum: uploaded, processing, completed, error)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `files` table
    - Add policies for users to manage their own files
*/

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  s3_key text NOT NULL,
  s3_url text NOT NULL,
  status text DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own files"
  ON files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_files_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);