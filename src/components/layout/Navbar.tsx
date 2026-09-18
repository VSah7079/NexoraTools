import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  UserCheck,
  CreditCard,
  FileText,
  Printer,
  Scan,
  Layers,
  LayoutDashboard,
} from 'lucide-react';
import { NexoraLogo } from '../common/NexoraLogo';
import { useTheme } from '../../context/ThemeContext';
import { SearchModal } from './SearchModal';

export const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Brand Logo & Navigation */}
            <div className="flex items-center gap-4 xl:gap-6 min-w-0">
              <Link to="/" className="flex items-center shrink-0 group cursor-pointer" title="NexoraTools - Home">
                <NexoraLogo size="md" showBadge={true} />
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
                {/* Photo Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('photo')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap cursor-pointer">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Photo Tools</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {activeDropdown === 'photo' && (
                    <div className="absolute top-full left-0 mt-1 w-64 p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50">
                      <Link
                        to="/photo/passport"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <UserCheck className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-semibold">Passport Photo Maker</div>
                          <div className="text-[10px] text-slate-400">35x45mm, 2x2" presets &amp; ICAO</div>
                        </div>
                      </Link>
                      <Link
                        to="/photo/bg-remover"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="font-semibold">AI Background Remover</div>
                          <div className="text-[10px] text-slate-400">Transparent &amp; color replace</div>
                        </div>
                      </Link>
                      <Link
                        to="/photo/compress"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <span className="w-4 h-4 flex items-center justify-center font-bold text-emerald-400 text-xs">KB</span>
                        <div>
                          <div className="font-semibold">Exact KB Compressor</div>
                          <div className="text-[10px] text-slate-400">Target 20KB, 50KB, 100KB</div>
                        </div>
                      </Link>
                      <Link
                        to="/photo/resize"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <span className="w-4 h-4 flex items-center justify-center font-bold text-amber-400 text-xs">px</span>
                        <div>
                          <div className="font-semibold">Image Resizer &amp; DPI</div>
                          <div className="text-[10px] text-slate-400">Pixels, mm, cm, 300 DPI</div>
                        </div>
                      </Link>
                      <Link
                        to="/photo/signature"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <span className="w-4 h-4 flex items-center justify-center font-bold text-rose-400 text-xs">✍</span>
                        <div>
                          <div className="font-semibold">Signature Tool</div>
                          <div className="text-[10px] text-slate-400">Clean paper tint &amp; enhance</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* ID Card Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('id')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap cursor-pointer">
                    <CreditCard className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>ID Cards</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {activeDropdown === 'id' && (
                    <div className="absolute top-full left-0 mt-1 w-64 p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50">
                      <Link
                        to="/id/merger"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <CreditCard className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="font-semibold">Front + Back ID Merger</div>
                          <div className="text-[10px] text-slate-400">Aadhaar, Voter, PAN, DL</div>
                        </div>
                      </Link>
                      <Link
                        to="/id/aadhaar"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-semibold">Aadhaar Card A4 Sheet</div>
                          <div className="text-[10px] text-slate-400">A4 print ready layout</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* PDF Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setActiveDropdown('pdf')}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap cursor-pointer">
                    <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>PDF Suite</span>
                    <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>

                  {activeDropdown === 'pdf' && (
                    <div className="absolute top-full left-0 mt-1 w-64 p-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150 z-50">
                      <Link
                        to="/pdf/image-to-pdf"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <FileText className="w-4 h-4 text-red-400" />
                        <div>
                          <div className="font-semibold">Image to PDF</div>
                          <div className="text-[10px] text-slate-400">Multi-image &amp; drag reorder</div>
                        </div>
                      </Link>
                      <Link
                        to="/pdf/pdf-to-image"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <span className="w-4 h-4 font-bold text-amber-400 text-xs">JPG</span>
                        <div>
                          <div className="font-semibold">PDF to Image</div>
                          <div className="text-[10px] text-slate-400">Extract high-res pages</div>
                        </div>
                      </Link>
                      <Link
                        to="/pdf/merge"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <Layers className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-semibold">Merge PDF Files</div>
                          <div className="text-[10px] text-slate-400">Combine multiple documents</div>
                        </div>
                      </Link>
                      <Link
                        to="/pdf/split"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <span className="w-4 h-4 font-bold text-violet-400 text-xs">✂</span>
                        <div>
                          <div className="font-semibold">Split &amp; Extract PDF</div>
                          <div className="text-[10px] text-slate-400">Extract ranges or pages</div>
                        </div>
                      </Link>
                      <Link
                        to="/pdf/compress"
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white"
                      >
                        <span className="w-4 h-4 font-bold text-emerald-400 text-xs">▼</span>
                        <div>
                          <div className="font-semibold">Compress PDF</div>
                          <div className="text-[10px] text-slate-400">Reduce document file size</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Direct Links */}
                <Link
                  to="/print/passport-sheet"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Passport Sheet</span>
                </Link>

                <Link
                  to="/scanner"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap"
                >
                  <Scan className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Doc Scanner</span>
                </Link>

                <Link
                  to="/batch"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap"
                >
                  <span className="text-pink-400 font-bold text-xs shrink-0">⚡</span>
                  <span>Batch Tools</span>
                </Link>
              </nav>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Search Modal Trigger */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Search utilities...</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950 rounded border border-slate-700 whitespace-nowrap">
                  Ctrl+K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer shrink-0"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
              </button>

              {/* Admin / Health Dashboard link */}
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-colors whitespace-nowrap shrink-0"
                title="System health and local statistics"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Dashboard</span>
              </Link>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Slideout */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-2">
              Popular Utilities
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/photo/passport"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                Passport Photo
              </Link>
              <Link
                to="/photo/bg-remover"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI BG Remover
              </Link>
              <Link
                to="/print/passport-sheet"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                Passport Sheet
              </Link>
              <Link
                to="/id/merger"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-indigo-400" />
                ID Card Merge
              </Link>
              <Link
                to="/pdf/image-to-pdf"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                Image to PDF
              </Link>
              <Link
                to="/scanner"
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2"
              >
                <Scan className="w-4 h-4 text-cyan-400" />
                Doc Scanner
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1">
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
              >
                System Dashboard &amp; Stats
              </Link>
              <Link
                to="/privacy"
                className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
              >
                Privacy &amp; Zero-Storage Policy
              </Link>
              <Link
                to="/how-it-works"
                className="block px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
              >
                How It Works &amp; FAQ
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
