import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Plus, Building2, Mail, Phone, Globe, MapPin, Check, AlertCircle, Loader2 } from 'lucide-react';
import useProjectStore from '../../store/projectStore';
import clsx from 'clsx';

const COMPANY_SIZES = [
  '1-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

const BiddersList = () => {
  const { projectId, tenderId } = useParams();
  const navigate = useNavigate();
  const { projects, loading, error, fetchProjects, addBidder } = useProjectStore();
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const bidders = tender?.bidders || [];
  
  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBidder, setNewBidder] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    contactPerson: '',
    contactPosition: '',
    companySize: '',
    yearEstablished: '',
    website: ''
  });
  
  const handleAddBidder = async () => {
    if (newBidder.name.trim() && tenderId) {
      try {
        await addBidder(tenderId, {
          ...newBidder,
          name: newBidder.name.trim(),
          email: newBidder.email.trim(),
          phone: newBidder.phone.trim(),
          address: newBidder.address.trim(),
          city: newBidder.city.trim(),
          country: newBidder.country.trim(),
          contactPerson: newBidder.contactPerson.trim(),
          contactPosition: newBidder.contactPosition.trim(),
          companySize: newBidder.companySize,
          yearEstablished: newBidder.yearEstablished.trim(),
          website: newBidder.website.trim()
        });
        
        setNewBidder({
          name: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          country: '',
          contactPerson: '',
          contactPosition: '',
          companySize: '',
          yearEstablished: '',
          website: ''
        });
        setIsAddModalOpen(false);
        
        // Refresh data
        fetchProjects();
      } catch (error) {
        console.error('Error adding bidder:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-600">Loading bidders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-error-600 mb-4">Error loading bidders</p>
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
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Users size={18} className="text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Bidders</h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary inline-flex items-center py-1.5 px-3 text-sm"
          >
            <Plus size={16} className="mr-1" />
            Add Bidder
          </button>
        </div>
        
        <div className="p-6">
          {bidders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bidders.map((bidder) => {
                const documentsSubmitted = bidder.documents.length;
                const totalCategories = tender.categories.length;
                const progress = Math.round((documentsSubmitted / totalCategories) * 100);
                
                return (
                  <div
                    key={bidder.id}
                    onClick={() => navigate(`/projects/${projectId}/tenders/${tenderId}/bidders/${bidder.id}`)}
                    className={clsx(
                      "border rounded-lg p-6 hover:border-primary-300 hover:bg-primary-50/50 transition-colors cursor-pointer",
                      bidder.evaluation ? "bg-success-50/50 border-success-200" : "border-gray-200"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 mr-4">
                          {bidder.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{bidder.name}</h3>
                          <p className="text-sm text-gray-500">{documentsSubmitted} of {totalCategories} documents submitted</p>
                        </div>
                      </div>
                      
                      {bidder.evaluation ? (
                        <div className="flex items-center text-sm text-success-600 bg-success-100 px-3 py-1 rounded-full">
                          <Check size={16} className="mr-1" />
                          Evaluated
                        </div>
                      ) : (
                        <div className="flex items-center text-sm text-warning-600 bg-warning-100 px-3 py-1 rounded-full">
                          <AlertCircle size={16} className="mr-1" />
                          Pending
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
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

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Building2 size={14} className="text-gray-400 mr-2" />
                            <span>Est. {bidder.yearEstablished}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail size={14} className="text-gray-400 mr-2" />
                            <a href={`mailto:${bidder.email}`} className="text-primary-600 hover:text-primary-800">{bidder.email}</a>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <MapPin size={14} className="text-gray-400 mr-2" />
                            <span>{bidder.city}, {bidder.country}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone size={14} className="text-gray-400 mr-2" />
                            <a href={`tel:${bidder.phone}`} className="text-primary-600 hover:text-primary-800">{bidder.phone}</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No bidders added</h3>
              <p className="text-gray-500 mb-4">
                Add bidders to start collecting and evaluating their tender documents.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary inline-flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add Bidder
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Bidder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsAddModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Bidder</h3>
                
                <div className="space-y-6">
                  {/* Company Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Building2 size={16} className="mr-2 text-gray-400" />
                      Company Information
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="bidderName" className="form-label required">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="bidderName"
                          value={newBidder.name}
                          onChange={(e) => setNewBidder(prev => ({ ...prev, name: e.target.value }))}
                          className="form-input"
                          placeholder="Enter company name"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="companySize" className="form-label required">
                            Company Size
                          </label>
                          <select
                            id="companySize"
                            value={newBidder.companySize}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, companySize: e.target.value }))}
                            className="form-select"
                            required
                          >
                            <option value="">Select size</option>
                            {COMPANY_SIZES.map(size => (
                              <option key={size} value={size}>{size} employees</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="yearEstablished" className="form-label required">
                            Year Established
                          </label>
                          <input
                            type="number"
                            id="yearEstablished"
                            value={newBidder.yearEstablished}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, yearEstablished: e.target.value }))}
                            className="form-input"
                            placeholder="YYYY"
                            min="1900"
                            max={new Date().getFullYear()}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="website" className="form-label">
                          Website
                        </label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="url"
                            id="website"
                            value={newBidder.website}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, website: e.target.value }))}
                            className="form-input pl-9"
                            placeholder="www.company.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Users size={16} className="mr-2 text-gray-400" />
                      Contact Information
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="contactPerson" className="form-label required">
                            Contact Person
                          </label>
                          <input
                            type="text"
                            id="contactPerson"
                            value={newBidder.contactPerson}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, contactPerson: e.target.value }))}
                            className="form-input"
                            placeholder="Full name"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="contactPosition" className="form-label required">
                            Position
                          </label>
                          <input
                            type="text"
                            id="contactPosition"
                            value={newBidder.contactPosition}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, contactPosition: e.target.value }))}
                            className="form-input"
                            placeholder="Job title"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="form-label required">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            id="email"
                            value={newBidder.email}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, email: e.target.value }))}
                            className="form-input pl-9"
                            placeholder="contact@company.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="form-label required">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            id="phone"
                            value={newBidder.phone}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, phone: e.target.value }))}
                            className="form-input pl-9"
                            placeholder="+1 234 567 8900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <MapPin size={16} className="mr-2 text-gray-400" />
                      Address
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label htmlFor="address" className="form-label required">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          value={newBidder.address}
                          onChange={(e) => setNewBidder(prev => ({ ...prev, address: e.target.value }))}
                          className="form-input"
                          placeholder="Enter street address"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="city" className="form-label required">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            value={newBidder.city}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, city: e.target.value }))}
                            className="form-input"
                            placeholder="Enter city"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="country" className="form-label required">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            value={newBidder.country}
                            onChange={(e) => setNewBidder(prev => ({ ...prev, country: e.target.value }))}
                            className="form-input"
                            placeholder="Enter country"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddBidder}
                  disabled={!newBidder.name || !newBidder.email || !newBidder.phone || !newBidder.address || !newBidder.city || !newBidder.country || !newBidder.contactPerson || !newBidder.contactPosition || !newBidder.companySize || !newBidder.yearEstablished}
                  className="btn btn-primary sm:ml-3"
                >
                  Add Bidder
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

export default BiddersList;