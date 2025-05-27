/*
  # Create Project Members Table

  1. New Tables
    - project_members
      - id (uuid, primary key)
      - project_id (uuid, references projects)
      - user_id (uuid, references auth.users)
      - role (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create project members table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (project_id, user_id)
);

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view project members of their projects"
  ON project_members
  FOR SELECT
  TO authenticated
  USING (project_id IN (
    SELECT project_id FROM project_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can add members to their projects"
  ON project_members
  FOR INSERT
  TO authenticated
  WITH CHECK (project_id IN (
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));

CREATE POLICY "Project owners and admins can remove members"
  ON project_members
  FOR DELETE
  TO authenticated
  USING (project_id IN (
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));