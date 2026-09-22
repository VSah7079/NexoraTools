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
} from 'lucide-react';
import { usePageSEO } from '../../utils/seoHelper';

interface ToolDef {
  name: string;
  path: string;
  desc: string;
  badge?: string;
  icon: any;
  color: string;
}

interface CategoryGroup {
  id: string;
  title: string;
  badgeColor: string;
  tools: ToolDef[];
}

export const PDFHub: React.FC = () => {
  usePageSEO({
    title: 'Free PDF Suite - 25+ Online PDF Tools (No Watermark, 100% RAM Privacy)',
    description: 'The ultimate free online PDF toolkit: Merge, Split, Compress, Convert to/from Word/Excel/PPTX/HTML, Edit, Sign, Protect, Unlock, OCR, and AI Summarize without limits.',
    keywords: 'pdf tools online free, ilovepdf alternative, convert pdf to word, merge pdf free no watermark, compress pdf, sign pdf, password protect pdf, ocr pdf',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const PDF_MATRIX: CategoryGroup[] = [
    {
      id: 'organize',
      title: 'ORGANIZE PDF',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      tools: [
        {
          name: 'Merge PDF',
          path: '/pdf/merge',
          desc: 'Combine multiple PDFs into a single file',
          badge: 'Popular',
          icon: Layers,
          color: 'text-orange-400 bg-orange-500/20',
        },
        {
          name: 'Split PDF',
          path: '/pdf/split',
          desc: 'Extract ranges or save every page as PDF',
          icon: Scissors,
          color: 'text-orange-400 bg-orange-500/20',
        },
        {
          name: 'Remove Pages',
          path: '/pdf/organize',
          desc: 'Delete unwanted pages visually with 1-click',
          icon: Trash2,
          color: 'text-rose-400 bg-rose-500/20',
        },
        {
          name: 'Extract Pages',
          path: '/pdf/split',
          desc: 'Export specific pages into individual documents',
          icon: FolderSync,
          color: 'text-orange-400 bg-orange-500/20',
        },
        {
          name: 'Organize PDF',
          path: '/pdf/organize',
          desc: 'Drag and drop to sort, duplicate and rotate pages',
          badge: 'Studio',
          icon: FolderSync,
          color: 'text-orange-400 bg-orange-500/20',
        },
        {
          name: 'Scan to PDF',
          path: '/scanner',
          desc: 'Capture receipts and IDs with corner perspective warp',
          icon: Scan,
          color: 'text-orange-400 bg-orange-500/20',
        },
      ],
    },
    {
      id: 'optimize',
      title: 'OPTIMIZE PDF',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tools: [
        {
          name: 'Compress PDF',
          path: '/pdf/compress',
          desc: 'Reduce file size while keeping high DPI clarity',
          badge: 'Essential',
          icon: Zap,
          color: 'text-emerald-400 bg-emerald-500/20',
        },
        {
          name: 'Repair PDF',
          path: '/pdf/repair',
          desc: 'Fix corrupted xref tables and recover lost pages',
          icon: Wrench,
          color: 'text-emerald-400 bg-emerald-500/20',
        },
        {
          name: 'OCR PDF',
          path: '/pdf/ocr',
          desc: 'Extract text layers and create searchable PDFs',
          badge: 'Searchable',
          icon: ScanLine,
          color: 'text-emerald-400 bg-emerald-500/20',
        },
      ],
    },
    {
      id: 'convert-to',
      title: 'CONVERT TO PDF',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tools: [
        {
          name: 'JPG to PDF',
          path: '/pdf/image-to-pdf',
          desc: 'Convert multiple photos into a clean A4 PDF',
          badge: 'Popular',
          icon: ImageIcon,
          color: 'text-amber-400 bg-amber-500/20',
        },
        {
          name: 'WORD to PDF',
          path: '/pdf/word-to-pdf',
          desc: 'Convert Word DOCX files into vector A4 PDF',
          badge: 'DOCX',
          icon: FileType,
          color: 'text-blue-400 bg-blue-500/20',
        },
        {
          name: 'POWERPOINT to PDF',
          path: '/pdf/powerpoint-to-pdf',
          desc: 'Convert PPTX presentation slides to 16:9 PDF',
          badge: 'PPTX',
          icon: Presentation,
          color: 'text-orange-400 bg-orange-500/20',
        },
        {
          name: 'EXCEL to PDF',
          path: '/pdf/excel-to-pdf',
          desc: 'Convert Excel XLSX/CSV spreadsheets to paginated PDF',
          badge: 'XLSX',
          icon: FileSpreadsheet,
          color: 'text-emerald-400 bg-emerald-500/20',
        },
        {
          name: 'HTML to PDF',
          path: '/pdf/html-to-pdf',
          desc: 'Convert web code, invoices and HTML to A4 PDF',
          badge: 'Code',
          icon: Code2,
          color: 'text-amber-400 bg-amber-500/20',
        },
      ],
    },
    {
      id: 'convert-from',
      title: 'CONVERT FROM PDF',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      tools: [
        {
          name: 'PDF to JPG',
          path: '/pdf/pdf-to-image',
          desc: 'Extract PDF pages into 300 DPI high-res JPG/PNG',
          badge: 'Images',
          icon: ImageIcon,
          color: 'text-yellow-400 bg-yellow-500/20',
        },
        {
          name: 'PDF to WORD',
          path: '/pdf/pdf-to-word',
          desc: 'Convert PDF into fully editable Microsoft Word DOCX',
          badge: 'Editable',
          icon: FileType,
          color: 'text-blue-400 bg-blue-500/20',
        },
        {
          name: 'PDF to POWERPOINT',
          path: '/pdf/pdf-to-powerpoint',
          desc: 'Convert PDF pages into editable PowerPoint PPTX slides',
          badge: 'Slides',
          icon: Presentation,
          color: 'text-orange-400 bg-orange-500/20',
        },
        {
          name: 'PDF to EXCEL',
          path: '/pdf/pdf-to-excel',
          desc: 'Extract financial tables and data to XLSX/CSV',
          badge: 'Spreadsheet',
          icon: Table,
          color: 'text-emerald-400 bg-emerald-500/20',
        },
        {
          name: 'PDF to PDF/A',
          path: '/pdf/pdf-to-pdfa',
          desc: 'ISO 19005 archival compliance with XMP schemas',
          badge: 'ISO 19005',
          icon: ShieldCheck,
          color: 'text-blue-400 bg-blue-500/20',
        },
      ],
    },
    {
      id: 'edit',
      title: 'EDIT PDF',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      tools: [
        {
          name: 'Rotate PDF',
          path: '/pdf/rotate',
          desc: 'Rotate pages 90°, 180° or 270° clockwise & counter-clockwise',
          icon: RotateCw,
          color: 'text-purple-400 bg-purple-500/20',
        },
        {
          name: 'Add Page Numbers',
          path: '/pdf/page-numbers',
          desc: 'Insert header & footer numbers with Page 1 of N formats',
          icon: Hash,
          color: 'text-purple-400 bg-purple-500/20',
        },
        {
          name: 'Add Watermark',
          path: '/pdf/watermark',
          desc: 'Stamp text, confidential seals and diagonal grid security',
          badge: 'Security',
          icon: ShieldAlert,
          color: 'text-rose-400 bg-rose-500/20',
        },
        {
          name: 'Crop PDF',
          path: '/pdf/crop',
          desc: 'Trim page margins and custom crop viewport borders',
          icon: Crop,
          color: 'text-purple-400 bg-purple-500/20',
        },
        {
          name: 'Edit PDF',
          path: '/pdf/edit',
          desc: 'Add text notes, reviewer comments, callouts and markup',
          icon: Edit3,
          color: 'text-purple-400 bg-purple-500/20',
        },
        {
          name: 'PDF Forms',
          path: '/pdf/forms',
          desc: 'Fill interactive form fields and flatten into read-only PDF',
          icon: FileCheck2,
          color: 'text-purple-400 bg-purple-500/20',
        },
      ],
    },
    {
      id: 'security',
      title: 'PDF SECURITY',
      badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      tools: [
        {
          name: 'Unlock PDF',
          path: '/pdf/unlock',
          desc: 'Remove passwords and print/copy security restrictions',
          icon: Unlock,
          color: 'text-indigo-400 bg-indigo-500/20',
        },
        {
          name: 'Protect PDF',
          path: '/pdf/protect',
          desc: 'Encrypt PDF with AES-256 password and custom permissions',
          badge: 'AES-256',
          icon: Lock,
          color: 'text-indigo-400 bg-indigo-500/20',
        },
        {
          name: 'Sign PDF',
          path: '/pdf/sign',
          desc: 'Draw signature, type cursive name or place image stamp',
          badge: 'Digital Sign',
          icon: PenTool,
          color: 'text-blue-400 bg-blue-500/20',
        },
        {
          name: 'Redact PDF',
          path: '/pdf/redact',
          desc: 'Permanently blackout sensitive PII, account & tax numbers',
          badge: 'Permanent',
          icon: ShieldAlert,
          color: 'text-rose-400 bg-rose-500/20',
        },
        {
          name: 'Compare PDF',
          path: '/pdf/compare',
          desc: 'Side-by-side visual diff comparison between two PDF revisions',
          icon: GitCompare,
          color: 'text-indigo-400 bg-indigo-500/20',
        },
      ],
    },
    {
      id: 'intelligence',
      title: 'PDF INTELLIGENCE',
      badgeColor: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20',
      tools: [
        {
          name: 'AI Summarizer',
          path: '/pdf/ai-summary',
          desc: 'Generate executive summary, key insights and action items',
          badge: 'AI Smart',
          icon: Sparkles,
          color: 'text-fuchsia-400 bg-fuchsia-500/20',
        },
        {
          name: 'Translate PDF',
          path: '/pdf/translate',
          desc: 'Translate PDF documents into 30+ international languages',
          icon: Languages,
          color: 'text-purple-400 bg-purple-500/20',
        },
        {
          name: 'PDF to Markdown',
          path: '/pdf/to-markdown',
          desc: 'Convert documents into structured GitHub-flavored Markdown',
          badge: '.MD',
          icon: FileCode,
          color: 'text-fuchsia-400 bg-fuchsia-500/20',
        },
      ],
    },
  ];

  // Filter tools by search query
  const filteredMatrix = PDF_MATRIX.map((cat) => ({
    ...cat,
    tools: cat.tools.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.tools.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5" />
          Complete 7-Category PDF Suite • 100% Free &amp; Private
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
          Every PDF Tool You'll Ever Need.
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Organize, convert, edit, secure, and summarize your PDF documents with zero server uploads, no watermarks, and unlimited file size.
        </p>

        {/* Live Search Input */}
        <div className="relative max-w-xl mx-auto pt-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 25+ PDF tools (e.g. Word to PDF, Sign, Compress, Rotate)..."
            className="w-full bg-slate-900/90 border border-white/15 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 shadow-xl"
          />
        </div>
      </div>

      {/* 7-Column Mega Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-6 items-start">
        {filteredMatrix.map((category) => (
          <div
            key={category.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 transition-all hover:border-white/20"
          >
            {/* Category Header */}
            <div className="px-2 py-1.5 border-b border-white/10">
              <span className={`text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border ${category.badgeColor}`}>
                {category.title}
              </span>
            </div>

            {/* Tool Links */}
            <div className="space-y-1.5">
              {category.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.name}
                    to={tool.path}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/10 transition-all group cursor-pointer text-left"
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${tool.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate flex items-center justify-between gap-1">
                        <span>{tool.name}</span>
                        {tool.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-mono shrink-0">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                        {tool.desc}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Features Footer Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">100% Client-Side RAM</div>
            <div className="text-[11px] text-slate-400">Zero files uploaded to any server</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <Flame className="w-8 h-8 text-rose-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">No Watermarks Ever</div>
            <div className="text-[11px] text-slate-400">Clean, studio-resolution exports</div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <Zap className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">Instant Multi-Core Speed</div>
            <div className="text-[11px] text-slate-400">WebAssembly-accelerated execution</div>
          </div>
        </div>
      </div>
    </div>
  );
};
