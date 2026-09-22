import React, { useState } from 'react';
import JSZip from 'jszip';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
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

interface SlideData {
  slideNumber: number;
  title: string;
  contents: string[];
}

type SlideTheme = 'modern' | 'dark' | 'clean' | 'slate';

export const PowerpointToPDF: React.FC = () => {
  usePageSEO({
    title: 'PowerPoint (PPTX) to PDF Converter Free Online (100% In-Browser)',
    description: 'Convert Microsoft PowerPoint presentations (.pptx) into print-ready, high-resolution A4 or 16:9 widescreen PDF documents with zero server upload.',
    keywords: 'powerpoint to pdf, pptx to pdf, convert pptx to pdf, ppt to pdf, presentation to pdf online free',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<SlideTheme>('modern');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | 'A4'>('16:9');
  const [includeSlideNumbers, setIncludeSlideNumbers] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setSlides([]);
    await parsePptx(target);
  };

  const parsePptx = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Extracting presentation structure...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Find all slide XML files
      const slideFileNames = Object.keys(zip.files).filter((name) =>
        /^ppt\/slides\/slide\d+\.xml$/.test(name)
      );

      // Sort naturally by slide number (e.g. slide1, slide2, slide10)
      slideFileNames.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
        return numA - numB;
      });

      const extractedSlides: SlideData[] = [];
      const parser = new DOMParser();

      for (let i = 0; i < slideFileNames.length; i++) {
        const fileName = slideFileNames[i];
        setProgressText(`Parsing Slide ${i + 1} of ${slideFileNames.length}...`);
        const xmlText = await zip.files[fileName].async('text');
        const doc = parser.parseFromString(xmlText, 'application/xml');

        // Extract text elements: <a:t> inside <a:p>
        const paragraphs = doc.getElementsByTagName('a:p');
        const slideTexts: string[] = [];
        let slideTitle = '';

        for (let p = 0; p < paragraphs.length; p++) {
          const pEl = paragraphs[p];
          const textRuns = pEl.getElementsByTagName('a:t');
          let paragraphText = '';
          for (let r = 0; r < textRuns.length; r++) {
            paragraphText += textRuns[r].textContent || '';
          }
          paragraphText = paragraphText.trim();
          if (paragraphText) {
            // First substantial heading text is treated as slide title
            if (!slideTitle && paragraphText.length < 80) {
              slideTitle = paragraphText;
            } else {
              slideTexts.push(paragraphText);
            }
          }
        }

        extractedSlides.push({
          slideNumber: i + 1,
          title: slideTitle || `Slide ${i + 1}`,
          contents: slideTexts.length > 0 ? slideTexts : ['[Visual Slide Content / Graphics]'],
        });
      }

      setSlides(extractedSlides);
      incrementStat('pdf');
    } catch (err) {
      console.error('Failed to parse PPTX:', err);
      alert('Unable to extract presentation structure. Please ensure this is a valid Microsoft PowerPoint (.pptx) file.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const generatePDF = async () => {
    if (slides.length === 0) return;
    setIsExporting(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      // Page dimensions in pt
      let pageWidth = 841.89; // 16:9 standard pt (approx 297mm x 167mm or 1920x1080 scaled)
      let pageHeight = 473.56;

      if (aspectRatio === '4:3') {
        pageWidth = 720;
        pageHeight = 540;
      } else if (aspectRatio === 'A4') {
        pageWidth = 841.89; // A4 Landscape
        pageHeight = 595.28;
      }

      for (const slide of slides) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Background theme coloring
        if (selectedTheme === 'dark') {
          page.drawRectangle({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            color: rgb(0.06, 0.08, 0.12),
          });
        } else if (selectedTheme === 'modern') {
          // Soft off-white canvas with indigo accent bar
          page.drawRectangle({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            color: rgb(0.97, 0.98, 1.0),
          });
          // Top accent bar
          page.drawRectangle({
            x: 0,
            y: pageHeight - 8,
            width: pageWidth,
            height: 8,
            color: rgb(0.35, 0.38, 0.98),
          });
        } else if (selectedTheme === 'slate') {
          page.drawRectangle({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            color: rgb(0.12, 0.15, 0.2),
          });
        } else {
          // Clean white
          page.drawRectangle({
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
            color: rgb(1, 1, 1),
          });
        }

        const margin = 48;
        let currentY = pageHeight - margin - 20;

        // Colors
        const titleColor =
          selectedTheme === 'dark' || selectedTheme === 'slate'
            ? rgb(0.95, 0.96, 0.98)
            : rgb(0.1, 0.15, 0.28);
        const textColor =
          selectedTheme === 'dark' || selectedTheme === 'slate'
            ? rgb(0.78, 0.82, 0.88)
            : rgb(0.25, 0.28, 0.35);
        const bulletColor =
          selectedTheme === 'dark' || selectedTheme === 'slate'
            ? rgb(0.45, 0.55, 0.95)
            : rgb(0.35, 0.38, 0.95);

        // Draw Slide Title
        const titleFontSize = 22;
        page.drawText(slide.title, {
          x: margin,
          y: currentY,
          size: titleFontSize,
          font: boldFont,
          color: titleColor,
        });

        currentY -= 36;

        // Draw Sub-divider line
        page.drawLine({
          start: { x: margin, y: currentY + 12 },
          end: { x: pageWidth - margin, y: currentY + 12 },
          thickness: 1,
          color:
            selectedTheme === 'dark' || selectedTheme === 'slate'
              ? rgb(0.2, 0.25, 0.35)
              : rgb(0.85, 0.88, 0.92),
        });

        // Helper to wrap long content strings
        const maxContentWidth = pageWidth - margin * 2 - 30;
        const wrapText = (text: string, size: number): string[] => {
          const words = text.split(' ');
          const lines: string[] = [];
          let cur = '';
          for (const w of words) {
            const test = cur ? `${cur} ${w}` : w;
            const width = regularFont.widthOfTextAtSize(test, size);
            if (width <= maxContentWidth) {
              cur = test;
            } else {
              if (cur) lines.push(cur);
              cur = w;
            }
          }
          if (cur) lines.push(cur);
          return lines.length > 0 ? lines : [text];
        };

        const bodyFontSize = 13;
        const lineHeight = 20;

        for (const content of slide.contents) {
          if (currentY < margin + 30) break; // Don't overflow slide

          const wrapped = wrapText(content, bodyFontSize);

          // Draw Bullet dot
          page.drawCircle({
            x: margin + 8,
            y: currentY - bodyFontSize / 2 + 4,
            size: 3.5,
            color: bulletColor,
          });

          for (let l = 0; l < wrapped.length; l++) {
            if (currentY < margin + 20) break;
            page.drawText(wrapped[l], {
              x: margin + 24,
              y: currentY - bodyFontSize + 2,
              size: bodyFontSize,
              font: regularFont,
              color: textColor,
            });
            currentY -= lineHeight;
          }
          currentY -= 6; // paragraph gap
        }

        // Slide Number Footer
        if (includeSlideNumbers) {
          const footerText = `Slide ${slide.slideNumber} of ${slides.length}`;
          const footerSize = 9;
          const footerWidth = regularFont.widthOfTextAtSize(footerText, footerSize);
          page.drawText(footerText, {
            x: pageWidth - margin - footerWidth,
            y: margin / 2,
            size: footerSize,
            font: regularFont,
            color:
              selectedTheme === 'dark' || selectedTheme === 'slate'
                ? rgb(0.5, 0.55, 0.65)
                : rgb(0.6, 0.65, 0.72),
          });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const filename = (selectedFile?.name.replace(/\.[^/.]+$/, '') || 'presentation') + '.pdf';
      saveAs(blob, filename);
      incrementStat('pdf');
    } catch (err) {
      console.error('Error generating PDF presentation:', err);
      alert('Failed to generate PDF from presentation.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToolHeader
        title="PowerPoint to PDF Converter"
        description="Convert Microsoft PowerPoint presentations (.pptx) into clean, high-resolution vector PDF slide documents with 100% in-browser RAM privacy."
        categoryName="PDF & Office"
        categoryPath="/pdf/powerpoint-to-pdf"
        badge="100% Client-Side Engine"
      />

      {!selectedFile ? (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <UploadZone
              accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onFileSelect={handleFileSelect}
              title="Upload PowerPoint Presentation (.pptx)"
              subtitle="Drag & drop your presentation slides to convert into PDF"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-orange-400 block mb-1">16:9 &amp; 4:3 Slides</span>
              <span className="text-xs text-slate-400">High-resolution slide canvas tailored for presentation displays</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Vector Typography</span>
              <span className="text-xs text-slate-400">Crisp, scalable headings, bullet lists &amp; slide numbers</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% In-Browser</span>
              <span className="text-xs text-slate-400">No server uploads or external API transmission</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Slide Grid Preview (8 cols) */}
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
                    {formatFileSize(selectedFile.size)} • {slides.length} Presentation Slides
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setSlides([]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change PPTX
              </button>
            </div>

            {/* Processing loader */}
            {isProcessing && (
              <div className="p-12 text-center bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-300">{progressText}</p>
              </div>
            )}

            {/* Slide Preview Cards */}
            {!isProcessing && slides.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slides.map((slide) => (
                  <div
                    key={slide.slideNumber}
                    className={`p-4 rounded-xl border transition-all duration-200 shadow-md ${
                      selectedTheme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-slate-200'
                        : selectedTheme === 'slate'
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10 dark:border-white/10">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                        Slide {slide.slideNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">16:9 HD</span>
                    </div>

                    <h4 className="font-bold text-xs line-clamp-1 mb-2">
                      {slide.title}
                    </h4>

                    <div className="space-y-1 text-[11px] opacity-80 max-h-28 overflow-y-auto">
                      {slide.contents.map((c, idx) => (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="text-orange-500 font-bold">•</span>
                          <span className="line-clamp-2">{c}</span>
                        </div>
                      ))}
                    </div>
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
                PDF Output Settings
              </h3>

              {/* Theme Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  Presentation Visual Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'modern', label: 'Modern Accent', color: 'bg-indigo-900/40 text-indigo-300 border-indigo-500/40' },
                    { id: 'dark', label: 'Dark Studio', color: 'bg-slate-950 text-slate-200 border-slate-700' },
                    { id: 'clean', label: 'Clean White', color: 'bg-slate-100 text-slate-900 border-slate-300' },
                    { id: 'slate', label: 'Slate Pro', color: 'bg-slate-800 text-slate-200 border-slate-600' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTheme(t.id as SlideTheme)}
                      className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-all cursor-pointer ${
                        selectedTheme === t.id
                          ? 'border-orange-500 bg-orange-500/10 text-orange-300 shadow-xs'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>{t.label}</span>
                      {selectedTheme === t.id && <Check className="w-3.5 h-3.5 text-orange-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  Page Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['16:9', '4:3', 'A4'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                        aspectRatio === ratio
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Slide Numbers */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-300 font-medium">Show Slide Numbers</span>
                <input
                  type="checkbox"
                  checked={includeSlideNumbers}
                  onChange={(e) => setIncludeSlideNumbers(e.target.checked)}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
              </div>

              {/* Export Button */}
              <button
                onClick={generatePDF}
                disabled={isExporting || slides.length === 0}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-sm shadow-xl shadow-orange-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Vector PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF Presentation
                  </>
                )}
              </button>
            </div>

            {/* Privacy Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                100% Client-Side Privacy
              </div>
              <p className="leading-relaxed">
                Your slides are parsed and rendered directly in your browser's RAM memory without any cloud server uploads.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
