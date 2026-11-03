import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  CornerDownRight,
  Building2,
  Clock,
  IndianRupee,
  Boxes,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { getRiskColor } from '../utils/formatters';

export const RiskIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reevaluatingId, setReevaluatingId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getRiskOverview();
      setAssessments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReevaluate = async (projectId: number) => {
    setReevaluatingId(projectId);
    try {
      await api.reevaluateRisk(projectId);
      await loadData();
    } catch (e) {
      alert('Reevaluation error: ' + e);
    } finally {
      setReevaluatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-amber-500 text-xs font-semibold">
        Evaluating Rule-Based Risk Intelligence Matrices...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            Deterministic Construction Risk Intelligence Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Rule-based assessments evaluate progress deviation, budget utilization, supply-chain delays, and resource availability.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-2 transition shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh All Evaluations</span>
        </button>
      </div>

      {/* Risk Assessments Cards List */}
      <div className="space-y-6">
        {assessments.map((item) => {
          const riskColors = getRiskColor(item.risk_level);

          return (
            <div
              key={item.project_id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 hover:border-slate-700 transition"
            >
              {/* Project Title & Score Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-extrabold border uppercase ${riskColors.badge}`}
                    >
                      {item.risk_level} Risk Level
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Manager: {item.manager}
                    </span>
                  </div>
                  <h4
                    onClick={() => navigate(`/projects/${item.project_id}`)}
                    className="text-lg font-black text-white hover:text-amber-400 transition cursor-pointer"
                  >
                    {item.project_name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{item.client_name}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className={`text-3xl font-black ${riskColors.text}`}>
                      {item.risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Assessed: {new Date(item.assessed_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleReevaluate(item.project_id)}
                    disabled={reevaluatingId === item.project_id}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                    title="Recalculate Risk Score"
                  >
                    <RefreshCw className={`w-4 h-4 ${reevaluatingId === item.project_id ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Point Vectors Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Schedule Lag</span>
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="text-base font-extrabold text-slate-100 font-mono">
                    +{item.schedule_risk_points} pts
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Budget Overrun</span>
                    <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-base font-extrabold text-slate-100 font-mono">
                    +{item.budget_risk_points} pts
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Material Delay</span>
                    <Boxes className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="text-base font-extrabold text-slate-100 font-mono">
                    +{item.material_risk_points} pts
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Resource Bottleneck</span>
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-base font-extrabold text-slate-100 font-mono">
                    +{item.resource_risk_points} pts
                  </div>
                </div>
              </div>

              {/* Explainable Reasons */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Explainable Risk Triggers:
                </h5>
                <div className="space-y-1.5">
                  {item.reasons.map((r: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause Analysis (RCA) Cards */}
              {item.root_cause_analysis && item.root_cause_analysis.length > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Automated Root Cause Analysis (RCA):
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.root_cause_analysis.map((rca: any, rIdx: number) => (
                      <div
                        key={rIdx}
                        className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-rose-400 uppercase text-[10px] tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            Issue: {rca.issue}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Cause: </span>
                          <span className="text-slate-300">{rca.cause}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400">Impact: </span>
                          <span className="text-slate-300">{rca.impact}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800/80 text-amber-400 flex items-start gap-1.5 font-medium">
                          <CornerDownRight className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-500">Suggested Action: </span>
                            <span className="text-slate-200">{rca.suggested_action}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
