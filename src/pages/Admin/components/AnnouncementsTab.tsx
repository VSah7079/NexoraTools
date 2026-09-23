import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Gift,
  Eye,
  Check,
} from 'lucide-react';
import type { AnnouncementConfig } from '../../../types/admin';

interface AnnouncementsTabProps {
  announcement: AnnouncementConfig;
  onUpdateAnnouncement: (config: Partial<AnnouncementConfig>) => void;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcement,
  onUpdateAnnouncement,
}) => {

  const bannerTypes: {
    id: AnnouncementConfig['type'];
    label: string;
    description: string;
    gradient: string;
    icon: React.ElementType;
  }[] = [
    {
      id: 'info',
      label: 'Info / Notice',
      description: 'Clean blue informational notice',
      gradient: 'from-blue-600 to-indigo-600',
      icon: Info,
    },
    {
      id: 'success',
      label: 'Success / Verified',
      description: 'Emerald green confirmation notice',
      gradient: 'from-emerald-600 to-teal-600',
      icon: CheckCircle2,
    },
    {
      id: 'warning',
      label: 'Maintenance / Alert',
      description: 'Amber warning & downtime alert',
      gradient: 'from-amber-600 to-orange-600',
      icon: AlertTriangle,
    },
    {
      id: 'promo',
      label: 'Promo / Feature Launch',
      description: 'Vibrant purple-pink gradient banner',
      gradient: 'from-purple-600 via-pink-600 to-rose-600',
      icon: Gift,
    },
  ];

  const currentTypeObj = bannerTypes.find((b) => b.id === announcement.type) || bannerTypes[0];

  const handleToggle = () => {
    onUpdateAnnouncement({ enabled: !announcement.enabled });
  };

  const handleTypeSelect = (type: AnnouncementConfig['type']) => {
    onUpdateAnnouncement({ type });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
              Live Announcement &amp; Alert Banners
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                announcement.enabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-white/10'
              }`}
            >
              {announcement.enabled ? 'Broadcast Active' : 'Broadcast Paused'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Publish maintenance notices, new tool announcements, or special deals to visitors at the top of every page.
          </p>
        </div>

        {/* Big Animated Toggle */}
        <button
          onClick={handleToggle}
          className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg ${
            announcement.enabled
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${announcement.enabled ? 'bg-white animate-ping' : 'bg-slate-500'}`} />
          <span>{announcement.enabled ? 'Disable Banner' : 'Enable Live Banner'}</span>
        </button>
      </div>

      {/* LIVE SIMULATOR PREVIEW */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Live Website Banner Simulator</span>
          </h3>
          <span className="text-[11px] text-slate-400 hidden sm:inline">Real-time visitor view</span>
        </div>

        <div className="p-3.5 sm:p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
            <span className="font-mono text-indigo-400">https://nexoratools.com</span>
            <span>Desktop &amp; Mobile Top Bar</span>
          </div>

          <div
            className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl bg-gradient-to-r ${currentTypeObj.gradient} text-white shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-medium transition-all`}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                {announcement.badgeText || 'Update'}
              </span>
              <span className="break-words">{announcement.message || 'Enter your announcement message below...'}</span>
              {announcement.linkText && (
                <span className="underline underline-offset-2 font-bold cursor-pointer opacity-90 hover:opacity-100 shrink-0">
                  {announcement.linkText} →
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STYLE PRESETS & FORM */}
      <div className="p-5 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300">Select Banner Color Theme</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {bannerTypes.map((b) => {
              const isSel = announcement.type === b.id;
              const Icon = b.icon;
              return (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => handleTypeSelect(b.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                    isSel
                      ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-xl bg-gradient-to-br ${b.gradient} text-white shadow`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSel && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{b.label}</div>
                    <div className="text-[10px] text-slate-400">{b.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-slate-300 font-semibold">Announcement Message *</label>
            <input
              type="text"
              value={announcement.message}
              onChange={(e) => onUpdateAnnouncement({ message: e.target.value })}
              placeholder="e.g. New AI Background Remover tool is now live with 100% free HD exports!"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Badge Label</label>
            <input
              type="text"
              value={announcement.badgeText || ''}
              onChange={(e) => onUpdateAnnouncement({ badgeText: e.target.value })}
              placeholder="e.g. New Launch, Alert, Promo, Update"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">CTA Button / Link Text</label>
            <input
              type="text"
              value={announcement.linkText || ''}
              onChange={(e) => onUpdateAnnouncement({ linkText: e.target.value })}
              placeholder="e.g. Try Tool Now, Learn More"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-slate-300 font-semibold">Destination URL / Route Path</label>
            <input
              type="text"
              value={announcement.linkUrl || ''}
              onChange={(e) => onUpdateAnnouncement({ linkUrl: e.target.value })}
              placeholder="e.g. /bg-remover or https://example.com/promo"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
