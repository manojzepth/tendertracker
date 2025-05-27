import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Bidder } from '../store/projectStore';

export function useBidders(tenderId?: string) {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBidders = useCallback(async () => {
    if (!tenderId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('bidders')
        .select(`
          *,
          documents: bidder_documents (*),
          evaluation: bidder_evaluations (*)
        `)
        .eq('tender_id', tenderId);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(`Failed to fetch bidders: ${supabaseError.message}`);
      }

      const formattedBidders: Bidder[] = data.map(bidder => ({
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
        documents: bidder.documents || [],
        evaluation: bidder.evaluation
      }));

      setBidders(formattedBidders);
    } catch (err) {
      console.error('Error fetching bidders:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch bidders data'));
    } finally {
      setLoading(false);
    }
  }, [tenderId]);

  useEffect(() => {
    fetchBidders();
  }, [fetchBidders]);

  const getBidder = useCallback(async (bidderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('bidders')
        .select(`
          *,
          documents: bidder_documents (*),
          evaluation: bidder_evaluations (*)
        `)
        .eq('id', bidderId)
        .single();

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(`Failed to fetch bidder: ${supabaseError.message}`);
      }

      if (!data) {
        throw new Error('Bidder not found');
      }

      return {
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
        documents: data.documents || [],
        evaluation: data.evaluation
      };
    } catch (err) {
      console.error('Error in getBidder:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch bidder details'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { bidders, loading, error, refetch: fetchBidders, getBidder };
}