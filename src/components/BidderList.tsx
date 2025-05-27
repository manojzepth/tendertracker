import { useState } from 'react';
import { Users, Plus, Trash2, Upload, FileText, Check, Building2, Mail, Phone, Globe, MapPin, Calendar, DollarSign } from 'lucide-react';
import useProjectStore, { Bidder } from '../store/projectStore';
import clsx from 'clsx';

const COMPANY_SIZES = [
  '1-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

interface BidderListProps {
  tenderId: string;
  onBidderSelect?: (bidderId: string) => void;
}

const BidderList = ({ tenderId, onBidderSelect }: BidderListProps) => {
  const tender = useProjectStore(state => state.getTenderById(tenderId || ''));
  const bidders = tender?.bidders || [];
  const addBidder = useProjectStore(state => state.addBidder);
  
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
  
  const handleAddBidder = () => {
    if (newBidder.name.trim() && tenderId) {
      addBidder(tenderId, {
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
    }
  };
  
  if (!tender) {
    return <div className="text-gray-500">Tender not found.</div>;
  }

  return (
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
          <div className="space-y-4">
            {bidders.map((bidder) => (
              <div
                key={bidder.id}
                className={clsx(
                  "border rounded-lg p-6 hover:border-primary-300 hover:bg-primary-50/50 transition-colors cursor-pointer",
                  bidder.evaluation ? "bg-success-50/50 border-success-200" : "border-gray-200"
                )}
                onClick={() => onBidderSelect && onBidderSelect(bidder.id)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 mr-4">
                      {bidder.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{bidder.name}</h3>
                      <p className="text-sm text-gray-500">{bidder.documents.length} documents uploaded</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {bidder.evaluation ? (
                      <div className="flex items-center text-sm text-success-600 bg-success-100 px-3 py-1 rounded-full">
                        <Check size={16} className="mr-1" />
                        Evaluated
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onBidderSelect && onBidderSelect(bidder.id);
                        }}
                        className="btn btn-ghost text-sm py-1 px-3"
                      >
                        <Upload size={14} className="mr-1" />
                        Upload Documents
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Building2 size={14} className="text-gray-400 mr-2" />
                      <span>Est. {bidder.yearEstablished} • {bidder.companySize} employees</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={14} className="text-gray-400 mr-2" />
                      <a href={`mailto:${bidder.email}`} className="text-primary-600 hover:text-primary-800">{bidder.email}</a>
                    </div>
                    <div className="flex items-center">
                      <Phone size={14} className="text-gray-400 mr-2" />
                      <a href={`tel:${bidder.phone}`} className="text-primary-600 hover:text-primary-800">{bidder.phone}</a>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MapPin size={14} className="text-gray-400 mr-2" />
                      <span>{bidder.city}, {bidder.country}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe size={14} className="text-gray-400 mr-2" />
                      <a href={`https://${bidder.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-800">{bidder.website}</a>
                    </div>
                    <div className="flex items-center">
                      <Users size={14} className="text-gray-400 mr-2" />
                      <span>{bidder.contactPerson} • {bidder.contactPosition}</span>
                    </div>
                  </div>
                </div>
                
                {bidder.documents.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Documents</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {bidder.documents.map((doc) => {
                        const category = tender.categories.find(c => c.id === doc.categoryId);
                        return (
                          <div key={doc.id} className="flex items-center bg-gray-50 p-2 rounded text-sm">
                            <FileText size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="truncate text-gray-700">{doc.name}</p>
                              {category && (
                                <p className="text-xs text-gray-500 truncate">
                                  {category.name}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
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

export default BidderList;