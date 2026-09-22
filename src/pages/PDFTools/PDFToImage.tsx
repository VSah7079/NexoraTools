import React, { useState } from 'react';
import { Download, Trash2, Sparkles, FileArchive } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { renderPDFPageToCanvas, getPDFPageCount } from '../../utils/pdfUtils';
import { downloadCanvas } from '../../utils/fileHelpers';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

interface RenderedPage {
  pageNum: number;
  canvas: HTMLCanvasElement;
  previewUrl: string;
}

export const PDFToImage: React.FC = () => {
  usePageSEO({
    title: 'Free PDF to JPG Converter Online (Extract High Resolution Images)',
    description: 'Convert PDF pages to JPG or PNG images online for free. Extract individual pages in crisp 300 DPI high resolution or download all pages as a ZIP file with zero watermark.',
    keywords: 'pdf to jpg, pdf to image, convert pdf to jpg free, pdf to png, extract images from pdf, pdftojpg, pdf to photo converter, nexora tools',
    canonicalPath: '/pdf-to-jpg',
    categoryName: 'PDF Suite',
    toolName: 'PDF to JPG Converter',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setPdfFile(target);
    setIsRendering(true);
    setPages([]);

    try {
      const pageCount = await getPDFPageCount(target);
      const rendered: RenderedPage[] = [];

      for (let i = 1; i <= Math.min(pageCount, 30); i++) {
        const canvas = await renderPDFPageToCanvas(target, i, 2.0);
        rendered.push({
          pageNum: i,
          canvas,
          previewUrl: canvas.toDataURL('image/jpeg', 0.85),
        });
      }

      setPages(rendered);
      incrementStat('pdf');
    } catch (e) {
      console.error('PDF rendering error:', e);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadSingle = (page: RenderedPage) => {
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    const baseName = pdfFile ? pdfFile.name.replace(/\.[^/.]+$/, '') : 'document';
    downloadCanvas(page.canvas, `${baseName}-page-${page.pageNum}.${ext}`, format, 0.95);
  };

  const handleDownloadAllZip = async () => {
    if (pages.length === 0 || !pdfFile) return;

    const zip = new JSZip();
    const baseName = pdfFile.name.replace(/\.[^/.]+$/, '');
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';

    for (const page of pages) {
      const blob = await new Promise<Blob>((resolve) => {
        page.canvas.toBlob((b) => resolve(b || new Blob()), format, 0.95);
      });
      zip.file(`${baseName}-page-${page.pageNum}.${ext}`, blob);
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, `${baseName}-all-pages-images.zip`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="PDF to High-Res Image (JPG/PNG)"
        description="Extract every page from your PDF document into crisp 300 DPI high-resolution images in seconds."
        categoryName="PDF Suite"
        categoryPath="/pdf/pdf-to-image"
        badge="Zero Server Upload"
      />

      {!pdfFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            title="Upload PDF Document to Extract Images"
            subtitle="Extract pages into crystal clear JPG or lossless PNG images."
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">{pdfFile.name}</h3>
              <p className="text-xs text-slate-400">
                {isRendering ? 'Rendering pages in browser...' : `${pages.length} Pages Extracted`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setFormat('image/jpeg')}
                  className={`px-3 py-1 rounded-lg font-semibold ${
                    format === 'image/jpeg' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                  }`}
                >
                  JPG
                </button>
                <button
                  onClick={() => setFormat('image/png')}
                  className={`px-3 py-1 rounded-lg font-semibold ${
                    format === 'image/png' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                  }`}
                >
                  PNG
                </button>
              </div>

              <button
                onClick={handleDownloadAllZip}
                disabled={pages.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <FileArchive className="w-4 h-4" />
                <span>Download All as ZIP</span>
              </button>

              <button
                onClick={() => {
                  setPdfFile(null);
                  setPages([]);
                }}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl"
                title="Upload Another PDF"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isRendering ? (
            <div className="py-20 text-center text-slate-400">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold">Extracting high resolution pages in browser...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page) => (
                <div
                  key={page.pageNum}
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-white mb-3">
                    <img
                      src={page.previewUrl}
                      alt={`Page ${page.pageNum}`}
                      className="w-full h-auto object-contain"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-bold text-white">
                      Page {page.pageNum}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownloadSingle(page)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Page {page.pageNum}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
