import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Scissors,
  Trash2,
  FolderSync,
  Scan,
  Zap,
  Wrench,
  ScanLine,
  Image as ImageIcon,
  FileType,
  Presentation,
  FileSpreadsheet,
  Code2,
  Table,
  RotateCw,
  Hash,
  ShieldAlert,
  Crop,
  Edit3,
  FileCheck2,
  Unlock,
  Lock,
  PenTool,
  GitCompare,
  Sparkles,
  Languages,
  FileCode,
  Search,
  ShieldCheck,
  Flame,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { usePageSEO } from '../../utils/seoHelper';

interface ToolDef {
  name: string;
  path: string;
  desc: string;
  badge?: string;
  icon: any;
  color: string;
  popular?: boolean;
}

interface CategoryGroup {
  id: string;
  title: string;
  subtitle: string;
  badgeColor: string;
  headerIcon: any;
  tools: ToolDef[];
}

export const PDFHub: React.FC = () => {
  usePageSEO({
    title: 'Free PDF Suite - 28+ Online PDF Tools (No Watermark, 100% RAM Privacy)',
    description: 'The ultimate free online PDF toolkit: Merge, Split, Compress, Convert to/from Word/Excel/PPTX/HTML, Edit, Sign, Protect, Unlock, OCR, and AI Summarize without limits.',
    keywords: 'pdf tools online free, ilovepdf alternative, convert pdf to word, merge pdf free no watermark, compress pdf, sign pdf, password protect pdf, ocr pdf',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const PDF_MATRIX: CategoryGroup[] = [
    {
      id: 'organize',
      title: 'Organize PDF',
      subtitle: 'Merge, split, reorder and arrange pages',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      headerIcon: Layers,
      tools: [
        {
          name: 'Merge PDF',
          path: '/pdf/merge',
          desc: 'Combine multiple PDFs into a single organized document',
          badge: 'Popular',
          popular: true,
          icon: Layers,
          color: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        },
        {
          name: 'Split PDF',
          path: '/pdf/split',
          desc: 'Extract specific page ranges or save every page as PDF',
          icon: Scissors,
          color: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        },
        {
          name: 'Remove Pages',
          path: '/pdf/organize',
          desc: 'Delete unwanted pages visually with 1-click preview',
          icon: Trash2,
          color: 'text-rose-400 bg-rose-500/15 border-rose-500/20',
        },
        {
          name: 'Extract Pages',
          path: '/pdf/split',
          desc: 'Export specific selected pages into separate PDF files',
          icon: FolderSync,
          color: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        },
        {
          name: 'Organize PDF',
          path: '/pdf/organize',
          desc: 'Drag and drop to sort, duplicate, rotate and delete pages',
          badge: 'Studio',
          icon: FolderSync,
          color: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        },
        {
          name: 'Scan to PDF',
          path: '/scanner',
          desc: 'Capture receipts & documents with perspective warp',
          icon: Scan,
          color: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        },
      ],
    },
    {
      id: 'optimize',
      title: 'Optimize PDF',
      subtitle: 'Compress file size, repair damaged files & run OCR',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      headerIcon: Zap,
      tools: [
        {
          name: 'Compress PDF',
          path: '/pdf/compress',
          desc: 'Reduce file size while keeping crisp DPI vector clarity',
          badge: 'Essential',
          popular: true,
          icon: Zap,
          color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
        },
        {
          name: 'Repair PDF',
          path: '/pdf/repair',
          desc: 'Fix corrupted xref tables and recover unreadable pages',
          icon: Wrench,
          color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
        },
        {
          name: 'OCR PDF',
          path: '/pdf/ocr',
          desc: 'Extract text layers & create searchable documents with OCR',
          badge: 'Searchable',
          icon: ScanLine,
          color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
        },
      ],
    },
    {
      id: 'convert-to',
      title: 'Convert to PDF',
      subtitle: 'Create clean PDFs from images, Word, Excel, PPT & HTML',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      headerIcon: FileType,
      tools: [
        {
          name: 'JPG to PDF',
          path: '/pdf/image-to-pdf',
          desc: 'Convert multiple photos, PNGs & JPGs into a clean A4 PDF',
          badge: 'Popular',
          popular: true,
          icon: ImageIcon,
          color: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
        },
        {
          name: 'WORD to PDF',
          path: '/pdf/word-to-pdf',
          desc: 'Convert Microsoft Word (.DOCX, .DOC) files into vector PDF',
          badge: 'DOCX',
          icon: FileType,
          color: 'text-blue-400 bg-blue-500/15 border-blue-500/20',
        },
        {
          name: 'POWERPOINT to PDF',
          path: '/pdf/powerpoint-to-pdf',
          desc: 'Convert PowerPoint (.PPTX) presentation slides to 16:9 PDF',
          badge: 'PPTX',
          icon: Presentation,
          color: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        },
        {
          name: 'EXCEL to PDF',
          path: '/pdf/excel-to-pdf',
          desc: 'Convert Excel (.XLSX, .CSV) spreadsheets into neat PDF tables',
          badge: 'XLSX',
          icon: FileSpreadsheet,
          color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
        },
        {
          name: 'HTML to PDF',
          path: '/pdf/html-to-pdf',
          desc: 'Convert web code, online invoices & HTML templates to PDF',
          badge: 'Code',
          icon: Code2,
          color: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
        },
      ],
    },
    {
      id: 'convert-from',
      title: 'Convert from PDF',
      subtitle: 'Export PDF to editable Word, Excel, PPTX, JPG & PDF/A',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      headerIcon: Table,
      tools: [
        {
          name: 'PDF to JPG',
          path: '/pdf/pdf-to-image',
          desc: 'Extract PDF pages into 300 DPI high-resolution JPG / PNG',
          badge: '300 DPI',
          icon: ImageIcon,
          color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/20',
        },
        {
          name: 'PDF to WORD',
          path: '/pdf/pdf-to-word',
          desc: 'Convert PDF into fully editable Microsoft Word (.DOCX)',
          badge: 'Editable',
          popular: true,
          icon: FileType,
          color: 'text-blue-400 bg-blue-500/15 border-blue-500/20',
        },
        {
          name: 'PDF to POWERPOINT',
          path: '/pdf/pdf-to-powerpoint',
          desc: 'Convert PDF slides into editable PowerPoint (.PPTX) slides',
          badge: 'Slides',
          icon: Presentation,
          color: 'text-orange-400 bg-orange-500/15 border-orange-500/20',
        },
        {
          name: 'PDF to EXCEL',
          path: '/pdf/pdf-to-excel',
          desc: 'Extract financial tables, balances & rows to XLSX spreadsheet',
          badge: 'XLSX',
          icon: Table,
          color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
        },
        {
          name: 'PDF to PDF/A',
          path: '/pdf/pdf-to-pdfa',
          desc: 'ISO 19005 standard archival compliance with XMP schemas',
          badge: 'ISO 19005',
          icon: ShieldCheck,
          color: 'text-sky-400 bg-sky-500/15 border-sky-500/20',
        },
      ],
    },
    {
      id: 'edit',
      title: 'Edit PDF',
      subtitle: 'Rotate, crop, number, watermark, markup & fill forms',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      headerIcon: Edit3,
      tools: [
        {
          name: 'Rotate PDF',
          path: '/pdf/rotate',
          desc: 'Rotate pages 90°, 180° or 270° clockwise & counter-clockwise',
          icon: RotateCw,
          color: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
        },
        {
          name: 'Add Page Numbers',
          path: '/pdf/page-numbers',
          desc: 'Insert header & footer numbers with Page 1 of N formats',
          icon: Hash,
          color: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
        },
        {
          name: 'Add Watermark',
          path: '/pdf/watermark',
          desc: 'Stamp text, confidential seals & diagonal security grid',
          badge: 'Security',
          icon: ShieldAlert,
          color: 'text-rose-400 bg-rose-500/15 border-rose-500/20',
        },
        {
          name: 'Crop PDF',
          path: '/pdf/crop',
          desc: 'Trim page margins and custom crop viewport borders',
          icon: Crop,
          color: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
        },
        {
          name: 'Edit PDF',
          path: '/pdf/edit',
          desc: 'Add text notes, reviewer comments, callouts & markup',
          icon: Edit3,
          color: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
        },
        {
          name: 'PDF Forms',
          path: '/pdf/forms',
          desc: 'Fill interactive form fields and flatten into read-only PDF',
          icon: FileCheck2,
          color: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
        },
      ],
    },
    {
      id: 'security',
      title: 'PDF Security',
      subtitle: 'Password protect, unlock, sign, redact & compare documents',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      headerIcon: Lock,
      tools: [
        {
          name: 'Protect PDF',
          path: '/pdf/protect',
          desc: 'Encrypt PDF with AES-256 password & custom permissions',
          badge: 'AES-256',
          popular: true,
          icon: Lock,
          color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/20',
        },
        {
          name: 'Unlock PDF',
          path: '/pdf/unlock',
          desc: 'Remove passwords and print/copy security restrictions',
          icon: Unlock,
          color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/20',
        },
        {
          name: 'Sign PDF',
          path: '/pdf/sign',
          desc: 'Draw signature, type cursive name or place image stamp',
          badge: 'Digital Sign',
          popular: true,
          icon: PenTool,
          color: 'text-blue-400 bg-blue-500/15 border-blue-500/20',
        },
        {
          name: 'Redact PDF',
          path: '/pdf/redact',
          desc: 'Permanently blackout sensitive PII, account & tax numbers',
          badge: 'Permanent',
          icon: ShieldAlert,
          color: 'text-rose-400 bg-rose-500/15 border-rose-500/20',
        },
        {
          name: 'Compare PDF',
          path: '/pdf/compare',
          desc: 'Side-by-side visual diff comparison between two PDF revisions',
          icon: GitCompare,
          color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/20',
        },
      ],
    },
    {
      id: 'intelligence',
      title: 'PDF Intelligence',
      subtitle: 'AI summarization, 30+ language translation & Markdown',
      badgeColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
      headerIcon: Sparkles,
      tools: [
        {
          name: 'AI Summarizer',
          path: '/pdf/ai-summary',
          desc: 'Generate executive summary, key takeaways & action items',
          badge: 'AI Smart',
          popular: true,
          icon: Sparkles,
          color: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500/20',
        },
        {
          name: 'Translate PDF',
          path: '/pdf/translate',
          desc: 'Translate PDF documents into 30+ international languages',
          icon: Languages,
          color: 'text-purple-400 bg-purple-500/15 border-purple-500/20',
        },
        {
          name: 'PDF to Markdown',
          path: '/pdf/to-markdown',
          desc: 'Convert documents into structured GitHub-flavored Markdown',
          badge: '.MD',
          icon: FileCode,
          color: 'text-fuchsia-400 bg-fuchsia-500/15 border-fuchsia-500/20',
        },
      ],
    },
  ];

  // Filter tools by category and search query
  const filteredMatrix = PDF_MATRIX.map((cat) => {
    if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
      return null;
    }
    const matchingTools = cat.tools.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.badge && t.badge.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (matchingTools.length === 0) return null;
    return {
      ...cat,
      tools: matchingTools,
    };
  }).filter(Boolean) as CategoryGroup[];

  const totalToolsCount = PDF_MATRIX.reduce((acc, cat) => acc + cat.tools.length, 0);

  // Top featured spotlight tools
  const spotlightTools = [
    {
      name: 'Merge PDF',
      path: '/pdf/merge',
      desc: 'Combine multiple PDFs in seconds',
      badge: 'Most Popular',
      icon: Layers,
      gradient: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
    },
    {
      name: 'Compress PDF',
      path: '/pdf/compress',
      desc: 'Reduce file size up to 90%',
      badge: 'Essential',
      icon: Zap,
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      name: 'PDF to Word',
      path: '/pdf/pdf-to-word',
      desc: 'Export to editable .DOCX format',
      badge: '100% Editable',
      icon: FileType,
      gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    },
    {
      name: 'Sign PDF',
      path: '/pdf/sign',
      desc: 'Draw or stamp digital signatures',
      badge: 'Legal Ready',
      icon: PenTool,
      gradient: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400',
    },
    {
      name: 'Protect PDF',
      path: '/pdf/protect',
      desc: 'AES-256 military-grade encryption',
      badge: 'AES-256',
      icon: Lock,
      gradient: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
    },
    {
      name: 'AI Summarizer',
      path: '/pdf/ai-summary',
      desc: 'Instant executive insights & bullet points',
      badge: 'AI Neural',
      icon: Sparkles,
      gradient: 'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/30 text-fuchsia-400',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-5 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold shadow-inner">
          <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Complete 7-Category PDF Suite • {totalToolsCount} Tools • 100% Free &amp; Private</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Every PDF Tool You'll Ever Need.
        </h1>
        
        <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Organize, convert, edit, secure, and summarize your PDF documents with zero server uploads, no watermarks, and unlimited file sizes.
        </p>

        {/* Live Search Bar */}
        <div className="relative max-w-2xl mx-auto pt-2">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g. Word to PDF, Compress, Sign, Merge, Watermark, OCR)..."
              className="w-full bg-slate-900/95 border border-white/15 rounded-2xl pl-12 pr-10 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-2xl transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
            }`}
          >
            All Tools ({totalToolsCount})
          </button>
          {PDF_MATRIX.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white/15 text-white border border-white/30 shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20'
              }`}
            >
              {cat.title} ({cat.tools.length})
            </button>
          ))}
        </div>
      </div>

      {/* Featured Spotlight Bar (Visible on 'all' or when no search query) */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Most Popular Quick Access
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {spotlightTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.name}
                  to={tool.path}
                  className={`group p-3.5 rounded-2xl bg-gradient-to-b ${tool.gradient} border backdrop-blur-xl hover:scale-[1.03] transition-all duration-200 flex flex-col justify-between space-y-2.5 shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/10 text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/90">
                      {tool.badge}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                      {tool.name}
                    </div>
                    <div className="text-[11px] text-slate-300 leading-tight mt-0.5">
                      {tool.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacious Category Sections Grid */}
      {filteredMatrix.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {filteredMatrix.map((category) => {
            const HeaderIcon = category.headerIcon;
            return (
              <div
                key={category.id}
                className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl p-5 shadow-2xl space-y-4 transition-all"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
                      <HeaderIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-white tracking-wide truncate">
                        {category.title}
                      </h2>
                      <p className="text-xs text-slate-400 truncate">
                        {category.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border shrink-0 whitespace-nowrap ${category.badgeColor}`}>
                    {category.tools.length} Tools
                  </span>
                </div>

                {/* Tool Cards List */}
                <div className="space-y-2">
                  {category.tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.name}
                        to={tool.path}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all duration-150 group cursor-pointer text-left"
                      >
                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl shrink-0 border ${tool.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Title & Description */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-100 group-hover:text-rose-400 transition-colors">
                              {tool.name}
                            </span>
                            {tool.badge && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 shrink-0 whitespace-nowrap">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1 group-hover:text-slate-300 transition-colors leading-relaxed mt-0.5">
                            {tool.desc}
                          </p>
                        </div>

                        {/* Hover Arrow */}
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Search Results State */
        <div className="text-center py-16 space-y-4 bg-slate-900/50 border border-white/10 rounded-3xl max-w-lg mx-auto">
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 w-fit mx-auto border border-rose-500/20">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No matching PDF tools found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            We couldn't find any tool matching "<span className="text-white font-medium">{searchQuery}</span>". Try searching for Word, Merge, Compress, Sign, or Protect.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
          >
            Clear Filters &amp; Show All Tools
          </button>
        </div>
      )}

      {/* Trust & Privacy Guarantee Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/10">
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">100% Client-Side RAM</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Files never leave your browser or reach servers</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">No Watermarks Ever</div>
            <div className="text-[11px] text-slate-400 mt-0.5">High-definition, clean document exports</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Instant WebAssembly Speed</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Multi-threaded browser acceleration</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Unlimited File Size</div>
            <div className="text-[11px] text-slate-400 mt-0.5">No subscription fees or daily usage caps</div>
          </div>
        </div>
      </div>
    </div>
  );
};

