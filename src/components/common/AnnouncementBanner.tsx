import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, AlertTriangle, CheckCircle2, Info, X, ArrowRight } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export const AnnouncementBanner: React.FC = () => {
  const { state } = useSiteConfig();
  const announcement = state.announcement;
  const [dismissed, setDismissed] = useState(false);

  if (!announcement || !announcement.enabled || dismissed) {
    return null;
  }

  const getTypeStyles = () => {
    switch (announcement.type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200',
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/90 border-amber-500/30 text-amber-200',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        };
      case 'promo':
        return {
          bg: 'bg-gradient-to-r from-indigo-950/90 via-purple-950/90 to-indigo-950/90 border-indigo-500/30 text-indigo-200',
          badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          icon: <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-950/90 border-blue-500/30 text-blue-200',
          badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`w-full py-2 px-4 border-b backdrop-blur-md transition-all duration-300 relative z-50 text-xs sm:text-sm ${styles.bg}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-center sm:justify-start">
          {styles.icon}
          {announcement.badgeText && (
            <span
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles.badge}`}
            >
              {announcement.badgeText}
            </span>
          )}
          <span className="font-medium text-slate-100 truncate sm:whitespace-normal">
            {announcement.message}
          </span>
          {announcement.linkText && announcement.linkUrl && (
            <Link
              to={announcement.linkUrl}
              className="inline-flex items-center gap-1 font-semibold text-white underline underline-offset-4 hover:text-indigo-300 transition-colors ml-1 shrink-0"
            >
              {announcement.linkText}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {announcement.closable && (
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Dismiss Announcement"
            aria-label="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
