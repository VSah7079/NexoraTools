import React, { useState } from 'react';
import { ShieldCheck, Lock, X, Cpu, Trash2, CheckCircle2 } from 'lucide-react';

export const PrivacyBadge: React.FC<{ minimal?: boolean }> = ({ minimal = false }) => {
  const [showModal, setShowModal] = useState(false);

  if (minimal) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer shadow-xs"
          title="Click to view privacy architecture"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Client-Side Private</span>
        </button>

        {showModal && <PrivacyModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 border border-emerald-500/20 shadow-lg text-xs gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-emerald-400 text-sm block">Zero-Server Storage Guarantee</span>
            <span className="text-slate-400 text-xs">
              All computations execute securely inside your browser's RAM. No files or images are ever uploaded to any server.
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all shrink-0 cursor-pointer"
        >
          View Privacy Proof
        </button>
      </div>

      {showModal && <PrivacyModal onClose={() => setShowModal(false)} />}
    </>
  );
};

const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/80 text-slate-200 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/50">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-white">Nexora Privacy Architecture</h3>
            <p className="text-xs text-emerald-400 font-semibold">100% In-Browser Computation Guarantee</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
          <p>
            When you process sensitive documents (such as Aadhaar cards, Voter IDs, PAN cards, marks cards, or passport photos), 
            <strong> your files never touch a remote server or cloud database</strong>.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-start gap-3">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">Local RAM Processing</span>
                <span className="text-[11px] text-slate-400 leading-tight">
                  Background removal, cropping, rotation, card merging, and PDF creation run via HTML5 Canvas, WebAssembly, and local vector libraries.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-start gap-3">
              <Trash2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">Instant Session Disposal</span>
                <span className="text-[11px] text-slate-400 leading-tight">
                  As soon as you close or refresh your browser tab, all ephemeral memory buffers are garbage-collected and erased forever.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block text-xs">No Watermark &amp; Zero Paywall</span>
                <span className="text-[11px] text-slate-400 leading-tight">
                  All exported JPG, PNG, and PDF sheets are clean, full-resolution, and without forced branding.
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
        >
          Got It, Continue Working Securely
        </button>
      </div>
    </div>
  );
};
