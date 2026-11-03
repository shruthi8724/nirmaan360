import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  IndianRupee,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { Material, Project } from '../types';
import { formatINR, getRiskColor } from '../utils/formatters';
import { MaterialModal } from '../components/MaterialModal';

export const Materials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState<number | undefined>(undefined);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [matData, projData] = await Promise.all([
        api.getMaterials({
          search: searchTerm || undefined,
          supplier: supplierFilter !== 'All' ? supplierFilter : undefined,
          category: categoryFilter !== 'All' ? categoryFilter : undefined,
          project_id: projectFilter,
        }),
        api.getProjects(),
      ]);
      setMaterials(matData);
      setProjects(projData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, supplierFilter, categoryFilter, projectFilter]);

  const handleSave = async (formData: Partial<Material>) => {
    if (editingMaterial) {
      await api.updateMaterial(editingMaterial.id, formData);
    } else {
      await api.createMaterial(formData);
    }
    await loadData();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this material record?')) {
      try {
        await api.deleteMaterial(id);
        setMaterials(materials.filter((m) => m.id !== id));
      } catch (e) {
        alert('Delete failed: ' + e);
      }
    }
  };

  const suppliers = Array.from(new Set(materials.map((m) => m.supplier))).filter(Boolean);
  const categories = Array.from(new Set(materials.map((m) => m.category))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Material Supply Chain Tracker</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor procurement orders, track delivery delay days, and identify supply bottlenecks.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMaterial(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Material Item</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search material or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Suppliers</option>
            {suppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={projectFilter || ''}
            onChange={(e) => setProjectFilter(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-amber-500 text-xs font-semibold">
            Fetching material telemetry...
          </div>
        ) : materials.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Boxes className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs">No materials matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Material Name</th>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Required vs Delivered</th>
                  <th className="p-3.5">Supplier</th>
                  <th className="p-3.5">Exp. Delivery</th>
                  <th className="p-3.5">Delay Days</th>
                  <th className="p-3.5">Cost (₹)</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {materials.map((m) => {
                  const proj = projects.find((p) => p.id === m.project_id);
                  const riskColors = getRiskColor(m.material_risk);

                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-100">{m.name}</td>
                      <td className="p-3.5 text-slate-300 max-w-xs truncate">{proj?.name || `Project #${m.project_id}`}</td>
                      <td className="p-3.5 text-slate-400">{m.category}</td>
                      <td className="p-3.5 font-mono">
                        <div>
                          {m.delivered_quantity} / {m.required_quantity} {m.unit}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Completion: {m.delivery_completion_pct}% (Pending: {m.pending_quantity})
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300">{m.supplier}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{m.expected_delivery_date}</td>
                      <td className="p-3.5 font-bold font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${riskColors.badge}`}>
                          {m.material_delay_days > 0 ? `${m.material_delay_days}d Late` : 'On Time'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-400">{formatINR(m.cost, true)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingMaterial(m);
                              setIsModalOpen(true);
                            }}
                            className="p-1 hover:text-amber-400 text-slate-400"
                            title="Edit Material"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1 hover:text-rose-400 text-slate-400"
                            title="Delete Material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        material={editingMaterial}
        projects={projects}
      />
    </div>
  );
};
