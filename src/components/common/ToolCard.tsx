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
      className="group relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900/70 hover:bg-slate-900/95 border border-white/10 hover:border-indigo-500/40 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/15 backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-1.5 overflow-hidden"
    >
      {/* Ambient background glow on card hover */}
      <div
        className={`absolute -right-16 -top-16 w-36 h-36 rounded-full bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-25 blur-2xl transition-opacity duration-500 pointer-events-none`}
      />

      <div>
        <div className="flex items-start justify-between mb-4">
          <div
            className={`p-3.5 rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-lg shadow-black/40 group-hover:scale-110 transition-transform duration-300`}
          >
            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap shadow-xs">
                {tool.badge}
              </span>
            )}
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
              {tool.category}
            </span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-indigo-300 transition-colors">
          {tool.name}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
        <span className="flex items-center gap-1">
          <span>Launch Tool</span>
        </span>
        <div className="p-1 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
          <Icons.ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
