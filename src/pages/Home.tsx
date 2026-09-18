import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  CreditCard,
  Printer,
  FileText,
  Scan,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Search,
  CheckCircle2,
  FileCheck,
  Lock,
} from 'lucide-react';
import { ALL_TOOLS } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import type { ToolCategory } from '../types/tools';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: Array<{ id: ToolCategory | 'all'; label: string; icon: any }> = [
    { id: 'all', label: 'All Utilities', icon: Layers },
    { id: 'photo', label: 'Photo Tools', icon: UserCheck },
    { id: 'id-card', label: 'ID Card Merger', icon: CreditCard },
    { id: 'print', label: 'Print Studio', icon: Printer },
    { id: 'pdf', label: 'PDF Suite', icon: FileText },
    { id: 'scanner', label: 'Document Scanner', icon: Scan },
    { id: 'batch', label: 'Batch Processing', icon: Zap },
  ];

  const filteredTools = ALL_TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesQuery =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.shortName && tool.shortName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-8 overflow-hidden text-center">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] sm:w-[700px] sm:h-[400px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/15 to-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg text-xs font-semibold text-slate-200">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400">100% Free Forever</span>
            <span className="text-slate-600">•</span>
            <span>No Watermark</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Zero Server Storage</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Photo, Document, PDF &amp;{' '}
            <span className="gradient-text">Print Utility Suite</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The all-in-one digital workstation for Cyber Cafes, Photo Studios, students, and job applicants.
            Prepare passport photos, merge ID cards, convert PDFs, and print sheets instantly in your browser.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl shadow-indigo-950/50">
              <Search className="absolute left-4 w-5 h-5 text-indigo-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. Passport 35x45mm, Aadhaar merge, 20KB compress)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm sm:text-base transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Popular Workflows:</span>
            <Link
              to="/photo/passport"
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              Passport Photo (35×45mm)
            </Link>
            <Link
              to="/id/merger"
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              Aadhaar / Voter ID Merge
            </Link>
            <Link
              to="/print/passport-sheet"
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              4×6" Print Sheet
            </Link>
            <Link
              to="/photo/compress"
              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              Exact 20KB/50KB Compress
            </Link>
          </div>
        </div>
      </section>

      {/* Cyber Cafe & Studio Quick Workflow Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/photo/passport"
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20 hover:border-blue-500/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                Studio Ready
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
              Passport Photo to Print Sheet
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload once, set 35×45mm or 2×2" dimensions, pick white/blue background, and generate a 4×6" or A4 sheet with 8 to 36 copies.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Workflow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/id/merger"
            className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-violet-950/40 border border-purple-500/20 hover:border-purple-500/50 shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                Cyber Cafe Essential
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
              Two-Sided ID Card Merger
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Merge front and back sides of Aadhaar, Voter ID, PAN, Driving Licence into clean horizontal/vertical A4 print format.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Merge Cards Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            to="/photo/compress"
            className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/20 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                Exam Portals
              </span>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
              Exact File Size Optimizer
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Hit exact 20KB, 50KB, or 100KB limits for UPSC, SSC, state service exams, marksheets, and signatures without blurring.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Compress Image</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Category Tabs & Tool Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              All Tools &amp; Utilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select a category to filter or use the search bar above
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <p className="text-base font-semibold">No tools found matching "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Zero Server Storage Privacy Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacy-First Architecture</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your Documents Never Leave Your Device
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Nexora Tools was engineered from the ground up for strict confidentiality. 
                Whether you are merging government ID cards (Aadhaar, Voter ID, PAN) or processing sensitive passport photos, 
                <strong> all computation occurs purely inside your browser memory (RAM)</strong> via HTML5 Canvas, WebAssembly, and local vector libraries.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>0 Server Uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Account Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>No Watermarks Added</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant RAM Cleanup</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 text-center">
              <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Lock className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Client-Side Guarantee</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Trusted by hundreds of Cyber Cafes and studios daily for fast, private document jobs.
                </p>
              </div>
              <Link
                to="/privacy"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                Read Complete Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
