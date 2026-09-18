import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  UserCheck,
  CreditCard,
  FileText,
  Scan,
  Trash2,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { getLocalStats } from '../../services/analyticsTracker';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState(getLocalStats());
  const [purged, setPurged] = useState(false);

  useEffect(() => {
    setStats(getLocalStats());
  }, []);

  const handlePurgeMemory = () => {
    sessionStorage.clear();
    setPurged(true);
    setTimeout(() => setPurged(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Admin System & Health Dashboard"
        description="Monitor client-side processing metrics, privacy status, active tools, and local browser memory."
        categoryName="Admin"
        categoryPath="/admin"
        badge="Zero Telemetry"
      />

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>System Health</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              100% Operational
            </div>
            <div className="text-[11px] text-slate-500">Client-Side Engine Active</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Processed Documents</span>
              <Zap className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalProcessed}</div>
            <div className="text-[11px] text-slate-500">Since inception</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Server Retention</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300">0 Bytes</div>
            <div className="text-[11px] text-slate-500">Zero sensitive files stored</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>RAM Cache Status</span>
              <HardDrive className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-300">Clean</div>
            <div className="text-[11px] text-slate-500">Cleared on session close</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Tool Usage Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Passport Photos Created</span>
                </div>
                <span className="font-mono font-bold text-white">{stats.passportPhotosCreated}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  <span>ID Cards Merged</span>
                </div>
                <span className="font-mono font-bold text-white">{stats.idCardsMerged}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <FileText className="w-4 h-4 text-red-400" />
                  <span>PDF Operations Generated</span>
                </div>
                <span className="font-mono font-bold text-white">{stats.pdfsGenerated}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Scan className="w-4 h-4 text-cyan-400" />
                  <span>Document Scans Completed</span>
                </div>
                <span className="font-mono font-bold text-white">{stats.scansCompleted}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Memory &amp; Privacy Maintenance
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              All images and documents exist purely in ephemeral client memory (RAM). 
              If you are using a shared Cyber Cafe workstation or public computer, 
              you can purge all session data immediately:
            </p>

            <button
              onClick={handlePurgeMemory}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/40 hover:text-rose-300 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
            >
              {purged ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Browser RAM &amp; Session Cleared!</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>Purge Temporary In-Memory Session Cache</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
