import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Wrench,
  Activity,
  IndianRupee,
} from 'lucide-react';
import { api } from '../services/api';
import { Resource, Project } from '../types';
import { formatINR } from '../utils/formatters';
import { ResourceModal } from '../components/ResourceModal';

export const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState<number | undefined>(undefined);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resData, projData] = await Promise.all([
        api.getResources({
          search: searchTerm || undefined,
          type: typeFilter !== 'All' ? typeFilter : undefined,
          availability: availabilityFilter !== 'All' ? availabilityFilter : undefined,
          project_id: projectFilter,
        }),
        api.getProjects(),
      ]);
      setResources(resData);
      setProjects(projData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, typeFilter, availabilityFilter, projectFilter]);

  const handleSave = async (formData: Partial<Resource>) => {
    if (editingResource) {
      await api.updateResource(editingResource.id, formData);
    } else {
      await api.createResource(formData);
    }
    await loadData();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this resource entry?')) {
      try {
        await api.deleteResource(id);
        setResources(resources.filter((r) => r.id !== id));
      } catch (e) {
        alert('Delete failed: ' + e);
      }
    }
  };

  const overutilizedCount = resources.filter((r) => r.utilization > 100).length;
  const maintenanceCount = resources.filter((r) => r.status === 'Maintenance' || r.availability === 'Maintenance').length;
  const shortageCount = resources.filter((r) => r.availability === 'Shortage').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Resource Allocation & Optimization</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Track labour crews, site engineers, heavy machinery utilization, and maintenance downtime.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingResource(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Tracked Resources</span>
            <div className="text-xl font-extrabold text-white mt-1">{resources.length}</div>
          </div>
          <Users className="w-6 h-6 text-sky-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Overutilized Resources</span>
            <div className="text-xl font-extrabold text-rose-400 mt-1">{overutilizedCount}</div>
          </div>
          <Activity className="w-6 h-6 text-rose-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Maintenance Downtime</span>
            <div className="text-xl font-extrabold text-amber-400 mt-1">{maintenanceCount}</div>
          </div>
          <Wrench className="w-6 h-6 text-amber-400" />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Shortage Warnings</span>
            <div className="text-xl font-extrabold text-orange-400 mt-1">{shortageCount}</div>
          </div>
          <AlertTriangle className="w-6 h-6 text-orange-400" />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search resource name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Resource Types</option>
            <option value="Labour">Labour</option>
            <option value="Engineers">Engineers</option>
            <option value="Supervisors">Supervisors</option>
            <option value="Vehicles">Vehicles</option>
            <option value="Machines">Machines</option>
            <option value="Equipment">Equipment</option>
          </select>
        </div>

        <div>
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Assigned">Assigned</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Shortage">Shortage</option>
          </select>
        </div>

        <div>
          <select
            value={projectFilter || ''}
            onChange={(e) => setProjectFilter(e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Assigned Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-amber-500 text-xs font-semibold">
            Fetching resource allocation telemetry...
          </div>
        ) : resources.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-xs">No resources matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Resource Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Assigned Project</th>
                  <th className="p-3.5">Utilization %</th>
                  <th className="p-3.5">Cost / Day (₹)</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Operational Notes</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {resources.map((r) => {
                  const proj = projects.find((p) => p.id === r.project_id);

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-slate-100">{r.name}</td>
                      <td className="p-3.5 text-slate-400">{r.type}</td>
                      <td className="p-3.5 text-slate-300 max-w-xs truncate">
                        {proj ? proj.name : <span className="text-slate-500 font-italic">Unassigned</span>}
                      </td>
                      <td className="p-3.5 font-mono">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${r.utilization > 100 ? 'text-rose-400' : 'text-slate-200'}`}>
                            {r.utilization}%
                          </span>
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                r.utilization > 100 ? 'bg-rose-500' : r.utilization > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, r.utilization)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-400">{formatINR(r.cost_per_day)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            r.status === 'Maintenance' || r.availability === 'Maintenance'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : r.status === 'Overutilized'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 max-w-xs truncate">{r.notes || '-'}</td>
                      <td className="p-3.5">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingResource(r);
                              setIsModalOpen(true);
                            }}
                            className="p-1 hover:text-amber-400 text-slate-400"
                            title="Edit Resource"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1 hover:text-rose-400 text-slate-400"
                            title="Delete Resource"
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

      <ResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        resource={editingResource}
        projects={projects}
      />
    </div>
  );
};
