/*
  # Add Reference Numbers

  1. Changes:
    - Add ref_no columns to projects and tenders
    - Create triggers to generate reference numbers
    - Add indexes for faster lookups

  2. Format:
    - Projects: PRJ-YYYY-XXXX (YYYY = year, XXXX = first 4 chars of UUID)
    - Tenders: PRJ-YYYY-XXXX-TND-XXX (inherits project ref + first 3 chars of tender UUID)
*/

-- Add ref_no columns
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ref_no text;
ALTER TABLE tenders ADD COLUMN IF NOT EXISTS ref_no text;

-- Create function to generate project reference number
CREATE OR REPLACE FUNCTION generate_project_ref_no()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ref_no := 'PRJ-' || 
                TO_CHAR(NEW.created_at, 'YYYY') || 
                '-' || 
                SUBSTRING(NEW.id::text, 1, 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate tender reference number
CREATE OR REPLACE FUNCTION generate_tender_ref_no()
RETURNS TRIGGER AS $$
DECLARE
  project_ref text;
BEGIN
  SELECT ref_no INTO project_ref
  FROM projects
  WHERE id = NEW.project_id;

  NEW.ref_no := project_ref || 
                '-TND-' || 
                SUBSTRING(NEW.id::text, 1, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS set_project_ref_no ON projects;
CREATE TRIGGER set_project_ref_no
  BEFORE INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION generate_project_ref_no();

DROP TRIGGER IF EXISTS set_tender_ref_no ON tenders;
CREATE TRIGGER set_tender_ref_no
  BEFORE INSERT ON tenders
  FOR EACH ROW
  EXECUTE FUNCTION generate_tender_ref_no();

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS projects_ref_no_idx ON projects(ref_no);
CREATE INDEX IF NOT EXISTS tenders_ref_no_idx ON tenders(ref_no);

-- Update existing records
UPDATE projects 
SET ref_no = 'PRJ-' || 
             TO_CHAR(created_at, 'YYYY') || 
             '-' || 
             SUBSTRING(id::text, 1, 4)
WHERE ref_no IS NULL;

UPDATE tenders t
SET ref_no = (
  SELECT p.ref_no || '-TND-' || SUBSTRING(t.id::text, 1, 3)
  FROM projects p
  WHERE p.id = t.project_id
)
WHERE ref_no IS NULL;