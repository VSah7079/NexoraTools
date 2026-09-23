import React from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Download,
  Lock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import type { AdminTab } from './AdminSidebar';

import { Database } from 'lucide-react';

interface AdminHeaderProps {
  activeTab: AdminTab;
  isDbConnected?: boolean;
  onOpenMobile: () => void;
  onDownloadBackup: () => void;
  onLogout: () => void;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Mission Control & Health',
    subtitle: 'Real-time telemetry, client performance, and RAM memory manager',
  },
  tools: {
    title: 'Tools & Services Catalog',
    subtitle: 'Manage utilities, custom routes, category badges, and visibility',
  },
  seo: {
    title: 'Dynamic SEO & SERP Studio',
    subtitle: 'Search snippet visualizer, sitemap generator, and meta tags',
  },
  announcements: {
    title: 'Live Announcement Banners',
    subtitle: 'Broadcast alerts, promos, and system notices across all pages',
  },
  branding: {
    title: 'Site Branding & Script Injection',
    subtitle: 'Configure identity, contact information, and inject custom code',
  },
  security: {
    title: 'Security, Backups & Reset',
    subtitle: 'PIN protection, portable JSON backups, and factory reset',
  },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  isDbConnected = false,
  onOpenMobile,
  onDownloadBackup,
  onLogout,
}) => {
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  return (
    <header className="sticky top-0 z-20 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Mobile Menu & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-xl bg-slate-900/90 border border-white/10 text-slate-300 hover:text-white lg:hidden cursor-pointer shrink-0 active:scale-95 transition-transform"
          title="Open Admin Navigation"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="font-semibold text-slate-400 hidden xs:inline">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden xs:inline" />
            <span className="text-indigo-400 font-bold truncate max-w-[140px] sm:max-w-xs">{currentTabInfo.title}</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden md:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Live Status & Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Database Status Pill */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border ${
            isDbConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}
          title={isDbConnected ? 'MongoDB Database Connected & Synced' : 'Offline Local Storage Fallback Mode'}
        >
          <span className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <Database className="w-3.5 h-3.5 hidden sm:inline" />
          <span className="hidden sm:inline">{isDbConnected ? 'MongoDB Connected' : 'Local Mode'}</span>
          <span className="sm:hidden">{isDbConnected ? 'MongoDB' : 'Local'}</span>
        </div>

        {/* Backup Button */}
        <button
          onClick={onDownloadBackup}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
          title="Download JSON Config Backup"
          aria-label="Download Backup"
        >
          <Download className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="hidden md:inline">Backup JSON</span>
        </button>

        {/* View Public Site */}
        <Link
          to="/"
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
          title="Go to Public Website"
          aria-label="View Public Website"
        >
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Public Site</span>
        </Link>

        {/* Lock Button */}
        <button
          onClick={onLogout}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
          title="Lock Admin Console"
          aria-label="Lock Admin Console"
        >
          <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    </header>
  );
};
