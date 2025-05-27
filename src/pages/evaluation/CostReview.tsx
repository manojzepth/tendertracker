import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calculator, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import { Bar } from 'react-chartjs-2';
import clsx from 'clsx';

const CostReview = () => {
  const { projectId, tenderId, bidderId } = useParams();
  const navigate = useNavigate();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const bidder = tender?.bidders.find(b => b.id === bidderId);
  
  const [costData] = useState({
    directCosts: 750000,
    indirectCosts: 150000,
    contingency: 50000,
    profit: 100000,
    totalBid: 1050000,
    marketAverage: 1100000,
    varianceToMarket: -4.5,
    riskItems: [
      { item: 'Labor Rates', impact: 'Medium', description: 'Below market average by 10%' },
      { item: 'Material Costs', impact: 'High', description: 'Significant price volatility risk' },
      { item: 'Equipment Rates', impact: 'Low', description: 'Within acceptable range' }
    ],
    costBreakdown: {
      labor: 400000,
      materials: 250000,
      equipment: 100000,
      subcontractors: 150000,
      overhead: 100000,
      profit: 50000
    }
  });

  if (!tender || !bidder) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Bidder not found.</p>
      </div>
    );
  }

  const costBreakdownData = {
    labels: ['Labor', 'Materials', 'Equipment', 'Subcontractors', 'Overhead', 'Profit'],
    datasets: [
      {
        label: 'Cost Breakdown',
        data: Object.values(costData.costBreakdown),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  const costBreakdownOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => navigate(`/projects/${projectId}/tenders/${tenderId}/evaluation/${bidderId}`)}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Evaluation
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cost Review for {bidder.name}</h1>
            <p className="text-sm text-gray-500">Detailed cost analysis and risk assessment</p>
          </div>
          
          <button
            onClick={() => navigate(`/projects/${projectId}/tenders/${tenderId}/reports`)}
            className="btn btn-primary inline-flex items-center"
          >
            <ArrowRight size={16} className="mr-2" />
            Proceed to Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <DollarSign size={20} />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">Total Bid Amount</h3>
                  <p className="text-2xl font-bold text-gray-900">${costData.totalBid.toLocaleString()}</p>
                </div>
              </div>
              <div className={clsx(
                "px-3 py-1 rounded-full text-sm font-medium",
                costData.varianceToMarket <= 0
                  ? "bg-success-100 text-success-800"
                  : "bg-warning-100 text-warning-800"
              )}>
                {costData.varianceToMarket}% vs Market
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Direct Costs</p>
                <p className="font-medium text-gray-900">${costData.directCosts.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Indirect Costs</p>
                <p className="font-medium text-gray-900">${costData.indirectCosts.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Contingency</p>
                <p className="font-medium text-gray-900">${costData.contingency.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Profit</p>
                <p className="font-medium text-gray-900">${costData.profit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-lg bg-warning-100 flex items-center justify-center text-warning-600">
                <AlertTriangle size={20} />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">Risk Assessment</h3>
            </div>
            <div className="space-y-4">
              {costData.riskItems.map((risk, index) => (
                <div key={index} className="flex items-start">
                  <div className={clsx(
                    "h-6 w-6 rounded-full flex items-center justify-center mt-0.5",
                    risk.impact === 'High' ? "bg-error-100 text-error-600" :
                    risk.impact === 'Medium' ? "bg-warning-100 text-warning-600" :
                    "bg-success-100 text-success-600"
                  )}>
                    <AlertTriangle size={14} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{risk.item}</p>
                    <p className="text-sm text-gray-500">{risk.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Comparison */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">Market Analysis</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Market Average</span>
                <span className="font-medium text-gray-900">${costData.marketAverage.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-full bg-accent-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Bid Amount</span>
                <span className="font-medium text-gray-900">${costData.totalBid.toLocaleString()}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className={clsx(
                    "h-full rounded-full",
                    costData.varianceToMarket <= 0 ? "bg-success-500" : "bg-warning-500"
                  )}
                  style={{ width: `${(costData.totalBid / costData.marketAverage) * 100}%` }}
                />
              </div>
            </div>
            
            <div className={clsx(
              "flex items-center p-4 rounded-lg",
              costData.varianceToMarket <= 0 ? "bg-success-50" : "bg-warning-50"
            )}>
              {costData.varianceToMarket <= 0 ? (
                <TrendingDown size={20} className="text-success-600" />
              ) : (
                <TrendingUp size={20} className="text-warning-600" />
              )}
              <div className="ml-3">
                <p className={clsx(
                  "text-sm font-medium",
                  costData.varianceToMarket <= 0 ? "text-success-900" : "text-warning-900"
                )}>
                  {Math.abs(costData.varianceToMarket)}% {costData.varianceToMarket <= 0 ? 'Below' : 'Above'} Market
                </p>
                <p className="text-sm text-gray-500">
                  {costData.varianceToMarket <= 0 ? 'Competitive pricing' : 'Higher than average'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Breakdown Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-sm font-medium text-gray-900">Cost Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="h-[400px]">
              <Bar options={costBreakdownOptions} data={costBreakdownData} />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <h2 className="text-sm font-medium text-gray-900">Recommendations</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <CheckCircle size={16} className="text-success-500 mt-1 mr-2" />
                <p className="text-sm text-gray-600">Overall pricing is competitive and below market average</p>
              </div>
              <div className="flex items-start">
                <AlertTriangle size={16} className="text-warning-500 mt-1 mr-2" />
                <p className="text-sm text-gray-600">Request clarification on material cost assumptions due to market volatility</p>
              </div>
              <div className="flex items-start">
                <AlertTriangle size={16} className="text-warning-500 mt-1 mr-2" />
                <p className="text-sm text-gray-600">Consider increasing contingency allocation for labor rate risks</p>
              </div>
              <div className="flex items-start">
                <CheckCircle size={16} className="text-success-500 mt-1 mr-2" />
                <p className="text-sm text-gray-600">Equipment rates are well-justified and within market norms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostReview;