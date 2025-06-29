/*
  # Create result files table

  1. New Tables
    - `result_files`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to processing_jobs)
      - `user_id` (uuid, foreign key to users)
      - `file_name` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `s3_key` (text)
      - `s3_url` (text)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `result_files` table
    - Add policies for users to access their own result files
*/

CREATE TABLE IF NOT EXISTS result_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES processing_jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  s3_key text NOT NULL,
  s3_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE result_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own result files"
  ON result_files
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_result_files_job_id ON result_files(job_id);
CREATE INDEX IF NOT EXISTS idx_result_files_user_id ON result_files(user_id);