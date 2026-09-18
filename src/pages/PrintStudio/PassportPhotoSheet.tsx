import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Printer,
  Scissors,
  Check,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { PAPER_SIZE_PRESETS, type SheetSettings } from '../../types/passport';
import { calculateSheetLayout, renderSheetToCanvas } from '../../utils/printCalculations';
import { loadImage } from '../../utils/canvasUtils';
import { PDFDocument } from 'pdf-lib';
import { downloadBlob } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

export const PassportPhotoSheet: React.FC = () => {
  const [photoImage, setPhotoImage] = useState<HTMLImageElement | null>(null);

  // Sheet Settings
  const [settings, setSettings] = useState<SheetSettings>({
    paperId: '4x6', // photo studio 4x6" postcard paper default
    customWidthMm: 101.6,
    customHeightMm: 152.4,
    orientation: 'portrait',
    photoWidthMm: 35,
    photoHeightMm: 45,
    copiesCount: 8,
    autoFit: true,
    rows: 4,
    columns: 2,
    gapX: 3,
    gapY: 3,
    marginX: 5,
    marginY: 5,
    showCutLines: true,
    cutLineStyle: 'solid',
    showPhotoBorder: true,
    photoBorderColor: '#cbd5e1',
    bgColor: '#ffffff',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const forwarded = sessionStorage.getItem('nexora_print_sheet_photo');
    if (forwarded) {
      loadImage(forwarded).then((img) => {
        setPhotoImage(img);
        const w = sessionStorage.getItem('nexora_print_photo_w');
        const h = sessionStorage.getItem('nexora_print_photo_h');
        if (w && h) {
          setSettings((s) => ({
            ...s,
            photoWidthMm: parseFloat(w) || 35,
            photoHeightMm: parseFloat(h) || 45,
          }));
        }
      });
    }
  }, []);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    setPhotoImage(img);
  };

  const drawSheet = useCallback(() => {
    if (!photoImage || !canvasRef.current) return;

    const layout = calculateSheetLayout(settings, 300);
    renderSheetToCanvas(canvasRef.current, photoImage, settings, layout);
    incrementStat('passport');
  }, [photoImage, settings]);

  useEffect(() => {
    drawSheet();
  }, [drawSheet]);

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    const layout = calculateSheetLayout(settings, 300);
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.98);

    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(dataUrl);

    const ptW = layout.paperWidthMm * (72 / 25.4);
    const ptH = layout.paperHeightMm * (72 / 25.4);

    const page = pdfDoc.addPage([ptW, ptH]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: ptW,
      height: ptH,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, `passport-sheet-${settings.paperId}-${settings.copiesCount}copies.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Passport Photo Print Sheet Generator"
        description="Arrange passport photos automatically onto 4×6 inch studio paper, A4, A5, or Letter sheets with cutting markers and 1-click high-res printing."
        categoryName="Print Studio"
        categoryPath="/print/passport-sheet"
        badge="300 DPI Studio Ready"
      />

      {!photoImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Passport Photo for Print Sheet"
            subtitle="JPG, PNG, or WebP. We will automatically calculate the maximum fit grid on your paper."
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xl font-bold text-emerald-400 block mb-1">4 × 6" (4R) Paper</span>
              <span className="text-xs text-slate-400">Fits 6 to 8 passport photos (Most common)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xl font-bold text-cyan-400 block mb-1">A4 Full Sheet</span>
              <span className="text-xs text-slate-400">Fits 16 to 36+ passport photos</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Cutting Guidelines</span>
              <span className="text-xs text-slate-400">Solid lines or cross-hair scissor marks</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-center min-h-[520px] overflow-hidden">
              <div className="p-2 bg-white rounded-lg shadow-2xl max-w-full max-h-[540px] overflow-auto flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-h-[500px] w-auto object-contain border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span>
                Paper: <strong className="text-emerald-400">{settings.paperId.toUpperCase()}</strong>{' '}
                • Photos Placed: <strong className="text-white">{settings.copiesCount} copies</strong>
              </span>

              <button
                onClick={() => {
                  setPhotoImage(null);
                  sessionStorage.removeItem('nexora_print_sheet_photo');
                }}
                className="text-rose-400 hover:text-rose-300"
              >
                Change Photo
              </button>
            </div>
          </div>

          {/* Right Settings Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* 1-Click Print & Export Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Print &amp; Export
              </h3>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handlePrint}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>1-Click Print Sheet</span>
                </button>

                <DownloadDropdown
                  getCanvas={() => canvasRef.current}
                  baseFilename={`passport-sheet-${settings.paperId}`}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                />
              </div>
            </div>

            {/* Paper Size Preset */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Select Paper Size
              </h3>

              <div className="space-y-2">
                {PAPER_SIZE_PRESETS.map((paper) => (
                  <button
                    key={paper.id}
                    onClick={() => setSettings((s) => ({ ...s, paperId: paper.id }))}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      settings.paperId === paper.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{paper.name}</span>
                      {settings.paperId === paper.id && (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {paper.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Copies Preset */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Number of Photo Copies
              </h3>

              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 12, 16, 24, 30, 36].map((count) => (
                  <button
                    key={count}
                    onClick={() => setSettings((s) => ({ ...s, copiesCount: count }))}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      settings.copiesCount === count
                        ? 'bg-emerald-500/20 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {count} Photos
                  </button>
                ))}
              </div>
            </div>

            {/* Cutting Lines & Margins */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                Cutting Lines &amp; Spacing
              </h3>

              <div>
                <label className="text-slate-400 block mb-1">Scissor Cut Markers</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['solid', 'dashed', 'cross-marks'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setSettings((s) => ({ ...s, cutLineStyle: style }))}
                      className={`py-1.5 rounded-lg capitalize border ${
                        settings.cutLineStyle === style
                          ? 'bg-emerald-600/20 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {style.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">Horizontal Gap (mm)</label>
                  <input
                    type="number"
                    value={settings.gapX}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, gapX: Math.max(0, parseFloat(e.target.value) || 0) }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vertical Gap (mm)</label>
                  <input
                    type="number"
                    value={settings.gapY}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, gapY: Math.max(0, parseFloat(e.target.value) || 0) }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
