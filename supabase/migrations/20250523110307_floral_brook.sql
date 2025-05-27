/*
  # Fix RLS Policies

  1. Changes
    - Add policy existence checks before creation
    - Update RLS policies for projects and project members
    - Ensure proper access control
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can view their own projects'
  ) THEN
    CREATE POLICY "Users can view their own projects"
      ON projects
      FOR SELECT
      TO authenticated
      USING (id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      ));
  END IF;

  -- Create projects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can create projects'
  ) THEN
    CREATE POLICY "Users can create projects"
      ON projects
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- Update projects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can update their own projects'
  ) THEN
    CREATE POLICY "Users can update their own projects"
      ON projects
      FOR UPDATE
      TO authenticated
      USING (id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      ));
  END IF;

  -- Delete projects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can delete their own projects'
  ) THEN
    CREATE POLICY "Users can delete their own projects"
      ON projects
      FOR DELETE
      TO authenticated
      USING (id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      ));
  END IF;
END $$;

-- Project members policies
DO $$
BEGIN
  -- View members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_members' 
    AND policyname = 'Users can view project members of their projects'
  ) THEN
    CREATE POLICY "Users can view project members of their projects"
      ON project_members
      FOR SELECT
      TO authenticated
      USING (project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
      ));
  END IF;

  -- Add members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_members' 
    AND policyname = 'Users can add members to their projects'
  ) THEN
    CREATE POLICY "Users can add members to their projects"
      ON project_members
      FOR INSERT
      TO authenticated
      WITH CHECK (project_id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      ));
  END IF;

  -- Remove members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'project_members' 
    AND policyname = 'Project owners and admins can remove members'
  ) THEN
    CREATE POLICY "Project owners and admins can remove members"
      ON project_members
      FOR DELETE
      TO authenticated
      USING (project_id IN (
        SELECT project_id FROM project_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      ));
  END IF;
END $$;