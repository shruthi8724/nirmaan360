import React, { useState, useEffect } from 'react';
import { X, Boxes } from 'lucide-react';
import { Material, Project } from '../types';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Material>) => Promise<void>;
  material?: Material | null;
  projects: Project[];
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  material,
  projects,
}) => {
  const [formData, setFormData] = useState<Partial<Material>>({
    name: '',
    category: 'Steel',
    required_quantity: 100,
    ordered_quantity: 100,
    delivered_quantity: 50,
    unit: 'Tons',
    supplier: '',
    expected_delivery_date: new Date().toISOString().split('T')[0],
    actual_delivery_date: null,
    cost: 500000,
    status: 'Pending',
    project_id: projects[0]?.id || 1,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (material) {
      setFormData(material);
    } else {
      setFormData({
        name: '',
        category: 'Steel',
        required_quantity: 100,
        ordered_quantity: 100,
        delivered_quantity: 50,
        unit: 'Tons',
        supplier: '',
        expected_delivery_date: new Date().toISOString().split('T')[0],
        actual_delivery_date: null,
        cost: 500000,
        status: 'Pending',
        project_id: projects[0]?.id || 1,
      });
    }
  }, [material, isOpen, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      alert('Error saving material: ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <Boxes className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-white">
              {material ? 'Edit Material Record' : 'Add Construction Material Item'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Associated Project *</label>
              <select
                required
                value={formData.project_id || ''}
                onChange={(e) => setFormData({ ...formData, project_id: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Material Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Fe-550D TMT Rebar"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                value={formData.category || 'Steel'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Steel">Steel</option>
                <option value="Cement">Cement</option>
                <option value="Aggregates">Aggregates</option>
                <option value="Precast">Precast</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Finishing">Finishing</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.required_quantity || 0}
                onChange={(e) => setFormData({ ...formData, required_quantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ordered Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.ordered_quantity || 0}
                onChange={(e) => setFormData({ ...formData, ordered_quantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delivered Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.delivered_quantity || 0}
                onChange={(e) => setFormData({ ...formData, delivered_quantity: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit of Measure *</label>
              <input
                type="text"
                required
                value={formData.unit || 'Tons'}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. Tons / Bags / Cu.m"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Supplier Name *</label>
              <input
                type="text"
                required
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g. Tata Steel / UltraTech"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cost (₹ INR) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.cost || 0}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Delivery Date *</label>
              <input
                type="date"
                required
                value={formData.expected_delivery_date || ''}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Delivery Date</label>
              <input
                type="date"
                value={formData.actual_delivery_date || ''}
                onChange={(e) => setFormData({ ...formData, actual_delivery_date: e.target.value || null })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Delivery Status *</label>
              <select
                value={formData.status || 'Pending'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Pending">Pending</option>
                <option value="Ordered">Ordered</option>
                <option value="Partially Delivered">Partially Delivered</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
            >
              {loading ? 'Saving...' : material ? 'Update Material' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
