import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Zap,
  Printer,
  Sparkles,
  UserCheck,
  CreditCard,
  FileText,
  ArrowUp,
  Cpu,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import { NexoraLogo } from '../common/NexoraLogo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl text-slate-400 no-print relative z-10 overflow-hidden">
      {/* Top subtle radiant gradient beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500/60 via-purple-500/60 to-transparent" />
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Trust & Guarantee Cards */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-10 pb-8 border-b border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md flex items-start gap-3.5 group hover:border-emerald-500/30 transition-all">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>100% Client-Side RAM</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Files never touch remote servers. Pure browser-memory execution.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md flex items-start gap-3.5 group hover:border-indigo-500/30 transition-all">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Zero Watermarks Ever</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Clean, unbranded exports ready for official submissions &amp; customers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md flex items-start gap-3.5 group hover:border-cyan-500/30 transition-all">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 group-hover:scale-110 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Studio 300 DPI Sharpness</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Crisp standard presets (A4, 4×6", 5×7") for laser &amp; inkjet printers.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md flex items-start gap-3.5 group hover:border-amber-500/30 transition-all">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Free &amp; Instant Forever</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                No subscription, no accounts required, no queue or file limits.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Links Section */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand & Parent info */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex group cursor-pointer" title="NexoraTools - Professional Workstation">
              <NexoraLogo size="lg" showBadge={true} />
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The high-performance, studio-grade productivity suite engineered under{' '}
              <strong className="text-white font-semibold">Nexora Lab Technologies</strong>. Purpose-built for CSC centers, Cyber Cafes, photo studios, students, and competitive exam applicants.
            </p>

            {/* In-Browser Security Engine Badge */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Client-Side Engine
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  100% Active
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[10px] text-indigo-300">HTML5 Canvas</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[10px] text-cyan-300">WebAssembly</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[10px] text-rose-300">PDF-Lib</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 font-mono text-[10px] text-emerald-300">Zero Server Upload</span>
              </div>
            </div>
          </div>

          {/* Photo & Studio Suite */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <span>Photo Tools</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/photo/passport" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-1 transition-transform">Passport Photo Maker</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 font-bold">Popular</span>
                </Link>
              </li>
              <li>
                <Link to="/photo/bg-remover" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-1 transition-transform">AI Background Remover</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 font-bold">AI</span>
                </Link>
              </li>
              <li>
                <Link to="/photo/compress" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Exact KB Compressor</span>
                </Link>
              </li>
              <li>
                <Link to="/photo/resize" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Image Resizer &amp; Scale</span>
                </Link>
              </li>
              <li>
                <Link to="/photo/signature" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Signature Resizer &amp; Invert</span>
                </Link>
              </li>
              <li>
                <Link to="/photo/crop-rotate" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Crop, Rotate &amp; Straighten</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ID Card & Print Studio */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span>ID &amp; Print Studio</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/id/merger" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-1 transition-transform">ID Front+Back Merger</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold">Top</span>
                </Link>
              </li>
              <li>
                <Link to="/id/aadhaar" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Aadhaar A4 Print Sheet</span>
                </Link>
              </li>
              <li>
                <Link to="/print/passport-sheet" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Passport Grid Print Sheet</span>
                </Link>
              </li>
              <li>
                <Link to="/print/studio" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Custom Print Layouts</span>
                </Link>
              </li>
              <li>
                <Link to="/scanner" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">4-Corner Document Scanner</span>
                </Link>
              </li>
              <li>
                <Link to="/tools/qr-generator" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">QR &amp; UPI Standee Studio</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* PDF Tools & Utilities */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <div className="p-1 rounded-md bg-rose-500/20 text-rose-400">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <span>PDF &amp; Office Suite</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/pdf" className="text-rose-400 font-bold hover:text-rose-300 transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-1 transition-transform">★ All 25+ PDF Tools Grid</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">Suite</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/pdf-to-word" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center justify-between group">
                  <span className="group-hover:translate-x-1 transition-transform">PDF to Word (.docx)</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 font-bold">New</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/word-to-pdf" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Word to PDF (.pdf)</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/powerpoint-to-pdf" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">PowerPoint to PDF</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/pdf-to-powerpoint" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">PDF to PowerPoint</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/excel-to-pdf" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Excel to PDF Tables</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/pdf-to-excel" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">PDF to Excel (XLSX/CSV)</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/html-to-pdf" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">HTML to PDF Webpage</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/pdf-to-pdfa" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">PDF to PDF/A (ISO 19005)</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/pdf-to-text" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">PDF &amp; Text Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/pdf/image-to-pdf" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Image to PDF &amp; Extract</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Platform */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span>Platform &amp; Info</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Zero-Storage Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">How It Works &amp; Architecture</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">System Health &amp; Analytics</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-indigo-300 transition-colors flex items-center group">
                  <span className="group-hover:translate-x-1 transition-transform">Contact &amp; Support</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="space-y-1 text-center md:text-left">
            <div>
              © {currentYear} <strong className="text-white font-bold">NexoraTools</strong>. An engineering initiative by{' '}
              <strong className="text-slate-200">Nexora Lab Technologies</strong>.
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-center md:justify-start gap-1">
              <span>Crafted with</span>
              <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500/40" />
              <span>for Cyber Cafes, CSC Centers, Photographers &amp; Students across India 🇮🇳 &amp; Worldwide.</span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Free Forever</span>
            </div>

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              title="Scroll back to top"
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/20 group"
            >
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
