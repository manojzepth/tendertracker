/*
  # Storage setup for document management
  
  1. New Storage
    - Creates 'documents' bucket for storing project files
    - Sets 10MB file size limit
    - Restricts allowed file types to PDF only
    
  2. Security
    - Bucket is private by default
    - RLS policies for authenticated access
*/

-- Create bucket for storing documents
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE
SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create policies for authenticated access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can view their project files'
  ) THEN
    CREATE POLICY "Users can view their project files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can upload to their projects'
  ) THEN
    CREATE POLICY "Users can upload to their projects"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'documents');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can delete their project files'
  ) THEN
    CREATE POLICY "Users can delete their project files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'documents');
  END IF;
END $$;