import React from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { Scale, ShieldAlert, Award } from 'lucide-react';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <ToolHeader
        title="Terms of Service"
        description="Terms and conditions for utilizing the Nexora Tools utility platform."
        categoryName="Legal"
        categoryPath="/terms"
      />

      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-7 text-slate-300 text-sm leading-relaxed shadow-xl">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>1. Free Usage for Individuals, Studios &amp; Cyber Cafes</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Nexora Tools is provided 100% free of charge for individuals, students, job applicants, photo studio operators, CSC centers, and cyber cafe professionals with zero watermark obligations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span>2. Biometric and Portal Compliance Verification</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            While Nexora Tools provides presets modeled after official biometric standards (such as ICAO 35×45mm, 2×2 inch US Visa, SSC 20KB limits, and CR80 ID dimensions), individual consulates, examination boards, and government portals may periodically update requirements. Users should verify dimensions and file limits against target authority guidelines.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            <span>3. Intellectual Property &amp; Branding</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Nexora Tools is a registered digital product of <strong className="text-slate-200">Nexora Lab Technologies</strong>. All rights reserved.
          </p>
        </section>

        <div className="pt-6 border-t border-white/10 text-xs text-slate-500">
          Last Updated: September 2026 • Published by <strong className="text-slate-400">Nexora Lab Technologies</strong>.
        </div>
      </div>
    </div>
  );
};
