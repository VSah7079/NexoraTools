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
    <div className="mb-6 space-y-3">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <Link to={categoryPath} className="hover:text-indigo-400 transition-colors capitalize">
          {categoryName}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-none">
          {title}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <PrivacyBadge minimal />
          {actions}
        </div>
      </div>
    </div>
  );
};
