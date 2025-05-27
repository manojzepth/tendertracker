import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Plus, ChevronRight, MoreVertical, Calendar, DollarSign, Building2, Clock, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import clsx from 'clsx';

const DISCIPLINES = [
  'Civil Works',
  'MEP',
  'Interior Design',
  'Architecture',
  'Structural',
  'HVAC',
  'Electrical',
  'Plumbing',
  'Fire Fighting',
  'Landscaping',
  'Other'
];

const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'AED',
  'SAR'
];

const DOCUMENT_CATEGORIES = [
  { value: 'administrative', label: 'Administrative Documents' },
  { value: 'technical', label: 'Scope & Technical Documents' },
  { value: 'legal', label: 'Contractual & Legal Documents' },
  { value: 'evaluation', label: 'Evaluation Criteria' },
  { value: 'submission', label: 'Submission Requirements' }
] as const;

const TenderSetup = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, loading, error, fetchProjects } = useProjectStore();
  const project = useProjectStore(state => state.getProjectById(projectId || ''));
  const tenders = project ? project.tenders : [];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Debug logging
  useEffect(() => {
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Project:', project);
    console.log('Tenders:', tenders);
    console.log('Project ID:', projectId);
  }, [loading, error, project, tenders, projectId]);
  
  const [newTender, setNewTender] = useState({
    name: '',
    discipline: '',
    value: '',
    currency: 'USD',
    startDate: '',
    endDate: '',
    description: '',
    customDiscipline: ''
  });
  
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
  const uploadTenderDocument = useProjectStore(state => state.uploadTenderDocument);
  const addTender = useProjectStore(state => state.addTender);
  
  const handleFileChange = (category: string, file: File) => {
    setSelectedFiles(prev => ({
      ...prev,
      [category]: file
    }));
  };
  
  const handleAddTender = async () => {
    if (newTender.name.trim() && projectId) {
      try {
        // Add tender
        const tender = await addTender(projectId, {
          name: newTender.name.trim(),
          discipline: newTender.discipline === 'Other' ? newTender.customDiscipline.trim() : newTender.discipline,
          value: parseFloat(newTender.value) || 0,
          currency: newTender.currency,
          startDate: newTender.startDate,
          endDate: newTender.endDate,
          description: newTender.description.trim(),
          status: 'draft',
        });

        console.log('New tender created:', tender);
        
        // Upload documents
        for (const [category, file] of Object.entries(selectedFiles)) {
          try {
            await uploadTenderDocument(tender.id, {
              category: category as 'administrative' | 'technical' | 'legal' | 'evaluation' | 'submission',
              name: file.name,
              url: URL.createObjectURL(file),
              uploadDate: new Date().toISOString().split('T')[0],
            });
          } catch (error) {
            console.error('Error uploading document:', error);
          }
        }
        
        // Reset form
        setNewTender({
          name: '',
          discipline: '',
          value: '',
          currency: 'USD',
          startDate: '',
          endDate: '',
          description: '',
          customDiscipline: ''
        });
        setSelectedFiles({});
        setIsAddModalOpen(false);
      } catch (error) {
        console.error('Error creating tender:', error);
      }
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock size={12} className="mr-1" />
            Draft
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircle size={12} className="mr-1" />
            Open
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <AlertCircle size={12} className="mr-1" />
            Closed
          </span>
        );
      case 'awarded':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
            <Building2 size={12} className="mr-1" />
            Awarded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-error-600 mb-4">Error loading project data</p>
          <button 
            onClick={() => fetchProjects()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500">Manage tenders for this project</p>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <FileText size={18} className="text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Tenders</h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary inline-flex items-center py-1.5 px-3 text-sm"
          >
            <Plus size={16} className="mr-1" />
            Add Tender
          </button>
        </div>
        
        {tenders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discipline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenders.map((tender) => (
                  <tr 
                    key={tender.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${projectId}/tenders/${tender.id}/bidders`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                          <FileText size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{tender.name}</div>
                          <div className="text-sm text-gray-500">{tender.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tender.discipline}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {tender.value.toLocaleString()} {tender.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(tender.startDate).toLocaleDateString()} - {new Date(tender.endDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.ceil((new Date(tender.endDate).getTime() - new Date(tender.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tender.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${projectId}/tenders/${tender.id}/documents`);
                        }}
                        className="text-sm text-primary-600 hover:text-primary-900"
                      >
                        View Documents ({tender.documents.length})
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tenders found</h3>
            <p className="text-gray-500 mb-4">
              You haven't created any tenders for this project yet.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Tender
            </button>
          </div>
        )}
      </div>
      
      {/* Add Tender Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsAddModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Tender</h3>
                
                <div className="space-y-4">
                  {/* Tender Name */}
                  <div>
                    <label htmlFor="tenderName" className="form-label required">
                      Tender Name
                    </label>
                    <input
                      type="text"
                      id="tenderName"
                      value={newTender.name}
                      onChange={(e) => setNewTender(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      placeholder="Enter tender name"
                      required
                    />
                  </div>
                  
                  {/* Discipline */}
                  <div>
                    <label htmlFor="discipline" className="form-label required">
                      Discipline
                    </label>
                    <select
                      id="discipline"
                      value={newTender.discipline}
                      onChange={(e) => setNewTender(prev => ({ ...prev, discipline: e.target.value }))}
                      className="form-select"
                      required
                    >
                      <option value="">Select discipline</option>
                      {DISCIPLINES.map(discipline => (
                        <option key={discipline} value={discipline}>{discipline}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Custom Discipline */}
                  {newTender.discipline === 'Other' && (
                    <div>
                      <label htmlFor="customDiscipline" className="form-label required">
                        Specify Discipline
                      </label>
                      <input
                        type="text"
                        id="customDiscipline"
                        value={newTender.customDiscipline}
                        onChange={(e) => setNewTender(prev => ({ ...prev, customDiscipline: e.target.value }))}
                        className="form-input"
                        placeholder="Enter discipline name"
                        required
                      />
                    </div>
                  )}
                  
                  {/* Tender Value */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tenderValue" className="form-label required">
                        Tender Value
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="tenderValue"
                          value={newTender.value}
                          onChange={(e) => setNewTender(prev => ({ ...prev, value: e.target.value }))}
                          className="form-input pl-8"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="currency" className="form-label required">
                        Currency
                      </label>
                      <select
                        id="currency"
                        value={newTender.currency}
                        onChange={(e) => setNewTender(prev => ({ ...prev, currency: e.target.value }))}
                        className="form-select"
                        required
                      >
                        {CURRENCIES.map(currency => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="form-label required">
                        Start Date
                      </label>
                      <input
                        type="date"
                        id="startDate"
                        value={newTender.startDate}
                        onChange={(e) => setNewTender(prev => ({ ...prev, startDate: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="form-label required">
                        End Date
                      </label>
                      <input
                        type="date"
                        id="endDate"
                        value={newTender.endDate}
                        onChange={(e) => setNewTender(prev => ({ ...prev, endDate: e.target.value }))}
                        className="form-input"
                        min={newTender.startDate}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newTender.description}
                      onChange={(e) => setNewTender(prev => ({ ...prev, description: e.target.value }))}
                      className="form-input"
                      rows={3}
                      placeholder="Enter tender description"
                    />
                  </div>

                  {/* Document Upload Section */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tender Documents</h4>
                    
                    <div className="space-y-3">
                      {DOCUMENT_CATEGORIES.map(category => (
                        <div key={category.value}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {category.label}
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(category.value, file);
                              }}
                              className="hidden"
                              id={`file-${category.value}`}
                              accept=".pdf"
                            />
                            <label
                              htmlFor={`file-${category.value}`}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              {selectedFiles[category.value]?.name || 'Choose PDF...'}
                            </label>
                            {selectedFiles[category.value] && (
                              <button
                                onClick={() => {
                                  setSelectedFiles(prev => {
                                    const newFiles = { ...prev };
                                    delete newFiles[category.value];
                                    return newFiles;
                                  });
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddTender}
                  disabled={!newTender.name || !newTender.discipline || !newTender.value || !newTender.startDate || !newTender.endDate}
                  className="btn btn-primary sm:ml-3"
                >
                  Add Tender
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-ghost mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderSetup;