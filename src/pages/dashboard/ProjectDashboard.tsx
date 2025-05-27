import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, MoreVertical, Calendar, MapPin, LayoutDashboard, Ruler, FileText, Loader2 } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import useProjectStore, { Project } from '../../store/projectStore';
import { useAuth } from '../../contexts/AuthContext';
import clsx from 'clsx';

const PROJECT_TYPES = [
  { value: 'residential', label: 'Residential', gradient: 'from-blue-500 to-indigo-600' },
  { value: 'commercial', label: 'Commercial', gradient: 'from-emerald-500 to-teal-600' },
  { value: 'mixed-use', label: 'Mixed Use', gradient: 'from-violet-500 to-purple-600' },
  { value: 'hospitality', label: 'Hospitality', gradient: 'from-amber-500 to-orange-600' },
];

const ProjectDashboard = () => {
  const { projects, loading, error, refetch } = useProjects();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const addProject = useProjectStore(state => state.addProject);
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    area: '',
    type: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  
  const handleAddProject = async () => {
    if (newProject.name.trim()) {
      try {
        await addProject({
          name: newProject.name.trim(),
          description: newProject.description.trim(),
          area: parseInt(newProject.area) || 0,
          type: newProject.type as 'residential' | 'commercial' | 'mixed-use' | 'hospitality',
          location: newProject.location.trim(),
          startDate: newProject.startDate,
          endDate: newProject.endDate
        });
        
        setNewProject({
          name: '',
          description: '',
          area: '',
          type: '',
          location: '',
          startDate: '',
          endDate: ''
        });
        setIsAddModalOpen(false);
        refetch();
      } catch (err) {
        console.error('Error adding project:', err);
      }
    }
  };

  const getProjectColor = (type: Project['type']) => {
    return PROJECT_TYPES.find(t => t.value === type)?.gradient || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-error-600 mb-4">Error loading projects</p>
          <button 
            onClick={() => refetch()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your construction projects and tenders</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary inline-flex items-center"
        >
          <Plus size={16} className="mr-2" />
          Add Project
        </button>
      </div>
      
      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const totalTenders = project.tenders.length;
          const activeTenders = project.tenders.filter(t => t.status === 'open').length;
          const closedTenders = project.tenders.filter(t => t.status === 'closed' || t.status === 'awarded').length;
          
          return (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}/tenders`)}
              className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {/* Gradient Background */}
              <div className={clsx(
                "absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity",
                `bg-gradient-to-br ${getProjectColor(project.type)}`
              )} />
              
              {/* Content */}
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className={clsx(
                      "h-12 w-12 rounded-xl flex items-center justify-center",
                      `bg-gradient-to-br ${getProjectColor(project.type)} text-white`
                    )}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {project.name}
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                {/* Project Details */}
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <LayoutDashboard size={16} className="text-gray-400 mr-2" />
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium text-gray-900 capitalize">{project.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Ruler size={16} className="text-gray-400 mr-2" />
                      <div>
                        <p className="text-gray-500">Area</p>
                        <p className="font-medium text-gray-900">{project.area.toLocaleString()} m²</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <p className="text-gray-600 truncate">{project.location}</p>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar size={16} className="text-gray-400 mr-2" />
                    <div>
                      <p className="text-gray-600">
                        {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tender Statistics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{totalTenders}</div>
                      <div className="text-xs text-gray-500">Total Tenders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-600">{activeTenders}</div>
                      <div className="text-xs text-gray-500">Active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{closedTenders}</div>
                      <div className="text-xs text-gray-500">Closed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Empty State */}
        {projects.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                <Building2 size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
              <p className="text-gray-500 mb-4">
                You haven't created any projects yet.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-primary inline-flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add Project
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setIsAddModalOpen(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Project</h3>
                
                <div className="space-y-4">
                  {/* Project Name */}
                  <div>
                    <label htmlFor="projectName" className="form-label required">
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="form-label required">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      className="form-input"
                      rows={3}
                      placeholder="Enter project description"
                      required
                    />
                  </div>
                  
                  {/* Project Type */}
                  <div>
                    <label htmlFor="type" className="form-label required">
                      Project Type
                    </label>
                    <select
                      id="type"
                      value={newProject.type}
                      onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value }))}
                      className="form-select"
                      required
                    >
                      <option value="">Select type</option>
                      {PROJECT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Area */}
                  <div>
                    <label htmlFor="area" className="form-label required">
                      Area (m²)
                    </label>
                    <input
                      type="number"
                      id="area"
                      value={newProject.area}
                      onChange={(e) => setNewProject(prev => ({ ...prev, area: e.target.value }))}
                      className="form-input"
                      placeholder="Enter built-up area"
                      min="0"
                      required
                    />
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="form-label required">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={newProject.location}
                      onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                      className="form-input"
                      placeholder="Enter project location"
                      required
                    />
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
                        value={newProject.startDate}
                        onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
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
                        value={newProject.endDate}
                        onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                        className="form-input"
                        min={newProject.startDate}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleAddProject}
                  disabled={!newProject.name || !newProject.description || !newProject.type || !newProject.area || !newProject.location || !newProject.startDate || !newProject.endDate}
                  className="btn btn-primary sm:ml-3"
                >
                  Add Project
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

export default ProjectDashboard;