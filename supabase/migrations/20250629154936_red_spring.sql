/*
  # Create job files junction table

  1. New Tables
    - `job_files`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to processing_jobs)
      - `file_id` (uuid, foreign key to files)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `job_files` table
    - Add policies for users to manage their own job files
*/

CREATE TABLE IF NOT EXISTS job_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES processing_jobs(id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, file_id)
);

ALTER TABLE job_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own job files"
  ON job_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM processing_jobs pj 
      WHERE pj.id = job_id AND pj.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_job_files_job_id ON job_files(job_id);
CREATE INDEX IF NOT EXISTS idx_job_files_file_id ON job_files(file_id);