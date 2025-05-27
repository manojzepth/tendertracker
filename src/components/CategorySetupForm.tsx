import { useState, useEffect } from 'react';
import { Plus, Trash2, List, Save, AlertTriangle } from 'lucide-react';
import useProjectStore, { DocumentCategory, DEFAULT_DOCUMENT_CATEGORIES } from '../store/projectStore';
import clsx from 'clsx';

interface CategorySetupFormProps {
  tenderId: string;
  onSave?: () => void;
}

const CategorySetupForm = ({ tenderId, onSave }: CategorySetupFormProps) => {
  const tender = useProjectStore(state => state.getTenderById(tenderId));
  const addDocumentCategory = useProjectStore(state => state.addDocumentCategory);
  const updateScoringMatrix = useProjectStore(state => state.updateScoringMatrix);
  
  useEffect(() => {
    // Add default categories if none exist
    if (tender && tender.categories.length === 0) {
      DEFAULT_DOCUMENT_CATEGORIES.forEach(category => {
        addDocumentCategory(tenderId, category);
      });
    }
  }, [tender, tenderId, addDocumentCategory]);
  
  const [newCategory, setNewCategory] = useState<{ name: string; weight: number }>({
    name: '',
    weight: 0,
  });
  
  const [weights, setWeights] = useState<Record<string, number>>(
    tender?.categories.reduce((acc, category) => {
      acc[category.id] = tender.scoringMatrix.criteria[category.id]?.weight || 0;
      return acc;
    }, {} as Record<string, number>) || {}
  );
  
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0) + newCategory.weight;
  
  const handleAddCategory = () => {
    if (newCategory.name.trim() && newCategory.weight > 0) {
      addDocumentCategory(tenderId, {
        name: newCategory.name.trim(),
        weight: newCategory.weight,
      });
      setNewCategory({ name: '', weight: 0 });
    }
  };
  
  const handleWeightChange = (categoryId: string, weight: number) => {
    setWeights(prev => ({
      ...prev,
      [categoryId]: weight,
    }));
  };
  
  const handleSave = () => {
    updateScoringMatrix(tenderId, {
      criteria: Object.entries(weights).reduce((acc, [categoryId, weight]) => {
        acc[categoryId] = { weight };
        return acc;
      }, {} as Record<string, { weight: number }>),
    });
    
    if (onSave) {
      onSave();
    }
  };
  
  if (!tender) {
    return <div className="text-gray-500">Tender not found.</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <List size={18} className="text-gray-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Document Categories</h2>
        </div>
        <div className="text-sm text-gray-500">
          Total Weight: <span className={clsx(totalWeight !== 100 ? 'text-error-600 font-medium' : 'text-success-600 font-medium')}>{totalWeight}%</span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Categories List */}
        {tender.categories.length > 0 ? (
          <div className="mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (%)</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tender.categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={weights[category.id] || 0}
                        onChange={(e) => handleWeightChange(category.id, parseInt(e.target.value) || 0)}
                        className="form-input max-w-[80px] text-right"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-error-600 hover:text-error-900">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 mb-6">
            <p className="text-gray-500">No document categories defined yet.</p>
            <p className="text-sm text-gray-400">Add categories to define document types for bidders to submit.</p>
          </div>
        )}
        
        {/* Add New Category */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label htmlFor="categoryName" className="form-label">Category Name</label>
              <input
                type="text"
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="form-input"
                placeholder="e.g., Method Statement, Quality Plan"
              />
            </div>
            <div>
              <label htmlFor="categoryWeight" className="form-label">Weight (%)</label>
              <input
                type="number"
                id="categoryWeight"
                min="0"
                max="100"
                value={newCategory.weight}
                onChange={(e) => setNewCategory(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                className="form-input"
              />
            </div>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={handleAddCategory}
              disabled={!newCategory.name || newCategory.weight <= 0}
              className="btn btn-secondary inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Add Category
            </button>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="btn btn-primary inline-flex items-center"
            disabled={totalWeight !== 100}
          >
            <Save size={16} className="mr-2" />
            Save Scoring Matrix
          </button>
        </div>
        
        {totalWeight !== 100 && (
          <p className="text-sm text-error-600 mt-2 text-right">
            Total weight must equal 100%. Current total: {totalWeight}%
          </p>
        )}
      </div>
    </div>
  );
};

export default CategorySetupForm;