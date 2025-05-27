import React from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Globe, User, Briefcase, Calendar, FileText, Upload, Check, AlertCircle, Download, Eye, X, Brain, Loader2, Play } from 'lucide-react';
import { useBidders } from '@/hooks/useBidders';
import useProjectStore from '@/store/projectStore';
import clsx from 'clsx';

const REQUIRED_DOCUMENTS = [
  { id: 'pow', name: 'Programme of Works', weight: 10, description: 'Detailed project timeline and milestones' },
  { id: 'method', name: 'Method Statement', weight: 10, description: 'Construction methodology and approach' },
  { id: 'logistics', name: 'Site Logistic Plan', weight: 8, description: 'Site organization and material flow' },
  { id: 'org', name: 'Project Organisation Chart', weight: 5, description: 'Team structure and reporting lines' },
  { id: 'cv', name: "CV's of Key Personnel", weight: 8, description: 'Professional profiles of key team members' },
  { id: 'suppliers', name: 'List of Manufacturers and Suppliers', weight: 6, description: 'Proposed material sources' },
  { id: 'machinery', name: 'Planned Machinery and Equipment', weight: 6, description: 'Resources allocation plan' },
  { id: 'facilities', name: 'Plant and Facilities Layout', weight: 5, description: 'Site facilities arrangement' },
  { id: 'poa', name: 'Power of Attorney', weight: 4, description: 'Legal authorization document' },
  { id: 'license', name: 'Valid Trade License', weight: 4, description: 'Current business permits' },
  { id: 'quality', name: 'Quality Plan', weight: 8, description: 'Quality assurance procedures' },
  { id: 'safety', name: 'Health and Safety Plan', weight: 8, description: 'HSE policies and procedures' },
  { id: 'site', name: 'Statement of Site Visit', weight: 4, description: 'Site inspection confirmation' },
  { id: 'quals', name: 'List of Qualifications', weight: 6, description: 'Company certifications and capabilities' },
  { id: 'insurance', name: 'Insurance Policies', weight: 4, description: 'Required coverage documentation' },
  { id: 'workload', name: 'Existing Projects and Workload', weight: 4, description: 'Current commitments' }
];

const BidderDetails: React.FC = () => {
  const { bidderId } = useParams<{ bidderId: string }>();
  const { getBidder, loading, error } = useBidders();
  const [bidder, setBidder] = React.useState<any>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = React.useState<string | null>(null);
  const [analyzingDoc, setAnalyzingDoc] = React.useState<string | null>(null);
  const [runningDoc, setRunningDoc] = React.useState<string | null>(null);
  const uploadDocument = useProjectStore(state => state.uploadDocument);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (!bidderId) {
          throw new Error('Bidder ID is required');
        }

        const bidderData = await getBidder(bidderId);
        if (!bidderData) {
          throw new Error('Bidder not found');
        }
        setBidder(bidderData);
      } catch (err) {
        console.error('Error fetching bidder:', err);
      }
    };

    fetchData();
  }, [bidderId, getBidder]);

  const handleFileSelect = async (docId: string, file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    if (file.size > 26214400) { // 25MB
      alert('File size must be less than 25MB');
      return;
    }

    setSelectedFile(file);
    handleUpload(docId, file);
  };

  const handleUpload = async (docId: string, file: File) => {
    try {
      setUploadingDoc(docId);
      
      await uploadDocument(bidderId!, file, {
        categoryId: docId,
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0]
      });

      // Refresh bidder data
      const updatedBidder = await getBidder(bidderId!);
      if (updatedBidder) {
        setBidder(updatedBidder);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingDoc(null);
      setSelectedFile(null);
    }
  };

  const handleAnalyze = async (docId: string, url: string) => {
    try {
      setAnalyzingDoc(docId);
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implement actual AI analysis
      alert('AI analysis completed! This is a placeholder for the actual implementation.');
    } catch (err) {
      console.error('Error analyzing document:', err);
      alert('Failed to analyze document. Please try again.');
    } finally {
      setAnalyzingDoc(null);
    }
  };

  const handleRun = async (docId: string) => {
    try {
      setRunningDoc(docId);
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      // TODO: Implement actual document processing
      alert('Document processing completed! This is a placeholder for the actual implementation.');
    } catch (err) {
      console.error('Error processing document:', err);
      alert('Failed to process document. Please try again.');
    } finally {
      setRunningDoc(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  if (!bidder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Bidder not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Bidder Info Card */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">{bidder.name}</h1>
          <p className="text-blue-100 mt-1">{bidder.contactPerson} - {bidder.contactPosition}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <span>{bidder.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span>{bidder.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span>{bidder.address}, {bidder.city}, {bidder.country}</span>
              </div>
              {bidder.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <a href={bidder.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {bidder.website}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-gray-500" />
                <span>Company Size: {bidder.companySize}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span>Established: {bidder.yearEstablished}</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500" />
                <span>Contact Person: {bidder.contactPerson}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <span>Position: {bidder.contactPosition}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Required Documents</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Category
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Process
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {REQUIRED_DOCUMENTS.map((doc) => {
                const uploadedDoc = bidder.documents.find((d: any) => d.categoryId === doc.id);
                
                return (
                  <tr key={doc.id} className={clsx(
                    "hover:bg-gray-50 transition-colors",
                    uploadingDoc === doc.id && "bg-blue-50"
                  )}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500">{doc.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{doc.weight}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {uploadedDoc ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Check size={12} className="mr-1" />
                            Uploaded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <AlertCircle size={12} className="mr-1" />
                            Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {uploadedDoc ? (
                        <div className="flex items-center">
                          <FileText size={16} className="text-gray-400 mr-2" />
                          <span className="truncate">{uploadedDoc.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No file uploaded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {uploadedDoc ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => window.open(uploadedDoc.url, '_blank')}
                            className="text-gray-400 hover:text-gray-500"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => window.open(uploadedDoc.url, '_blank')}
                            className="text-gray-400 hover:text-gray-500"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => {/* Implement delete */}}
                            className="text-red-400 hover:text-red-500"
                            title="Delete"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            type="file"
                            id={`file-${doc.id}`}
                            className="hidden"
                            accept="application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileSelect(doc.id, file);
                            }}
                          />
                          <label
                            htmlFor={`file-${doc.id}`}
                            className={clsx(
                              "inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white",
                              "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
                              "cursor-pointer"
                            )}
                          >
                            {uploadingDoc === doc.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Upload size={16} className="mr-1" />
                            )}
                            Upload
                          </label>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {uploadedDoc && (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleAnalyze(doc.id, uploadedDoc.url)}
                            disabled={analyzingDoc === doc.id || runningDoc === doc.id}
                            className={clsx(
                              "inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md",
                              analyzingDoc === doc.id
                                ? "bg-indigo-100 text-indigo-800 border-indigo-200"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent",
                              "transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            )}
                          >
                            {analyzingDoc === doc.id ? (
                              <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Brain size={16} className="mr-2" />
                                AI
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRun(doc.id)}
                            disabled={runningDoc === doc.id || analyzingDoc === doc.id}
                            className={clsx(
                              "inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md",
                              runningDoc === doc.id
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-green-600 text-white hover:bg-green-700 border-transparent",
                              "transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            )}
                          >
                            {runningDoc === doc.id ? (
                              <>
                                <Loader2 size={16} className="animate-spin mr-2" />
                                Running...
                              </>
                            ) : (
                              <>
                                <Play size={16} className="mr-2" />
                                Run
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BidderDetails;