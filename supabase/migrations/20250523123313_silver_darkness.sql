/*
  # Update Storage Bucket Configuration
  
  1. Changes:
    - Increase file size limit to 25MB
    - Restrict allowed file types to PDF only
*/

-- Update storage bucket configuration
UPDATE storage.buckets
SET 
  file_size_limit = 26214400, -- 25MB in bytes
  allowed_mime_types = ARRAY['application/pdf']
WHERE id = 'documents';

-- Update document_storage table constraint
ALTER TABLE document_storage DROP CONSTRAINT IF EXISTS valid_file_size;
ALTER TABLE document_storage ADD CONSTRAINT valid_file_size CHECK (size <= 26214400);

ALTER TABLE document_storage DROP CONSTRAINT IF EXISTS valid_mime_type;
ALTER TABLE document_storage ADD CONSTRAINT valid_mime_type CHECK (mime_type = 'application/pdf');