import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BidderDocument } from '../store/projectStore';

export function useDocuments(bidderId: string) {
  const [documents, setDocuments] = useState<BidderDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [bidderId]);

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('bidder_documents')
        .select('*')
        .eq('bidder_id', bidderId);

      if (error) throw error;

      const formattedDocuments: BidderDocument[] = data.map(doc => ({
        id: doc.id,
        bidderId: doc.bidder_id,
        categoryId: doc.category_id,
        name: doc.name,
        url: doc.url,
        uploadDate: doc.upload_date
      }));

      setDocuments(formattedDocuments);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      setLoading(false);
    }
  }

  return { documents, loading, error, refetch: fetchDocuments };
}