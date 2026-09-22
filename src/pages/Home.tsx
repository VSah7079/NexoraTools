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
  Lock,
  Cpu,
  Sparkles,
  ChevronDown,
  PrinterCheck,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { ALL_TOOLS } from '../data/toolsData';
import { ToolCard } from '../components/common/ToolCard';
import type { ToolCategory } from '../types/tools';
import { usePageSEO } from '../utils/seoHelper';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  usePageSEO({
    title: 'Free Photo, ID Card, PDF & Print Workstation (No Watermark)',
    description:
      '100% Free online workstation for passport photo maker (35×45mm), Aadhaar & ID card front+back merger on A4, exact 20KB/50KB image compressor, and PDF tools. Runs in browser RAM with zero server uploads.',
    keywords:
      'passport photo maker online, aadhaar card merge front back, id card merger a4, image compressor 20kb 50kb upsc ssc, ai background remover free, pdf watermark free, image to pdf, signature resizer, cyber cafe tools, csc center printing tools, 4x6 passport photo sheet, nexora tools',
    canonicalPath: '/',
  });

  const categories: Array<{ id: ToolCategory | 'all'; label: string; icon: any; countBadge?: string }> = [
    { id: 'all', label: 'All Utilities', icon: Layers },
    { id: 'photo', label: 'Photo Suite', icon: UserCheck },
    { id: 'id-card', label: 'ID Card Merger', icon: CreditCard, countBadge: 'Popular' },
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

  const quickSearchTags = [
    { label: 'Passport Photo 35×45mm', query: 'passport' },
    { label: 'Aadhaar ID Card Merge', query: 'aadhaar' },
    { label: 'Exact 20KB / 50KB Compress', query: 'compress' },
    { label: 'AI Background Remover', query: 'background' },
    { label: 'PDF Watermark', query: 'watermark' },
    { label: 'UPI QR Standee', query: 'qr' },
    { label: 'Image to PDF', query: 'pdf' },
  ];

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
      q: 'Can I use NexoraTools for high-volume commercial printing in my Cyber Cafe or Studio?',
      a: 'Yes, completely! NexoraTools is engineered specifically to save time for Cyber Cafe operators, CSC centers, and studio photographers. There are no daily usage limits, no subscriptions, and all PDF/photo outputs are 300 DPI print-ready.',
    },
    {
      q: 'Are there any hidden watermarks, page limits, or subscription paywalls?',
      a: 'None whatsoever. All 16+ utilities are 100% free forever under Nexora Lab Technologies. Every exported JPG, PNG, and PDF is completely clean with zero watermarks and full studio resolution.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 pb-6 overflow-hidden text-center">
        {/* Decorative ambient beams */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-600/15 via-purple-600/15 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 space-y-6 sm:space-y-8">
          {/* Live Status Chip */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-900/90 border border-white/10 shadow-xl shadow-indigo-950/40 text-xs font-semibold text-slate-200 backdrop-blur-xl hover:border-indigo-500/40 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">100% Free Forever</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">Zero Watermarks</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <Cpu className="w-3 h-3 inline" />
              In-Browser RAM Engine
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-black text-white tracking-tight leading-[1.12]">
            High-Speed Photo, ID Card, PDF &amp;{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Print Workstation
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            The ultra-fast digital productivity suite built for <strong className="text-white font-semibold">Cyber Cafes</strong>, <strong className="text-white font-semibold">Photo Studios</strong>, CSC Centers, and students.
            Generate passport photo sheets, merge two-sided ID cards, and optimize files with 100% in-browser privacy.
          </p>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl shadow-indigo-950/60 rounded-3xl bg-slate-900/90 border border-white/10 hover:border-indigo-500/50 focus-within:border-indigo-500 transition-all p-1">
              <div className="p-3 pl-4 text-indigo-400">
                <Search className="w-5 h-5 pointer-events-none" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search utilities (e.g. Passport 35x45mm, Aadhaar card merge, 20KB compress, PDF)..."
                className="w-full py-3.5 pr-12 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm sm:text-base font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Search Tag Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3.5 text-xs">
              <span className="text-slate-500 font-medium text-[11px]">Quick Search:</span>
              {quickSearchTags.map((tag) => (
                <button
                  key={tag.query}
                  onClick={() => setSearchQuery(tag.query)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 hover:border-white/20 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-center">
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-heading text-white">16+</div>
              <div className="text-[11px] text-slate-400 font-medium">Studio Utilities</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-heading text-indigo-400">300 DPI</div>
              <div className="text-[11px] text-slate-400 font-medium">Razor-Sharp Print</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-heading text-emerald-400">0 MB</div>
              <div className="text-[11px] text-slate-400 font-medium">Server Uploads (100% RAM)</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-white/5 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-black font-heading text-cyan-400">₹0 Free</div>
              <div className="text-[11px] text-slate-400 font-medium">No Subscription Ever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Studio Workflows (4 Hero Cards) */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-400 mb-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>High-Frequency Pipelines</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-white tracking-tight">
              Essential Cyber Cafe &amp; Studio Workflows
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Instant 1-click workflows optimized for fast customer turnaround
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Passport to Sheet */}
          <Link
            to="/photo/passport"
            className="p-6 rounded-3xl bg-gradient-to-br from-blue-950/50 via-slate-900/90 to-indigo-950/40 border border-blue-500/30 hover:border-blue-500/70 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform shadow-md">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wide">
                  Top Choice
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-blue-300 transition-colors">
                Passport Photo Maker
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                35×45mm, 2×2", 30×40mm with AI background replace and auto 4×6" / A4 print sheet generation.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
              <span>Create Photo Now</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Two-Sided ID Card Merger */}
          <Link
            to="/id/merger"
            className="p-6 rounded-3xl bg-gradient-to-br from-purple-950/50 via-slate-900/90 to-violet-950/40 border border-purple-500/30 hover:border-purple-500/70 shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform shadow-md">
                  <CreditCard className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wide">
                  Cyber Essential
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-purple-300 transition-colors">
                Two-Sided ID Merger
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Merge front &amp; back of Aadhaar, PAN, Voter ID &amp; Driving Licence into aligned A4 sheets instantly.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
              <span>Merge Cards</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Exact KB Optimizer */}
          <Link
            to="/photo/compress"
            className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/50 via-slate-900/90 to-teal-950/40 border border-emerald-500/30 hover:border-emerald-500/70 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/20 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform shadow-md">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                  Govt Portals
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-emerald-300 transition-colors">
                Exact KB Compressor
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Compress photos &amp; signatures to exact 20KB, 50KB or 100KB limits without facial blur or quality loss.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
              <span>Target File Size</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Card 4: PDF Power Suite */}
          <Link
            to="/pdf/watermark"
            className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/50 via-slate-900/90 to-amber-950/40 border border-rose-500/30 hover:border-rose-500/70 shadow-xl hover:shadow-2xl hover:shadow-rose-500/20 backdrop-blur-xl transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform shadow-md">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase tracking-wide">
                  Security
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-white group-hover:text-rose-300 transition-colors">
                PDF Watermark &amp; Seal
              </h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Add "FOR VERIFICATION ONLY" diagonal mesh or custom confidentiality stamps to PDFs securely.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-rose-400 group-hover:text-rose-300">
              <span>Stamp PDF</span>
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
                Select a category to filter or search across all in-browser workstation tools
              </p>
            </div>

            {/* Total Count Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-semibold text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Showing <strong>{filteredTools.length}</strong> of {ALL_TOOLS.length} utilities</span>
            </div>
          </div>

          {/* Category Filter Pills */}
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
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Studio Standard Paper & Exam Cheat-Sheet Matrix */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold mb-2">
                <PrinterCheck className="w-3.5 h-3.5" />
                <span>Industry Standards Reference</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-black text-white tracking-tight">
                Studio Paper &amp; Official Exam Standard Presets
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Built-in hardware dimensional accuracy for Cyber Cafes, CSC and Studio Operators
              </p>
            </div>
            <Link
              to="/print/passport-sheet"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 w-fit shadow-md shadow-indigo-950"
            >
              <span>Open Print Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="text-indigo-400 font-mono text-xs font-bold uppercase">A4 Sheet Paper</div>
              <div className="text-base font-bold text-white">210 × 297 mm</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard office paper for Aadhaar ID merge, certificates, application forms, and multi-card layouts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="text-emerald-400 font-mono text-xs font-bold uppercase">4×6" Glossy Photo</div>
              <div className="text-base font-bold text-white">100 × 150 mm (10×15cm)</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                The most popular studio size for 8-photo passport grids on Canon PIXMA and Epson EcoTank printers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="text-purple-400 font-mono text-xs font-bold uppercase">Standard CR80 ID</div>
              <div className="text-base font-bold text-white">85.6 × 54.0 mm</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Official dimensions for Aadhaar, PAN card, Driving Licence, Voter ID, and PVC smart cards.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="text-cyan-400 font-mono text-xs font-bold uppercase">Govt Exam Photo</div>
              <div className="text-base font-bold text-white">35 × 45 mm (3.5×4.5cm)</div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard dimension for UPSC, SSC, State PSC, NTA NEET/JEE, Railway &amp; Banking examination forms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Nexora vs Cloud Upload Tools */}
      <section className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Architecture Superiority</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight">
            Why Nexora Tools Outperforms Cloud Converters
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare local WebAssembly execution with traditional remote cloud websites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Traditional Cloud Tools Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-rose-500/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-500/10">
              <span className="font-bold text-rose-400 text-sm">Traditional Online Tools</span>
              <span className="text-xs text-slate-500">Cloud-Based</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Uploads your sensitive Aadhaar/PAN cards to unknown remote servers</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Slow upload and download times depending on internet speed</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Adds annoying watermarks unless you purchase expensive monthly plans</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400 font-bold">✕</span>
                <span>Strict daily file limits or forced account registrations</span>
              </li>
            </ul>
          </div>

          {/* Nexora Client-Side Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-emerald-950/30 border border-emerald-500/30 space-y-4 shadow-xl shadow-emerald-950/20">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <span className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                NexoraTools Workstation
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                100% In-Browser
              </span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero Server Uploads:</strong> Processed 100% in your browser RAM</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Instant Speed:</strong> Powered by WebAssembly and HTML5 Canvas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Clean Outputs:</strong> Zero watermarks, full 300 DPI studio resolution</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>100% Free Forever:</strong> No accounts, no paywalls, unlimited daily use</span>
              </li>
            </ul>
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
                  Trusted by thousands of Cyber Cafes and photo studios daily for high-speed, private document jobs.
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
