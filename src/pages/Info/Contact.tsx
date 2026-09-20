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
        description="Questions, feedback, or feature requests for Nexora Lab Technologies."
        categoryName="Support"
        categoryPath="/contact"
      />

      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6 shadow-xl">
        {submitted ? (
          <div className="py-12 text-center space-y-3 animate-in fade-in">
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 w-fit mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-heading font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Our engineering team at Nexora Lab Technologies has received your message and will review your feature request promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Your Name</label>
              <input
                required
                type="text"
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Email Address</label>
              <input
                required
                type="email"
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1.5">Message / Tool Feature Request</label>
              <textarea
                required
                rows={4}
                placeholder="Tell us what tool, card template, or dimension preset you'd like added..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-xs sm:text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-950/50 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
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
