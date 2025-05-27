-- Drop existing development policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "dev-only: allow single user" ON projects;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON tenders;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON document_categories;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON scoring_matrices;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON bidders;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON bidder_documents;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON bidder_evaluations;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON tender_documents;
  DROP POLICY IF EXISTS "dev-only: allow single user" ON project_members;

  -- Create new development policies that check for authenticated user
  CREATE POLICY "dev-only: allow single user" ON projects FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON tenders FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON document_categories FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON scoring_matrices FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON bidders FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON bidder_documents FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON bidder_evaluations FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON tender_documents FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
  CREATE POLICY "dev-only: allow single user" ON project_members FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
END $$;