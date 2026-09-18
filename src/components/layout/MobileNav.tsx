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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 no-print shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
