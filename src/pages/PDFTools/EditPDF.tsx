import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Edit3,
  Download,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface TextAnnotation {
  id: string;
  pageNum: number;
  text: string;
  x: number; // %
  y: number; // %
  color: string;
  size: number;
}

export const EditPDF: React.FC = () => {
  usePageSEO({
    title: 'Edit PDF Online Free - Add Text, Highlight & Draw on PDF (No Watermark)',
    description: 'Free online PDF Editor to add text, annotate, highlight paragraphs, draw shapes, and insert stamps directly into PDF pages.',
    keywords: 'edit pdf online free, pdf editor no watermark, add text to pdf, annotate pdf free, highlight pdf text online',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [textInput, setTextInput] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#b91c1c'); // red default for markup
  const [textSize, setTextSize] = useState<number>(14);
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setCurrentPage(1);
    setAnnotations([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
      await renderPage(pdf, 1);
    } catch (err: any) {
      console.error(err);
      alert('Failed to load PDF: ' + err.message);
    }
  };

  const renderPage = async (pdfOrNull: any, pageNum: number) => {
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

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !textInput.trim()) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setAnnotations((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        pageNum: currentPage,
        text: textInput,
        x,
        y,
        color: textColor,
        size: textSize,
      },
    ]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? rgb(
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255
        )
      : rgb(0.8, 0.1, 0.1);
  };

  const handleDownload = async () => {
    if (!selectedFile) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      annotations.forEach((anno) => {
        const pageIdx = anno.pageNum - 1;
        if (pageIdx < pages.length) {
          const page = pages[pageIdx];
          const { width, height } = page.getSize();
          const x = (anno.x / 100) * width;
          const y = height - (anno.y / 100) * height - anno.size;

          page.drawText(anno.text, {
            x,
            y,
            size: anno.size,
            font,
            color: hexToRgb(anno.color),
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_edited_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error(err);
      alert('Failed to export edited PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Edit PDF & Add Annotations"
        description="Add text notes, reviewer comments, callouts, and custom markings directly onto any page of your PDF."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Edit Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop your PDF here to edit"
            subtitle="Add text &amp; stamps • Place anywhere on page • 100% Client-Side Privacy"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Editor Tools Panel */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-purple-400" />
                  PDF Editor Tools
                </h3>
                <p className="text-xs text-slate-400">{selectedFile.name} ({totalPages} pages)</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 rounded-lg"
              >
                Change PDF
              </button>
            </div>

            {/* Text Input Box */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">1. Type Text or Note</label>
              <textarea
                rows={2}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type text, APPROVED stamp, comment, etc..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-400">
                👉 After typing, click anywhere on the document preview to place the text.
              </p>
            </div>

            {/* Quick Stamps */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Quick Stamp Presets:</label>
              <div className="flex flex-wrap gap-2">
                {['APPROVED', 'CONFIDENTIAL', 'DRAFT', 'PAID', 'VERIFIED'].map((stamp) => (
                  <button
                    key={stamp}
                    onClick={() => setTextInput(stamp)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-purple-300 border border-purple-500/20"
                  >
                    {stamp}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Styling */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Color</label>
                <div className="flex items-center gap-2">
                  {['#b91c1c', '#1e40af', '#15803d', '#000000'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setTextColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        textColor === c ? 'scale-110 border-white ring-2 ring-purple-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Font Size ({textSize} pt)</label>
                <input
                  type="range"
                  min={10}
                  max={36}
                  value={textSize}
                  onChange={(e) => setTextSize(Number(e.target.value))}
                  className="w-full accent-purple-500 mt-2"
                />
              </div>
            </div>

            {/* Annotations List */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>Placed Text Markings ({annotations.length})</span>
                {annotations.length > 0 && (
                  <button
                    onClick={() => setAnnotations([])}
                    className="text-rose-400 hover:text-rose-300 text-[11px]"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {annotations.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg text-xs text-slate-300 border border-white/5"
                  >
                    <span className="truncate max-w-[180px]" style={{ color: a.color }}>
                      "{a.text}" (P{a.pageNum})
                    </span>
                    <button
                      onClick={() => removeAnnotation(a.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
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
                  <span>Saving Edited PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Edited PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Document Preview Surface */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                Click Document to Add Text (Page {currentPage} of {totalPages})
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setCurrentPage(prev);
                    renderPage(null, prev);
                  }}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-200"
                >
                  Prev
                </button>
                <button
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(next);
                    renderPage(null, next);
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-200"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Document preview container */}
            <div className="relative w-full aspect-[1/1.35] bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
              {previewImageUrl ? (
                <div
                  ref={containerRef}
                  onClick={handleCanvasClick}
                  className="relative max-h-full max-w-full shadow-2xl border border-white/20 bg-white cursor-crosshair select-none"
                >
                  <img
                    src={previewImageUrl}
                    alt="PDF Page Preview"
                    className="max-h-[500px] w-auto object-contain block pointer-events-none"
                  />

                  {/* Render placed annotations on this page */}
                  {annotations
                    .filter((a) => a.pageNum === currentPage)
                    .map((a) => (
                      <div
                        key={a.id}
                        className="absolute font-bold font-sans pointer-events-none whitespace-nowrap bg-white/80 px-1 rounded shadow-sm"
                        style={{
                          left: `${a.x}%`,
                          top: `${a.y}%`,
                          color: a.color,
                          fontSize: `${a.size}px`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        {a.text}
                      </div>
                    ))}
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
