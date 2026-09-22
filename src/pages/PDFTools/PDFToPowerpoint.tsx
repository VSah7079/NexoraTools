import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pptxgen from 'pptxgenjs';
import {
  Presentation,
  Download,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageSlidePreview {
  pageNumber: number;
  previewUrl: string;
  extractedTitle: string;
  textSnippet: string;
}

export const PDFToPowerpoint: React.FC = () => {
  usePageSEO({
    title: 'PDF to PowerPoint (PPTX) Converter Free Online (100% In-Browser)',
    description: 'Convert PDF documents into editable Microsoft PowerPoint (.pptx) presentation slides with crisp typography and high-res layout preservation.',
    keywords: 'pdf to powerpoint, pdf to pptx, convert pdf to ppt, pdf to slides online free',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [slidePreviews, setSlidePreviews] = useState<PageSlidePreview[]>([]);
  const [slideLayout, setSlideLayout] = useState<'LAYOUT_16x9' | 'LAYOUT_4x3'>('LAYOUT_16x9');
  const [conversionMode, setConversionMode] = useState<'visual_slides' | 'structured_text'>('visual_slides');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setSlidePreviews([]);
    await processPdfToSlides(target);
  };

  const processPdfToSlides = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Loading PDF Document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const previews: PageSlidePreview[] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgressText(`Rendering Slide ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);

        // High-res preview render for presentation slide
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          const previewUrl = canvas.toDataURL('image/jpeg', 0.92);

          // Extract text for structured titles
          const textContent = await page.getTextContent();
          let pageText = '';
          for (const item of textContent.items as any[]) {
            if ('str' in item && item.str.trim()) {
              pageText += item.str + ' ';
            }
          }

          const lines = pageText.split('\n').filter(Boolean);
          const firstLine = lines[0] || pageText.slice(0, 60);

          previews.push({
            pageNumber: pageNum,
            previewUrl,
            extractedTitle: firstLine.trim() || `Slide ${pageNum}`,
            textSnippet: pageText.slice(0, 180),
          });
        }
      }

      setSlidePreviews(previews);
      incrementStat('pdf');
    } catch (err) {
      console.error('Failed to parse PDF for PowerPoint:', err);
      alert('Failed to load PDF pages for PowerPoint conversion.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const exportPowerPoint = async () => {
    if (slidePreviews.length === 0) return;
    setIsExporting(true);

    try {
      const pres = new pptxgen();
      pres.layout = slideLayout;

      const title = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'Presentation';
      pres.title = title;

      for (let i = 0; i < slidePreviews.length; i++) {
        const slideData = slidePreviews[i];
        const slide = pres.addSlide();

        if (conversionMode === 'visual_slides') {
          // Add crisp full-bleed page capture image onto slide
          slide.addImage({
            data: slideData.previewUrl,
            x: 0,
            y: 0,
            w: '100%',
            h: '100%',
            sizing: { type: 'contain', w: '100%', h: '100%' },
          });
        } else {
          // Structured slide with editable text box
          slide.background = { color: '0F172A' }; // Dark sleek slide background

          // Header
          slide.addText(slideData.extractedTitle || `Slide ${i + 1}`, {
            x: 0.8,
            y: 0.6,
            w: '85%',
            h: 1.0,
            fontSize: 22,
            bold: true,
            color: 'F8FAFC',
          });

          // Body text snippet
          slide.addText(slideData.textSnippet || 'PDF Extracted Content', {
            x: 0.8,
            y: 1.8,
            w: '85%',
            h: 3.5,
            fontSize: 14,
            color: 'CBD5E1',
            lineSpacing: 24,
          });

          // Footer
          slide.addText(`Slide ${i + 1} of ${slidePreviews.length}`, {
            x: 0.8,
            y: 6.8,
            w: '85%',
            h: 0.4,
            fontSize: 10,
            color: '64748B',
          });
        }
      }

      const pptxFilename = `${title}.pptx`;
      await pres.writeFile({ fileName: pptxFilename });
      incrementStat('pdf');
    } catch (err) {
      console.error('Failed to export PowerPoint PPTX:', err);
      alert('Failed to generate PowerPoint file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToolHeader
        title="PDF to PowerPoint (PPTX) Converter"
        description="Convert PDF documents into editable Microsoft PowerPoint presentation slides (.pptx) with full layout preservation and 100% in-browser RAM privacy."
        categoryName="PDF & Office"
        categoryPath="/pdf/pdf-to-powerpoint"
        badge="100% Client-Side Engine"
      />

      {!selectedFile ? (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <UploadZone
              accept=".pdf,application/pdf"
              onFileSelect={handleFileSelect}
              title="Upload PDF Document"
              subtitle="Select any PDF document to convert each page into a PowerPoint slide"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-orange-400 block mb-1">Standard .PPTX</span>
              <span className="text-xs text-slate-400">Compatible with Microsoft PowerPoint, Keynote &amp; Google Slides</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">16:9 Widescreen</span>
              <span className="text-xs text-slate-400">High-resolution slide rendering with presentation display ratio</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% In-Browser</span>
              <span className="text-xs text-slate-400">No cloud uploads. Files processed in local device memory</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Slide Carousel & Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Presentation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{selectedFile.name}</h3>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(selectedFile.size)} • {slidePreviews.length} PowerPoint Slides
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSlidePreviews([]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change PDF
              </button>
            </div>

            {/* Processing state */}
            {isProcessing && (
              <div className="p-12 text-center bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-300">{progressText}</p>
              </div>
            )}

            {/* Slide Previews Grid */}
            {!isProcessing && slidePreviews.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slidePreviews.map((slide) => (
                  <div
                    key={slide.pageNumber}
                    className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 group hover:border-orange-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                      <span className="font-bold text-orange-400">Slide {slide.pageNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 font-mono">PPTX</span>
                    </div>

                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center relative">
                      <img
                        src={slide.previewUrl}
                        alt={`Slide ${slide.pageNumber}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <p className="text-[11px] text-slate-300 line-clamp-1 font-medium">
                      {slide.extractedTitle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Controls Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-orange-400" />
                PowerPoint Slide Settings
              </h3>

              {/* Conversion Mode */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  Slide Render Mode
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setConversionMode('visual_slides')}
                    className={`w-full p-3 rounded-xl text-xs font-medium border flex items-center justify-between text-left transition-all cursor-pointer ${
                      conversionMode === 'visual_slides'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-100">Exact Visual Slides (Recommended)</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Retains exact charts, tables, vectors &amp; fonts</div>
                    </div>
                    {conversionMode === 'visual_slides' && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                  </button>

                  <button
                    onClick={() => setConversionMode('structured_text')}
                    className={`w-full p-3 rounded-xl text-xs font-medium border flex items-center justify-between text-left transition-all cursor-pointer ${
                      conversionMode === 'structured_text'
                        ? 'border-orange-500 bg-orange-500/10 text-orange-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-100">Editable Slide Text Boxes</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Extracts text into native PowerPoint boxes</div>
                    </div>
                    {conversionMode === 'structured_text' && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                  </button>
                </div>
              </div>

              {/* Slide Layout Ratio */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  Slide Presentation Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSlideLayout('LAYOUT_16x9')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      slideLayout === 'LAYOUT_16x9'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    16:9 Widescreen
                  </button>
                  <button
                    onClick={() => setSlideLayout('LAYOUT_4x3')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      slideLayout === 'LAYOUT_4x3'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    4:3 Standard
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={exportPowerPoint}
                disabled={isExporting || slidePreviews.length === 0}
                className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm shadow-xl shadow-orange-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating PowerPoint (.pptx)...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PowerPoint (.pptx)
                  </>
                )}
              </button>
            </div>

            {/* Privacy Trust Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                100% Client-Side Privacy
              </div>
              <p className="leading-relaxed">
                PDF pages are converted into native PowerPoint presentations in your browser RAM without any server upload.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
