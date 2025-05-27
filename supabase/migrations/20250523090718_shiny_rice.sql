/*
  # Document Storage Setup

  1. New Tables
    - `document_storage` table to track uploaded files
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key)
      - `name` (text)
      - `path` (text)
      - `size` (bigint)
      - `mime_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on document_storage table
    - Add policies for authenticated users to manage their project files
*/

-- Create document storage table
CREATE TABLE IF NOT EXISTS document_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  path text NOT NULL,
  size bigint NOT NULL,
  mime_type text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_mime_type CHECK (
    mime_type IN (
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    )
  ),
  CONSTRAINT valid_file_size CHECK (size <= 10485760) -- 10MB limit
);

-- Enable RLS
ALTER TABLE document_storage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view files in their projects"
  ON document_storage
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files to their projects"
  ON document_storage
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from their projects"
  ON document_storage
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id 
      FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX document_storage_project_id_idx ON document_storage(project_id);