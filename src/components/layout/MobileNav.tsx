import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, UserCheck, CreditCard, FileText, Printer, Scan } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Passport', path: '/photo/passport', icon: UserCheck },
    { label: 'ID Merge', path: '/id/merger', icon: CreditCard },
    { label: 'Print Sheet', path: '/print/passport-sheet', icon: Printer },
    { label: 'PDF Suite', path: '/pdf/image-to-pdf', icon: FileText },
    { label: 'Scanner', path: '/scanner', icon: Scan },
  ];

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-900/90 backdrop-blur-2xl border border-white/10 px-2 py-2 rounded-2xl no-print shadow-2xl shadow-black/80">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
