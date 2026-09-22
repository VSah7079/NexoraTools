import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  RotateCw,
  RotateCcw,
  RefreshCw,
  Download,
  FileText,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageThumb {
  pageNumber: number;
  dataUrl: string;
  rotation: number; // 0, 90, 180, 270
}

export const RotatePDF: React.FC = () => {
  usePageSEO({
    title: 'Rotate PDF Online Free - Rotate Specific or All PDF Pages (No Watermark)',
    description: 'Permanently rotate PDF pages clockwise or counterclockwise by 90°, 180°, or 270°. 100% free client-side RAM processing.',
    keywords: 'rotate pdf, rotate pdf pages online, free pdf rotator, rotate pdf 90 degrees, save rotated pdf no watermark',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageThumb[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setPages([]);
    setIsLoading(true);
    setLoadingText('Loading PDF and rendering page previews...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const thumbs: PageThumb[] = [];

      for (let i = 1; i <= numPages; i++) {
        setLoadingText(`Rendering preview for page ${i} of ${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          thumbs.push({
            pageNumber: i,
            dataUrl: canvas.toDataURL('image/jpeg', 0.85),
            rotation: 0,
          });
        }
      }
      setPages(thumbs);
    } catch (err: any) {
      console.error('Failed to load PDF:', err);
      alert('Could not render PDF. Please ensure the file is not password protected.');
    } finally {
      setIsLoading(false);
    }
  };

  const rotatePage = (pageNumber: number, dir: 'cw' | 'ccw') => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber === pageNumber) {
          const delta = dir === 'cw' ? 90 : -90;
          let newRot = (p.rotation + delta) % 360;
          if (newRot < 0) newRot += 360;
          return { ...p, rotation: newRot };
        }
        return p;
      })
    );
  };

  const rotateAll = (dir: 'cw' | 'ccw') => {
    const delta = dir === 'cw' ? 90 : -90;
    setPages((prev) =>
      prev.map((p) => {
        let newRot = (p.rotation + delta) % 360;
        if (newRot < 0) newRot += 360;
        return { ...p, rotation: newRot };
      })
    );
  };

  const resetAllRotations = () => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: 0 })));
  };

  const handleDownload = async () => {
    if (!selectedFile) return;
    setIsExporting(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdfDoc.getPages();

      pages.forEach((p, idx) => {
        if (idx < pdfPages.length && p.rotation !== 0) {
          const currentRotation = pdfPages[idx].getRotation().angle;
          pdfPages[idx].setRotation(degrees((currentRotation + p.rotation) % 360));
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_rotated_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error('Failed to export rotated PDF:', err);
      alert('Error exporting PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Rotate PDF Pages"
        description="Permanently rotate entire PDF documents or select individual pages by 90°, 180°, or 270° clockwise or counterclockwise with instant preview."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Edit Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop your PDF here to rotate"
            subtitle="Rotate individual pages or entire document • 100% Private in Browser RAM"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Action Bar */}
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm sm:text-base flex items-center gap-2">
                  {selectedFile.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                    {pages.length} Pages
                  </span>
                </h3>
                <p className="text-slate-400 text-xs">{formatFileSize(selectedFile.size)} • Client RAM Protected</p>
              </div>
            </div>

            {/* Quick Bulk Rotations */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => rotateAll('ccw')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 text-xs font-medium transition-all shadow-md active:scale-95"
                title="Rotate all pages 90° Left"
              >
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span>Rotate All Left (90°)</span>
              </button>

              <button
                onClick={() => rotateAll('cw')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 text-xs font-medium transition-all shadow-md active:scale-95"
                title="Rotate all pages 90° Right"
              >
                <RotateCw className="w-3.5 h-3.5 text-purple-400" />
                <span>Rotate All Right (90°)</span>
              </button>

              <button
                onClick={resetAllRotations}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-slate-200 border border-white/10 text-xs font-medium transition-all"
                title="Reset all rotations to 0°"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPages([]);
                }}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-all"
              >
                Change File
              </button>

              <button
                onClick={handleDownload}
                disabled={isExporting || isLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Rotated PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading status */}
          {isLoading && (
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-slate-300 text-sm font-medium">{loadingText}</p>
            </div>
          )}

          {/* Page Grid */}
          {!isLoading && pages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {pages.map((p) => (
                <div
                  key={p.pageNumber}
                  className="group relative bg-slate-900/80 border border-white/10 hover:border-purple-500/50 rounded-2xl p-3 flex flex-col items-center gap-3 transition-all hover:shadow-xl hover:shadow-purple-500/10"
                >
                  {/* Page Badge & Rotation Indicator */}
                  <div className="w-full flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-md border border-white/5">
                      Page {p.pageNumber}
                    </span>
                    {p.rotation !== 0 && (
                      <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                        {p.rotation}°
                      </span>
                    )}
                  </div>

                  {/* Thumbnail with visual rotation */}
                  <div className="w-full aspect-[3/4] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-white/5 relative">
                    <img
                      src={p.dataUrl}
                      alt={`Page ${p.pageNumber}`}
                      className="max-w-full max-h-full object-contain rounded shadow-md transition-transform duration-300 ease-in-out"
                      style={{ transform: `rotate(${p.rotation}deg)` }}
                    />
                  </div>

                  {/* Action Buttons for this Page */}
                  <div className="w-full flex items-center justify-center gap-2 pt-1 border-t border-white/5">
                    <button
                      onClick={() => rotatePage(p.pageNumber, 'ccw')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 hover:text-purple-300 text-slate-300 border border-white/10 transition-colors"
                      title="Rotate 90° Left"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => rotatePage(p.pageNumber, 'cw')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600/30 hover:text-purple-300 text-slate-300 border border-white/10 transition-colors"
                      title="Rotate 90° Right"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
