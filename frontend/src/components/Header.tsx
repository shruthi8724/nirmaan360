import React, { useState, useEffect } from 'react';
import { Menu, Bell, RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { api } from '../services/api';
import { Alert } from '../types';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
  title: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen, title, onRefresh }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts(true); // unread
      setAlerts(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSeed = async () => {
    if (window.confirm('Reset and seed database with sample Indian construction projects?')) {
      setSeeding(true);
      try {
        await api.seedDatabase();
        await loadAlerts();
        if (onRefresh) onRefresh();
        window.location.reload();
      } catch (e) {
        alert('Seed failed: ' + e);
      } finally {
        setSeeding(false);
      }
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await api.markAlertRead(id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-3">
        {/* Seed Database Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition"
          title="Reset database with realistic Indian project sample data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Seeding...' : 'Seed Sample Data'}</span>
        </button>

        {/* Alerts Bell Button */}
        <div className="relative">
          <button
            onClick={() => setShowAlertModal(!showAlertModal)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 relative transition"
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Panel */}
          {showAlertModal && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-sm text-slate-100">Live Risk Alerts</h3>
                </div>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No unread risk alerts.</p>
                ) : (
                  alerts.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs flex justify-between items-start gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              a.severity === 'Critical'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {a.severity}
                          </span>
                          <span className="font-semibold text-slate-200">{a.title}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] leading-relaxed">{a.message}</p>
                      </div>
                      <button
                        onClick={() => handleMarkRead(a.id)}
                        className="text-slate-500 hover:text-emerald-400 p-1 shrink-0"
                        title="Mark read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Currency Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg">
          <span>Currency:</span>
          <span className="font-bold">INR (₹)</span>
        </div>
      </div>
    </header>
  );
};
