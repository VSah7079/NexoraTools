import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Sliders,
  Globe,
  Bell,
  Code,
  Key,
  ExternalLink,
  Lock,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';

export type AdminTab = 'overview' | 'tools' | 'seo' | 'announcements' | 'branding' | 'security';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  toolsCount: number;
  activeToolsCount: number;
  seoCount: number;
  announcementActive: boolean;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  toolsCount,
  activeToolsCount,
  seoCount,
  announcementActive,
  onLogout,
}) => {
  const navItems: {
    id: AdminTab;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    badge?: string | number;
    badgeColor?: string;
    dot?: boolean;
  }[] = [
    {
      id: 'overview',
      label: 'Mission Control',
      shortLabel: 'Overview',
      icon: Activity,
    },
    {
      id: 'tools',
      label: 'Tools & Services',
      shortLabel: 'Tools',
      icon: Sliders,
      badge: `${activeToolsCount}/${toolsCount}`,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'seo',
      label: 'Dynamic SEO Studio',
      shortLabel: 'SEO',
      icon: Globe,
      badge: seoCount,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'announcements',
      label: 'Live Announcements',
      shortLabel: 'Banner',
      icon: Bell,
      dot: announcementActive,
    },
    {
      id: 'branding',
      label: 'Branding & Scripts',
      shortLabel: 'Brand',
      icon: Code,
    },
    {
      id: 'security',
      label: 'Security & Backup',
      shortLabel: 'Security',
      icon: Key,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900/95 lg:bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          {(!isCollapsed || mobileOpen) && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-black text-white text-base tracking-tight truncate">
                  Nexora
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">Enterprise Control Hub</p>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto scrollbar-thin">
        {(!isCollapsed || mobileOpen) && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Management Suites
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (mobileOpen) onCloseMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group relative cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/90 to-purple-600/90 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title={isCollapsed && !mobileOpen ? item.label : undefined}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800/80 text-slate-400 group-hover:text-indigo-300 group-hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {(!isCollapsed || mobileOpen) && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor || 'bg-slate-800 text-slate-400 border-white/5'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.dot && (
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse ml-2 shrink-0"
                      title="Announcement is currently active"
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer / Quick Actions */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {(!isCollapsed || mobileOpen) && (
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Local RAM Shield</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              100% In-Browser. Zero telemetry server logs.
            </p>
          </div>
        )}

        {/* Live Site Link */}
        <Link
          to="/"
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-white/5 transition-all ${
            isCollapsed && !mobileOpen ? 'justify-center' : ''
          }`}
          title="Open Live Public Website"
        >
          <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0" />
          {(!isCollapsed || mobileOpen) && <span>Public Website</span>}
        </Link>

        {/* Lock Console Button */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer ${
            isCollapsed && !mobileOpen ? 'justify-center' : ''
          }`}
          title="Lock Master Admin Console"
        >
          <Lock className="w-4 h-4 text-rose-400 shrink-0" />
          {(!isCollapsed || mobileOpen) && <span>Lock Console</span>}
        </button>
      </div>
    </div>
  );

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay with smooth transition */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
          onClick={onCloseMobile}
        />
        {/* Drawer Panel */}
        <div
          className={`fixed inset-y-0 left-0 w-72 sm:w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-out shadow-2xl ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};
