import React from 'react';
import { UserCheck, CreditCard, ArrowRight } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { Link } from 'react-router-dom';

export const HowItWorks: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">
      <ToolHeader
        title="How It Works & Quick Guides"
        description="Step-by-step guides for Photo Studios, Cyber Cafes, CSC Centers, and students."
        categoryName="Guide"
        categoryPath="/how-it-works"
      />

      <div className="space-y-8">
        {/* Guide 1: Passport Photo to Print Sheet */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                How to make a Passport Photo &amp; Print Sheet in 3 Steps
              </h3>
              <p className="text-xs text-slate-400">Perfect for photo studios and quick 4×6" print orders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-blue-400 block">Step 1: Upload &amp; Pick Size</span>
              <p className="text-slate-400">
                Upload a portrait. Choose standard 35×45mm (Indian Passport/Visa) or 2×2" (US Visa/PAN).
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-blue-400 block">Step 2: Align with ICAO Guide</span>
              <p className="text-slate-400">
                Drag the face inside the biometric oval guideline and pick pure white or sky blue backdrop.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-blue-400 block">Step 3: Send to Print Sheet</span>
              <p className="text-slate-400">
                Click "Send to Print Sheet", select 4×6" paper with 8 copies, and click Print.
              </p>
            </div>
          </div>

          <Link
            to="/photo/passport"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 pt-2"
          >
            <span>Open Passport Photo Maker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Guide 2: Two-Side ID Merger */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                How to Merge Front &amp; Back of Aadhaar / Voter ID
              </h3>
              <p className="text-xs text-slate-400">The #1 daily utility for Cyber Cafes and CSC centers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-400 block">Step 1: Choose Document</span>
              <p className="text-slate-400">
                Select Aadhaar, Voter ID, PAN, or Driving Licence preset.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-400 block">Step 2: Upload Front &amp; Back</span>
              <p className="text-slate-400">
                Drop front photo and back address photo. Rotate 90° if taken sideways.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-bold text-purple-400 block">Step 3: A4 Print or Vector PDF</span>
              <p className="text-slate-400">
                Choose Vertical (stacked) or Horizontal (side-by-side) and export clean A4 PDF.
              </p>
            </div>
          </div>

          <Link
            to="/id/merger"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 pt-2"
          >
            <span>Open ID Card Merger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
