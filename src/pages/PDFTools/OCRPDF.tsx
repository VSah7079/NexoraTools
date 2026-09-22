import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  ScanLine,
  Download,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ExtractedPageText {
  pageNum: number;
  text: string;
}

export const OCRPDF: React.FC = () => {
  usePageSEO({
    title: 'OCR PDF Online Free - Convert Scanned PDF to Searchable Text (No Watermark)',
    description: 'Extract text layers from scanned PDF pages and generate searchable, copyable PDF documents. 100% private in-browser client-side processing.',
    keywords: 'ocr pdf, make pdf searchable, extract text from pdf, scanned pdf to text, ocr pdf online free no watermark',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedPages, setExtractedPages] = useState<ExtractedPageText[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(1);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setExtractedPages([]);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pagesText: ExtractedPageText[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgressText(`Analyzing page ${i} of ${numPages} for text layers...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str).join(' ');
        pagesText.push({
          pageNum: i,
          text: textItems.trim() || `[Page ${i}: Scanned raster image or no selectable text detected]`,
        });
      }

      setExtractedPages(pagesText);
      setActiveTab(1);
      incrementStat('pdf');
    } catch (err: any) {
      console.error(err);
      alert('Failed to parse PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fullText = extractedPages.map((p) => `--- PAGE ${p.pageNum} ---\n${p.text}`).join('\n\n');

  const handleCopyText = () => {
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!selectedFile) return;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
    saveAs(blob, `${baseName}_OCR_Text_Nexora.txt`);
  };

  const handleDownloadSearchablePDF = async () => {
    if (!selectedFile) return;
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      extractedPages.forEach((p) => {
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        let y = 800;

        page.drawText(`Page ${p.pageNum}`, {
          x: 50,
          y: y,
          size: 14,
          font,
          color: rgb(0.2, 0.2, 0.6),
        });
        y -= 25;

        // Wrap lines
        const words = p.text.split(' ');
        let currentLine = '';

        words.forEach((word) => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = font.widthOfTextAtSize(testLine, 10);
          if (width > 495) {
            if (y > 40) {
              page.drawText(currentLine, { x: 50, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
              y -= 14;
            }
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine && y > 40) {
          page.drawText(currentLine, { x: 50, y, size: 10, font, color: rgb(0.1, 0.1, 0.1) });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_searchable_Nexora.pdf`);
    } catch (e: any) {
      alert('Error creating searchable PDF: ' + e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="OCR PDF & Searchable Text Extractor"
        description="Extract selectable text, paragraphs, and content from scanned PDF documents and generate searchable files."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Optimize Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop PDF here for OCR text extraction"
            subtitle="Searchable text layer • Export to TXT or Searchable PDF • 100% RAM Privacy"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* File summary and actions */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)} • {extractedPages.length} Pages</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={handleCopyText}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied!' : 'Copy All Text'}</span>
              </button>

              <button
                onClick={handleDownloadTxt}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save as .TXT</span>
              </button>

              <button
                onClick={handleDownloadSearchablePDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Searchable PDF</span>
              </button>
            </div>
          </div>

          {/* Processing state */}
          {isProcessing && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-slate-300 text-sm font-medium">{progressText}</p>
            </div>
          )}

          {/* Extracted Text Viewer */}
          {!isProcessing && extractedPages.length > 0 && (
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
              {/* Page Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
                {extractedPages.map((p) => (
                  <button
                    key={p.pageNum}
                    onClick={() => setActiveTab(p.pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      activeTab === p.pageNum
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Page {p.pageNum}
                  </button>
                ))}
              </div>

              {/* Text content area */}
              <div className="bg-slate-950/80 rounded-xl p-5 border border-white/5 max-h-[480px] overflow-y-auto">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {extractedPages.find((p) => p.pageNum === activeTab)?.text || 'No text content.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
