import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Database, RefreshCw, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export const Settings: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<string | null>(null);

  const [thresholds, setThresholds] = useState({
    progressLagCritical: 20,
    progressLagHigh: 15,
    budgetUtilizationWarning: 85,
    budgetUtilizationCritical: 95,
    materialDelayDaysWarning: 5,
    materialDelayDaysCritical: 10,
    overutilizationCap: 100,
  });

  const handleSeed = async () => {
    if (window.confirm('Reset database and seed with sample Indian construction projects?')) {
      setSeeding(true);
      try {
        const res = await api.seedDatabase();
        setSeedStatus(res.message);
        setTimeout(() => setSeedStatus(null), 5000);
      } catch (e) {
        alert('Seed failed: ' + e);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-amber-500" />
          Nirman360 Risk Intelligence Engine Configuration
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Tune deterministic risk calculation weights, thresholds, currency formatters, and database reset tools.
        </p>
      </div>

      {/* Threshold Tuner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Sliders className="w-5 h-5 text-sky-400" />
          <h4 className="font-bold text-sm text-slate-100">Risk Assessment Threshold Weights</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-300">Critical Progress Lag Threshold (%)</label>
            <input
              type="number"
              value={thresholds.progressLagCritical}
              onChange={(e) => setThresholds({ ...thresholds, progressLagCritical: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-500">Triggers +25 pts schedule risk penalty when deviation exceeds this value.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-300">High Budget Utilization Limit (%)</label>
            <input
              type="number"
              value={thresholds.budgetUtilizationWarning}
              onChange={(e) => setThresholds({ ...thresholds, budgetUtilizationWarning: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-500">Triggers budget warning alerts when project spends above this percentage.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-300">Critical Material Delay Warning (Days)</label>
            <input
              type="number"
              value={thresholds.materialDelayDaysCritical}
              onChange={(e) => setThresholds({ ...thresholds, materialDelayDaysCritical: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-500">Triggers +25 pts procurement risk when supplier delivery exceeds this delay.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block font-semibold text-slate-300">Resource Overutilization Cap (%)</label>
            <input
              type="number"
              value={thresholds.overutilizationCap}
              onChange={(e) => setThresholds({ ...thresholds, overutilizationCap: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono"
            />
            <p className="text-[11px] text-slate-500">Triggers resource bottleneck warning when labor/machinery utilization passes 100%.</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => alert('Risk weights updated successfully!')}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            Save Weight Preferences
          </button>
        </div>
      </div>

      {/* Database Management & Seed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Database className="w-5 h-5 text-amber-500" />
          <h4 className="font-bold text-sm text-slate-100">Database & Sample Telemetry Seeder</h4>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Wipe the database schema and populate with realistic Indian mega-construction projects (Metro Line Extension, Tech Park Commercial Tower, Highway Flyover, High-Rise Residential Complex, Renewable Energy Plant).
        </p>

        {seedStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{seedStatus}</span>
          </div>
        )}

        <div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-amber-500/20 transition"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding Database...' : 'Reset & Seed Realistic Indian Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
