import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UserCheck, CreditCard, FileText, Printer } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Passport', path: '/photo/passport', icon: UserCheck },
    { label: 'ID Merge', path: '/id/merger', icon: CreditCard },
    { label: 'Print Sheet', path: '/print/passport-sheet', icon: Printer },
    { label: 'PDFs', path: '/pdf/image-to-pdf', icon: FileText },
  ];

  return (
    <div className="lg:hidden fixed bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-40 bg-slate-900/95 backdrop-blur-2xl border border-white/10 p-1.5 sm:p-2 rounded-2xl no-print shadow-2xl shadow-black/90">
      <div className="flex items-center justify-between gap-1 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold shadow-md shadow-indigo-600/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'stroke-[2.5px] text-white' : 'stroke-2 text-slate-400'}`} />
              <span className="text-[10px] sm:text-[11px] mt-0.5 truncate max-w-full font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
