import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import {
  FileText,
  Download,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Sparkles,
  BookOpen,
  Copy,
  Check,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageTextData {
  pageNumber: number;
  lines: string[];
  fullText: string;
}

export const PDFToWord: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [extractedPages, setExtractedPages] = useState<PageTextData[]>([]);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setExtractedPages([]);
    setDocxBlob(null);

    await processPdfToWord(target);
  };

  const processPdfToWord = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Loading PDF Document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const pagesData: PageTextData[] = [];
      const docxChildren: Paragraph[] = [];

      // Document Title Header in Word
      docxChildren.push(
        new Paragraph({
          text: file.name.replace(/\.[^/.]+$/, ''),
          heading: HeadingLevel.TITLE,
          spacing: { after: 300 },
        })
      );

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgressText(`Extracting structured text from Page ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group items by Y position to reconstruct paragraphs and lines
        const linesMap = new Map<number, string[]>();

        for (const item of textContent.items as any[]) {
          if (!('str' in item) || !item.str.trim()) continue;
          // Round Y coordinate to group characters on same horizontal line
          const y = Math.round(item.transform[5]);
          if (!linesMap.has(y)) {
            linesMap.set(y, []);
          }
          linesMap.get(y)!.push(item.str);
        }

        // Sort lines from top to bottom (PDF Y is from bottom up)
        const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
        const pageLines: string[] = sortedY.map((y) => linesMap.get(y)!.join(' '));
        const pageFullText = pageLines.join('\n');

        pagesData.push({
          pageNumber: pageNum,
          lines: pageLines,
          fullText: pageFullText,
        });

        // Add page heading in DOCX
        if (totalPages > 1) {
          docxChildren.push(
            new Paragraph({
              text: `--- Page ${pageNum} ---`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 240, after: 120 },
            })
          );
        }

        // Add paragraphs to DOCX
        for (const line of pageLines) {
          if (!line.trim()) continue;

          // Check if line looks like a heading
          const isHeading = line.length < 60 && (line === line.toUpperCase() || line.endsWith(':'));

          docxChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  bold: isHeading,
                  size: isHeading ? 26 : 22,
                  font: 'Calibri',
                }),
              ],
              spacing: { after: 120 },
            })
          );
        }
      }

      setExtractedPages(pagesData);

      // Build DOCX document
      setProgressText('Compiling Microsoft Word (.docx) document...');
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docxChildren,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      setDocxBlob(blob);
      incrementStat('pdf');
    } catch (err) {
      console.error('PDF to Word extraction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocx = () => {
    if (!docxBlob || !selectedFile) return;
    const filename = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_converted.docx`;
    saveAs(docxBlob, filename);
  };

  const handleCopyText = () => {
    const fullText = extractedPages.map((p) => `--- Page ${p.pageNumber} ---\n` + p.fullText).join('\n\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const totalWords = extractedPages.reduce((acc, p) => acc + p.fullText.split(/\s+/).filter(Boolean).length, 0);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="PDF to Word (DOCX) Converter"
        description="Convert PDF documents into editable Microsoft Word (.docx) files with text structure and paragraph preservation. 100% private in-browser RAM execution."
        categoryName="PDF Tools"
        categoryPath="/pdf/pdf-to-word"
        badge="Pure Client-Side DOCX Engine"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            title="Upload PDF to Convert to Microsoft Word (.docx)"
            subtitle="Extract editable paragraphs, headings, and lines with 100% client-side privacy"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-blue-400 block mb-1">Editable DOCX</span>
              <span className="text-xs text-slate-400">Compatible with Microsoft Word, LibreOffice &amp; Google Docs</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Structure Intact</span>
              <span className="text-xs text-slate-400">Headings, lines, paragraphs and multi-page grouping</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% Private</span>
              <span className="text-xs text-slate-400">Zero files uploaded to any remote servers</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Document Details & Extracted Preview */}
          <div className="lg:col-span-7 space-y-5">
            {/* File Info Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-sm text-white truncate">{selectedFile.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span>{extractedPages.length} Pages</span>
                    <span>•</span>
                    <span>{totalWords.toLocaleString()} Words</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium cursor-pointer"
              >
                Change File
              </button>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-4 shadow-xl">
                <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-white">{progressText}</div>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="w-full h-full bg-blue-500 rounded-full animate-pulse" />
                </div>
              </div>
            )}

            {/* Extracted Document Live Text Preview */}
            {!isProcessing && extractedPages.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Extracted Document Preview</span>
                  </span>

                  <button
                    onClick={handleCopyText}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy All Text</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
                  {extractedPages.map((page) => (
                    <div key={page.pageNumber} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">
                        Page {page.pageNumber}
                      </div>
                      <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                        {page.fullText || <span className="text-slate-500 italic">No selectable text found on this page.</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Download & Conversion Actions */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>Microsoft Word Export</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  .DOCX Format
                </span>
              </div>

              {docxBlob ? (
                <div className="space-y-4 animate-in zoom-in-95 duration-150">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Microsoft Word (.docx) document compiled successfully!</span>
                  </div>

                  <button
                    onClick={handleDownloadDocx}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-950/60 transition-all cursor-pointer hover:scale-102"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Word (.docx) Document</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
                  <p className="text-xs leading-relaxed">
                    Converting PDF structure and compiling native Office Open XML document...
                  </p>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="font-bold text-slate-200">Supported Applications:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Microsoft Word 2010, 2013, 2016, 2019, 2021 &amp; Office 365</li>
                  <li>Google Docs &amp; Google Drive</li>
                  <li>LibreOffice Writer &amp; OpenOffice</li>
                  <li>WPS Office &amp; Apple Pages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
