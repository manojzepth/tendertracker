import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, CheckCircle, AlertTriangle, User, BarChart, Award } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import clsx from 'clsx';

const ContractorReports = () => {
  const { projectId, tenderId } = useParams<{ projectId: string; tenderId: string }>();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const bidders = tender?.bidders || [];
  const [selectedBidderId, setSelectedBidderId] = useState<string | null>(null);
  
  if (!tender) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Tender not found.</p>
      </div>
    );
  }
  
  const selectedBidder = selectedBidderId
    ? bidders.find(b => b.id === selectedBidderId)
    : null;
  
  // Filter out bidders without evaluations
  const evaluatedBidders = bidders.filter(b => b.evaluation);

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tender.name}</h1>
        <p className="text-gray-500">Contractor Evaluation Reports</p>
      </div>
      
      {evaluatedBidders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center text-warning-600 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Evaluations Available</h3>
          <p className="text-gray-500 mb-4">
            None of the bidders have been evaluated yet. Please complete the document evaluation process first.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bidders List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
              <h2 className="text-sm font-medium text-gray-900">Evaluated Bidders</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-2">
                {evaluatedBidders.map((bidder) => {
                  const overallScore = bidder.evaluation?.overallScore || 0;
                  
                  return (
                    <div
                      key={bidder.id}
                      className={clsx(
                        "p-3 border rounded-md flex items-center justify-between",
                        selectedBidderId === bidder.id
                          ? "border-primary-300 bg-primary-50"
                          : "border-gray-200 hover:border-primary-200 hover:bg-gray-50",
                        "cursor-pointer transition-colors"
                      )}
                      onClick={() => setSelectedBidderId(bidder.id)}
                    >
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{bidder.name}</p>
                          <div className="flex items-center">
                            <CheckCircle size={12} className="text-success-500 mr-1" />
                            <p className="text-xs text-gray-500">
                              Evaluated
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={clsx(
                          "h-8 w-8 rounded-full flex items-center justify-center text-white font-medium",
                          overallScore >= 80 ? "bg-success-500" :
                          overallScore >= 70 ? "bg-primary-500" :
                          overallScore >= 60 ? "bg-warning-500" :
                          "bg-error-500"
                        )}>
                          {overallScore}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Detailed Report */}
          {selectedBidder && selectedBidder.evaluation && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <h2 className="text-sm font-medium text-gray-900">
                  Evaluation Report for {selectedBidder.name}
                </h2>
              </div>
              
              <div className="p-4">
                {/* Overall Score */}
                <div className="flex items-center mb-6">
                  <div className={clsx(
                    "h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl",
                    selectedBidder.evaluation.overallScore >= 80 ? "bg-success-500" :
                    selectedBidder.evaluation.overallScore >= 70 ? "bg-primary-500" :
                    selectedBidder.evaluation.overallScore >= 60 ? "bg-warning-500" :
                    "bg-error-500"
                  )}>
                    {selectedBidder.evaluation.overallScore}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">Overall Score</p>
                    <p className="text-sm text-gray-500">Weighted average across all categories</p>
                  </div>
                </div>
                
                {/* Recommendation */}
                <div className="bg-primary-50 border border-primary-100 rounded-md p-4 mb-6">
                  <div className="flex items-start">
                    <Award size={20} className="text-primary-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">AI Recommendation</h3>
                      <p className="text-sm text-gray-700">{selectedBidder.evaluation.recommendation}</p>
                    </div>
                  </div>
                </div>
                
                {/* Category Scores */}
                <div className="space-y-4">
                  {tender.categories.map((category) => {
                    const categoryScore = selectedBidder.evaluation?.categoryScores[category.id];
                    if (!categoryScore) return null;

                    return (
                      <div key={category.id} className="border border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-success-600">{categoryScore.score}</span>
                            <span className="text-sm text-gray-500 ml-1">/100</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{categoryScore.summary}</p>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
                            <ul className="space-y-2">
                              {categoryScore.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start text-sm text-gray-600">
                                  <span className="text-success-500 font-medium mr-2">+</span>
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Weaknesses</h4>
                            <ul className="space-y-2">
                              {categoryScore.weaknesses.map((weakness, index) => (
                                <li key={index} className="flex items-start text-sm text-gray-600">
                                  <span className="text-error-500 font-medium mr-2">-</span>
                                  {weakness}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Risks</h4>
                            <div className="bg-warning-50 border border-warning-100 rounded-lg p-3">
                              <ul className="space-y-2">
                                {categoryScore.risks.map((risk, index) => (
                                  <li key={index} className="flex items-start text-sm text-warning-800">
                                    <AlertTriangle size={14} className="text-warning-500 mr-2 mt-0.5 flex-shrink-0" />
                                    {risk}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContractorReports;