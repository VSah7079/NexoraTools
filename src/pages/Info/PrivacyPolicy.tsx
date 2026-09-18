import React from 'react';
import { ShieldCheck, Lock, FileText, Database } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <ToolHeader
        title="Privacy & Data Retention Policy"
        description="Official privacy commitment by Nexora Lab Technologies for the Nexora Tools platform."
        categoryName="Legal"
        categoryPath="/privacy"
        badge="100% Client-Side"
      />

      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-8 text-slate-300 text-sm leading-relaxed">
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Zero Server Retention Guarantee
            </h3>
            <p className="text-xs text-slate-300">
              Nexora Tools operates on a <strong>client-side first</strong> architecture. Your photos, Aadhaar cards, Voter IDs, PAN cards, Driving Licences, and PDF documents are rendered and processed exclusively in your device's memory. No uploaded files are ever sent to, recorded on, or stored on our servers.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" />
            1. Identity Documents &amp; Sensitive Media Handling
          </h2>
          <p>
            When utilizing tools such as the <strong>Aadhaar Front+Back Merger</strong>, <strong>Voter ID Tool</strong>, <strong>PAN Card Tool</strong>, or <strong>Passport Photo Maker</strong>, image manipulation executes directly on your web browser's HTML5 Canvas, WebAssembly workers, and WebGPU/WebGL acceleration.
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-400">
            <li>No temporary image files are written to remote disks.</li>
            <li>No government ID numbers or biometric images are scraped or indexed.</li>
            <li>Refreshing or closing the browser immediately purges all transient memory.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400" />
            2. Local Analytics &amp; Cookies
          </h2>
          <p>
            We do not use tracking cookies to track your identity or documents across the web. Any counters displayed in the dashboard represent local browser counts saved only inside your personal browser's <code className="text-cyan-400">localStorage</code>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            3. 100% Free &amp; Zero Watermarks
          </h2>
          <p>
            Nexora Tools does not require payment, subscriptions, or credit card information. Exported outputs (PDF, JPG, PNG, WebP) are provided cleanly without promotional watermarks.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          Last Updated: September 2026 • Published by <strong>Nexora Lab Technologies</strong>.
        </div>
      </div>
    </div>
  );
};
