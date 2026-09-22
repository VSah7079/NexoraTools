import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Layers,
  Download,
  RotateCw,
  Trash2,
  Copy,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckSquare,
  Square,
  Scissors,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageItem {
  id: string;
  originalIndex: number;
  previewUrl: string;
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
}

export const OrganizePDF: React.FC = () => {
  usePageSEO({
    title: 'Organize PDF - Reorder, Remove & Extract Pages Free Online',
    description: 'Sort, reorder, rotate, delete and extract pages from your PDF document visually with 100% in-browser RAM privacy.',
    keywords: 'organize pdf, reorder pdf pages, remove pdf pages, extract pdf pages, rotate pdf pages online free',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setPages([]);
    await loadPdfPages(target);
  };

  const loadPdfPages = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Loading PDF pages...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const loadedPages: PageItem[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgressText(`Rendering page ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 0.8 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          loadedPages.push({
            id: `page-${pageNum}-${Date.now()}-${Math.random()}`,
            originalIndex: pageNum - 1,
            previewUrl: canvas.toDataURL('image/jpeg', 0.85),
            rotation: 0,
            selected: false,
          });
        }
      }

      setPages(loadedPages);
      incrementStat('pdf');
    } catch (err) {
      console.error('Failed to load PDF pages:', err);
      alert('Unable to load PDF document for organization.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  // Move page left
  const movePage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setPages(newPages);
  };

  // Rotate individual page
  const rotatePage = (index: number) => {
    const newPages = [...pages];
    newPages[index].rotation = (newPages[index].rotation + 90) % 360;
    setPages(newPages);
  };

  // Rotate all pages
  const rotateAllPages = () => {
    const newPages = pages.map((p) => ({
      ...p,
      rotation: (p.rotation + 90) % 360,
    }));
    setPages(newPages);
  };

  // Delete page
  const deletePage = (index: number) => {
    if (pages.length <= 1) {
      alert('A document must have at least one page.');
      return;
    }
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
  };

  // Duplicate page
  const duplicatePage = (index: number) => {
    const pageToDup = pages[index];
    const newPage: PageItem = {
      ...pageToDup,
      id: `page-dup-${Date.now()}-${Math.random()}`,
    };
    const newPages = [...pages];
    newPages.splice(index + 1, 0, newPage);
    setPages(newPages);
  };

  // Toggle selection
  const toggleSelect = (index: number) => {
    const newPages = [...pages];
    newPages[index].selected = !newPages[index].selected;
    setPages(newPages);
  };

  // Select all / Deselect all
  const toggleSelectAll = () => {
    const allSelected = pages.every((p) => p.selected);
    const newPages = pages.map((p) => ({ ...p, selected: !allSelected }));
    setPages(newPages);
  };

  // Delete selected
  const deleteSelected = () => {
    const remaining = pages.filter((p) => !p.selected);
    if (remaining.length === 0) {
      alert('You cannot delete all pages.');
      return;
    }
    setPages(remaining);
  };

  // Export organized PDF
  const exportPDF = async (onlySelected = false) => {
    if (!selectedFile) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const outDoc = await PDFDocument.create();

      const exportTargetPages = onlySelected
        ? pages.filter((p) => p.selected)
        : pages;

      if (exportTargetPages.length === 0) {
        alert('No pages selected to export.');
        setIsExporting(false);
        return;
      }

      for (const pageItem of exportTargetPages) {
        const [copiedPage] = await outDoc.copyPages(srcDoc, [pageItem.originalIndex]);
        if (pageItem.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + pageItem.rotation));
        }
        outDoc.addPage(copiedPage);
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const filename = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_organized.pdf`;
      saveAs(blob, filename);
      incrementStat('pdf');
    } catch (err) {
      console.error('Error organizing PDF:', err);
      alert('Failed to save organized PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToolHeader
        title="Organize PDF Pages Studio"
        description="Visually reorder, rotate, duplicate, delete and extract pages from PDF documents with interactive drag-and-sort controls. 100% in-browser RAM privacy."
        categoryName="PDF & Office"
        categoryPath="/pdf/organize"
        badge="Interactive Page Studio"
      />

      {!selectedFile ? (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <UploadZone
              accept=".pdf,application/pdf"
              onFileSelect={handleFileSelect}
              title="Upload PDF Document to Organize"
              subtitle="Drag & drop any PDF to visually reorder, rotate, delete or extract pages"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-rose-400 block mb-1">Visual Page Grid</span>
              <span className="text-xs text-slate-400">Reorder pages with 1-click moves, rotate 90° and duplicate</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Extract &amp; Remove</span>
              <span className="text-xs text-slate-400">Select unwanted pages to delete or extract selected into a new PDF</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% In-Browser</span>
              <span className="text-xs text-slate-400">Zero file uploads to cloud servers. Pure RAM manipulation</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Top Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{selectedFile.name}</h3>
                <p className="text-xs text-slate-400">
                  {formatFileSize(selectedFile.size)} • {pages.length} Pages • {selectedCount} Selected
                </p>
              </div>
            </div>

            {/* Middle Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                {pages.every((p) => p.selected) ? <CheckSquare className="w-3.5 h-3.5 text-rose-400" /> : <Square className="w-3.5 h-3.5" />}
                {pages.every((p) => p.selected) ? 'Deselect All' : 'Select All'}
              </button>

              <button
                onClick={rotateAllPages}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Rotate All 90°
              </button>

              {selectedCount > 0 && (
                <>
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition border border-red-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Selected ({selectedCount})
                  </button>

                  <button
                    onClick={() => exportPDF(true)}
                    disabled={isExporting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Extract Selected ({selectedCount})
                  </button>
                </>
              )}
            </div>

            {/* Right Export Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPages([]);
                }}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Change PDF
              </button>

              <button
                onClick={() => exportPDF(false)}
                disabled={isExporting || pages.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-semibold text-xs shadow-lg shadow-rose-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Save Organized PDF ({pages.length} Pages)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="p-12 text-center bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-300">{progressText}</p>
            </div>
          )}

          {/* Visual Page Grid */}
          {!isProcessing && pages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pages.map((page, idx) => (
                <div
                  key={page.id}
                  onClick={() => toggleSelect(idx)}
                  className={`p-3 rounded-2xl border transition-all duration-150 relative group cursor-pointer ${
                    page.selected
                      ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/50 shadow-xl shadow-rose-950/40'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-lg'
                  }`}
                >
                  {/* Selection Checkmark */}
                  <div className="absolute top-2 left-2 z-10">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        page.selected
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'bg-slate-950/80 border border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>

                  {/* Page Number Badge */}
                  <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 text-[10px] font-bold text-slate-300">
                    {idx + 1}
                  </div>

                  {/* Page Canvas Preview */}
                  <div className="aspect-[1/1.414] w-full rounded-xl bg-white overflow-hidden my-6 border border-slate-700 shadow-inner flex items-center justify-center">
                    <img
                      src={page.previewUrl}
                      alt={`Page ${idx + 1}`}
                      style={{ transform: `rotate(${page.rotation}deg)` }}
                      className="w-full h-full object-contain transition-transform duration-200"
                    />
                  </div>

                  {/* Page Card Actions Bar */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-slate-400"
                  >
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => movePage(idx, 'left')}
                        disabled={idx === 0}
                        title="Move Page Left"
                        className="p-1 rounded-md hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePage(idx, 'right')}
                        disabled={idx === pages.length - 1}
                        title="Move Page Right"
                        className="p-1 rounded-md hover:bg-slate-800 hover:text-white disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => rotatePage(idx)}
                        title="Rotate Page 90°"
                        className="p-1 rounded-md hover:bg-slate-800 hover:text-rose-400 transition cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => duplicatePage(idx)}
                        title="Duplicate Page"
                        className="p-1 rounded-md hover:bg-slate-800 hover:text-indigo-400 transition cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePage(idx)}
                        title="Delete Page"
                        className="p-1 rounded-md hover:bg-red-500/20 hover:text-red-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
