import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Hash,
  Download,
  RefreshCw,
  Layout,
  Eye,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
type FormatType = 'number' | 'page_n' | 'page_n_of_total' | 'n_of_total' | 'hyphen';

export const PDFPageNumbers: React.FC = () => {
  usePageSEO({
    title: 'Add Page Numbers to PDF Online Free - Header & Footer Numbering (No Watermark)',
    description: 'Insert customizable page numbers into PDF headers or footers. Select position, format, typography, margins, and starting page with instant preview.',
    keywords: 'add page numbers to pdf, number pdf pages, paginate pdf free, pdf header footer numbers, add page numbers to pdf online free',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [currentPreviewPage, setCurrentPreviewPage] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Settings
  const [position, setPosition] = useState<Position>('bottom-center');
  const [format, setFormat] = useState<FormatType>('page_n_of_total');
  const [fontFamily, setFontFamily] = useState<'Helvetica' | 'TimesRoman' | 'Courier'>('Helvetica');
  const [fontSize, setFontSize] = useState<number>(11);
  const [startPage, setStartPage] = useState<number>(1);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [skipFirstPage, setSkipFirstPage] = useState<boolean>(false);
  const [marginOffset, setMarginOffset] = useState<number>(24);
  const [textColor, setTextColor] = useState<string>('#334155'); // slate-700
  const [customPrefix] = useState<string>('');

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
      setCurrentPreviewPage(1);

      await renderPreviewPage(pdf, 1);
    } catch (err: any) {
      console.error('Failed to load PDF:', err);
      alert('Could not render PDF. Please ensure the file is not corrupted or password protected.');
    }
  };

  const renderPreviewPage = async (pdfOrNull: any, pageNum: number) => {
    try {
      let pdf = pdfOrNull;
      if (!pdf && selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      }
      if (!pdf) return;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
        setPreviewImageUrl(canvas.toDataURL('image/jpeg', 0.9));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getFormattedText = (pageNum: number, total: number) => {
    if (skipFirstPage && pageNum === 1) return '';
    if (pageNum < startPage) return '';

    const effectiveNum = startNumber + (pageNum - startPage);
    let str = '';

    switch (format) {
      case 'number':
        str = `${effectiveNum}`;
        break;
      case 'page_n':
        str = `Page ${effectiveNum}`;
        break;
      case 'page_n_of_total':
        str = `Page ${effectiveNum} of ${total}`;
        break;
      case 'n_of_total':
        str = `${effectiveNum} / ${total}`;
        break;
      case 'hyphen':
        str = `- ${effectiveNum} -`;
        break;
    }

    return customPrefix ? `${customPrefix} ${str}` : str;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? rgb(
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        )
      : rgb(0.2, 0.2, 0.2);
  };

  const handleDownload = async () => {
    if (!selectedFile) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font =
        fontFamily === 'TimesRoman'
          ? await pdfDoc.embedFont(StandardFonts.TimesRoman)
          : fontFamily === 'Courier'
          ? await pdfDoc.embedFont(StandardFonts.Courier)
          : await pdfDoc.embedFont(StandardFonts.Helvetica);

      const pdfPages = pdfDoc.getPages();
      const numPages = pdfPages.length;
      const color = hexToRgb(textColor);

      pdfPages.forEach((page, idx) => {
        const pageNum = idx + 1;
        const text = getFormattedText(pageNum, numPages);
        if (!text) return;

        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        let x = 0;
        let y = 0;

        // Position coordinates
        if (position === 'top-left') {
          x = marginOffset;
          y = height - marginOffset - textHeight;
        } else if (position === 'top-center') {
          x = (width - textWidth) / 2;
          y = height - marginOffset - textHeight;
        } else if (position === 'top-right') {
          x = width - marginOffset - textWidth;
          y = height - marginOffset - textHeight;
        } else if (position === 'bottom-left') {
          x = marginOffset;
          y = marginOffset;
        } else if (position === 'bottom-center') {
          x = (width - textWidth) / 2;
          y = marginOffset;
        } else if (position === 'bottom-right') {
          x = width - marginOffset - textWidth;
          y = marginOffset;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_numbered_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error('Error applying page numbers:', err);
      alert('Failed to add page numbers: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Add Page Numbers to PDF"
        description="Insert formatted page numbers into your PDF header or footer with custom coordinates, fonts, typography formats, and preview."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Edit Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop your PDF here to add page numbers"
            subtitle="Custom header & footer positions • Page 1 of N formats • 100% Private in Browser RAM"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls Panel */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-400" />
                  Page Number Settings
                </h3>
                <p className="text-xs text-slate-400">{selectedFile.name} ({totalPages} pages)</p>
              </div>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewImageUrl(null);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 rounded-lg"
              >
                Change PDF
              </button>
            </div>

            {/* Position Matrix (3x2 Grid) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-purple-400" />
                Position on Page
              </label>
              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-950/60 rounded-xl border border-white/5">
                {[
                  { id: 'top-left', label: 'Top Left' },
                  { id: 'top-center', label: 'Top Center' },
                  { id: 'top-right', label: 'Top Right' },
                  { id: 'bottom-left', label: 'Bottom Left' },
                  { id: 'bottom-center', label: 'Bottom Center' },
                  { id: 'bottom-right', label: 'Bottom Right' },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setPosition(pos.id as Position)}
                    className={`py-2 px-1 text-xs rounded-lg font-medium transition-all text-center ${
                      position === pos.id
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Style */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Numbering Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'page_n_of_total', label: `Page 1 of ${totalPages}` },
                  { id: 'n_of_total', label: `1 / ${totalPages}` },
                  { id: 'page_n', label: 'Page 1' },
                  { id: 'number', label: '1' },
                  { id: 'hyphen', label: '- 1 -' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id as FormatType)}
                    className={`py-2 px-3 text-xs rounded-xl border text-left transition-all ${
                      format === fmt.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-200 font-medium'
                        : 'bg-slate-800/50 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Font Family</label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="Helvetica">Helvetica (Clean Sans)</option>
                  <option value="TimesRoman">Times New Roman (Serif)</option>
                  <option value="Courier">Courier (Monospace)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Font Size ({fontSize} pt)</label>
                <input
                  type="range"
                  min={8}
                  max={24}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-purple-500 mt-2"
                />
              </div>
            </div>

            {/* Margins & Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Edge Margin ({marginOffset} px)</label>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={marginOffset}
                  onChange={(e) => setMarginOffset(Number(e.target.value))}
                  className="w-full accent-purple-500 mt-2"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/10"
                  />
                  <span className="text-xs font-mono text-slate-400">{textColor}</span>
                </div>
              </div>
            </div>

            {/* Skip First Page & Start Numbers */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipFirstPage}
                  onChange={(e) => setSkipFirstPage(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-300 font-medium">Skip cover page (don't number page 1)</span>
              </label>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>Start numbering at page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={startPage}
                  onChange={(e) => setStartPage(Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-center text-white"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Start counting from number:</span>
                <input
                  type="number"
                  min={1}
                  value={startNumber}
                  onChange={(e) => setStartNumber(Math.max(1, Number(e.target.value)))}
                  className="w-16 bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-center text-white"
                />
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying Page Numbers...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Numbered PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Right Live Preview */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                Live Page Overlay Preview
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Page {currentPreviewPage} of {totalPages}</span>
                <button
                  onClick={() => {
                    const next = currentPreviewPage > 1 ? currentPreviewPage - 1 : 1;
                    setCurrentPreviewPage(next);
                    renderPreviewPage(null, next);
                  }}
                  disabled={currentPreviewPage <= 1}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-200"
                >
                  Prev
                </button>
                <button
                  onClick={() => {
                    const next = currentPreviewPage < totalPages ? currentPreviewPage + 1 : totalPages;
                    setCurrentPreviewPage(next);
                    renderPreviewPage(null, next);
                  }}
                  disabled={currentPreviewPage >= totalPages}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Preview Sheet with Dynamic Marker Overlay */}
            <div className="relative w-full aspect-[1/1.35] bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
              {previewImageUrl ? (
                <div className="relative max-h-full max-w-full shadow-2xl border border-white/20 bg-white">
                  <img
                    src={previewImageUrl}
                    alt="Preview"
                    className="max-h-[520px] w-auto object-contain block"
                  />
                  {/* Overlay Simulated Number */}
                  <div
                    className={`absolute pointer-events-none transition-all duration-150 font-${
                      fontFamily === 'Courier' ? 'mono' : fontFamily === 'TimesRoman' ? 'serif' : 'sans'
                    }`}
                    style={{
                      color: textColor,
                      fontSize: `${Math.max(10, fontSize * 0.9)}px`,
                      top: position.startsWith('top') ? `${marginOffset / 2}px` : 'auto',
                      bottom: position.startsWith('bottom') ? `${marginOffset / 2}px` : 'auto',
                      left: position.endsWith('left')
                        ? `${marginOffset / 2}px`
                        : position.endsWith('center')
                        ? '50%'
                        : 'auto',
                      right: position.endsWith('right') ? `${marginOffset / 2}px` : 'auto',
                      transform: position.endsWith('center') ? 'translateX(-50%)' : 'none',
                    }}
                  >
                    {getFormattedText(currentPreviewPage, totalPages)}
                  </div>
                </div>
              ) : (
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
