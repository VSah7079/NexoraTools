import React from 'react';
import { ToolHeader } from '../../components/common/ToolHeader';

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <ToolHeader
        title="Terms of Service"
        description="Terms and conditions for utilizing the Nexora Tools utility platform."
        categoryName="Legal"
        categoryPath="/terms"
      />

      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 text-slate-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Free Usage for End Users</h2>
          <p>
            Nexora Tools is provided 100% free of charge for individuals, students, job applicants, photo studio operators, and cyber cafe professionals.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Biometric and Portal Compliance Disclaimer</h2>
          <p>
            While Nexora Tools provides presets modeled after official standards (such as ICAO 35×45mm, 2×2 inch US Visa, SSC 20KB limits, and CR80 ID dimensions), individual consulates, examination boards, and government portals may have specific rules. Users should verify dimensions and formatting against their target authority's instructions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Intellectual Property</h2>
          <p>
            Nexora Tools is a registered product of <strong>Nexora Lab Technologies</strong>. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  );
};
