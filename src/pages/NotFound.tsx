import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
      <div className="text-6xl font-black text-indigo-500">404</div>
      <h1 className="text-2xl font-bold text-white">Tool Not Found</h1>
      <p className="text-xs text-slate-400">
        The tool or page you are searching for might have been moved or renamed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-950/40 transition-all"
      >
        <Home className="w-4 h-4" />
        <span>Return to Nexora Tools Home</span>
      </Link>
    </div>
  );
};
