import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import {
  FileText,
  Download,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Layers,
  FileCheck,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

export const PDFWatermark: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('FOR VERIFICATION ONLY');
  const [opacity, setOpacity] = useState(0.25);
  const [angle, setAngle] = useState(45);
  const [fontSize, setFontSize] = useState(48);
  const [colorHex, setColorHex] = useState('#EF4444');
  const [mode, setMode] = useState<'diagonal_grid' | 'center_single'>('diagonal_grid');
  const [pageRange, setPageRange] = useState<'all' | 'first' | 'custom'>('all');
  const [customPages, setCustomPages] = useState('1');

  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkedPdfBytes, setWatermarkedPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const presets = [
    'FOR VERIFICATION ONLY',
    'CONFIDENTIAL',
    'ORIGINAL DOCUMENT',
    'COPY / DUPLICATE',
    'SAMPLE ONLY',
    'DO NOT COPY',
  ];

  const handleFileSelect = (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setWatermarkedPdfBytes(null);
    setPdfPreviewUrl(null);
  };

  const hexToRgb01 = (hex: string) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16) / 255 || 0;
    const g = parseInt(clean.substring(2, 4), 16) / 255 || 0;
    const b = parseInt(clean.substring(4, 6), 16) / 255 || 0;
    return { r, g, b };
  };

  const handleApplyWatermark = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const { r, g, b } = hexToRgb01(colorHex);
      const pages = pdfDoc.getPages();

      let targetIndices: number[] = [];
      if (pageRange === 'all') {
        targetIndices = pages.map((_, i) => i);
      } else if (pageRange === 'first') {
        targetIndices = [0];
      } else {
        // Parse custom range (e.g. 1, 2-4)
        targetIndices = customPages
          .split(',')
          .map((s) => s.trim())
          .flatMap((part) => {
            if (part.includes('-')) {
              const [start, end] = part.split('-').map((n) => parseInt(n));
              if (!isNaN(start) && !isNaN(end)) {
                return Array.from({ length: end - start + 1 }, (_, i) => start + i - 1);
              }
            }
            const num = parseInt(part);
            return !isNaN(num) ? [num - 1] : [];
          })
          .filter((idx) => idx >= 0 && idx < pages.length);
      }

      for (const idx of targetIndices) {
        const page = pages[idx];
        const { width, height } = page.getSize();
        const textToDraw = watermarkText.trim().toUpperCase() || 'CONFIDENTIAL';

        if (mode === 'center_single') {
          const textWidth = font.widthOfTextAtSize(textToDraw, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          page.drawText(textToDraw, {
            x: (width - textWidth) / 2,
            y: (height - textHeight) / 2,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity,
            rotate: degrees(angle),
          });
        } else {
          // Diagonal Grid Pattern
          const stepX = 280;
          const stepY = 240;

          for (let x = -width * 0.2; x < width * 1.3; x += stepX) {
            for (let y = -height * 0.2; y < height * 1.3; y += stepY) {
              page.drawText(textToDraw, {
                x,
                y,
                size: Math.round(fontSize * 0.75),
                font,
                color: rgb(r, g, b),
                opacity,
                rotate: degrees(angle),
              });
            }
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      setWatermarkedPdfBytes(pdfBytes);

      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setPdfPreviewUrl(URL.createObjectURL(blob));
      incrementStat('pdf');
    } catch (err) {
      console.error('PDF watermark error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!watermarkedPdfBytes || !selectedFile) return;
    const blob = new Blob([watermarkedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_watermarked.pdf`;
    a.click();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="PDF Watermark & Security Stamping"
        description="Stamp custom security text, diagonal grid protection, and confidentiality seals on PDF documents with 100% in-browser RAM execution."
        categoryName="PDF Tools"
        categoryPath="/pdf/watermark"
        badge="Instant PDF-Lib Engine"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            title="Upload PDF Document to Watermark"
            subtitle="Add custom text stamps, opacity controls & diagonal grid protection"
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-rose-400 block mb-1">Verification Stamp</span>
              <span className="text-xs text-slate-400">"FOR VERIFICATION ONLY" for Govt IDs</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Diagonal Grid</span>
              <span className="text-xs text-slate-400">Repeat watermark across entire page</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% Private</span>
              <span className="text-xs text-slate-400">Never leaves your browser memory</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 shadow-xl backdrop-blur-xl">
              {/* Active Document Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-sm text-white truncate">{selectedFile.name}</div>
                    <div className="text-[11px] text-slate-400">{formatFileSize(selectedFile.size)}</div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-slate-400 hover:text-rose-400 cursor-pointer font-medium"
                >
                  Change File
                </button>
              </div>

              {/* Watermark Preset Chips */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Quick Stamp Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setWatermarkText(p);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${watermarkText === p
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Watermark Text */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Watermark Text:
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. ONLY FOR VERIFICATION PURPOSE"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm uppercase font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Pattern Mode */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('diagonal_grid')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${mode === 'diagonal_grid'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Diagonal Grid</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Repeating anti-copy mesh</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('center_single')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${mode === 'center_single'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-rose-400" />
                    <span>Single Center Stamp</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">One large central watermark</div>
                </button>
              </div>

              {/* Page Range Selection */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Target Pages:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPageRange('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${pageRange === 'all'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    All Pages
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageRange('first')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${pageRange === 'first'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    First Page Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageRange('custom')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${pageRange === 'custom'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-950 border border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                  >
                    Custom Pages
                  </button>
                </div>
                {pageRange === 'custom' && (
                  <input
                    type="text"
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    placeholder="e.g. 1, 3-5, 8"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none mt-1"
                  />
                )}
              </div>

              {/* Sliders (Opacity, Angle, Font Size) */}
              <div className="space-y-4 pt-2 border-t border-white/10">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Opacity:</span>
                    <span className="font-mono text-indigo-400">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={Math.round(opacity * 100)}
                    onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Rotation:</span>
                      <span className="font-mono text-indigo-400">{angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={angle}
                      onChange={(e) => setAngle(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Font Size:</span>
                      <span className="font-mono text-indigo-400">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Color Selector */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-300 font-medium">Stamp Color:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorHex}
                      onChange={(e) => setColorHex(e.target.value)}
                      className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-mono text-slate-400">{colorHex.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleApplyWatermark}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-rose-950/40 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Stamping PDF Document...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4" />
                    <span>Apply Security Watermark</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Output & Download Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-xl min-h-[460px]">
              {watermarkedPdfBytes && pdfPreviewUrl ? (
                <div className="w-full space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Watermark Applied Successfully! Clean 100% vector document generated.</span>
                  </div>

                  <iframe
                    src={pdfPreviewUrl}
                    title="Watermarked PDF Preview"
                    className="w-full h-80 rounded-2xl border border-white/10 bg-slate-950 shadow-inner"
                  />

                  <button
                    onClick={handleDownload}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Watermarked PDF Document</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 max-w-sm">
                  <div className="p-5 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit mx-auto">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Live PDF Stamping Ready</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Click "Apply Security Watermark" to generate your stamped PDF document with instant client-side rendering.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
