import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { uploadFile } from '../services/storage';

// Types
export interface Project {
  id: string;
  refNo: string;
  name: string;
  description: string;
  area: number;
  type: 'residential' | 'commercial' | 'mixed-use' | 'hospitality';
  location: string;
  startDate: string;
  endDate: string;
  tenders: Tender[];
}

export interface TenderDocument {
  id: string;
  tenderId: string;
  category: 'administrative' | 'technical' | 'legal' | 'evaluation' | 'submission';
  name: string;
  url: string;
  uploadDate: string;
}

export interface Tender {
  id: string;
  refNo: string;
  projectId: string;
  name: string;
  discipline: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  description: string;
  status: 'draft' | 'open' | 'closed' | 'awarded';
  categories: DocumentCategory[];
  scoringMatrix: ScoringMatrix;
  bidders: Bidder[];
  documents: TenderDocument[];
}

export interface DocumentCategory {
  id: string;
  name: string;
  weight: number;
  required: boolean;
  description: string;
}

export interface ScoringMatrix {
  id: string;
  tenderId: string;
  criteria: {
    [categoryId: string]: {
      weight: number;
    };
  };
}

export interface Bidder {
  id: string;
  tenderId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  contactPerson: string;
  contactPosition: string;
  companySize: string;
  yearEstablished: string;
  website: string;
  documents: BidderDocument[];
  evaluation?: BidderEvaluation;
}

export interface BidderDocument {
  id: string;
  bidderId: string;
  categoryId: string;
  name: string;
  url: string;
  uploadDate: string;
}

export interface BidderEvaluation {
  id: string;
  bidderId: string;
  categoryScores: {
    [categoryId: string]: {
      score: number;
      summary: string;
      strengths: string[];
      weaknesses: string[];
      risks: string[];
    };
  };
  overallScore: number;
  recommendation: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  
  fetchProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'refNo' | 'tenders'>) => Promise<Project>;
  getProjectById: (projectId: string) => Project | undefined;
  getTenderById: (tenderId: string) => Tender | undefined;
  getTenderDocuments: (tenderId: string) => TenderDocument[];
  addTender: (projectId: string, tender: Omit<Tender, 'id' | 'refNo' | 'projectId' | 'bidders' | 'categories' | 'scoringMatrix'>) => Promise<Tender>;
  uploadTenderDocument: (tenderId: string, file: File, document: Omit<TenderDocument, 'id' | 'tenderId' | 'url'>) => Promise<void>;
  removeTenderDocument: (tenderId: string, documentId: string) => Promise<void>;
  addBidder: (tenderId: string, bidder: Omit<Bidder, 'id' | 'tenderId' | 'documents' | 'evaluation'>) => Promise<void>;
  uploadDocument: (bidderId: string, file: File, document: Omit<BidderDocument, 'id' | 'bidderId' | 'url'>) => Promise<void>;
  removeDocument: (bidderId: string, documentId: string) => Promise<void>;
  evaluateBidder: (bidderId: string, evaluation: Omit<BidderEvaluation, 'id' | 'bidderId'>) => Promise<void>;
}

const generateProjectRefNo = (id: string) => {
  const year = new Date().getFullYear();
  const shortId = id.slice(0, 4).toUpperCase();
  return `PRJ-${year}-${shortId}`;
};

const generateTenderRefNo = (projectRefNo: string, id: string) => {
  const shortId = id.slice(0, 3).toUpperCase();
  return `${projectRefNo}-TND-${shortId}`;
};

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Fetching projects...');

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          tenders (
            *,
            categories: document_categories (*),
            scoring_matrix: scoring_matrices (*),
            bidders (
              *,
              documents: bidder_documents (*),
              evaluation: bidder_evaluations (*)
            ),
            documents: tender_documents (*)
          )
        `);

      if (projectsError) throw projectsError;

      console.log('Projects data:', projectsData);

      const projects: Project[] = projectsData.map(project => {
        const projectRefNo = generateProjectRefNo(project.id);
        return {
          id: project.id,
          refNo: projectRefNo,
          name: project.name,
          description: project.description,
          area: project.area,
          type: project.type,
          location: project.location,
          startDate: project.start_date,
          endDate: project.end_date,
          tenders: project.tenders.map(tender => ({
            id: tender.id,
            refNo: generateTenderRefNo(projectRefNo, tender.id),
            projectId: tender.project_id,
            name: tender.name,
            discipline: tender.discipline,
            value: tender.value,
            currency: tender.currency,
            startDate: tender.start_date,
            endDate: tender.end_date,
            description: tender.description,
            status: tender.status,
            categories: tender.categories || [],
            scoringMatrix: tender.scoring_matrix || { criteria: {} },
            bidders: tender.bidders || [],
            documents: tender.documents || []
          }))
        };
      });

      console.log('Processed projects:', projects);
      set({ projects, loading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ error: error as Error, loading: false });
    }
  },

  getProjectById: (projectId) => {
    return get().projects.find(project => project.id === projectId);
  },

  getTenderById: (tenderId) => {
    const projects = get().projects;
    for (const project of projects) {
      const tender = project.tenders.find(tender => tender.id === tenderId);
      if (tender) {
        return tender;
      }
    }
    return undefined;
  },

  getTenderDocuments: (tenderId) => {
    const tender = get().getTenderById(tenderId);
    return tender?.documents || [];
  },

  addProject: async (project) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          area: project.area,
          type: project.type,
          location: project.location,
          start_date: project.startDate,
          end_date: project.endDate
        })
        .select()
        .single();

      if (error) throw error;

      const projectRefNo = generateProjectRefNo(data.id);
      const newProject: Project = {
        id: data.id,
        refNo: projectRefNo,
        name: data.name,
        description: data.description,
        area: data.area,
        type: data.type,
        location: data.location,
        startDate: data.start_date,
        endDate: data.end_date,
        tenders: []
      };

      set(state => ({
        projects: [...state.projects, newProject]
      }));

      return newProject;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  },

  addTender: async (projectId, tender) => {
    try {
      const { data, error } = await supabase
        .from('tenders')
        .insert({
          project_id: projectId,
          name: tender.name,
          discipline: tender.discipline,
          value: tender.value,
          currency: tender.currency,
          start_date: tender.startDate,
          end_date: tender.endDate,
          description: tender.description,
          status: tender.status
        })
        .select()
        .single();

      if (error) throw error;

      const project = get().getProjectById(projectId);
      if (!project) throw new Error('Project not found');

      const newTender: Tender = {
        id: data.id,
        refNo: generateTenderRefNo(project.refNo, data.id),
        projectId: data.project_id,
        name: data.name,
        discipline: data.discipline,
        value: data.value,
        currency: data.currency,
        startDate: data.start_date,
        endDate: data.end_date,
        description: data.description,
        status: data.status,
        categories: [],
        scoringMatrix: { criteria: {} },
        bidders: [],
        documents: []
      };

      set(state => ({
        projects: state.projects.map(project =>
          project.id === projectId
            ? { ...project, tenders: [...project.tenders, newTender] }
            : project
        )
      }));

      return newTender;
    } catch (error) {
      console.error('Error adding tender:', error);
      throw error;
    }
  },

  uploadTenderDocument: async (tenderId, file, document) => {
    try {
      // Upload file to storage and get public URL
      const publicUrl = await uploadFile(file, `tenders/${tenderId}`);

      // Insert document record
      const { data, error } = await supabase
        .from('tender_documents')
        .insert({
          tender_id: tenderId,
          category: document.category,
          name: document.name,
          url: publicUrl,
          upload_date: document.uploadDate
        })
        .select()
        .single();

      if (error) throw error;

      const newDocument: TenderDocument = {
        id: data.id,
        tenderId: data.tender_id,
        category: data.category,
        name: data.name,
        url: data.url,
        uploadDate: data.upload_date
      };

      set(state => ({
        projects: state.projects.map(project => ({
          ...project,
          tenders: project.tenders.map(tender =>
            tender.id === tenderId
              ? { ...tender, documents: [...tender.documents, newDocument] }
              : tender
          )
        }))
      }));
    } catch (error) {
      console.error('Error uploading tender document:', error);
      throw error;
    }
  },

  removeTenderDocument: async (tenderId, documentId) => {
    try {
      const { error } = await supabase
        .from('tender_documents')
        .delete()
        .match({ id: documentId });

      if (error) throw error;

      set(state => ({
        projects: state.projects.map(project => ({
          ...project,
          tenders: project.tenders.map(tender =>
            tender.id === tenderId
              ? {
                  ...tender,
                  documents: tender.documents.filter(doc => doc.id !== documentId)
                }
              : tender
          )
        }))
      }));
    } catch (error) {
      console.error('Error removing tender document:', error);
      throw error;
    }
  },

  addBidder: async (tenderId, bidder) => {
    try {
      const { data, error } = await supabase
        .from('bidders')
        .insert({
          tender_id: tenderId,
          name: bidder.name,
          email: bidder.email,
          phone: bidder.phone,
          address: bidder.address,
          city: bidder.city,
          country: bidder.country,
          contact_person: bidder.contactPerson,
          contact_position: bidder.contactPosition,
          company_size: bidder.companySize,
          year_established: bidder.yearEstablished,
          website: bidder.website
        })
        .select()
        .single();

      if (error) throw error;

      const newBidder: Bidder = {
        id: data.id,
        tenderId: data.tender_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        country: data.country,
        contactPerson: data.contact_person,
        contactPosition: data.contact_position,
        companySize: data.company_size,
        yearEstablished: data.year_established,
        website: data.website,
        documents: []
      };

      set(state => ({
        projects: state.projects.map(project => ({
          ...project,
          tenders: project.tenders.map(tender =>
            tender.id === tenderId
              ? { ...tender, bidders: [...tender.bidders, newBidder] }
              : tender
          )
        }))
      }));
    } catch (error) {
      console.error('Error adding bidder:', error);
      throw error;
    }
  },

  uploadDocument: async (bidderId, file, document) => {
    try {
      console.log('Uploading document:', { bidderId, document });

      // Upload file to storage and get public URL
      const publicUrl = await uploadFile(file, `bidders/${bidderId}`);

      const { data, error } = await supabase
        .from('bidder_documents')
        .insert({
          bidder_id: bidderId,
          category_id: document.categoryId,
          name: document.name,
          url: publicUrl,
          upload_date: document.uploadDate
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Document uploaded:', data);

      const newDocument: BidderDocument = {
        id: data.id,
        bidderId: data.bidder_id,
        categoryId: data.category_id,
        name: data.name,
        url: data.url,
        uploadDate: data.upload_date
      };

      set(state => {
        const newState = {
          projects: state.projects.map(project => ({
            ...project,
            tenders: project.tenders.map(tender => ({
              ...tender,
              bidders: tender.bidders.map(bidder =>
                bidder.id === bidderId
                  ? { ...bidder, documents: [...bidder.documents, newDocument] }
                  : bidder
              )
            }))
          }))
        };
        console.log('Updated state after upload:', newState);
        return newState;
      });

      // Trigger a refresh to ensure UI is up to date
      await get().fetchProjects();
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  removeDocument: async (bidderId, documentId) => {
    try {
      console.log('Removing document:', { bidderId, documentId });

      const { error } = await supabase
        .from('bidder_documents')
        .delete()
        .match({ id: documentId });

      if (error) throw error;

      set(state => {
        const newState = {
          projects: state.projects.map(project => ({
            ...project,
            tenders: project.tenders.map(tender => ({
              ...tender,
              bidders: tender.bidders.map(bidder =>
                bidder.id === bidderId
                  ? {
                      ...bidder,
                      documents: bidder.documents.filter(doc => doc.id !== documentId)
                    }
                  : bidder
              )
            }))
          }))
        };
        console.log('Updated state after remove:', newState);
        return newState;
      });

      // Trigger a refresh to ensure UI is up to date
      await get().fetchProjects();
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  },

  evaluateBidder: async (bidderId, evaluation) => {
    try {
      console.log('Evaluating bidder:', { bidderId, evaluation });

      const { data, error } = await supabase
        .from('bidder_evaluations')
        .insert({
          bidder_id: bidderId,
          category_scores: evaluation.categoryScores,
          overall_score: evaluation.overallScore,
          recommendation: evaluation.recommendation
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Evaluation result:', data);

      const newEvaluation: BidderEvaluation = {
        id: data.id,
        bidderId: data.bidder_id,
        categoryScores: data.category_scores,
        overallScore: data.overall_score,
        recommendation: data.recommendation
      };

      set(state => {
        const newState = {
          projects: state.projects.map(project => ({
            ...project,
            tenders: project.tenders.map(tender => ({
              ...tender,
              bidders: tender.bidders.map(bidder =>
                bidder.id === bidderId
                  ? { ...bidder, evaluation: newEvaluation }
                  : bidder
              )
            }))
          }))
        };
        console.log('Updated state after evaluation:', newState);
        return newState;
      });

      // Trigger a refresh to ensure UI is up to date
      await get().fetchProjects();
    } catch (error) {
      console.error('Error evaluating bidder:', error);
      throw error;
    }
  }
}));

export default useProjectStore;