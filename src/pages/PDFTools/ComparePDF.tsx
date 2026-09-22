import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  FileText,
  SplitSquareVertical,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { formatFileSize } from '../../utils/fileHelpers';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const ComparePDF: React.FC = () => {
  usePageSEO({
    title: 'Compare PDF Files Online Free - Side-by-Side Visual Diff (No Watermark)',
    description: 'Compare two PDF documents side-by-side to visually inspect differences, modified text, and layout updates. 100% private in-browser RAM processing.',
    keywords: 'compare pdf, pdf diff online free, compare two pdf files, pdf version comparison, side by side pdf compare',
  });

  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [pagesA, setPagesA] = useState<number>(0);
  const [pagesB, setPagesB] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);

  const loadDocument = async (file: File, isA: boolean) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      if (isA) {
        setPagesA(pdf.numPages);
      } else {
        setPagesB(pdf.numPages);
      }
      await renderPagePreview(pdf, currentPage, isA);
    } catch (e: any) {
      console.error(e);
      alert('Failed to load PDF: ' + e.message);
    }
  };

  const renderPagePreview = async (pdf: any, pageNum: number, isA: boolean) => {
    if (pageNum > pdf.numPages) {
      if (isA) setPreviewA(null);
      else setPreviewB(null);
      return;
    }
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (isA) setPreviewA(dataUrl);
      else setPreviewB(dataUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isA: boolean) => {
    const f = e.target.files?.[0];
    if (f) {
      if (isA) {
        setFileA(f);
        loadDocument(f, true);
      } else {
        setFileB(f);
        loadDocument(f, false);
      }
    }
  };

  const goToPage = async (page: number) => {
    setCurrentPage(page);
    if (fileA) {
      const bufA = await fileA.arrayBuffer();
      const pdfA = await pdfjsLib.getDocument({ data: new Uint8Array(bufA) }).promise;
      renderPagePreview(pdfA, page, true);
    }
    if (fileB) {
      const bufB = await fileB.arrayBuffer();
      const pdfB = await pdfjsLib.getDocument({ data: new Uint8Array(bufB) }).promise;
      renderPagePreview(pdfB, page, false);
    }
  };

  const maxPages = Math.max(pagesA, pagesB) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Compare PDF Documents"
        description="Compare two versions of a PDF document side-by-side to visually inspect text updates, layout changes, and revisions."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Security Suite"
      />

      {/* Upload Dual Dropzone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A (Original) */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Document A (Original / Older)
            </span>
            {fileA && <span className="text-xs text-slate-400">{formatFileSize(fileA.size)}</span>}
          </div>

          {!fileA ? (
            <label className="border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/40">
              <FileText className="w-8 h-8 text-amber-400/80" />
              <span className="text-xs font-semibold text-slate-200">Select Original PDF</span>
              <span className="text-[10px] text-slate-400">PDF up to 100MB</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => handleFileChange(e, true)}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-xs font-semibold text-white truncate max-w-[200px]">{fileA.name}</span>
              <label className="text-xs text-amber-400 hover:underline cursor-pointer">
                Change
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => handleFileChange(e, true)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Document B (Revised) */}
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Document B (Revised / Newer)
            </span>
            {fileB && <span className="text-xs text-slate-400">{formatFileSize(fileB.size)}</span>}
          </div>

          {!fileB ? (
            <label className="border-2 border-dashed border-white/10 hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/40">
              <FileText className="w-8 h-8 text-cyan-400/80" />
              <span className="text-xs font-semibold text-slate-200">Select Revised PDF</span>
              <span className="text-[10px] text-slate-400">PDF up to 100MB</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => handleFileChange(e, false)}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-white/5">
              <span className="text-xs font-semibold text-white truncate max-w-[200px]">{fileB.name}</span>
              <label className="text-xs text-cyan-400 hover:underline cursor-pointer">
                Change
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => handleFileChange(e, false)}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Comparison View */}
      {fileA && fileB && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <SplitSquareVertical className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Comparing Page {currentPage} of {maxPages}</h4>
                <p className="text-xs text-slate-400">Doc A: {pagesA} pages • Doc B: {pagesB} pages</p>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs text-slate-200"
              >
                Previous Page
              </button>
              <span className="text-xs text-slate-400 font-mono px-2">{currentPage} / {maxPages}</span>
              <button
                onClick={() => goToPage(Math.min(maxPages, currentPage + 1))}
                disabled={currentPage >= maxPages}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs text-slate-200"
              >
                Next Page
              </button>
            </div>
          </div>

          {/* Side-by-Side Dual Visual View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* View A */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-amber-300 flex items-center justify-between">
                <span>Original (Doc A)</span>
                <span className="text-[10px] text-slate-400">Page {currentPage}</span>
              </div>
              <div className="w-full aspect-[1/1.35] bg-slate-950 rounded-xl overflow-hidden border border-amber-500/30 flex items-center justify-center p-3">
                {previewA ? (
                  <img
                    src={previewA}
                    alt="Doc A Preview"
                    className="max-h-full max-w-full object-contain shadow-md rounded"
                  />
                ) : (
                  <div className="text-xs text-slate-500">No page {currentPage} in Document A</div>
                )}
              </div>
            </div>

            {/* View B */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-cyan-300 flex items-center justify-between">
                <span>Revised (Doc B)</span>
                <span className="text-[10px] text-slate-400">Page {currentPage}</span>
              </div>
              <div className="w-full aspect-[1/1.35] bg-slate-950 rounded-xl overflow-hidden border border-cyan-500/30 flex items-center justify-center p-3">
                {previewB ? (
                  <img
                    src={previewB}
                    alt="Doc B Preview"
                    className="max-h-full max-w-full object-contain shadow-md rounded"
                  />
                ) : (
                  <div className="text-xs text-slate-500">No page {currentPage} in Document B</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
