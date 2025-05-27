import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BidderEvaluation } from '../store/projectStore';

export function useEvaluation(bidderId: string) {
  const [evaluation, setEvaluation] = useState<BidderEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchEvaluation();
  }, [bidderId]);

  async function fetchEvaluation() {
    try {
      const { data, error } = await supabase
        .from('bidder_evaluations')
        .select('*')
        .eq('bidder_id', bidderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No evaluation found
          setEvaluation(null);
        } else {
          throw error;
        }
      } else if (data) {
        const formattedEvaluation: BidderEvaluation = {
          id: data.id,
          bidderId: data.bidder_id,
          categoryScores: data.category_scores,
          overallScore: data.overall_score,
          recommendation: data.recommendation
        };

        setEvaluation(formattedEvaluation);
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      setLoading(false);
    }
  }

  return { evaluation, loading, error, refetch: fetchEvaluation };
}