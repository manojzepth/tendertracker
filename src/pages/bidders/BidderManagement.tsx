import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, AlertTriangle, Users, Calendar, FileCheck, AlertCircle, Trash2, Eye, Download, ArrowRight } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import CategorySetupForm from '../../components/CategorySetupForm';
import BidderList from '../../components/BidderList';
import clsx from 'clsx';

const BidderManagement = () => {
  const { projectId, tenderId } = useParams<{ projectId: string; tenderId: string }>();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const [selectedBidderId, setSelectedBidderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const uploadDocument = useProjectStore(state => state.uploadDocument);
  
  useEffect(() => {
    setSelectedBidderId(null);
    setSelectedCategoryId(null);
    setUploadedFiles({});
    setPreviewUrl(null);
    setShowDocumentUpload(false);
  }, [tenderId]);
  
  const selectedBidder = selectedBidderId
    ? tender?.bidders.find(b => b.id === selectedBidderId)
    : null;
  
  const handleFileChange = async (categoryId: string, file: File) => {
    setUploadedFiles(prev => ({
      ...prev,
      [categoryId]: file,
    }));

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  };
  
  const handleUpload = (categoryId: string) => {
    if (selectedBidderId && uploadedFiles[categoryId]) {
      uploadDocument(selectedBidderId, {
        categoryId,
        name: uploadedFiles[categoryId].name,
        url: '#',
        uploadDate: new Date().toISOString().split('T')[0],
      });
      
      setUploadedFiles(prev => {
        const newState = { ...prev };
        delete newState[categoryId];
        return newState;
      });
      setPreviewUrl(null);
    }
  };
  
  const handleRemoveFile = (categoryId: string) => {
    setUploadedFiles(prev => {
      const newState = { ...prev };
      delete newState[categoryId];
      return newState;
    });
    setPreviewUrl(null);
  };
  
  if (!tender) {
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
        <p className="text-gray-500">Manage bidders and documents</p>
      </div>
      
      {tender.categories.length === 0 ? (
        <div className="mb-6">
          <div className="bg-warning-50 border-l-4 border-warning-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-warning-700">
                  Please set up document categories before adding bidders.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <CategorySetupForm tenderId={tenderId || ''} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bidders List */}
          <div className="lg:col-span-1">
            <BidderList 
              tenderId={tenderId || ''} 
              onBidderSelect={(bidderId) => {
                setSelectedBidderId(bidderId);
                setSelectedCategoryId(null);
                setUploadedFiles({});
                setPreviewUrl(null);
                setShowDocumentUpload(false);
              }}
            />
          </div>
          
          {/* Document Upload */}
          <div className="lg:col-span-2">
            {selectedBidder ? (
              <div className="space-y-6">
                {/* Required Documents List */}
                {!showDocumentUpload && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">Required Documents</h2>
                      <button
                        onClick={() => setShowDocumentUpload(true)}
                        className="btn btn-primary inline-flex items-center py-1.5 px-3 text-sm"
                      >
                        Next
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {tender.categories.map((category) => {
                          const existingDocs = selectedBidder.documents.filter(
                            d => d.categoryId === category.id
                          );
                          
                          return (
                            <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">Weight: {category.weight}%</p>
                              </div>
                              
                              {existingDocs.length > 0 ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                  <FileCheck size={12} className="mr-1" />
                                  Uploaded
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                                  <AlertCircle size={12} className="mr-1" />
                                  Required
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Document Upload Section */}
                {showDocumentUpload && (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
                      <h2 className="text-lg font-medium text-gray-900">
                        Upload Documents for {selectedBidder.name}
                      </h2>
                      <button
                        onClick={() => setShowDocumentUpload(false)}
                        className="btn btn-ghost inline-flex items-center py-1.5 px-3 text-sm"
                      >
                        Back to List
                      </button>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-6">
                        {tender.categories.map((category) => {
                          const existingDocs = selectedBidder.documents.filter(
                            d => d.categoryId === category.id
                          );
                          
                          return (
                            <div
                              key={category.id}
                              className={clsx(
                                "p-4 border rounded-md",
                                selectedCategoryId === category.id
                                  ? "border-primary-300 bg-primary-50"
                                  : "border-gray-200 hover:border-primary-200 hover:bg-gray-50",
                                "cursor-pointer transition-colors"
                              )}
                              onClick={() => setSelectedCategoryId(category.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-md font-medium text-gray-900 mb-1">{category.name}</h3>
                                  <p className="text-sm text-gray-500">Weight: {category.weight}%</p>
                                </div>
                                
                                {existingDocs.length > 0 ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                                    <FileCheck size={12} className="mr-1" />
                                    {existingDocs.length} Document{existingDocs.length > 1 ? 's' : ''} Uploaded
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                                    <AlertCircle size={12} className="mr-1" />
                                    Required
                                  </span>
                                )}
                              </div>
                              
                              {selectedCategoryId === category.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  {existingDocs.length > 0 && (
                                    <div className="mb-4">
                                      <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
                                      <div className="space-y-2">
                                        {existingDocs.map((doc) => (
                                          <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                            <div className="flex items-center text-sm">
                                              <FileText size={16} className="text-gray-400 mr-2" />
                                              <div>
                                                <span className="text-gray-700 font-medium">{doc.name}</span>
                                                <div className="text-xs text-gray-500">
                                                  Uploaded on {doc.uploadDate}
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex space-x-2">
                                              <button
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                title="Preview"
                                              >
                                                <Eye size={16} />
                                              </button>
                                              <button
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                                title="Download"
                                              >
                                                <Download size={16} />
                                              </button>
                                              <button
                                                className="p-1 text-error-400 hover:text-error-600"
                                                title="Delete"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                      Upload New Document
                                    </h4>
                                    
                                    {uploadedFiles[category.id] ? (
                                      <div className="mb-4 p-4 bg-gray-50 rounded-md">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <FileText size={20} className="text-gray-400 mr-3" />
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">
                                                {uploadedFiles[category.id].name}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {(uploadedFiles[category.id].size / 1024 / 1024).toFixed(2)} MB
                                              </p>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => handleRemoveFile(category.id)}
                                            className="text-error-600 hover:text-error-800"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                        
                                        {previewUrl && (
                                          <div className="mt-4 border rounded-md overflow-hidden">
                                            {uploadedFiles[category.id].type.startsWith('image/') ? (
                                              <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-h-48 w-full object-contain"
                                              />
                                            ) : uploadedFiles[category.id].type === 'application/pdf' ? (
                                              <iframe
                                                src={previewUrl}
                                                title="PDF Preview"
                                                className="w-full h-48"
                                              />
                                            ) : null}
                                          </div>
                                        )}
                                        
                                        <div className="mt-4">
                                          <button
                                            onClick={() => handleUpload(category.id)}
                                            className="btn btn-primary w-full"
                                          >
                                            <Upload size={16} className="mr-2" />
                                            Upload Document
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <div className="text-center">
                                          <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                                          <p className="text-sm font-medium text-gray-900">
                                            Drop your file here, or{' '}
                                            <label className="text-primary-600 hover:text-primary-800 cursor-pointer">
                                              browse
                                              <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => e.target.files && handleFileChange(category.id, e.target.files[0])}
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                              />
                                            </label>
                                          </p>
                                          <p className="text-xs text-gray-500 mt-1">
                                            PDF, Word, Excel, or Image up to 10MB
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                  <h2 className="text-lg font-medium text-gray-900">Document Upload</h2>
                </div>
                
                <div className="p-6 text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                    <Users size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Select a Bidder</h3>
                  <p className="text-gray-500 mb-4">
                    Select a bidder from the list to upload and manage their documents.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BidderManagement;