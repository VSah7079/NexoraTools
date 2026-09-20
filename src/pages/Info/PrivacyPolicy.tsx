import React from 'react';
import { ShieldCheck, Lock, FileText, Database } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <ToolHeader
        title="Privacy & Zero-Retention Policy"
        description="Official privacy architecture commitment by Nexora Lab Technologies for Nexora Tools."
        categoryName="Legal"
        categoryPath="/privacy"
        badge="100% Client-Side"
      />

      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-8 text-slate-300 text-sm leading-relaxed shadow-xl">
        <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-white mb-1">
              Zero Server Retention Guarantee
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Nexora Tools operates on an absolute <strong>in-browser client-side architecture</strong>. Your photos, Aadhaar cards, Voter IDs, PAN cards, Driving Licences, marksheets, and PDF documents are rendered and manipulated exclusively in your local device's memory (RAM). No files or metadata are ever transmitted to or stored on remote servers.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-400" />
            <span>1. Identity Documents &amp; Biometric Privacy</span>
          </h2>
          <p>
            When utilizing tools such as the <strong>Aadhaar Front+Back Merger</strong>, <strong>Voter ID Tool</strong>, <strong>PAN Card Tool</strong>, or <strong>Passport Photo Maker</strong>, all image calculations execute directly on your web browser via HTML5 Canvas, WebAssembly workers, and local GPU hardware acceleration.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-400 pt-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>No temporary image files are written to remote disks or server caches.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>No government ID numbers or biometric faces are scanned, logged, or indexed.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Refreshing or closing the browser tab immediately flushes all ephemeral memory buffers.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <span>2. Local Statistics &amp; Cookies</span>
          </h2>
          <p>
            We do not use advertising trackers or persistent cross-site cookies. Any usage counters shown in the Admin Dashboard represent local counts stored solely inside your personal browser's <code className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-slate-950 border border-white/5">localStorage</code>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>3. 100% Free &amp; Zero Watermarks</span>
          </h2>
          <p>
            Nexora Tools does not require user registration, login credentials, or subscription fees. Exported output files (PDF, JPG, PNG, WebP) are provided cleanly at full resolution with zero watermarks.
          </p>
        </section>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span>Last Updated: September 2026</span>
          <span>Published by <strong className="text-slate-400">Nexora Lab Technologies</strong></span>
        </div>
      </div>
    </div>
  );
};
