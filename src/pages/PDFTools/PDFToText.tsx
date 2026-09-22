import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  FileText,
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Copy,
  Check,
  Search,
  ArrowRightLeft,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type ConversionMode = 'pdf-to-text' | 'text-to-pdf';

export const PDFToText: React.FC = () => {
  usePageSEO({
    title: 'PDF to Text & Text to PDF Converter Free Online (100% In-Browser)',
    description: 'Extract raw text, notes, and strings from PDF documents or convert plain text (.txt) into clean vector PDF files without server uploads.',
    keywords: 'pdf to text, text to pdf, txt to pdf, extract text from pdf, pdf text converter, free pdf converter',
  });

  const [mode, setMode] = useState<ConversionMode>('pdf-to-text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Mode: Text to PDF states
  const [inputText, setInputText] = useState<string>('');
  const [pdfTitle, setPdfTitle] = useState<string>('Document');
  const [fontSize, setFontSize] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<number>(1.4);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setExtractedText('');

    if (mode === 'pdf-to-text') {
      await processPdfToText(target);
    } else {
      // Read TXT file into text editor
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string || '';
        setInputText(text);
        setPdfTitle(target.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsText(target);
    }
  };

  const processPdfToText = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Opening PDF Document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      let fullExtracted = '';

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgressText(`Reading Page ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group items by vertical position
        const linesMap = new Map<number, string[]>();
        for (const item of textContent.items as any[]) {
          if (!('str' in item) || !item.str.trim()) continue;
          const y = Math.round(item.transform[5]);
          if (!linesMap.has(y)) {
            linesMap.set(y, []);
          }
          linesMap.get(y)!.push(item.str);
        }

        const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
        const pageLines = sortedY.map((y) => linesMap.get(y)!.join(' ')).join('\n');

        fullExtracted += `--- PAGE ${pageNum} / ${totalPages} ---\n\n` + pageLines + '\n\n';
      }

      setExtractedText(fullExtracted.trim());
      incrementStat('pdf');
    } catch (err) {
      console.error('PDF to Text extraction failed:', err);
      alert('Failed to parse text from this PDF file. It might be a scanned image-only PDF.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const handleCopy = () => {
    const textToCopy = mode === 'pdf-to-text' ? extractedText : inputText;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const filename = (selectedFile?.name.replace(/\.[^/.]+$/, '') || 'document') + '_extracted.txt';
    saveAs(blob, filename);
  };

  const generatePdfFromText = async () => {
    if (!inputText.trim()) {
      alert('Please enter or paste text to generate a PDF.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28; // A4 width in pt
      const pageHeight = 841.89; // A4 height in pt
      const margin = 50;
      const maxLineWidth = pageWidth - margin * 2;
      const effectiveLineHeight = fontSize * lineSpacing;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin;

      // Draw Title Header
      if (pdfTitle.trim()) {
        currentPage.drawText(pdfTitle.trim(), {
          x: margin,
          y: currentY - 14,
          size: 16,
          font: boldFont,
          color: rgb(0.1, 0.15, 0.25),
        });
        currentY -= 35;

        // Divider line
        currentPage.drawLine({
          start: { x: margin, y: currentY + 10 },
          end: { x: pageWidth - margin, y: currentY + 10 },
          thickness: 1,
          color: rgb(0.85, 0.88, 0.92),
        });
      }

      // Helper to wrap text into lines fitting maxLineWidth
      const wrapText = (text: string, font: any, size: number): string[] => {
        const words = text.split(' ');
        const lines: string[] = [];
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, size);
          if (width <= maxLineWidth) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        return lines.length > 0 ? lines : [''];
      };

      const paragraphs = inputText.split('\n');

      for (const p of paragraphs) {
        if (p.trim() === '') {
          // Empty paragraph = blank line space
          currentY -= effectiveLineHeight * 0.8;
          if (currentY < margin) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }
          continue;
        }

        const wrappedLines = wrapText(p, regularFont, fontSize);

        for (const line of wrappedLines) {
          if (currentY - effectiveLineHeight < margin) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          currentPage.drawText(line, {
            x: margin,
            y: currentY - fontSize,
            size: fontSize,
            font: regularFont,
            color: rgb(0.15, 0.18, 0.22),
          });

          currentY -= effectiveLineHeight;
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const filename = `${pdfTitle.trim() || 'Document'}.pdf`;
      saveAs(blob, filename);
      incrementStat('pdf');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Error compiling PDF from text. Please check text formatting.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const wordCount = (mode === 'pdf-to-text' ? extractedText : inputText)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const charCount = (mode === 'pdf-to-text' ? extractedText : inputText).length;
  const lineCount = (mode === 'pdf-to-text' ? extractedText : inputText)
    .split('\n').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToolHeader
        title="PDF & Text Studio"
        description="Extract raw text and notes from PDF files or turn plain text & articles into vector-quality A4 PDF documents with custom typography."
        categoryName="PDF Tools"
        categoryPath="/pdf/pdf-to-text"
        badge="Pure Client-Side Engine"
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl backdrop-blur-md">
          <button
            onClick={() => {
              setMode('pdf-to-text');
              setSelectedFile(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              mode === 'pdf-to-text'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            PDF to Text (.txt)
          </button>
          <button
            onClick={() => {
              setMode('text-to-pdf');
              setSelectedFile(null);
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              mode === 'text-to-pdf'
                ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            Text (.txt) to PDF
          </button>
        </div>
      </div>

      {/* MODE 1: PDF to Text */}
      {mode === 'pdf-to-text' && (
        <div className="space-y-6">
          {!selectedFile ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
              <UploadZone
                accept=".pdf,application/pdf"
                onFileSelect={handleFileSelect}
                title="Upload PDF Document to Extract Text"
                subtitle="Select any PDF document (Invoices, Articles, Contracts, Books)"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* File details banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{selectedFile.name}</h3>
                    <p className="text-xs text-slate-400">
                      {formatFileSize(selectedFile.size)} • Extracted in Client RAM
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setExtractedText('');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New PDF
                  </button>

                  <button
                    onClick={handleCopy}
                    disabled={!extractedText}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>

                  <button
                    onClick={handleDownloadTxt}
                    disabled={!extractedText}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 transition active:scale-95 disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    Download .TXT
                  </button>
                </div>
              </div>

              {/* Stats & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/40 px-4 py-2 rounded-xl border border-slate-800/60">
                <div className="flex items-center gap-4">
                  <span>Words: <strong className="text-slate-200">{wordCount.toLocaleString()}</strong></span>
                  <span>Characters: <strong className="text-slate-200">{charCount.toLocaleString()}</strong></span>
                  <span>Lines: <strong className="text-slate-200">{lineCount.toLocaleString()}</strong></span>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Quick search text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Text Area Content */}
              {isProcessing ? (
                <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium text-slate-300">{progressText}</p>
                </div>
              ) : (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-hidden backdrop-blur-xl">
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    rows={18}
                    className="w-full bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-y leading-relaxed"
                    placeholder="Extracted text will appear here..."
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: Text to PDF */}
      {mode === 'text-to-pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Area (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Document Title
                </label>
                <span className="text-xs text-slate-500">Appears at top of page 1</span>
              </div>
              <input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="e.g. Project Summary & Notes"
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
              />

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Document Content (Plain Text)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!inputText}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => setInputText('')}
                    disabled={!inputText}
                    className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={16}
                placeholder="Type or paste your text, articles, speech, or notes here... Paragraphs will automatically paginate onto clean A4 pages."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm font-sans text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
              />

              {/* Upload TXT file helper */}
              <div className="pt-2">
                <UploadZone
                  accept=".txt,.text,.md"
                  onFileSelect={handleFileSelect}
                  title="Or load from .txt / .md file"
                  subtitle="Drag and drop any text file to auto-populate the editor"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar Controls & PDF Generation */}
          <div className="space-y-6">
            {/* Formatting Settings */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Typography Settings
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Font Size</span>
                    <span className="font-semibold text-slate-200">{fontSize} pt</span>
                  </div>
                  <input
                    type="range"
                    min={9}
                    max={18}
                    step={1}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Line Spacing</span>
                    <span className="font-semibold text-slate-200">{lineSpacing}x</span>
                  </div>
                  <input
                    type="range"
                    min={1.1}
                    max={2.2}
                    step={0.1}
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Live Text Metrics */}
              <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Words:</span>
                  <span className="font-semibold text-slate-200">{wordCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Characters:</span>
                  <span className="font-semibold text-slate-200">{charCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Pages:</span>
                  <span className="font-semibold text-indigo-400">
                    ~{Math.max(1, Math.ceil(wordCount / 450))} A4 Pages
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={generatePdfFromText}
                disabled={isGeneratingPdf || !inputText.trim()}
                className="w-full mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition active:scale-95 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Vector PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate & Download PDF
                  </>
                )}
              </button>
            </div>

            {/* Privacy Trust Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                100% Client-Side Privacy
              </div>
              <p className="leading-relaxed">
                Your notes and documents are formatted purely in your browser's local memory. No data is ever uploaded to any cloud server.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
