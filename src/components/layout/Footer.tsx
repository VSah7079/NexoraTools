import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { NexoraLogo } from '../common/NexoraLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-slate-950 text-slate-400 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Parent info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex group cursor-pointer" title="NexoraTools">
              <NexoraLogo size="md" />
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Free online photo and document utility platform under <strong>Nexora Lab Technologies</strong>.
              Crafted for Cyber Cafes, photo studios, students, and job applicants with 100% in-browser processing.
            </p>

            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Zero Document Retention: All data remains strictly on your machine.</span>
            </div>
          </div>

          {/* Photo & ID Tools */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Photo &amp; ID Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/photo/passport" className="hover:text-indigo-400 transition-colors">
                  Passport Photo Maker
                </Link>
              </li>
              <li>
                <Link to="/photo/bg-remover" className="hover:text-indigo-400 transition-colors">
                  AI Background Remover
                </Link>
              </li>
              <li>
                <Link to="/id/merger" className="hover:text-indigo-400 transition-colors">
                  ID Card Front+Back Merger
                </Link>
              </li>
              <li>
                <Link to="/id/aadhaar" className="hover:text-indigo-400 transition-colors">
                  Aadhaar A4 Sheet Merger
                </Link>
              </li>
              <li>
                <Link to="/photo/compress" className="hover:text-indigo-400 transition-colors">
                  Exact KB Image Compressor
                </Link>
              </li>
              <li>
                <Link to="/photo/signature" className="hover:text-indigo-400 transition-colors">
                  Signature Resizer &amp; Enhancer
                </Link>
              </li>
            </ul>
          </div>

          {/* PDF & Print Suite */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              PDF &amp; Print
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/print/passport-sheet" className="hover:text-indigo-400 transition-colors">
                  Passport Photo Print Sheet
                </Link>
              </li>
              <li>
                <Link to="/pdf/image-to-pdf" className="hover:text-indigo-400 transition-colors">
                  Image to PDF Converter
                </Link>
              </li>
              <li>
                <Link to="/pdf/pdf-to-image" className="hover:text-indigo-400 transition-colors">
                  PDF to High-Res Image
                </Link>
              </li>
              <li>
                <Link to="/pdf/merge" className="hover:text-indigo-400 transition-colors">
                  Merge PDF Documents
                </Link>
              </li>
              <li>
                <Link to="/pdf/split" className="hover:text-indigo-400 transition-colors">
                  Split &amp; Extract PDF Pages
                </Link>
              </li>
              <li>
                <Link to="/scanner" className="hover:text-indigo-400 transition-colors">
                  4-Corner Document Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs">
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
                  Admin System Health
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
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong>Nexora Tools</strong> • A product of <strong>Nexora Lab Technologies</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Free &amp; No Watermark
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
