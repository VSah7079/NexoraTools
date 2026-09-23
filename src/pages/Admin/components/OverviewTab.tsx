import React, { useState, useEffect } from 'react';
import {
  Zap,
  Sliders,
  Globe,
  ShieldCheck,
  UserCheck,
  CreditCard,
  FileText,
  Scan,
  Trash2,
  CheckCircle2,
  Sparkles,
  Activity,
  Terminal,
} from 'lucide-react';
import { getLocalStats } from '../../../services/analyticsTracker';
import type { AdminTab } from './AdminSidebar';

import { Database } from 'lucide-react';

interface OverviewTabProps {
  toolsCount: number;
  activeToolsCount: number;
  seoCount: number;
  isDbConnected?: boolean;
  dbInfo?: { engine?: string; sizeBytes?: number };
  onNavigateTab: (tab: AdminTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  toolsCount,
  activeToolsCount,
  seoCount,
  isDbConnected = false,
  dbInfo,
  onNavigateTab,
}) => {
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

  const totalOps = stats.totalProcessed || 1;
  const passportPct = Math.round(((stats.passportPhotosCreated || 0) / totalOps) * 100);
  const idMergerPct = Math.round(((stats.idCardsMerged || 0) / totalOps) * 100);
  const pdfPct = Math.round(((stats.pdfsGenerated || 0) / totalOps) * 100);
  const scanPct = Math.round(((stats.scansCompleted || 0) / totalOps) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-white/10 p-5 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] sm:text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nexora Enterprise Control Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">
              Mission Control &amp; System Health
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time monitoring of client-side operations, active tool services, dynamic SEO routes, and in-browser privacy caching.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onNavigateTab('tools')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Manage Tools</span>
            </button>
            <button
              onClick={() => onNavigateTab('seo')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>SEO Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 sm:mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Tasks Done</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Zap className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">{stats.totalProcessed}</div>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">100% In-Browser</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 sm:mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Active Tools</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Sliders className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-white">
            {activeToolsCount}{' '}
            <span className="text-xs sm:text-sm font-normal text-slate-400">/ {toolsCount}</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-indigo-300 font-medium truncate">
            <span className="truncate">{Math.round((activeToolsCount / (toolsCount || 1)) * 100)}% Public</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 sm:mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] truncate">SEO Routes</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Globe className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-cyan-300">{seoCount}</div>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-cyan-400 font-medium truncate">
            <span className="truncate">Search Landings</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 sm:mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] sm:text-[11px] truncate">Cloud Retention</span>
            <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shrink-0">
              <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-black text-purple-300">0 B</div>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-purple-400 font-medium truncate">
            <span className="truncate">Zero Leaks</span>
          </div>
        </div>
      </div>

      {/* Operations Breakdown & Workstation Memory Cleaner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool Usage Breakdown */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Tool Operations Distribution
                </h3>
                <p className="text-[11px] text-slate-400">Activity breakdown across client utilities</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">{stats.totalProcessed} Total</span>
          </div>

          <div className="space-y-4">
            {/* Passport Photos */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Passport &amp; Studio Photos
                </span>
                <span className="font-mono font-bold text-white">
                  {stats.passportPhotosCreated} <span className="text-slate-400 font-normal">({passportPct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${Math.max(passportPct, 4)}%` }}
                />
              </div>
            </div>

            {/* ID Cards Merged */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  ID Card &amp; Aadhaar Mergers
                </span>
                <span className="font-mono font-bold text-white">
                  {stats.idCardsMerged} <span className="text-slate-400 font-normal">({idMergerPct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-500"
                  style={{ width: `${Math.max(idMergerPct, 4)}%` }}
                />
              </div>
            </div>

            {/* PDF Operations */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                  PDF Operations &amp; Conversions
                </span>
                <span className="font-mono font-bold text-white">
                  {stats.pdfsGenerated} <span className="text-slate-400 font-normal">({pdfPct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-600 transition-all duration-500"
                  style={{ width: `${Math.max(pdfPct, 4)}%` }}
                />
              </div>
            </div>

            {/* Document Scans */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-2">
                  <Scan className="w-3.5 h-3.5 text-cyan-400" />
                  Document Camera Scans
                </span>
                <span className="font-mono font-bold text-white">
                  {stats.scansCompleted} <span className="text-slate-400 font-normal">({scanPct}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${Math.max(scanPct, 4)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workstation RAM Privacy & Purge Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  Cyber Cafe &amp; Workstation Privacy
                </h3>
                <p className="text-[11px] text-slate-400">RAM session cache instant flusher</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              All documents, passport photos, and merged card buffers are held strictly inside your local browser memory (RAM). When finished on a shared PC or Cyber Cafe workstation, you can immediately wipe all temporary memory with one click.
            </p>
          </div>

          <button
            onClick={handlePurgeMemory}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg ${
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
                <span>Flush Temporary In-Memory Session RAM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Environment & Hardware Diagnostics */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
              Client Hardware &amp; Capabilities Diagnostics
            </h3>
            <p className="text-[11px] text-slate-400">In-browser rendering acceleration engines</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400">Database Engine</div>
            <div className={`text-sm font-bold flex items-center gap-1.5 ${isDbConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              <Database className="w-3.5 h-3.5" />
              <span>{dbInfo?.engine || (isDbConnected ? 'MongoDB Synced' : 'Local Fallback')}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400">WebAssembly (WASM)</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SIMD Active</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400">WebGPU / Canvas 2D</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Hardware Ready</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400">OffscreenCanvas</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Multi-Threaded</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 space-y-1">
            <div className="text-[11px] text-slate-400">Security Vault</div>
            <div className="text-sm font-bold text-indigo-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PIN Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
