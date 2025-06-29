/*
  # Create processing jobs table

  1. New Tables
    - `processing_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `tool_id` (text)
      - `status` (enum: pending, processing, completed, failed)
      - `progress` (integer, 0-100)
      - `options` (jsonb)
      - `error_message` (text)
      - `result_metadata` (jsonb)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)
  2. Security
    - Enable RLS on `processing_jobs` table
    - Add policies for users to manage their own jobs
*/

CREATE TABLE IF NOT EXISTS processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  options jsonb DEFAULT '{}',
  error_message text,
  result_metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own jobs"
  ON processing_jobs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_processing_jobs_updated_at
  BEFORE UPDATE ON processing_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_created_at ON processing_jobs(created_at);