import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Unlock,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { usePageSEO } from '../../utils/seoHelper';
import { AdminSidebar, type AdminTab } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { OverviewTab } from './components/OverviewTab';
import { ToolsTab } from './components/ToolsTab';
import { SEOTab } from './components/SEOTab';
import { AnnouncementsTab } from './components/AnnouncementsTab';
import { BrandingTab } from './components/BrandingTab';
import { SecurityTab } from './components/SecurityTab';

export const AdminDashboard: React.FC = () => {
  usePageSEO({
    title: 'Admin Master Control & Site Management Hub',
    description: 'Manage tools, edit SEO metadata, configure announcements, customize branding, and monitor client-side metrics.',
    categoryName: 'Admin',
    canonicalPath: '/admin',
  });

  const {
    state,
    tools,
    activeTools,
    isAuthenticated,
    isDbConnected,
    dbInfo,
    login,
    logout,
    changePin,
    addTool,
    updateTool,
    deleteTool,
    toggleToolStatus,
    updateRouteSEO,
    deleteRouteSEO,
    updateGlobalSEO,
    updateAnnouncement,
    updateBranding,
    exportConfigJSON,
    importConfigJSON,
    resetToDefaults,
  } = useSiteConfig();

  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auth state
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPin, setShowPin] = useState(false);

  // JSON Import Status
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(pinInput);
    if (ok) {
      setAuthError('');
      setPinInput('');
    } else {
      setAuthError('Incorrect Master PIN. Default PIN is nexora2026');
    }
  };

  // Export JSON file download
  const handleDownloadBackup = () => {
    const jsonStr = exportConfigJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora-tools-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = importConfigJSON(content);
        if (res.success) {
          setImportStatus({ success: true, message: 'Configuration successfully imported and applied!' });
        } else {
          setImportStatus({ success: false, message: res.error || 'Failed to import configuration' });
        }
      }
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------
  // UN-AUTHENTICATED VAULT LOCK SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center px-4 py-12 bg-slate-950 relative overflow-hidden">
        {/* Glow orbs */}
        <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-1/4 left-1/3 w-80 h-80 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden z-10 mx-auto">
          <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              Nexora Master Control
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your Master Admin PIN to unlock live catalog management, dynamic SEO routes, announcements, and site settings.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Master PIN / Password</span>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPin ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter Master PIN (Default: nexora2026)"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-950/90 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  autoFocus
                />
              </div>
            </div>

            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>
              Default PIN: <code className="text-indigo-300 font-mono font-bold">nexora2026</code>
            </span>
            <Link
              to="/"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1"
            >
              ← Return to Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN APP-SHELL
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Background Ambient Lights */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Modern Sidebar Navigation */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        mobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        toolsCount={tools.length}
        activeToolsCount={activeTools.length}
        seoCount={Object.keys(state.seoRoutes).length}
        announcementActive={state.announcement.enabled}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Control Bar */}
        <AdminHeader
          activeTab={activeTab}
          isDbConnected={isDbConnected}
          onOpenMobile={() => setIsMobileOpen(true)}
          onDownloadBackup={handleDownloadBackup}
          onLogout={logout}
        />

        {/* Tab Content Body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {activeTab === 'overview' && (
            <OverviewTab
              toolsCount={tools.length}
              activeToolsCount={activeTools.length}
              seoCount={Object.keys(state.seoRoutes).length}
              isDbConnected={isDbConnected}
              dbInfo={dbInfo}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsTab
              tools={tools}
              onAddTool={addTool}
              onUpdateTool={updateTool}
              onDeleteTool={deleteTool}
              onToggleStatus={toggleToolStatus}
            />
          )}

          {activeTab === 'seo' && (
            <SEOTab
              seoRoutes={state.seoRoutes}
              globalSEO={state.globalSEO}
              activeTools={activeTools}
              onUpdateRouteSEO={updateRouteSEO}
              onDeleteRouteSEO={deleteRouteSEO}
              onUpdateGlobalSEO={updateGlobalSEO}
            />
          )}

          {activeTab === 'announcements' && (
            <AnnouncementsTab
              announcement={state.announcement}
              onUpdateAnnouncement={updateAnnouncement}
            />
          )}

          {activeTab === 'branding' && (
            <BrandingTab
              branding={state.branding}
              globalSEO={state.globalSEO}
              onUpdateBranding={updateBranding}
              onUpdateGlobalSEO={updateGlobalSEO}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              onChangePin={changePin}
              onExportBackup={handleDownloadBackup}
              onImportBackup={handleFileUpload}
              importStatus={importStatus}
              onResetDefaults={resetToDefaults}
            />
          )}

          {/* Dedicated Admin Footer */}
          <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Nexora Master Admin Console • Secure In-Browser Storage</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 font-mono">v2.5.0 Enterprise</span>
              <Link
                to="/"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Exit to Live Website</span>
              </Link>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
