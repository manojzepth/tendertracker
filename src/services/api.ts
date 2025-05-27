import { DocumentCategory, Bidder } from '../store/projectStore';

interface EvaluationResult {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
}

interface LangchainResponse {
  [bidderId: string]: EvaluationResult;
}

const LANGCHAIN_API_BASE = import.meta.env.VITE_LANGCHAIN_API_URL || 'http://localhost:8000';

export const evaluateDocuments = async (
  categoryId: string,
  categoryName: string,
  documents: { name: string; url: string }[]
): Promise<EvaluationResult> => {
  try {
    console.log('Evaluating documents:', { categoryId, categoryName, documents });

    // Call the Langchain API
    const response = await fetch(`${LANGCHAIN_API_BASE}/evaluate/${categoryName.toLowerCase().replace(/\s+/g, '-')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documents }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Evaluation result:', result);
    return result;
  } catch (error) {
    console.error('Evaluation failed:', error);
    throw error;
  }
};