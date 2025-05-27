import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, AlertTriangle, Check, X, ArrowRight, Brain, Lightbulb, Loader2, ArrowLeft } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import { evaluateDocuments } from '../../services/api';
import clsx from 'clsx';

const BidderEvaluationDetails = () => {
  const { projectId, tenderId, bidderId } = useParams();
  const navigate = useNavigate();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const bidder = tender?.bidders.find(b => b.id === bidderId);
  const evaluateBidder = useProjectStore(state => state.evaluateBidder);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [evaluatedCategories, setEvaluatedCategories] = useState<Set<string>>(new Set());
  const [evaluation, setEvaluation] = useState<Record<string, {
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    risks: string[];
  }>>({});
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (bidder?.evaluation) {
      setEvaluation(bidder.evaluation.categoryScores);
      setEvaluatedCategories(new Set(Object.keys(bidder.evaluation.categoryScores)));
    } else {
      setEvaluation({});
      setEvaluatedCategories(new Set());
    }
  }, [bidder]);

  if (!tender || !bidder) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Bidder not found.</p>
      </div>
    );
  }

  const startCategoryEvaluation = async (categoryId: string) => {
    if (!tender) return;
    
    setIsEvaluating(true);
    setCurrentCategory(categoryId);
    setError(null);

    try {
      const category = tender.categories.find(c => c.id === categoryId);
      if (!category) throw new Error('Category not found');

      const results = await evaluateDocuments(
        categoryId,
        category.name,
        tender.bidders
      );

      // Update evaluation state with results
      setEvaluation(prev => ({
        ...prev,
        [categoryId]: results[bidderId] || {
          score: 0,
          summary: 'Evaluation failed',
          strengths: [],
          weaknesses: [],
          risks: []
        }
      }));

      setEvaluatedCategories(prev => new Set([...prev, categoryId]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setIsEvaluating(false);
      setCurrentCategory(null);
    }
  };

  const handleSaveAndProceed = () => {
    const overallScore = Math.round(
      Object.entries(evaluation).reduce((sum, [categoryId, categoryEval]) => {
        const category = tender.categories.find(c => c.id === categoryId);
        return sum + (categoryEval.score * (category?.weight || 0));
      }, 0) / tender.categories.reduce((sum, cat) => sum + cat.weight, 0)
    );
    
    evaluateBidder(bidderId, {
      categoryScores: evaluation,
      overallScore,
      recommendation: `Based on AI evaluation, ${bidder.name} achieved an overall score of ${overallScore}/100.`,
    });
    
    navigate(`/projects/${projectId}/tenders/${tenderId}/reports`);
  };

  const canProceedToReport = evaluatedCategories.size === tender.categories.length;

  return (
    <div className="animate-fade-in">
      <div className="mb-4">
        <button
          onClick={() => navigate(`/projects/${projectId}/tenders/${tenderId}/evaluation`)}
          className="mb-3 text-gray-600 hover:text-gray-900 flex items-center text-sm"
        >
          <ArrowLeft size={14} className="mr-1" />
          Back to Bidders
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Evaluating {bidder.name}</h1>
            <p className="text-sm text-gray-500">Document Evaluation</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tender.categories.map((category) => {
            const isEvaluated = evaluatedCategories.has(category.id);
            const isCurrentlyEvaluating = currentCategory === category.id;
            const categoryEval = evaluation[category.id];
            const hasDocument = bidder.documents.some(doc => doc.categoryId === category.id);

            return (
              <div
                key={category.id}
                className={clsx(
                  "border rounded-lg p-4",
                  isEvaluated ? "border-success-200 bg-success-50" :
                  isCurrentlyEvaluating ? "border-primary-300 bg-primary-50" :
                  "border-gray-200"
                )}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    <p className="text-xs text-gray-500">Weight: {category.weight}%</p>
                  </div>
                  {isEvaluated && (
                    <div className="flex items-center bg-success-100 text-success-700 px-2 py-1 rounded-full text-xs font-medium">
                      <Check size={12} className="mr-1" />
                      {categoryEval.score}
                    </div>
                  )}
                </div>

                {!hasDocument ? (
                  <div className="text-sm text-warning-600 flex items-center">
                    <AlertTriangle size={14} className="mr-1" />
                    No document uploaded
                  </div>
                ) : isEvaluated ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">{categoryEval.summary}</p>
                    <button
                      onClick={() => startCategoryEvaluation(category.id)}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      Re-evaluate
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startCategoryEvaluation(category.id)}
                    disabled={isEvaluating}
                    className={clsx(
                      "w-full btn btn-primary text-sm py-2",
                      isEvaluating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isCurrentlyEvaluating ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Brain size={14} className="mr-2" />
                        Start Evaluation
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
            <p className="flex items-center">
              <AlertTriangle size={16} className="mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Proceed Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveAndProceed}
            disabled={!canProceedToReport}
            className={clsx(
              "btn btn-primary",
              !canProceedToReport && "opacity-50 cursor-not-allowed"
            )}
          >
            <ArrowRight size={16} className="mr-2" />
            Proceed to Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default BidderEvaluationDetails;