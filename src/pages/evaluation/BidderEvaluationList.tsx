import { useParams, Link } from 'react-router-dom';
import { FileText, Check, AlertCircle } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import clsx from 'clsx';

const BidderEvaluationList = () => {
  const { projectId, tenderId } = useParams<{ projectId: string; tenderId: string }>();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const bidders = tender?.bidders || [];

  // Debug logs
  console.log('Route Parameters:', { projectId, tenderId });
  console.log('Tender Data:', tender);
  console.log('Bidders:', bidders);

  if (!tender) {
    console.log('Tender not found');
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Tender not found.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tender.name}</h1>
        <p className="text-gray-500">Document Evaluation</p>
      </div>

      {bidders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center text-warning-600 mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Bidders Found</h3>
          <p className="text-gray-500 mb-4">
            No bidders have been added to this tender yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bidders.map((bidder) => {
            const documentsSubmitted = bidder.documents.length;
            const totalCategories = tender.categories.length;
            const progress = Math.round((documentsSubmitted / totalCategories) * 100);

            // Debug log for each bidder
            console.log('Bidder Data:', {
              id: bidder.id,
              name: bidder.name,
              documentsSubmitted,
              totalCategories,
              progress,
              hasEvaluation: !!bidder.evaluation
            });

            return (
              <Link
                key={bidder.id}
                to={`/projects/${projectId}/tenders/${tenderId}/evaluation/${bidder.id}`}
                className={clsx(
                  "block bg-white rounded-lg border hover:border-primary-300 hover:shadow-md transition-all duration-200",
                  bidder.evaluation ? "border-success-200" : "border-gray-200"
                )}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 mr-4">
                        {bidder.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{bidder.name}</h3>
                        <p className="text-sm text-gray-500">
                          {documentsSubmitted} of {totalCategories} documents submitted
                        </p>
                      </div>
                    </div>

                    {bidder.evaluation ? (
                      <div className="flex items-center text-sm text-success-600 bg-success-50 px-3 py-1 rounded-full">
                        <Check size={14} className="mr-1" />
                        Evaluated
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                        <FileText size={14} className="mr-1" />
                        Pending
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Submission Progress</span>
                        <span className="font-medium text-gray-900">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full rounded-full transition-all duration-300",
                            progress === 100 ? "bg-success-500" : "bg-primary-500"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Document Categories */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {tender.categories.map((category) => {
                        const hasDocument = bidder.documents.some(d => d.categoryId === category.id);
                        
                        // Debug log for each category
                        console.log('Category Status:', {
                          categoryId: category.id,
                          categoryName: category.name,
                          bidderId: bidder.id,
                          hasDocument
                        });

                        return (
                          <div
                            key={category.id}
                            className={clsx(
                              "px-3 py-2 rounded-lg text-sm",
                              hasDocument ? "bg-success-50 text-success-700" : "bg-gray-50 text-gray-500"
                            )}
                          >
                            <div className="flex items-center">
                              {hasDocument ? (
                                <Check size={14} className="mr-1.5" />
                              ) : (
                                <FileText size={14} className="mr-1.5" />
                              )}
                              <span className="truncate">{category.name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BidderEvaluationList;