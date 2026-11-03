import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  ShieldAlert,
  IndianRupee,
  Calendar,
  Clock,
  UserCheck,
  Boxes,
  Users,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  CornerDownRight,
} from 'lucide-react';
import { api } from '../services/api';
import { ProjectDetail } from '../types';
import { formatINR, getRiskColor, getStatusBadge } from '../utils/formatters';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getProjectDetail(parseInt(id));
      setProject(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-amber-500 font-semibold text-xs">
        Loading Project Intelligence Details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center text-slate-400">
        <h3 className="font-bold text-lg text-slate-200">Project Not Found</h3>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg"
        >
          Return to Projects Portfolio
        </button>
      </div>
    );
  }

  const riskColors = getRiskColor(project.risk_level);
  const statusStyle = getStatusBadge(project.status);
  const budgetVariance = project.current_cost - project.budget;
  const progressDeviation = project.planned_progress - project.actual_progress;

  return (
    <div className="space-y-6">
      {/* Top Back Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border uppercase ${statusStyle}`}>
            {project.status}
          </span>
          <span className={`px-3 py-1 rounded-lg text-xs font-extrabold border uppercase ${riskColors.badge}`}>
            {project.risk_level} Risk ({project.risk_score} Score)
          </span>
        </div>
      </div>

      {/* Project Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-black text-white tracking-tight">{project.name}</h2>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
          <span>Client: <strong className="text-slate-200">{project.client_name}</strong></span>
          <span>Location: <strong className="text-slate-200">{project.location}</strong></span>
          <span>Manager: <strong className="text-slate-200">{project.manager}</strong></span>
          <span>Start: <strong className="text-slate-200">{project.start_date}</strong></span>
          <span>End: <strong className="text-slate-200">{project.end_date}</strong></span>
        </div>
        {project.description && (
          <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      {/* 2 Grid Cards: Budget Summary & Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              Budget & Financial Summary
            </h3>
            <span className="text-xs font-mono font-bold text-amber-400">
              {project.budget_utilization_pct}% Spent
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Approved Budget</span>
              <div className="text-lg font-black text-slate-100 font-mono mt-1">
                {formatINR(project.budget)}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Current Cost Spent</span>
              <div className="text-lg font-black text-amber-400 font-mono mt-1">
                {formatINR(project.current_cost)}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Cost Variance</span>
              <div
                className={`text-sm font-bold font-mono mt-1 ${
                  budgetVariance > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {budgetVariance > 0 ? `+${formatINR(budgetVariance)} Over` : `${formatINR(budgetVariance)} Safe`}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Financial Health</span>
              <div className="text-sm font-bold text-slate-200 mt-1">
                {project.budget_utilization_pct > 95
                  ? 'Critical Overrun'
                  : project.budget_utilization_pct > 85
                  ? 'High Consumption'
                  : 'On Track'}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              Schedule & Progress Summary
            </h3>
            <span
              className={`text-xs font-bold font-mono ${
                progressDeviation > 10 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {progressDeviation > 0 ? `${progressDeviation.toFixed(1)}% Behind` : 'Ahead of Target'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Planned Progress</span>
              <div className="text-lg font-black text-sky-400 font-mono mt-1">
                {project.planned_progress}%
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Actual Site Progress</span>
              <div className="text-lg font-black text-amber-400 font-mono mt-1">
                {project.actual_progress}%
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Material Delay Days</span>
              <div className="text-sm font-bold text-slate-200 font-mono mt-1">
                {project.delay_days > 0 ? `${project.delay_days} Days Late` : 'On Schedule'}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Delivery Speed</span>
              <div className="text-sm font-bold text-slate-200 mt-1">
                {progressDeviation > 15 ? 'Critical Slippage' : progressDeviation > 5 ? 'Slight Lag' : 'Optimal'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Analysis & Explainable RCA Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${riskColors.bg} ${riskColors.text}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Rule-Based Risk Intelligence Analysis</h3>
              <p className="text-xs text-slate-400">Score Range: 0-100 (Calculated from site telemetry)</p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-black ${riskColors.text}`}>{project.risk_score} / 100</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{project.risk_level} Risk Level</div>
          </div>
        </div>

        {/* Explainable Risk Factors Bullet List */}
        {project.latest_assessment?.reasons && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Identified Risk Factor Drivers:</h4>
            <ul className="space-y-1.5">
              {project.latest_assessment.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Root Cause Analysis Cards */}
        {project.latest_assessment?.root_cause_analysis && project.latest_assessment.root_cause_analysis.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Root Cause Analysis (RCA) & Actionable Remediation:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.latest_assessment.root_cause_analysis.map((rca, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-400 uppercase text-[10px] tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      Issue: {rca.issue}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Root Cause:</span>
                    <p className="text-slate-300 mt-0.5">{rca.cause}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">Project Impact:</span>
                    <p className="text-slate-300 mt-0.5">{rca.impact}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 text-amber-400 font-medium flex items-start gap-1.5">
                    <CornerDownRight className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <span className="font-bold text-amber-500">Suggested Action:</span>
                      <p className="text-slate-200 mt-0.5">{rca.suggested_action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Material Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-400" />
            Assigned Materials ({project.materials.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Material</th>
                <th className="p-3">Category</th>
                <th className="p-3">Required / Delivered</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Expected Date</th>
                <th className="p-3">Delay Days</th>
                <th className="p-3">Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {project.materials.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">No materials assigned to this project yet.</td>
                </tr>
              ) : (
                project.materials.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-slate-200">{m.name}</td>
                    <td className="p-3 text-slate-400">{m.category}</td>
                    <td className="p-3 font-mono">
                      {m.delivered_quantity} / {m.required_quantity} {m.unit} ({m.delivery_completion_pct}%)
                    </td>
                    <td className="p-3 text-slate-300">{m.supplier}</td>
                    <td className="p-3 text-slate-400">{m.expected_delivery_date}</td>
                    <td className="p-3 font-bold font-mono">
                      <span className={m.material_delay_days > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {m.material_delay_days > 0 ? `${m.material_delay_days} days late` : 'On time'}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-200">{formatINR(m.cost, true)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Summary Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            Assigned Resources ({project.resources.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Resource Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Utilization %</th>
                <th className="p-3">Cost / Day</th>
                <th className="p-3">Status</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {project.resources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">No resources assigned to this project yet.</td>
                </tr>
              ) : (
                project.resources.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-semibold text-slate-200">{r.name}</td>
                    <td className="p-3 text-slate-400">{r.type}</td>
                    <td className="p-3 font-mono font-bold">
                      <span className={r.utilization > 100 ? 'text-rose-400' : 'text-slate-200'}>
                        {r.utilization}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{formatINR(r.cost_per_day)} / day</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'Maintenance'
                            ? 'bg-rose-500/20 text-rose-300'
                            : r.status === 'Overutilized'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{r.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
