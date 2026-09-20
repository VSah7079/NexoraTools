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
  Cpu,
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
        description="Monitor client-side processing metrics, privacy status, active tools, and local browser memory in real time."
        categoryName="Admin"
        categoryPath="/admin"
        badge="Zero Telemetry"
      />

      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">System Engine</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-heading font-black text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              100% Active
            </div>
            <div className="text-[11px] text-slate-400">Client-Side WASM / Canvas Engine</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Total Documents</span>
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-heading font-black text-white">{stats.totalProcessed}</div>
            <div className="text-[11px] text-slate-400">Jobs completed on this device</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Server Retention</span>
              <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-heading font-black text-cyan-300">0 Bytes</div>
            <div className="text-[11px] text-slate-400">Zero telemetry or cloud files</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold">Memory Status</span>
              <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-heading font-black text-purple-300">Isolated RAM</div>
            <div className="text-[11px] text-slate-400">Cleared on session close</div>
          </div>
        </div>

        {/* Breakdown and Memory Cleanup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 shadow-lg">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                Local Tool Usage Breakdown
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/5">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Passport Photos Generated</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">{stats.passportPhotosCreated}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/5">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="font-medium">ID Cards Merged</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">{stats.idCardsMerged}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/5">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-medium">PDF Operations Generated</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">{stats.pdfsGenerated}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/80 border border-white/5">
                <div className="flex items-center gap-3 text-slate-300">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Scan className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Document Scans Completed</span>
                </div>
                <span className="font-mono font-bold text-white text-sm">{stats.scansCompleted}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 shadow-lg flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Cyber Cafe &amp; Privacy Maintenance
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                All photos and documents are held strictly inside your device's browser memory (RAM). 
                If you are running on a shared Cyber Cafe workstation or public PC, 
                you can immediately flush all browser session memory with one click:
              </p>
            </div>

            <button
              onClick={handlePurgeMemory}
              className={`w-full flex items-center justify-center gap-2.5 py-4 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg ${
                purged
                  ? 'bg-emerald-600 text-white shadow-emerald-900/40'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {purged ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Session Memory Cleaned Successfully!</span>
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
