import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { NexoraLogo } from '../common/NexoraLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl text-slate-400 no-print relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Parent info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex group cursor-pointer" title="NexoraTools">
              <NexoraLogo size="md" showBadge={true} />
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The high-performance, 100% free photo, ID card, PDF and print workstation under{' '}
              <strong className="text-slate-200">Nexora Lab Technologies</strong>. Engineered for Cyber Cafes, photo studios, students, and job applicants.
            </p>

            <div className="inline-flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium max-w-md">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Zero Server Retention: All processing runs purely in your browser's RAM via HTML5 Canvas &amp; WebAssembly.</span>
            </div>
          </div>

          {/* Photo & ID Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>Photo &amp; ID Tools</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/photo/passport" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Passport Photo Maker
                </Link>
              </li>
              <li>
                <Link to="/photo/bg-remover" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  AI Background Remover
                </Link>
              </li>
              <li>
                <Link to="/id/merger" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  ID Card Front+Back Merger
                </Link>
              </li>
              <li>
                <Link to="/id/aadhaar" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  Aadhaar A4 Print Sheet
                </Link>
              </li>
              <li>
                <Link to="/photo/compress" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Exact KB Image Compressor
                </Link>
              </li>
              <li>
                <Link to="/photo/signature" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Signature Resizer &amp; Clean
                </Link>
              </li>
            </ul>
          </div>

          {/* PDF & Print Suite */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>PDF &amp; Print Suite</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/print/passport-sheet" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Passport Photo Print Sheet
                </Link>
              </li>
              <li>
                <Link to="/pdf/image-to-pdf" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Image to PDF Converter
                </Link>
              </li>
              <li>
                <Link to="/pdf/pdf-to-image" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  PDF to High-Res Image
                </Link>
              </li>
              <li>
                <Link to="/pdf/merge" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Merge PDF Documents
                </Link>
              </li>
              <li>
                <Link to="/pdf/split" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  Split &amp; Extract PDF Pages
                </Link>
              </li>
              <li>
                <Link to="/scanner" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  4-Corner Document Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
              <span>Platform &amp; Legal</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-indigo-400 transition-colors">
                  Privacy Policy (Zero-Storage)
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-indigo-400 transition-colors">
                  How It Works &amp; FAQ
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-400 transition-colors">
                  System Health &amp; Memory
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-300">Nexora Tools</strong> • A product of <strong className="text-slate-300">Nexora Lab Technologies</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              100% Free &amp; Zero Watermark Guarantee
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
