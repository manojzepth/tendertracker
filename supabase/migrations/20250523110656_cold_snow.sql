/*
  # Temporary Development Policy
  
  1. Changes
    - Add temporary development policy for single-user testing
    - Simplify RLS to allow full access for authenticated users
    
  2. Security
    - This is a temporary policy for development only
    - Should be replaced with proper project_members-based RLS before production
*/

-- Temporary relaxed policy for development
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "dev-only: allow single user" ON projects;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON tenders;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON document_categories;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON scoring_matrices;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON bidders;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON bidder_documents;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON bidder_evaluations;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON tender_documents;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON project_members;

  -- Create new development policies
  CREATE POLICY "dev-only: allow single user" ON projects FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON tenders FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON document_categories FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON scoring_matrices FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON bidders FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON bidder_documents FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON bidder_evaluations FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON tender_documents FOR ALL TO authenticated USING (true);
  CREATE POLICY "dev-only: allow single user" ON project_members FOR ALL TO authenticated USING (true);
END $$;