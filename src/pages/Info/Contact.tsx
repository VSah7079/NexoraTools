import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <ToolHeader
        title="Contact Nexora Support"
        description="Questions, feedback, or feature suggestions for Nexora Lab Technologies."
        categoryName="Support"
        categoryPath="/contact"
      />

      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Our engineering team at Nexora Lab Technologies has received your message and will review it promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Your Name</label>
              <input
                required
                type="text"
                placeholder="Enter your name..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Email Address</label>
              <input
                required
                type="email"
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Message / Tool Request</label>
              <textarea
                required
                rows={4}
                placeholder="Let us know what feature or document template you'd like added..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-950/40 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
