import React from 'react';
import {
  Palette,
  Mail,
  Send,
  Share2,
  Terminal,
} from 'lucide-react';
import type { BrandingConfig, GlobalSEOSettings } from '../../../types/admin';

interface BrandingTabProps {
  branding: BrandingConfig;
  globalSEO: GlobalSEOSettings;
  onUpdateBranding: (config: Partial<BrandingConfig>) => void;
  onUpdateGlobalSEO: (config: Partial<GlobalSEOSettings>) => void;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({
  branding,
  globalSEO,
  onUpdateBranding,
  onUpdateGlobalSEO,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-white">
            Site Branding &amp; Script Injection
          </h2>
          <p className="text-xs text-slate-400">
            Configure site identity, contact information, social links, and inject custom tracking scripts.
          </p>
        </div>
      </div>

      {/* Brand Identity & Social Links Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg space-y-6">
        <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-400" />
          <span>Brand Identity &amp; Contact Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Site Brand Name</label>
            <input
              type="text"
              value={branding.siteName}
              onChange={(e) => onUpdateBranding({ siteName: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Tagline / Slogan</label>
            <input
              type="text"
              value={branding.tagline}
              onChange={(e) => onUpdateBranding({ tagline: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contact &amp; Support Email</span>
            </label>
            <input
              type="email"
              value={branding.contactEmail}
              onChange={(e) => onUpdateBranding({ contactEmail: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">Footer Copyright Text</label>
            <input
              type="text"
              value={branding.copyrightText}
              onChange={(e) => onUpdateBranding({ copyrightText: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Twitter / X Profile URL</span>
            </label>
            <input
              type="text"
              value={branding.twitterUrl || ''}
              onChange={(e) => onUpdateBranding({ twitterUrl: e.target.value })}
              placeholder="https://x.com/nexoratools"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Telegram Channel / Support URL</span>
            </label>
            <input
              type="text"
              value={branding.telegramUrl || ''}
              onChange={(e) => onUpdateBranding({ telegramUrl: e.target.value })}
              placeholder="https://t.me/nexoratools"
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Custom Script Injection */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl shadow-lg space-y-6">
        <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Custom Header &amp; Footer Code Injection</span>
        </h3>

        <div className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Custom &lt;head&gt; Scripts (e.g. Analytics, Pixels)</label>
              <span className="text-[11px] font-mono text-slate-400">Injected into document head</span>
            </div>
            <textarea
              rows={4}
              value={globalSEO.customHeadScripts || ''}
              onChange={(e) => onUpdateGlobalSEO({ customHeadScripts: e.target.value })}
              placeholder="<!-- e.g. <script async src='https://www.googletagmanager.com/gtag/js'></script> -->"
              className="w-full p-4 rounded-2xl bg-slate-950 border border-white/10 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-semibold">Custom &lt;footer&gt; Scripts (e.g. Chat Widgets)</label>
              <span className="text-[11px] font-mono text-slate-400">Injected before &lt;/body&gt;</span>
            </div>
            <textarea
              rows={4}
              value={globalSEO.customFooterScripts || ''}
              onChange={(e) => onUpdateGlobalSEO({ customFooterScripts: e.target.value })}
              placeholder="<!-- e.g. <script>console.log('Nexora Live');</script> -->"
              className="w-full p-4 rounded-2xl bg-slate-950 border border-white/10 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
