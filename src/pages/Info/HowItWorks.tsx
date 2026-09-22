import React from 'react';
import { UserCheck, CreditCard, ArrowRight, Zap } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { Link } from 'react-router-dom';
import { usePageSEO } from '../../utils/seoHelper';

export const HowItWorks: React.FC = () => {
  usePageSEO({
    title: 'How It Works & Quick Guides for Cyber Cafes & Photo Studios',
    description: 'Master workflows for passport photo creation, Aadhaar card front & back merging on A4 paper, and exact KB image compression with Nexora Tools guides.',
    keywords: 'how to create passport photo sheet, how to merge aadhaar front back, exact kb image compression guide, nexora tools guide',
    canonicalPath: '/how-it-works',
    categoryName: 'Guide',
    toolName: 'How It Works Guide',
  });
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
      <ToolHeader
        title="How It Works & Quick Guides"
        description="Step-by-step interactive workflow guides for Photo Studios, Cyber Cafes, CSC Centers, and applicants."
        categoryName="Guide"
        categoryPath="/how-it-works"
      />

      <div className="space-y-8">
        {/* Guide 1: Passport Photo to Print Sheet */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-blue-500/20 text-blue-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
                How to make a Passport Photo &amp; Print Sheet in 3 Steps
              </h3>
              <p className="text-xs text-slate-400">Perfect for studios and fast 4×6" print orders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-blue-400 block text-xs">Step 1: Upload &amp; Pick Size</span>
              <p className="text-slate-400 leading-relaxed">
                Upload a portrait. Choose standard 35×45mm (Indian Passport/Visa) or 2×2" (US Visa/PAN).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-blue-400 block text-xs">Step 2: Biometric Guidance</span>
              <p className="text-slate-400 leading-relaxed">
                Position face inside the biometric oval guideline and pick pure white or sky blue backdrop.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-blue-400 block text-xs">Step 3: Send to Print Sheet</span>
              <p className="text-slate-400 leading-relaxed">
                Click "Send to Print Sheet", select 4×6" paper with 8 copies, and click 1-Click Print.
              </p>
            </div>
          </div>

          <Link
            to="/photo/passport"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 pt-1 group"
          >
            <span>Open Passport Photo Maker</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Guide 2: Two-Side ID Merger */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
                How to Merge Front &amp; Back of Aadhaar / Voter ID
              </h3>
              <p className="text-xs text-slate-400">The daily indispensable utility for Cyber Cafes and CSC centers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-purple-400 block text-xs">Step 1: Choose Document Type</span>
              <p className="text-slate-400 leading-relaxed">
                Select Aadhaar, Voter ID, PAN, or Driving Licence card preset.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-purple-400 block text-xs">Step 2: Upload Front &amp; Back</span>
              <p className="text-slate-400 leading-relaxed">
                Drop front photo and back address photo. Use 4-corner perspective adjust if crooked.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-purple-400 block text-xs">Step 3: A4 Print or PDF</span>
              <p className="text-slate-400 leading-relaxed">
                Choose Vertical (stacked) or Horizontal (side-by-side) and export clean A4 PDF sheet.
              </p>
            </div>
          </div>

          <Link
            to="/id/merger"
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 pt-1 group"
          >
            <span>Open ID Card Merger</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Guide 3: Exact KB Compressor */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
                How to Compress Images to Exact 20KB / 50KB for Govt Forms
              </h3>
              <p className="text-xs text-slate-400">Pass strict portal validation rules on the first attempt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-emerald-400 block text-xs">Step 1: Upload Photo or Signature</span>
              <p className="text-slate-400 leading-relaxed">
                Drop your raw phone camera photo or high-res scan (even 10MB+).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-emerald-400 block text-xs">Step 2: Select Target Size</span>
              <p className="text-slate-400 leading-relaxed">
                Pick 20KB (signature), 50KB (passport photo), 100KB (mark card), or enter custom KB.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1.5">
              <span className="font-bold text-emerald-400 block text-xs">Step 3: Download Clean Image</span>
              <p className="text-slate-400 leading-relaxed">
                The engine calculates exact binary quantization and prepares an instant download.
              </p>
            </div>
          </div>

          <Link
            to="/photo/compress"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1 group"
          >
            <span>Open Image Compressor</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
