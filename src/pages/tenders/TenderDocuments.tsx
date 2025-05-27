import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Eye, AlertCircle, Upload, X } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import clsx from 'clsx';

const DOCUMENT_CATEGORIES = [
  { value: 'administrative', label: 'Administrative Documents', description: 'Legal and administrative requirements' },
  { value: 'technical', label: 'Scope & Technical Documents', description: 'Technical specifications and requirements' },
  { value: 'legal', label: 'Contractual & Legal Documents', description: 'Terms, conditions and legal agreements' },
  { value: 'evaluation', label: 'Evaluation Criteria', description: 'Bid evaluation methodology and criteria' },
  { value: 'submission', label: 'Submission Requirements', description: 'Instructions and requirements for bid submission' }
] as const;

const TenderDocuments = () => {
  const { projectId, tenderId } = useParams<{ projectId: string; tenderId: string }>();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const documents = useProjectStore(state => state.getTenderDocuments(tenderId || ''));
  const uploadTenderDocument = useProjectStore(state => state.uploadTenderDocument);
  const removeTenderDocument = useProjectStore(state => state.removeTenderDocument);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  if (!tender) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Tender not found.</p>
      </div>
    );
  }

  const handleFileSelect = async (category: string, file: File) => {
    setSelectedCategory(category);
    setSelectedFile(file);

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedCategory || !tenderId) return;

    uploadTenderDocument(tenderId, {
      category: selectedCategory as typeof DOCUMENT_CATEGORIES[number]['value'],
      name: selectedFile.name,
      url: URL.createObjectURL(selectedFile),
      uploadDate: new Date().toISOString().split('T')[0],
    });

    setSelectedFile(null);
    setSelectedCategory(null);
    setPreviewUrl(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{tender.name}</h1>
        <p className="text-gray-500">Tender Documents</p>
      </div>

      <div className="space-y-6">
        {DOCUMENT_CATEGORIES.map(category => {
          const categoryDocuments = documents.filter(doc => doc.category === category.value);
          const isSelected = selectedCategory === category.value;
          
          return (
            <div 
              key={category.value} 
              className={clsx(
                "bg-white rounded-lg border overflow-hidden transition-colors",
                isSelected ? "border-primary-300" : "border-gray-200"
              )}
            >
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <h2 className="text-sm font-medium text-gray-900">{category.label}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
              </div>
              
              <div className="p-4">
                {/* Existing Documents */}
                {categoryDocuments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {categoryDocuments.map(document => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <FileText size={16} className="text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{document.name}</p>
                            <p className="text-xs text-gray-500">Uploaded on {document.uploadDate}</p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(document.url, '_blank')}
                            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => window.open(document.url, '_blank')}
                            className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => tenderId && document.id && removeTenderDocument(tenderId, document.id)}
                            className="p-1.5 text-error-500 hover:text-error-700 rounded-full hover:bg-error-50"
                            title="Remove"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Interface */}
                {isSelected && selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <FileText size={20} className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {previewUrl && (
                      <div className="border rounded-lg overflow-hidden">
                        {selectedFile.type.startsWith('image/') ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-48 w-full object-contain"
                          />
                        ) : selectedFile.type === 'application/pdf' ? (
                          <iframe
                            src={previewUrl}
                            title="PDF Preview"
                            className="w-full h-48"
                          />
                        ) : null}
                      </div>
                    )}
                    
                    <button
                      onClick={handleUpload}
                      className="btn btn-primary w-full"
                    >
                      <Upload size={16} className="mr-2" />
                      Upload Document
                    </button>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                      isSelected ? "border-primary-300 bg-primary-50" : "border-gray-300 hover:border-primary-300 hover:bg-gray-50"
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file) handleFileSelect(category.value, file);
                    }}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-900 mb-1">
                      Drop your file here, or{' '}
                      <label className="text-primary-600 hover:text-primary-800 cursor-pointer">
                        browse
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(category.value, file);
                          }}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        />
                      </label>
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, Word, Excel, or Image up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TenderDocuments;