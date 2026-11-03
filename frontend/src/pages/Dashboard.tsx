import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  TrendingUp,
  IndianRupee,
  Clock,
  CheckCircle,
  BarChart,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../services/api';
import { DashboardSummary, ChartData, Alert } from '../types';
import { formatINR, getRiskColor } from '../utils/formatters';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [sumRes, chartRes, alertRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardCharts(),
        api.getAlerts(true),
      ]);
      setSummary(sumRes);
      setCharts(chartRes);
      setAlerts(alertRes);
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3 text-amber-500 font-semibold">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Portfolio Risk Analytics...</span>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Projects',
      value: summary?.total_projects || 0,
      subtext: `${summary?.active_projects || 0} Active, ${summary?.completed_projects || 0} Completed`,
      icon: Building2,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10 border-sky-500/30',
    },
    {
      title: 'At-Risk Projects',
      value: summary?.at_risk_projects || 0,
      subtext: 'High / Critical Risk Score',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      title: 'Average Progress',
      value: `${summary?.average_progress_pct || 0}%`,
      subtext: 'Across all active sites',
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Total Portfolio Budget',
      value: formatINR(summary?.total_budget || 0, true),
      subtext: `Utilization: ${summary?.budget_utilization_pct || 0}%`,
      icon: IndianRupee,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'Delayed Projects',
      value: summary?.delayed_projects || 0,
      subtext: 'Material or Schedule Lag',
      icon: Clock,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner / Header Subtext */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Nirman360 Risk Command Center
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Portfolio visibility and explainable rule-based risk insights for construction teams.
          </p>
        </div>
        <button
          onClick={() => navigate('/risk-intelligence')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition shrink-0"
        >
          <span>Open Risk Intelligence Engine</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-semibold">{card.title}</span>
                <div className={`p-2 rounded-lg border ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-extrabold text-white tracking-tight">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 font-medium">{card.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid - 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Planned vs Actual Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-sky-400" />
                Project Progress Variance (%)
              </h3>
              <p className="text-[11px] text-slate-400">Planned Target vs Actual Execution Progress</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts?.progress_chart && (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={charts.progress_chart}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="planned" name="Planned Progress %" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual Progress %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Risk Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Portfolio Risk Level Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Low, Medium, High, and Critical Risk Classifications</p>
            </div>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {charts?.risk_chart && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.risk_chart}
                    dataKey="count"
                    nameKey="level"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                    label={({ level, count }) => `${level}: ${count}`}
                  >
                    {charts.risk_chart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Budget Utilization Chart (₹ Crores) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-amber-400" />
                Budget vs Actual Cost (₹ Crores)
              </h3>
              <p className="text-[11px] text-slate-400">Total Approved Budget vs Capital Spent</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts?.budget_chart && (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={charts.budget_chart}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit=" Cr" />
                  <Tooltip
                    formatter={(val: any) => [`₹${val} Cr`, '']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="budget" name="Approved Budget (₹ Cr)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="current_cost" name="Current Cost Spent (₹ Cr)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </ReBarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Monthly Project Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Monthly Project Performance Trend
              </h3>
              <p className="text-[11px] text-slate-400">Historical velocity & progress accumulation</p>
            </div>
          </div>
          <div className="h-64 w-full">
            {charts?.monthly_chart && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.monthly_chart}>
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="planned" name="Planned %" stroke="#0284c7" fill="#0284c7" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="actual" name="Actual %" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Live System Alerts Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-100">Live Critical System Alerts</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{alerts.length} Active Notifications</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {alerts.length === 0 ? (
            <div className="col-span-full py-6 text-center text-xs text-slate-400">
              No active critical alerts detected across projects.
            </div>
          ) : (
            alerts.slice(0, 6).map((a) => (
              <div
                key={a.id}
                className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        a.severity === 'Critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {a.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-200 mb-1">{a.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{a.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
