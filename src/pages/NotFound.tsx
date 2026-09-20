import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto py-24 px-4 text-center space-y-6">
      <div className="relative inline-block">
        <div className="text-8xl sm:text-9xl font-heading font-black bg-gradient-to-r from-indigo-500 via-sky-400 to-purple-500 bg-clip-text text-transparent select-none">
          404
        </div>
        <div className="absolute inset-0 bg-indigo-500/10 blur-3xl -z-10 rounded-full" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">Utility Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
          The requested utility or route does not exist or may have been updated in the recent release.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xl shadow-indigo-950/50 transition-all hover:scale-105"
        >
          <Home className="w-4 h-4" />
          <span>Return to Workstation</span>
        </Link>
        <Link
          to="/photo/passport"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all"
        >
          <span>Passport Maker</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
