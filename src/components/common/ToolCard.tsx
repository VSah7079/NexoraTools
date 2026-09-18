import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { ToolItem } from '../../types/tools';

export const ToolCard: React.FC<{ tool: ToolItem }> = ({ tool }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[tool.iconName] || Icons.FileText;

  return (
    <Link
      to={tool.path}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
    >
      <div
        className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none`}
      />

      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3.5 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-md shadow-indigo-950/40 group-hover:scale-110 transition-transform duration-300`}
          >
            <IconComponent className="w-6 h-6" />
          </div>

          {tool.badge && (
            <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {tool.badge}
            </span>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
          {tool.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
        <span>Open Utility</span>
        <Icons.ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
};
