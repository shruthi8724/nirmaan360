import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  IndianRupee,
  ShieldAlert,
  AlertTriangle,
  Award,
  Truck,
  Users,
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsOverview } from '../types';
import { formatINR, getRiskColor } from '../utils/formatters';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const overview = await api.getAnalyticsOverview();
      setData(overview);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-amber-500 text-xs font-semibold">
        Aggregating Portfolio Financial & Schedule Telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-sky-400" />
          Construction Portfolio & EVM Analytics
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Deep-dive portfolio performance, Earned Value Management ($SPI$ & $CPI$), supplier delay trends, and budget variances.
        </p>
      </div>

      {/* EVM KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Schedule Performance Index (SPI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Schedule Performance Index (SPI)</span>
            <div className="text-3xl font-black text-white font-mono mt-1">
              {data?.schedule_variance_metrics.spi}
            </div>
            <span
              className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                (data?.schedule_variance_metrics.spi || 1) >= 1.0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {data?.schedule_variance_metrics.status}
            </span>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
            <div>Earned Value (EV): {formatINR(data?.schedule_variance_metrics.earned_value || 0, true)}</div>
            <div>Planned Value (PV): {formatINR(data?.schedule_variance_metrics.planned_value || 0, true)}</div>
          </div>
        </div>

        {/* Cost Performance Index (CPI) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Cost Performance Index (CPI)</span>
            <div className="text-3xl font-black text-amber-400 font-mono mt-1">
              {data?.cost_variance_metrics.cpi}
            </div>
            <span
              className={`inline-block mt-2 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                (data?.cost_variance_metrics.cpi || 1) >= 1.0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {data?.cost_variance_metrics.status}
            </span>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
            <div>Actual Cost (AC): {formatINR(data?.cost_variance_metrics.actual_cost || 0, true)}</div>
            <div>
              Cost Variance: {formatINR(data?.cost_variance_metrics.cost_variance || 0, true)}
            </div>
          </div>
        </div>
      </div>

      {/* 2 Column Layout: Top Risky Projects & Progress Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Risky Projects */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Highest At-Risk Projects Ranking
            </h4>
          </div>

          <div className="space-y-3">
            {data?.top_risky_projects.map((p, idx) => {
              const colors = getRiskColor(p.risk_level);
              return (
                <div
                  key={p.id}
                  className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-extrabold text-slate-500 text-sm">#{idx + 1}</span>
                    <div>
                      <h5 className="font-bold text-slate-200">{p.name}</h5>
                      <span className="text-[11px] text-slate-400">{p.client_name}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase ${colors.badge}`}>
                      {p.risk_level} ({p.risk_score} pts)
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">
                      Spent: {p.budget_utilization_pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Progress Ranking */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Progress Deviation Slippage Ranking
            </h4>
          </div>

          <div className="space-y-3">
            {data?.project_progress_ranking.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-extrabold text-slate-500 text-sm">#{idx + 1}</span>
                  <div>
                    <h5 className="font-bold text-slate-200">{item.name}</h5>
                    <span className="text-[11px] text-slate-400">
                      Actual: {item.actual_progress}% vs Planned: {item.planned_progress}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold font-mono text-xs ${
                      item.slippage > 10
                        ? 'text-rose-400'
                        : item.slippage > 0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {item.slippage > 0 ? `-${item.slippage}% Lag` : `+${Math.abs(item.slippage)}% Ahead`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supplier Material Delay Trends */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400" />
            Supplier Delivery Delay Analysis
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Supplier Name</th>
                <th className="p-3">Total Material Orders</th>
                <th className="p-3">Average Delay (Days)</th>
                <th className="p-3">Max Delay Recorded</th>
                <th className="p-3">Supplier Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data?.material_delay_trends.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-slate-200">{s.supplier}</td>
                  <td className="p-3 font-mono">{s.total_items} items</td>
                  <td className="p-3 font-mono font-bold text-amber-400">{s.avg_delay_days} days</td>
                  <td className="p-3 font-mono font-bold text-rose-400">{s.max_delay_days} days</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        s.max_delay_days > 7
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : s.max_delay_days > 2
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {s.max_delay_days > 7 ? 'Critical Risk' : s.max_delay_days > 2 ? 'Moderate Delay' : 'Reliable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
