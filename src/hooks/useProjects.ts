import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../store/projectStore';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
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

      if (error) throw error;

      const formattedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        area: project.area,
        type: project.type,
        location: project.location,
        startDate: project.start_date,
        endDate: project.end_date,
        tenders: project.tenders.map(tender => ({
          id: tender.id,
          projectId: tender.project_id,
          name: tender.name,
          discipline: tender.discipline,
          value: tender.value,
          currency: tender.currency,
          startDate: tender.start_date,
          endDate: tender.end_date,
          description: tender.description,
          status: tender.status,
          categories: tender.categories,
          scoringMatrix: tender.scoring_matrix,
          bidders: tender.bidders.map(bidder => ({
            id: bidder.id,
            tenderId: bidder.tender_id,
            name: bidder.name,
            email: bidder.email,
            phone: bidder.phone,
            address: bidder.address,
            city: bidder.city,
            country: bidder.country,
            contactPerson: bidder.contact_person,
            contactPosition: bidder.contact_position,
            companySize: bidder.company_size,
            yearEstablished: bidder.year_established,
            website: bidder.website,
            documents: bidder.documents,
            evaluation: bidder.evaluation
          })),
          documents: tender.documents
        }))
      }));

      setProjects(formattedProjects);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      setLoading(false);
    }
  }

  return { projects, loading, error, refetch: fetchProjects };
}