/*
  # Initial Schema Setup

  1. Tables Created:
    - projects
    - tenders
    - document_categories
    - scoring_matrices
    - bidders
    - bidder_documents
    - bidder_evaluations
    - tender_documents

  2. Relationships:
    - One project has many tenders
    - One tender has many document categories, bidders, and documents
    - One bidder has many documents and one evaluation
    - One scoring matrix belongs to one tender
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  area integer NOT NULL,
  type text NOT NULL CHECK (type IN ('residential', 'commercial', 'mixed-use', 'hospitality')),
  location text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tenders table
CREATE TABLE IF NOT EXISTS tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  discipline text NOT NULL,
  value numeric(15,2) NOT NULL,
  currency text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'awarded')),
  created_at timestamptz DEFAULT now()
);

-- Create document_categories table
CREATE TABLE IF NOT EXISTS document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  name text NOT NULL,
  weight integer NOT NULL CHECK (weight >= 0 AND weight <= 100),
  required boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create scoring_matrices table
CREATE TABLE IF NOT EXISTS scoring_matrices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  criteria jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE (tender_id)
);

-- Create bidders table
CREATE TABLE IF NOT EXISTS bidders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  contact_person text NOT NULL,
  contact_position text NOT NULL,
  company_size text NOT NULL,
  year_established text NOT NULL,
  website text,
  created_at timestamptz DEFAULT now()
);

-- Create bidder_documents table
CREATE TABLE IF NOT EXISTS bidder_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bidder_id uuid NOT NULL REFERENCES bidders(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES document_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  upload_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create bidder_evaluations table
CREATE TABLE IF NOT EXISTS bidder_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bidder_id uuid NOT NULL REFERENCES bidders(id) ON DELETE CASCADE,
  category_scores jsonb NOT NULL DEFAULT '{}',
  overall_score integer NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  recommendation text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (bidder_id)
);

-- Create tender_documents table
CREATE TABLE IF NOT EXISTS tender_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('administrative', 'technical', 'legal', 'evaluation', 'submission')),
  name text NOT NULL,
  url text NOT NULL,
  upload_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Disable RLS for all tables
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tenders DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_matrices DISABLE ROW LEVEL SECURITY;
ALTER TABLE bidders DISABLE ROW LEVEL SECURITY;
ALTER TABLE bidder_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE bidder_evaluations DISABLE ROW LEVEL SECURITY;
ALTER TABLE tender_documents DISABLE ROW LEVEL SECURITY;