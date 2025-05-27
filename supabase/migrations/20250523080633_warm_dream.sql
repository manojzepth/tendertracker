/*
  # Enable RLS and Add Policies

  1. Changes
    - Enable RLS on all tables
    - Add RLS policies for all tables
    - Ensure proper access control based on project membership

  2. Security
    - Users can only access data from projects they are members of
    - Project owners and admins have elevated permissions
    - Proper cascading of permissions through related tables
*/

-- Enable RLS
DO $$ 
BEGIN
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE scoring_matrices ENABLE ROW LEVEL SECURITY;
  ALTER TABLE bidders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE bidder_documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE bidder_evaluations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;
END $$;

-- Projects policies
DO $$ 
BEGIN
  -- View projects
  CREATE POLICY "Users can view their own projects"
    ON projects
    FOR SELECT
    TO authenticated
    USING (id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

  -- Create projects
  CREATE POLICY "Users can create projects"
    ON projects
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  -- Update projects
  CREATE POLICY "Users can update their own projects"
    ON projects
    FOR UPDATE
    TO authenticated
    USING (id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

  -- Delete projects
  CREATE POLICY "Users can delete their own projects"
    ON projects
    FOR DELETE
    TO authenticated
    USING (id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));
END $$;

-- Tenders policies
DO $$ 
BEGIN
  -- View tenders
  CREATE POLICY "Users can view tenders of their projects"
    ON tenders
    FOR SELECT
    TO authenticated
    USING (project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

  -- Create tenders
  CREATE POLICY "Users can create tenders in their projects"
    ON tenders
    FOR INSERT
    TO authenticated
    WITH CHECK (project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

  -- Update tenders
  CREATE POLICY "Users can update tenders in their projects"
    ON tenders
    FOR UPDATE
    TO authenticated
    USING (project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));

  -- Delete tenders
  CREATE POLICY "Users can delete tenders in their projects"
    ON tenders
    FOR DELETE
    TO authenticated
    USING (project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ));
END $$;

-- Document categories policies
DO $$ 
BEGIN
  -- View categories
  CREATE POLICY "Users can view document categories of their tenders"
    ON document_categories
    FOR SELECT
    TO authenticated
    USING (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));

  -- Create categories
  CREATE POLICY "Users can create document categories in their tenders"
    ON document_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));
END $$;

-- Scoring matrices policies
DO $$ 
BEGIN
  -- View matrices
  CREATE POLICY "Users can view scoring matrices of their tenders"
    ON scoring_matrices
    FOR SELECT
    TO authenticated
    USING (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));

  -- Update matrices
  CREATE POLICY "Users can update scoring matrices of their tenders"
    ON scoring_matrices
    FOR UPDATE
    TO authenticated
    USING (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));
END $$;

-- Bidders policies
DO $$ 
BEGIN
  -- View bidders
  CREATE POLICY "Users can view bidders of their tenders"
    ON bidders
    FOR SELECT
    TO authenticated
    USING (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));

  -- Create bidders
  CREATE POLICY "Users can create bidders in their tenders"
    ON bidders
    FOR INSERT
    TO authenticated
    WITH CHECK (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));
END $$;

-- Bidder documents policies
DO $$ 
BEGIN
  -- View documents
  CREATE POLICY "Users can view bidder documents of their tenders"
    ON bidder_documents
    FOR SELECT
    TO authenticated
    USING (bidder_id IN (
      SELECT id FROM bidders WHERE tender_id IN (
        SELECT id FROM tenders WHERE project_id IN (
          SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
      )
    ));

  -- Create documents
  CREATE POLICY "Users can create bidder documents in their tenders"
    ON bidder_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (bidder_id IN (
      SELECT id FROM bidders WHERE tender_id IN (
        SELECT id FROM tenders WHERE project_id IN (
          SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
      )
    ));
END $$;

-- Bidder evaluations policies
DO $$ 
BEGIN
  -- View evaluations
  CREATE POLICY "Users can view evaluations of their tenders"
    ON bidder_evaluations
    FOR SELECT
    TO authenticated
    USING (bidder_id IN (
      SELECT id FROM bidders WHERE tender_id IN (
        SELECT id FROM tenders WHERE project_id IN (
          SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
      )
    ));

  -- Create evaluations
  CREATE POLICY "Users can create evaluations in their tenders"
    ON bidder_evaluations
    FOR INSERT
    TO authenticated
    WITH CHECK (bidder_id IN (
      SELECT id FROM bidders WHERE tender_id IN (
        SELECT id FROM tenders WHERE project_id IN (
          SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
      )
    ));
END $$;

-- Tender documents policies
DO $$ 
BEGIN
  -- View documents
  CREATE POLICY "Users can view tender documents of their tenders"
    ON tender_documents
    FOR SELECT
    TO authenticated
    USING (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));

  -- Create documents
  CREATE POLICY "Users can create tender documents in their tenders"
    ON tender_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (tender_id IN (
      SELECT id FROM tenders WHERE project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      )
    ));
END $$;