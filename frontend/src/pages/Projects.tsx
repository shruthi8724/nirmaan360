import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  IndianRupee,
  Calendar,
  UserCheck,
  ChevronRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';
import { formatINR, getRiskColor, getStatusBadge } from '../utils/formatters';
import { ProjectModal } from '../components/ProjectModal';

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [managerFilter, setManagerFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects({
        search: searchTerm || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        manager: managerFilter !== 'All' ? managerFilter : undefined,
        risk_level: riskFilter !== 'All' ? riskFilter : undefined,
      });
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [searchTerm, statusFilter, riskFilter, managerFilter]);

  const handleSave = async (formData: Partial<Project>) => {
    if (editingProject) {
      await api.updateProject(editingProject.id, formData);
    } else {
      await api.createProject(formData);
    }
    await loadProjects();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project and all its risk history?')) {
      try {
        await api.deleteProject(id);
        setProjects(projects.filter((p) => p.id !== id));
      } catch (err) {
        alert('Delete failed: ' + err);
      }
    }
  };

  const managers = Array.from(new Set(projects.map((p) => p.manager))).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">Project Portfolio</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage construction projects, monitor progress deviation, and review rule-based risk assessments.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shadow-lg">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search name, client, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Risk Filter */}
        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>
        </div>

        {/* Manager Filter */}
        <div>
          <select
            value={managerFilter}
            onChange={(e) => setManagerFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Managers</option>
            {managers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-16 text-center text-amber-500 text-xs font-semibold">Loading project portfolio...</div>
      ) : projects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-300">No Projects Found</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or create a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const riskColors = getRiskColor(p.risk_level);
            const statusStyle = getStatusBadge(p.status);
            const progressLag = p.planned_progress - p.actual_progress;

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase ${statusStyle}`}>
                      {p.status}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border uppercase ${riskColors.badge}`}
                    >
                      {p.risk_level} Risk ({p.risk_score} pts)
                    </span>
                  </div>

                  {/* Title & Location */}
                  <h4 className="font-extrabold text-base text-slate-100 group-hover:text-amber-400 transition line-clamp-1 mb-1">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
                    <span>{p.client_name}</span> &bull; <span>{p.location}</span>
                  </p>

                  {/* Budget & Cost */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Budget:</span>
                      <span className="font-bold text-slate-200 font-mono">{formatINR(p.budget, true)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Current Cost:</span>
                      <span className="font-bold text-amber-400 font-mono">{formatINR(p.current_cost, true)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          p.budget_utilization_pct > 90 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, p.budget_utilization_pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-400">Progress:</span>
                      <span className={progressLag > 10 ? 'text-rose-400' : 'text-slate-200'}>
                        {p.actual_progress}% (Planned: {p.planned_progress}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex">
                      <div className="bg-emerald-500 h-full" style={{ width: `${p.actual_progress}%` }} />
                    </div>
                    {progressLag > 5 && (
                      <div className="text-[11px] text-rose-400 flex items-center gap-1 mt-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Slippage: {progressLag.toFixed(1)}% behind schedule</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    {p.manager}
                  </span>

                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(p);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 hover:text-amber-400 rounded-lg hover:bg-slate-800"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="p-1.5 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-1.5 hover:text-sky-400 rounded-lg hover:bg-slate-800 flex items-center"
                      title="View Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        project={editingProject}
      />
    </div>
  );
};
