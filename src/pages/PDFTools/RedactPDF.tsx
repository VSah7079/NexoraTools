import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  ShieldAlert,
  Download,
  RefreshCw,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface RedactBox {
  id: string;
  pageNum: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage
  height: number; // percentage
}

export const RedactPDF: React.FC = () => {
  usePageSEO({
    title: 'Redact PDF Online Free - Blackout Sensitive Text & PII (Permanent No Watermark)',
    description: 'Permanently blackout confidential information, Aadhaar/SSN numbers, and sensitive text in PDF. 100% private in-browser RAM sanitization.',
    keywords: 'redact pdf, blackout pdf text, pdf redaction tool free, sanitize pdf online, remove confidential info pdf no watermark',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [redactBoxes, setRedactBoxes] = useState<RedactBox[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [redactColor, setRedactColor] = useState<'black' | 'white'>('black');

  // Box drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement | null>(null);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setCurrentPage(1);
    setRedactBoxes([]);

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
      const viewport = page.getViewport({ scale: 1.3 });
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPos || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const minX = Math.min(startPos.x, currentX);
    const minY = Math.min(startPos.y, currentY);
    const w = Math.abs(currentX - startPos.x);
    const h = Math.abs(currentY - startPos.y);

    setCurrentBox({ x: minX, y: minY, width: w, height: h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;
    setIsDrawing(false);
    if (currentBox.width > 1 && currentBox.height > 1) {
      setRedactBoxes((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          pageNum: currentPage,
          x: currentBox.x,
          y: currentBox.y,
          width: currentBox.width,
          height: currentBox.height,
        },
      ]);
    }
    setCurrentBox(null);
    setStartPos(null);
  };

  const removeBox = (id: string) => {
    setRedactBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  const clearCurrentPageBoxes = () => {
    setRedactBoxes((prev) => prev.filter((b) => b.pageNum !== currentPage));
  };

  const handleSaveRedactedPDF = async () => {
    if (!selectedFile) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      const fillColor = redactColor === 'black' ? rgb(0, 0, 0) : rgb(1, 1, 1);

      redactBoxes.forEach((box) => {
        const pageIdx = box.pageNum - 1;
        if (pageIdx < pages.length) {
          const page = pages[pageIdx];
          const { width, height } = page.getSize();

          const boxW = (box.width / 100) * width;
          const boxH = (box.height / 100) * height;
          const boxX = (box.x / 100) * width;
          const boxY = height - (box.y / 100) * height - boxH;

          page.drawRectangle({
            x: boxX,
            y: boxY,
            width: boxW,
            height: boxH,
            color: fillColor,
            opacity: 1.0,
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_redacted_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save redacted PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Redact PDF & Blackout Sensitive Data"
        description="Permanently redact and sanitize sensitive text, numbers, PII, and financial accounts with blackout or whiteout boxes."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Security Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop your PDF here to redact confidential info"
            subtitle="Draw blackout boxes • Permanent pixel burn • 100% Client-Side Privacy"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Redaction Tools
                </h3>
                <p className="text-xs text-slate-400">{selectedFile.name} ({totalPages} pages)</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 rounded-lg"
              >
                Change File
              </button>
            </div>

            {/* Instruction */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Click &amp; Drag on Document
              </div>
              <p className="text-slate-400 text-[11px]">
                Click and drag your mouse over any sensitive area on the preview page to place a permanent redaction block.
              </p>
            </div>

            {/* Redact Color */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Redaction Mask Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRedactColor('black')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    redactColor === 'black'
                      ? 'bg-black text-white border-white/30 shadow-lg'
                      : 'bg-slate-800/80 text-slate-400 border-white/5'
                  }`}
                >
                  <div className="w-3 h-3 bg-black border border-white/40 rounded-sm" />
                  <span>Blackout (Default)</span>
                </button>
                <button
                  onClick={() => setRedactColor('white')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    redactColor === 'white'
                      ? 'bg-slate-200 text-slate-900 border-white shadow-lg'
                      : 'bg-slate-800/80 text-slate-400 border-white/5'
                  }`}
                >
                  <div className="w-3 h-3 bg-white border border-slate-300 rounded-sm" />
                  <span>Whiteout Mask</span>
                </button>
              </div>
            </div>

            {/* Redaction List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Active Redactions ({redactBoxes.length})</span>
                {redactBoxes.filter((b) => b.pageNum === currentPage).length > 0 && (
                  <button
                    onClick={clearCurrentPageBoxes}
                    className="text-rose-400 hover:text-rose-300 text-[11px]"
                  >
                    Clear Page {currentPage}
                  </button>
                )}
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {redactBoxes.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-white/5">
                    No redactions placed yet. Drag on preview.
                  </div>
                ) : (
                  redactBoxes.map((b, idx) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-2 bg-slate-950/60 rounded-lg text-xs text-slate-300 border border-white/5"
                    >
                      <span>Box #{idx + 1} (Page {b.pageNum})</span>
                      <button
                        onClick={() => removeBox(b.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleSaveRedactedPDF}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-rose-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Applying Redactions...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Redacted PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Document Redaction Surface */}
          <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-400" />
                Select Redact Regions (Page {currentPage} of {totalPages})
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
                  Prev Page
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
                  Next Page
                </button>
              </div>
            </div>

            {/* Document Canvas Container */}
            <div className="relative w-full aspect-[1/1.35] bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
              {previewImageUrl ? (
                <div
                  ref={imageContainerRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="relative max-h-full max-w-full shadow-2xl border border-white/20 bg-white cursor-crosshair select-none"
                >
                  <img
                    src={previewImageUrl}
                    alt="PDF Page"
                    className="max-h-[520px] w-auto object-contain block pointer-events-none"
                  />

                  {/* Render saved redaction boxes for this page */}
                  {redactBoxes
                    .filter((b) => b.pageNum === currentPage)
                    .map((b) => (
                      <div
                        key={b.id}
                        className={`absolute border border-red-500/50 ${
                          redactColor === 'black' ? 'bg-black' : 'bg-white'
                        }`}
                        style={{
                          left: `${b.x}%`,
                          top: `${b.y}%`,
                          width: `${b.width}%`,
                          height: `${b.height}%`,
                        }}
                      />
                    ))}

                  {/* Render actively drawing box */}
                  {currentBox && (
                    <div
                      className="absolute border-2 border-red-500 bg-black/80"
                      style={{
                        left: `${currentBox.x}%`,
                        top: `${currentBox.y}%`,
                        width: `${currentBox.width}%`,
                        height: `${currentBox.height}%`,
                      }}
                    />
                  )}
                </div>
              ) : (
                <RefreshCw className="w-8 h-8 text-rose-400 animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
