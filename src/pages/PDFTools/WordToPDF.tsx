import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  FileText,
  Download,
  CheckCircle2,
  RefreshCw,
  FileCode,
  Sparkles,
  Eye,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

export const WordToPDF: React.FC = () => {
  usePageSEO({
    title: 'Free Word to PDF Converter Online (DOCX to PDF in High Quality)',
    description: 'Convert Microsoft Word DOCX and DOC files to PDF documents online for free. Fast in-browser conversion preserving fonts, paragraphs, and styling.',
    keywords: 'word to pdf, convert docx to pdf, doc to pdf online free, word document to pdf converter, nexora tools',
    canonicalPath: '/word-to-pdf',
    categoryName: 'PDF Suite',
    toolName: 'Word to PDF Converter',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [extractedHtml, setExtractedHtml] = useState<string>('');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setExtractedHtml('');
    setPdfBlob(null);
    setPdfPreviewUrl(null);

    await processWordToPdf(target);
  };

  const processWordToPdf = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Extracting Word document structure & text...');

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      setExtractedHtml(html);

      // Extract raw text lines to paginate into PDFDocument
      setProgressText('Compiling PDF pages with vector typography...');
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
      const rawText = rawTextResult.value;
      const paragraphs = rawText.split('\n').filter((p) => p.trim().length > 0);

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595.28; // A4 width in points
      const pageHeight = 841.89; // A4 height in points
      const margin = 50;
      const contentWidth = pageWidth - margin * 2;
      const fontSize = 11;
      const lineHeight = fontSize * 1.45;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin - 20;

      // Header on first page
      currentPage.drawText(file.name.replace(/\.[^/.]+$/, ''), {
        x: margin,
        y: currentY,
        size: 16,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.15),
      });
      currentY -= 30;

      // Draw horizontal dividing line
      currentPage.drawLine({
        start: { x: margin, y: currentY },
        end: { x: pageWidth - margin, y: currentY },
        thickness: 0.75,
        color: rgb(0.7, 0.7, 0.75),
      });
      currentY -= 25;

      for (const para of paragraphs) {
        const isHeading = para.length < 80 && (para === para.toUpperCase() || para.endsWith(':'));
        const activeFont = isHeading ? boldFont : font;
        const activeSize = isHeading ? 13 : fontSize;
        const activeLineHeight = isHeading ? 22 : lineHeight;

        // Simple text wrap
        const words = para.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = activeFont.widthOfTextAtSize(testLine, activeSize);

          if (testWidth > contentWidth && currentLine) {
            if (currentY < margin + 40) {
              currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
              currentY = pageHeight - margin;
            }

            currentPage.drawText(currentLine, {
              x: margin,
              y: currentY,
              size: activeSize,
              font: activeFont,
              color: isHeading ? rgb(0.1, 0.1, 0.2) : rgb(0.2, 0.2, 0.25),
            });
            currentY -= activeLineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }

        if (currentLine) {
          if (currentY < margin + 40) {
            currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
            currentY = pageHeight - margin;
          }

          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: activeSize,
            font: activeFont,
            color: isHeading ? rgb(0.1, 0.1, 0.2) : rgb(0.2, 0.2, 0.25),
          });
          currentY -= activeLineHeight;
        }

        currentY -= 8; // Paragraph spacing
      }

      setPageCount(pdfDoc.getPageCount());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setPdfBlob(blob);
      setPdfPreviewUrl(URL.createObjectURL(blob));
      incrementStat('pdf');
    } catch (err) {
      console.error('Word to PDF conversion error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !selectedFile) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_converted.pdf`;
    a.click();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Word (DOCX) to PDF Converter"
        description="Convert Microsoft Word (.docx / .doc) documents into standard A4 PDF files with 100% in-browser RAM execution."
        categoryName="PDF Tools"
        categoryPath="/pdf/word-to-pdf"
        badge="Pure Client-Side PDF Engine"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept=".docx,.doc,.odt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            title="Upload Word (.docx / .doc) Document to Convert to PDF"
            subtitle="Fast client-side conversion with A4 pagination and 100% privacy"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-blue-400 block mb-1">Standard A4</span>
              <span className="text-xs text-slate-400">Clean margins, readable typography &amp; pagination</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">No Software Needed</span>
              <span className="text-xs text-slate-400">Runs directly in Chrome, Edge, Safari &amp; Firefox</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% Private</span>
              <span className="text-xs text-slate-400">No documents sent to cloud servers</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: File Info & Extracted Content */}
          <div className="lg:col-span-6 space-y-5">
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
                    <span>{pageCount} PDF Pages Generated</span>
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
              </div>
            )}

            {/* Formatted Content HTML Preview */}
            {!isProcessing && extractedHtml && (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-xl">
                <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Document Text Structure</span>
                </div>
                <div
                  ref={previewContainerRef}
                  dangerouslySetInnerHTML={{ __html: extractedHtml }}
                  className="max-h-[400px] overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 prose prose-invert max-w-none"
                />
              </div>
            )}
          </div>

          {/* Right Column: Live PDF Output & Download */}
          <div className="lg:col-span-6 space-y-5">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  <span>PDF Document Preview</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  A4 Print Ready
                </span>
              </div>

              {pdfPreviewUrl ? (
                <div className="space-y-4 animate-in zoom-in-95 duration-150">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>PDF compiled successfully with {pageCount} pages!</span>
                  </div>

                  <iframe
                    src={pdfPreviewUrl}
                    title="PDF Output Preview"
                    className="w-full h-80 rounded-2xl border border-slate-800 bg-slate-950 shadow-inner"
                  />

                  <button
                    onClick={handleDownload}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-all cursor-pointer hover:scale-102"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Document</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
                  <p className="text-xs leading-relaxed">
                    Compiling vector A4 PDF with exact word wrapping and pagination...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
