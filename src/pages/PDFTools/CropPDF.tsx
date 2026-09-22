import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Crop,
  Download,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const CropPDF: React.FC = () => {
  usePageSEO({
    title: 'Crop PDF Online Free - Trim PDF Margins & Custom Crop Area (No Watermark)',
    description: 'Crop PDF pages visually or trim blank margins across all pages or single pages. 100% free client-side RAM processing.',
    keywords: 'crop pdf, trim pdf margins, crop pdf pages online free, pdf cropper no watermark, cut pdf borders',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Crop margins in percentage (top, right, bottom, left)
  const [cropMargins, setCropMargins] = useState<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });

  const [applyToAll, setApplyToAll] = useState<boolean>(true);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setCurrentPage(1);

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

  const handleCropDownload = async () => {
    if (!selectedFile) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
        if (applyToAll || idx === currentPage - 1) {
          const { width, height } = page.getSize();
          const cropX = (cropMargins.left / 100) * width;
          const cropY = (cropMargins.bottom / 100) * height;
          const cropW = width - cropX - (cropMargins.right / 100) * width;
          const cropH = height - cropY - (cropMargins.top / 100) * height;

          page.setCropBox(cropX, cropY, Math.max(10, cropW), Math.max(10, cropH));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_cropped_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error(err);
      alert('Failed to crop PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Crop PDF Margins & Custom Crop"
        description="Trim unwanted white borders, header margins, or custom-crop page viewports across all pages or single pages."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Edit Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop your PDF here to crop"
            subtitle="Trim margins • Custom crop box • 100% Client-Side Privacy"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Crop className="w-4 h-4 text-purple-400" />
                  Crop Margins
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

            {/* Margin Sliders */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Top Margin Trim</span>
                  <span>{cropMargins.top}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={cropMargins.top}
                  onChange={(e) => setCropMargins({ ...cropMargins, top: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Bottom Margin Trim</span>
                  <span>{cropMargins.bottom}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={cropMargins.bottom}
                  onChange={(e) => setCropMargins({ ...cropMargins, bottom: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Left Margin Trim</span>
                  <span>{cropMargins.left}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={cropMargins.left}
                  onChange={(e) => setCropMargins({ ...cropMargins, left: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>Right Margin Trim</span>
                  <span>{cropMargins.right}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={cropMargins.right}
                  onChange={(e) => setCropMargins({ ...cropMargins, right: Number(e.target.value) })}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-2">
              <div className="text-xs font-semibold text-slate-400">Quick Presets:</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCropMargins({ top: 0, right: 0, bottom: 0, left: 0 })}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium"
                >
                  Reset (0%)
                </button>
                <button
                  onClick={() => setCropMargins({ top: 5, right: 5, bottom: 5, left: 5 })}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium"
                >
                  Uniform 5%
                </button>
                <button
                  onClick={() => setCropMargins({ top: 10, right: 10, bottom: 10, left: 10 })}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 font-medium"
                >
                  Trim 10%
                </button>
              </div>
            </div>

            {/* Apply Scope */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToAll}
                  onChange={(e) => setApplyToAll(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs text-slate-300 font-medium">Apply crop margins to all {totalPages} pages</span>
              </label>
            </div>

            {/* Download Button */}
            <button
              onClick={handleCropDownload}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cropping PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Cropped PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Right Live Visual Box */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                Live Crop Box Preview (Page {currentPage} of {totalPages})
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

            {/* Document Preview with Overlay Shading for Cropped Area */}
            <div className="relative w-full aspect-[1/1.35] bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
              {previewImageUrl ? (
                <div className="relative max-h-full max-w-full shadow-2xl border border-white/20 bg-white">
                  <img
                    src={previewImageUrl}
                    alt="PDF Page Preview"
                    className="max-h-[500px] w-auto object-contain block"
                  />
                  {/* Crop box border */}
                  <div
                    className="absolute border-2 border-dashed border-purple-500 bg-purple-500/10 pointer-events-none transition-all duration-150"
                    style={{
                      top: `${cropMargins.top}%`,
                      bottom: `${cropMargins.bottom}%`,
                      left: `${cropMargins.left}%`,
                      right: `${cropMargins.right}%`,
                    }}
                  >
                    <span className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      Crop Area
                    </span>
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
