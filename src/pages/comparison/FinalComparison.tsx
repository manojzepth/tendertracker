import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Users, Award, FileText, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowRight, Brain, Lightbulb, Scale } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement, Filler } from 'chart.js';
import { Bar, Radar } from 'react-chartjs-2';
import clsx from 'clsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const FinalComparison = () => {
  const { projectId, tenderId } = useParams<{ projectId: string; tenderId: string }>();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const [sortField, setSortField] = useState<string>('overallScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  if (!tender) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Tender not found.</p>
      </div>
    );
  }
  
  // Filter out bidders without evaluations
  const evaluatedBidders = tender.bidders.filter(b => b.evaluation);
  
  // Sort bidders based on sort field and direction
  const sortedBidders = [...evaluatedBidders].sort((a, b) => {
    if (sortField === 'overallScore') {
      const scoreA = a.evaluation?.overallScore || 0;
      const scoreB = b.evaluation?.overallScore || 0;
      return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    } else if (sortField === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      // For category scores
      const categoryId = sortField;
      const scoreA = a.evaluation?.categoryScores[categoryId]?.score || 0;
      const scoreB = b.evaluation?.categoryScores[categoryId]?.score || 0;
      return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    }
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleRowExpanded = (bidderId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [bidderId]: !prev[bidderId],
    }));
  };

  // Prepare chart data
  const chartData = {
    labels: sortedBidders.map(b => b.name),
    datasets: [
      {
        label: 'Overall Score',
        data: sortedBidders.map(b => b.evaluation?.overallScore || 0),
        backgroundColor: sortedBidders.map(b => {
          const score = b.evaluation?.overallScore || 0;
          if (score >= 80) return 'rgba(34, 197, 94, 0.8)'; // success
          if (score >= 70) return 'rgba(59, 130, 246, 0.8)'; // primary
          if (score >= 60) return 'rgba(245, 158, 11, 0.8)'; // warning
          return 'rgba(239, 68, 68, 0.8)'; // error
        }),
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Score: ${context.raw}/100`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score',
          font: {
            size: 12,
            weight: 'medium'
          }
        },
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: 20
        }
      },
      y: {
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  // Generate category comparison chart data
  const categoryChartData = {
    labels: tender.categories.map(c => c.name),
    datasets: sortedBidders.map((bidder, index) => {
      const colors = [
        'rgba(34, 197, 94, 0.8)', // success
        'rgba(59, 130, 246, 0.8)', // primary
        'rgba(245, 158, 11, 0.8)', // warning
        'rgba(239, 68, 68, 0.8)', // error
      ];
      return {
        label: bidder.name,
        data: tender.categories.map(c => bidder.evaluation?.categoryScores[c.id]?.score || 0),
        backgroundColor: colors[index % colors.length],
        borderWidth: 0,
        borderRadius: 4,
      };
    }),
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 20,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score',
          font: {
            size: 12,
            weight: 'medium'
          }
        },
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          stepSize: 20
        }
      },
      x: {
        title: {
          display: true,
          text: 'Categories',
          font: {
            size: 12,
            weight: 'medium'
          }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  // Innovation Index Chart Data
  const innovationData = {
    labels: ['Technical Innovation', 'Process Innovation', 'Digital Integration', 'Sustainability', 'Cost Efficiency', 'Risk Management'],
    datasets: sortedBidders.map((bidder, index) => ({
      label: bidder.name,
      data: [
        85 - index * 10, // Technical Innovation
        80 - index * 8,  // Process Innovation
        90 - index * 12, // Digital Integration
        88 - index * 9,  // Sustainability
        82 - index * 7,  // Cost Efficiency
        87 - index * 11  // Risk Management
      ],
      backgroundColor: `rgba(59, 130, 246, ${0.7 - index * 0.15})`,
      borderColor: `rgba(59, 130, 246, ${0.8 - index * 0.15})`,
      borderWidth: 2,
      fill: true
    }))
  };

  const innovationOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  // Clarity & Completeness Score Data
  const clarityData = {
    labels: sortedBidders.map(b => b.name),
    datasets: [
      {
        label: 'Documentation Clarity',
        data: sortedBidders.map((_, i) => 90 - i * 8),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderRadius: 4
      },
      {
        label: 'Information Completeness',
        data: sortedBidders.map((_, i) => 88 - i * 10),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderRadius: 4
      }
    ]
  };

  const clarityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score',
          font: { size: 12 }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  // Sustainability Score Data
  const sustainabilityData = {
    labels: ['Environmental Impact', 'Resource Efficiency', 'Waste Management', 'Green Technologies'],
    datasets: sortedBidders.map((bidder, index) => ({
      label: bidder.name,
      data: [
        92 - index * 10, // Environmental Impact
        88 - index * 8,  // Resource Efficiency
        85 - index * 9,  // Waste Management
        90 - index * 11  // Green Technologies
      ],
      backgroundColor: index === 0 ? 'rgba(34, 197, 94, 0.7)' :
                      index === 1 ? 'rgba(59, 130, 246, 0.7)' :
                      index === 2 ? 'rgba(245, 158, 11, 0.7)' :
                                  'rgba(239, 68, 68, 0.7)',
      borderRadius: 4
    }))
  };

  const sustainabilityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Score',
          font: { size: 12 }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tender.name}</h1>
        <p className="text-gray-500">Final Comparison & Recommendation</p>
      </div>
      
      {evaluatedBidders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-warning-100 flex items-center justify-center text-warning-600 mb-4">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Evaluations Available</h3>
          <p className="text-gray-500 mb-4">
            None of the bidders have been evaluated yet. Please complete the document evaluation process first.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Performer Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-success-500 to-success-600 rounded-lg text-white p-6">
              <div className="flex items-center mb-4">
                <Award size={24} className="mr-2" />
                <h2 className="text-lg font-semibold">Top Performer</h2>
              </div>
              <div className="flex items-center space-x-6">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-3xl font-bold">{sortedBidders[0]?.evaluation?.overallScore}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{sortedBidders[0]?.name}</h3>
                  <p className="text-white/90 leading-relaxed">
                    {sortedBidders[0]?.evaluation?.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Evaluated Bidders</span>
                    <span className="text-lg font-semibold text-gray-900">{evaluatedBidders.length}</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${(evaluatedBidders.length / tender.bidders.length) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {Math.round(evaluatedBidders.reduce((sum, b) => sum + (b.evaluation?.overallScore || 0), 0) / evaluatedBidders.length)}
                    </span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full">
                    <div 
                      className="h-full bg-success-500 rounded-full"
                      style={{ width: `${(evaluatedBidders.reduce((sum, b) => sum + (b.evaluation?.overallScore || 0), 0) / evaluatedBidders.length)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Score Chart */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center">
                <BarChart3 size={18} className="text-gray-500 mr-2" />
                <h2 className="text-sm font-medium text-gray-900">Overall Score Comparison</h2>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <Bar options={chartOptions} data={chartData} />
                </div>
              </div>
            </div>

            {/* Innovation Index */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center">
                <Brain size={18} className="text-primary-600 mr-2" />
                <h2 className="text-sm font-medium text-gray-900">Innovation Index</h2>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <Radar data={innovationData} options={innovationOptions} />
                </div>
              </div>
            </div>

            {/* Documentation Quality Analysis */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center">
                <Lightbulb size={18} className="text-primary-600 mr-2" />
                <h2 className="text-sm font-medium text-gray-900">Documentation Quality Analysis</h2>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <Bar data={clarityData} options={clarityOptions} />
                </div>
              </div>
            </div>

            {/* Sustainability Assessment */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center">
                <Scale size={18} className="text-primary-600 mr-2" />
                <h2 className="text-sm font-medium text-gray-900">Sustainability Assessment</h2>
              </div>
              <div className="p-6">
                <div className="h-[300px]">
                  <Bar data={sustainabilityData} options={sustainabilityOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Category Comparison */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-sm font-medium text-gray-900">Category Score Comparison</h2>
            </div>
            <div className="p-6">
              <div className="h-[400px]">
                <Bar options={categoryChartOptions} data={categoryChartData} />
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
              <h2 className="text-sm font-medium text-gray-900">Detailed Comparison</h2>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-500 py-2 pr-4">Category</th>
                      {sortedBidders.map((bidder, index) => (
                        <th key={bidder.id} className="text-center text-sm font-medium text-gray-500 py-2 px-4">
                          <div className="flex flex-col items-center">
                            <span className="mb-1">{bidder.name}</span>
                            <div className={clsx(
                              "h-8 w-8 rounded-full flex items-center justify-center text-white font-medium",
                              bidder.evaluation?.overallScore >= 80 ? "bg-success-500" :
                              bidder.evaluation?.overallScore >= 70 ? "bg-primary-500" :
                              bidder.evaluation?.overallScore >= 60 ? "bg-warning-500" :
                              "bg-error-500"
                            )}>
                              {bidder.evaluation?.overallScore}
                            </div>
                            {index === 0 && (
                              <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                Top Performer
                              </span>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tender.categories.map(category => (
                      <tr key={category.id} className="border-t border-gray-100">
                        <td className="text-sm font-medium text-gray-900 py-4 pr-4">
                          <div>
                            <p>{category.name}</p>
                            <p className="text-xs text-gray-500">Weight: {category.weight}%</p>
                          </div>
                        </td>
                        {sortedBidders.map((bidder, bidderIndex) => {
                          const score = bidder.evaluation?.categoryScores[category.id]?.score || 0;
                          const topScore = sortedBidders[0].evaluation?.categoryScores[category.id]?.score || 0;
                          const diff = score - topScore;

                          return (
                            <td key={bidder.id} className="text-center py-4 px-4">
                              <div className="flex flex-col items-center">
                                <div className={clsx(
                                  "h-10 w-10 rounded-full flex items-center justify-center text-white font-medium mb-1",
                                  score >= 80 ? "bg-success-500" :
                                  score >= 70 ? "bg-primary-500" :
                                  score >= 60 ? "bg-warning-500" :
                                  "bg-error-500"
                                )}>
                                  {score}
                                </div>
                                {bidderIndex > 0 && (
                                  <div className="flex items-center text-xs">
                                    {diff > 0 ? (
                                      <span className="text-success-600">+{diff}</span>
                                    ) : diff < 0 ? (
                                      <span className="text-error-600">{diff}</span>
                                    ) : (
                                      <span className="text-gray-500">0</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalComparison;