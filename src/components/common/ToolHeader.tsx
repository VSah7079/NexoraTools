import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { PrivacyBadge } from './PrivacyBadge';

interface ToolHeaderProps {
  title: string;
  description: string;
  categoryName: string;
  categoryPath?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({
  title,
  description,
  categoryName,
  categoryPath = '/',
  badge,
  actions,
}) => {
  return (
    <div className="mb-6 sm:mb-8 space-y-2.5 sm:space-y-3">
      {/* Breadcrumb Bar */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-slate-400">
        <Link
          to="/"
          className="hover:text-indigo-400 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded-lg hover:bg-white/5 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
        <Link
          to={categoryPath}
          className="hover:text-indigo-400 transition-colors capitalize px-1.5 py-0.5 rounded-lg hover:bg-white/5 shrink-0"
        >
          {categoryName}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
        <span className="text-slate-200 font-medium truncate max-w-[160px] sm:max-w-none px-1">
          {title}
        </span>
      </div>

      {/* Main Title & Action Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-heading font-black text-white tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-extrabold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-xs">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
          <PrivacyBadge minimal />
          {actions}
        </div>
      </div>
    </div>
  );
};
