import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
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
  Zap,
  QrCode,
} from 'lucide-react';
import { NexoraLogo } from '../common/NexoraLogo';
import { SearchModal } from './SearchModal';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const { t } = useLanguage();
  const location = useLocation();

  // Handle smooth debounced dropdown hover
  const handleMouseEnter = (name: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 220); // 220ms grace period so moving into dropdown never closes
  };

  const handleToggleDropdown = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Close mobile menu & dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, [location.pathname]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

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
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-2xl transition-all shadow-md shadow-black/20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Left: Brand Logo & Navigation */}
            <div className="flex items-center gap-3 lg:gap-6 min-w-0">
              <Link to="/" className="flex items-center shrink-0 group cursor-pointer" title="NexoraTools - Home">
                <NexoraLogo size="md" showBadge={true} />
              </Link>

              {/* Desktop Nav Links */}
              <nav ref={navRef} className="hidden xl:flex items-center gap-1.5 shrink-0">
                {/* Photo Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('photo')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={(e) => handleToggleDropdown('photo', e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeDropdown === 'photo' || location.pathname.startsWith('/photo')
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('navPhotos')}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${activeDropdown === 'photo' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'photo' && (
                    <div
                      className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => handleMouseEnter('photo')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-72 p-2.5 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-indigo-950/60">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Photo Utilities
                        </div>
                        <Link
                          to="/photo/passport"
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-xs font-medium text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {t('passportMaker')}
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300">Popular</span>
                            </div>
                            <div className="text-[10px] text-slate-400">35×45mm, 2×2" &amp; Govt exam presets</div>
                          </div>
                        </Link>
                        <Link
                          to="/photo/bg-remover"
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-xs font-medium text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {t('bgRemover')}
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300">AI</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Transparent, white &amp; studio colors</div>
                          </div>
                        </Link>
                        <Link
                          to="/photo/compress"
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-xs font-medium text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                            <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">KB</span>
                          </div>
                          <div>
                            <div className="font-semibold">{t('exactCompress')}</div>
                            <div className="text-[10px] text-slate-400">Target 20KB, 50KB, 100KB for forms</div>
                          </div>
                        </Link>
                        <Link
                          to="/photo/resize"
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-xs font-medium text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                            <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">px</span>
                          </div>
                          <div>
                            <div className="font-semibold">Image Resizer &amp; DPI</div>
                            <div className="text-[10px] text-slate-400">Pixels, mm, cm, 300 DPI support</div>
                          </div>
                        </Link>
                        <Link
                          to="/photo/signature"
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-xs font-medium text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
                            <span className="w-4 h-4 flex items-center justify-center font-bold text-xs">✍</span>
                          </div>
                          <div>
                            <div className="font-semibold">Signature Tool</div>
                            <div className="text-[10px] text-slate-400">Paper tint cleaning &amp; ink contrast</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* ID Card Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('id')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={(e) => handleToggleDropdown('id', e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeDropdown === 'id' || location.pathname.startsWith('/id')
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="p-1 rounded-md bg-purple-500/20 text-purple-400">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('navIdCards')}</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${activeDropdown === 'id' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'id' && (
                    <div
                      className="absolute top-full left-0 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => handleMouseEnter('id')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-72 p-2.5 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-purple-950/60">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          ID Card Merging
                        </div>
                        <Link
                          to="/id/merger"
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-xs font-medium text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-105 transition-transform">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              {t('idMerger')}
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300">Popular</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Aadhaar, Voter, PAN, DL &amp; Ayushman</div>
                          </div>
                        </Link>
                        <Link
                          to="/id/aadhaar"
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-xs font-medium text-slate-200 hover:text-white transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold">{t('aadhaarMerger')}</div>
                            <div className="text-[10px] text-slate-400">CR80 standard card &amp; A4 print layout</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* PDF & Office Tools Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('pdf')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={(e) => handleToggleDropdown('pdf', e)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      activeDropdown === 'pdf' || location.pathname.startsWith('/pdf')
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>{t('navPdf')} Suite</span>
                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${activeDropdown === 'pdf' ? 'rotate-180' : ''}`} />
                  </button>

                  {activeDropdown === 'pdf' && (
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onMouseEnter={() => handleMouseEnter('pdf')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-[960px] max-w-[96vw] p-5 rounded-3xl bg-slate-900/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-rose-950/60 space-y-4">
                        {/* Header bar */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white tracking-wide">Nexora Complete PDF Suite</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                              25+ Tools • 100% Free
                            </span>
                          </div>
                          <Link
                            to="/pdf"
                            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-3 py-1 rounded-xl transition-colors"
                          >
                            <span>Explore All PDF Tools Grid</span>
                            <span>→</span>
                          </Link>
                        </div>

                        {/* 7 Columns Matrix */}
                        <div className="grid grid-cols-7 gap-3 text-left">
                          {/* 1. ORGANIZE */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider pb-1 mb-1 border-b border-white/5 truncate">
                              Organize PDF
                            </div>
                            <Link to="/pdf/merge" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Merge PDF
                            </Link>
                            <Link to="/pdf/split" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Split PDF
                            </Link>
                            <Link to="/pdf/organize" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Remove pages
                            </Link>
                            <Link to="/pdf/split" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Extract pages
                            </Link>
                            <Link to="/pdf/organize" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Organize PDF
                            </Link>
                            <Link to="/scanner" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Scan to PDF
                            </Link>
                          </div>

                          {/* 2. OPTIMIZE */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider pb-1 mb-1 border-b border-white/5 truncate">
                              Optimize PDF
                            </div>
                            <Link to="/pdf/compress" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Compress PDF
                            </Link>
                            <Link to="/pdf/repair" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Repair PDF
                            </Link>
                            <Link to="/pdf/ocr" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              OCR PDF
                            </Link>
                          </div>

                          {/* 3. CONVERT TO */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider pb-1 mb-1 border-b border-white/5 truncate">
                              Convert to PDF
                            </div>
                            <Link to="/pdf/image-to-pdf" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              JPG to PDF
                            </Link>
                            <Link to="/pdf/word-to-pdf" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              WORD to PDF
                            </Link>
                            <Link to="/pdf/powerpoint-to-pdf" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              PPT to PDF
                            </Link>
                            <Link to="/pdf/excel-to-pdf" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              EXCEL to PDF
                            </Link>
                            <Link to="/pdf/html-to-pdf" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              HTML to PDF
                            </Link>
                          </div>

                          {/* 4. CONVERT FROM */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider pb-1 mb-1 border-b border-white/5 truncate">
                              Convert from PDF
                            </div>
                            <Link to="/pdf/pdf-to-image" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              PDF to JPG
                            </Link>
                            <Link to="/pdf/pdf-to-word" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              PDF to WORD
                            </Link>
                            <Link to="/pdf/pdf-to-powerpoint" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              PDF to PPT
                            </Link>
                            <Link to="/pdf/pdf-to-excel" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              PDF to EXCEL
                            </Link>
                            <Link to="/pdf/pdf-to-pdfa" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              PDF to PDF/A
                            </Link>
                          </div>

                          {/* 5. EDIT PDF */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider pb-1 mb-1 border-b border-white/5 truncate">
                              Edit PDF
                            </div>
                            <Link to="/pdf/rotate" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Rotate PDF
                            </Link>
                            <Link to="/pdf/page-numbers" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Page numbers
                            </Link>
                            <Link to="/pdf/watermark" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Add watermark
                            </Link>
                            <Link to="/pdf/crop" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Crop PDF
                            </Link>
                            <Link to="/pdf/edit" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Edit PDF
                            </Link>
                            <Link to="/pdf/forms" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              PDF Forms
                            </Link>
                          </div>

                          {/* 6. SECURITY */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider pb-1 mb-1 border-b border-white/5 truncate">
                              PDF Security
                            </div>
                            <Link to="/pdf/unlock" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Unlock PDF
                            </Link>
                            <Link to="/pdf/protect" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Protect PDF
                            </Link>
                            <Link to="/pdf/sign" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Sign PDF
                            </Link>
                            <Link to="/pdf/redact" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Redact PDF
                            </Link>
                            <Link to="/pdf/compare" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Compare PDF
                            </Link>
                          </div>

                          {/* 7. INTELLIGENCE */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-wider pb-1 mb-1 border-b border-white/5 truncate">
                              Intelligence
                            </div>
                            <Link to="/pdf/ai-summary" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              AI Summarizer
                            </Link>
                            <Link to="/pdf/translate" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              Translate PDF
                            </Link>
                            <Link to="/pdf/to-markdown" className="block py-1 px-1.5 rounded-lg hover:bg-white/5 text-[11px] font-medium text-slate-300 hover:text-white transition-colors truncate">
                              To Markdown
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct Links */}
                <Link
                  to="/print/passport-sheet"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    location.pathname.startsWith('/print')
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                    <Printer className="w-3.5 h-3.5" />
                  </div>
                  <span>{t('navPrint')}</span>
                </Link>

                <Link
                  to="/tools/qr-generator"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    location.pathname.startsWith('/tools/qr-generator')
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                    <QrCode className="w-3.5 h-3.5" />
                  </div>
                  <span>{t('navQr')}</span>
                </Link>

                <Link
                  to="/scanner"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    location.pathname.startsWith('/scanner')
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="p-1 rounded-md bg-cyan-500/20 text-cyan-400">
                    <Scan className="w-3.5 h-3.5" />
                  </div>
                  <span>{t('navScanner')}</span>
                </Link>

                <Link
                  to="/batch"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    location.pathname.startsWith('/batch')
                      ? 'bg-white/10 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="p-1 rounded-md bg-pink-500/20 text-pink-400">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>{t('navBatch')}</span>
                </Link>
              </nav>

              {/* Compact Nav on Medium-Large screens (1024px - 1279px) */}
              <nav className="hidden lg:flex xl:hidden items-center gap-1 shrink-0">
                <Link
                  to="/photo/passport"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Photos</span>
                </Link>
                <Link
                  to="/id/merger"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                  <span>ID Cards</span>
                </Link>
                <Link
                  to="/pdf/image-to-pdf"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-400" />
                  <span>PDFs</span>
                </Link>
                <Link
                  to="/print/passport-sheet"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print</span>
                </Link>
                <Link
                  to="/scanner"
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Scan className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Scanner</span>
                </Link>
              </nav>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Search Modal Trigger Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer whitespace-nowrap shadow-xs"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Search tools...</span>
                <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-950 rounded border border-white/10 whitespace-nowrap">
                  Ctrl+K
                </kbd>
              </button>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 cursor-pointer"
                aria-label="Open menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Slideout */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl p-4 space-y-4 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-1">
              Popular Utilities
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/photo/passport"
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2.5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span>Passport Photo</span>
              </Link>
              <Link
                to="/photo/bg-remover"
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2.5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>AI BG Remover</span>
              </Link>
              <Link
                to="/print/passport-sheet"
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2.5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Printer className="w-4 h-4" />
                </div>
                <span>Passport Sheet</span>
              </Link>
              <Link
                to="/id/merger"
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2.5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span>ID Card Merge</span>
              </Link>
              <Link
                to="/pdf/image-to-pdf"
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2.5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Image to PDF</span>
              </Link>
              <Link
                to="/scanner"
                className="p-3 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2.5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Scan className="w-4 h-4" />
                </div>
                <span>Doc Scanner</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-1">
              <Link
                to="/privacy"
                className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors"
              >
                Privacy &amp; Zero-Storage Guarantee
              </Link>
              <Link
                to="/how-it-works"
                className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-900 transition-colors"
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
