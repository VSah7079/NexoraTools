import React, { useState } from 'react';
import { ShieldCheck, Lock, X } from 'lucide-react';

export const PrivacyBadge: React.FC<{ minimal?: boolean }> = ({ minimal = false }) => {
  const [showModal, setShowModal] = useState(false);

  if (minimal) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
          title="Click to view privacy guarantee"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Client-Side Private</span>
        </button>

        {showModal && <PrivacyModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-cyan-950/40 border border-emerald-500/20 shadow-sm text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-emerald-400 block">Zero-Server Storage Guarantee</span>
            <span className="text-slate-400 text-[11px]">
              All processing happens securely in your browser's RAM. No documents are uploaded to our servers.
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/30 transition-colors shrink-0 ml-2"
        >
          Details
        </button>
      </div>

      {showModal && <PrivacyModal onClose={() => setShowModal(false)} />}
    </>
  );
};

const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Nexora Privacy Architecture</h3>
            <p className="text-xs text-emerald-400">Nexora Lab Technologies</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-300 leading-relaxed mb-6">
          <p>
            When you use Nexora Tools for sensitive files (such as Aadhaar, PAN, Voter ID, or passport photos), 
            <strong> your data never leaves your device</strong>.
          </p>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Client-Side Engine:</strong> Photo cropping, background removal, ID merging, and PDF generation execute locally via Canvas &amp; WebAssembly.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Zero Retention:</strong> As soon as you refresh or close your browser tab, all temporary files in memory are completely cleared.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>No Watermarks &amp; 100% Free:</strong> No hidden payment walls or branded watermarks stamped on your exports.</span>
            </li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/30"
        >
          Got It, Proceed Securely
        </button>
      </div>
    </div>
  );
};
