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
  Cpu,
  Sparkles,
  ChevronDown,
  PrinterCheck,
} from 'lucide-react';
import { ALL_TOOLS } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import type { ToolCategory } from '../types/tools';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories: Array<{ id: ToolCategory | 'all'; label: string; icon: any }> = [
    { id: 'all', label: 'All Utilities', icon: Layers },
    { id: 'photo', label: 'Photo Suite', icon: UserCheck },
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

  const getToolCount = (categoryId: ToolCategory | 'all') => {
    if (categoryId === 'all') return ALL_TOOLS.length;
    return ALL_TOOLS.filter((t) => t.category === categoryId).length;
  };

  const faqs = [
    {
      q: 'Is it safe to process sensitive government IDs like Aadhaar, PAN, and Voter ID here?',
      a: 'Absolutely 100% safe. Nexora Tools executes all image cropping, perspective transformation, card merging, and PDF generation strictly inside your device’s local browser memory (RAM). No pictures or documents are ever uploaded to remote servers or stored in any cloud database.',
    },
    {
      q: 'What paper sizes and printer brands are supported for passport photo sheets?',
      a: 'We provide full presets for 4×6 inch (10×15 cm), A4, A5, and custom paper sizes with standard 35×45mm, 2×2 inch, and 30×40mm photo dimensions. Designed to print flawlessly on all studio photo printers including Canon PIXMA, Epson EcoTank, HP, and Brother with high-precision cutting guides.',
    },
    {
      q: 'How does the Exact KB Image Compressor work without making the photo blurry?',
      a: 'Our compression engine uses binary-search iterative quantization in WebAssembly to target exact file limits (e.g. 20KB, 50KB, 100KB) while preserving facial sharp lines and signature ink clarity for government exam portals (UPSC, SSC, State PSC, IBPS).',
    },
    {
      q: 'Are there any hidden watermarks, page limits, or subscription paywalls?',
      a: 'None whatsoever. All 16+ utilities are 100% free forever under Nexora Lab Technologies. Every exported JPG, PNG, and PDF is completely clean with zero watermarks and full 300 DPI resolution.',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-14 pb-4 overflow-hidden text-center">
        <div className="max-w-5xl mx-auto px-4 space-y-6 sm:space-y-8">
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-xl shadow-indigo-950/40 text-xs font-semibold text-slate-200 backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">100% Free Forever</span>
            <span className="text-slate-600">•</span>
            <span>Zero Watermarks</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">In-Browser RAM Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-[1.12]">
            High-Speed Photo, Document, ID &amp;{' '}
            <span className="gradient-brand">Print Workstation</span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The ultra-fast digital suite crafted for <strong className="text-white">Cyber Cafes</strong>, <strong className="text-white">Photo Studios</strong>, students, and job applicants.
            Generate passport photo sheets, merge two-sided ID cards, and convert PDFs with 100% in-browser privacy.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl shadow-indigo-950/60 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/50 focus-within:border-indigo-500 transition-all">
              <div className="p-3 pl-4 text-indigo-400">
                <Search className="w-5 h-5 pointer-events-none" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search utilities (e.g. Passport 35x45mm, Aadhaar card merge, 20KB compress, PDF)..."
                className="w-full py-4 pr-12 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm sm:text-base font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-500">Popular Workflows:</span>
            <Link
              to="/photo/passport"
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-blue-500/40 transition-all font-medium flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Passport Photo (35×45mm)</span>
            </Link>
            <Link
              to="/id/merger"
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-purple-500/40 transition-all font-medium flex items-center gap-1"
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              <span>Aadhaar / Voter ID Merge</span>
            </Link>
            <Link
              to="/print/passport-sheet"
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-emerald-500/40 transition-all font-medium flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>4×6" Print Sheet</span>
            </Link>
            <Link
              to="/photo/compress"
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 hover:border-teal-500/40 transition-all font-medium flex items-center gap-1"
            >
              <span className="font-bold text-teal-400 text-xs">KB</span>
              <span>Exact 20KB / 50KB</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Cyber Cafe & Studio Quick Workflow Highlights */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Essential Studio &amp; Cyber Cafe Workflows</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              1-Click accelerated pipelines for instant daily customer jobs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Passport to Sheet */}
          <Link
            to="/photo/passport"
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900/90 to-indigo-950/40 border border-blue-500/25 hover:border-blue-500/60 shadow-xl hover:shadow-2xl hover:shadow-blue-500/15 backdrop-blur-xl transition-all duration-300 group transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform shadow-md">
                <UserCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Studio Preset
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-bold text-white group-hover:text-blue-300 transition-colors">
              Passport Photo to Print Sheet
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Upload once, choose 35×45mm or 2×2", remove background with AI, and generate a 4×6" or A4 sheet with 8 to 36 copies ready for printing.
            </p>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Launch Studio Flow</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Two-Sided ID Card Merger */}
          <Link
            to="/id/merger"
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-violet-950/40 border border-purple-500/25 hover:border-purple-500/60 shadow-xl hover:shadow-2xl hover:shadow-purple-500/15 backdrop-blur-xl transition-all duration-300 group transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform shadow-md">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Cyber Cafe Essential
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-bold text-white group-hover:text-purple-300 transition-colors">
              Two-Sided ID Card Merger
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Merge front and back sides of Aadhaar, Voter ID, PAN, and Driving Licence into aligned horizontal or vertical A4 print layouts in seconds.
            </p>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Merge Cards Now</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Exact KB Optimizer */}
          <Link
            to="/photo/compress"
            className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-teal-950/40 border border-emerald-500/25 hover:border-emerald-500/60 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/15 backdrop-blur-xl transition-all duration-300 group transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform shadow-md">
                <FileCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Govt Portals
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-heading font-bold text-white group-hover:text-emerald-300 transition-colors">
              Exact File Size Optimizer
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Hit exact 20KB, 50KB, or 100KB limits for UPSC, SSC, state service exams, marksheets, and signatures without loss of legibility.
            </p>
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Compress Image</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Category Tabs & Tool Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 mb-8">
          {/* Header Title & Description */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-400 mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>All-In-One Cyber Suite</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-black text-white tracking-tight">
                All Tools &amp; Utilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Select a utility category to filter or search across all in-browser workstation tools
              </p>
            </div>

            {/* Total Count Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showing <strong>{filteredTools.length}</strong> of {ALL_TOOLS.length} utilities</span>
            </div>
          </div>

          {/* Category Filter Pills - Responsive Clean Flex Wrap */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-xl shadow-lg shadow-black/20">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = getToolCount(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="py-20 text-center text-slate-400 space-y-3 bg-slate-900/50 rounded-3xl border border-white/10 p-8">
            <Search className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-base font-bold text-white">No tools found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-400">Try changing keywords or reset the category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Feature Architecture Highlights Grid */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Built For Performance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
            Why Professionals Trust Nexora Tools
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Engineered with modern web standards to outperform cloud-upload tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-3 backdrop-blur-xl">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-white">Zero Server Uploads</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every crop, background removal, and PDF operation runs purely inside your browser memory. 100% confidential.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-3 backdrop-blur-xl">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 w-fit">
              <PrinterCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-white">300 DPI Studio Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Precision raster and vector rendering ensures razor-sharp prints on Canon, Epson, HP, and Brother photo paper.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-3 backdrop-blur-xl">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 w-fit">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-white">AI-Powered Features</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI background removal, 4-corner document perspective un-skewing, and signature ink cleaners run locally.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/10 space-y-3 backdrop-blur-xl">
            <div className="p-3 rounded-2xl bg-pink-500/20 text-pink-400 w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-white">Batch Processing Power</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Process dozens of photos and documents simultaneously and package everything into an instant ZIP download.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works in 3 Steps */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl space-y-8 backdrop-blur-xl">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              How It Works in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No registration, no software installation, no waiting queues.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center mx-auto border border-indigo-500/30">
                1
              </div>
              <h4 className="text-base font-bold text-white">Select &amp; Upload</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop your photos, ID cards, or PDF documents. Direct camera capture and clipboard (Ctrl+V) supported.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 text-cyan-400 font-bold flex items-center justify-center mx-auto border border-cyan-500/30">
                2
              </div>
              <h4 className="text-base font-bold text-white">Adjust &amp; Process</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick passport dimensions, merge front and back sides, compress to exact KB, or remove backgrounds in real-time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3 text-center">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center mx-auto border border-emerald-500/30">
                3
              </div>
              <h4 className="text-base font-bold text-white">Print or Download</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly print 4×6" sheets, download high-res JPG/PNG images, or save clean PDFs with zero watermarks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Everything you need to know about Nexora Tools.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-slate-900/80 border border-white/10 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-indigo-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zero Server Storage Privacy Callout Banner */}
      <section className="w-full px-4 sm:px-6 lg:px-8 pb-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/25 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Privacy-First Architecture</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
                Your Documents Never Leave Your Device
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Nexora Tools was engineered from the ground up for absolute confidentiality. 
                Whether you are merging government ID cards (Aadhaar, Voter ID, PAN) or processing sensitive passport photos, 
                <strong> all computation occurs purely inside your browser memory (RAM)</strong> via HTML5 Canvas, WebAssembly, and local vector libraries.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300 font-medium">
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

            <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-slate-950/80 border border-white/10 space-y-4 text-center">
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-heading font-bold text-white">Client-Side Guarantee</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Trusted by hundreds of Cyber Cafes and photo studios daily for high-speed, private document jobs.
                </p>
              </div>
              <Link
                to="/privacy"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/50"
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
