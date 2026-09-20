import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  FileText,
  Columns,
  Rows,
  Sparkles,
  Crop,
  Trash2,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { DOCUMENT_PRESETS, type DocumentType } from '../../types/idMerger';
import { loadImage, mmToPixels } from '../../utils/canvasUtils';
import {
  type Point,
  type ScanFilterType,
  warpPerspective,
  applyScanFilter,
  rotateCanvas,
} from '../../utils/perspectiveTransform';
import { CornerAdjustModal } from '../../components/id/CornerAdjustModal';
import { PDFDocument } from 'pdf-lib';
import { downloadBlob, printCanvas } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

interface CardSlotData {
  file: File | null;
  sourceCanvas: HTMLCanvasElement | null;
  corners: [Point, Point, Point, Point] | null;
  warpedCanvas: HTMLCanvasElement | null;
  rotation: number;
  filter: ScanFilterType;
}

const initialCardSlot: CardSlotData = {
  file: null,
  sourceCanvas: null,
  corners: null,
  warpedCanvas: null,
  rotation: 0,
  filter: 'original',
};

interface IDMergerProps {
  defaultDocType?: DocumentType;
}

export const IDMerger: React.FC<IDMergerProps> = ({ defaultDocType = 'aadhaar' }) => {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>(defaultDocType);

  // Front & Back Card Slots
  const [frontCard, setFrontCard] = useState<CardSlotData>(initialCardSlot);
  const [backCard, setBackCard] = useState<CardSlotData>(initialCardSlot);
  const [notification, setNotification] = useState<string | null>(null);

  // Active Corner Adjust Modal State
  const [activeModalSide, setActiveModalSide] = useState<'front' | 'back' | null>(null);

  // Settings
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('vertical');
  const [outputFormat, setOutputFormat] = useState<'a4-sheet' | 'fit-card'>('a4-sheet');
  const [borderStyle, setBorderStyle] = useState<'none' | 'thin-solid' | 'dashed' | 'rounded-shadow'>('thin-solid');
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('FOR OFFICIAL USE ONLY');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPreset =
    DOCUMENT_PRESETS.find((p) => p.id === selectedDocType) || DOCUMENT_PRESETS[0];

  const dpi = 300;
  const cardWidthPx = mmToPixels(currentPreset.recommendedWidthMm, dpi);
  const cardHeightPx = mmToPixels(currentPreset.recommendedHeightMm, dpi);

  useEffect(() => {
    setLayout(currentPreset.defaultLayout);
  }, [currentPreset]);

  // Flash Notification
  const triggerNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Process uploaded ID photo - Clean manual workflow with full frame default
  const processUploadedCard = useCallback(
    (img: HTMLImageElement, file: File): CardSlotData => {
      const sCanvas = document.createElement('canvas');
      sCanvas.width = img.width;
      sCanvas.height = img.height;
      const sCtx = sCanvas.getContext('2d');
      sCtx?.drawImage(img, 0, 0);

      const fullCorners: [Point, Point, Point, Point] = [
        { x: 0, y: 0 },
        { x: img.width, y: 0 },
        { x: img.width, y: img.height },
        { x: 0, y: img.height },
      ];

      const warped = warpPerspective(sCanvas, fullCorners, cardWidthPx, cardHeightPx);
      const filtered = applyScanFilter(warped, 'original');

      return {
        file,
        sourceCanvas: sCanvas,
        corners: fullCorners,
        warpedCanvas: filtered,
        rotation: 0,
        filter: 'original',
      };
    },
    [cardWidthPx, cardHeightPx]
  );

  const handleFrontUpload = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    const processed = processUploadedCard(img, target);
    setFrontCard(processed);
  };

  const handleBackUpload = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    const processed = processUploadedCard(img, target);
    setBackCard(processed);
  };

  // Re-warp card when corners, rotation, or filter changes
  const recomputeCardSlot = useCallback(
    (slot: CardSlotData, newRotation?: number, newFilter?: ScanFilterType): CardSlotData => {
      if (!slot.sourceCanvas) return slot;

      const rot = newRotation !== undefined ? newRotation : slot.rotation;
      const flt = newFilter !== undefined ? newFilter : slot.filter;

      // Apply rotation to source canvas if needed
      const baseCanvas = rot !== 0 ? rotateCanvas(slot.sourceCanvas, rot) : slot.sourceCanvas;
      const corners = slot.corners || [
        { x: 0, y: 0 },
        { x: baseCanvas.width, y: 0 },
        { x: baseCanvas.width, y: baseCanvas.height },
        { x: 0, y: baseCanvas.height },
      ];

      const warped = warpPerspective(baseCanvas, corners, cardWidthPx, cardHeightPx);
      const filtered = applyScanFilter(warped, flt);

      return {
        ...slot,
        rotation: rot,
        filter: flt,
        warpedCanvas: filtered,
      };
    },
    [cardWidthPx, cardHeightPx]
  );

  // Quick Rotate Slot
  const handleRotateSlot = (side: 'front' | 'back') => {
    if (side === 'front') {
      const nextRot = (frontCard.rotation + 90) % 360;
      setFrontCard((prev) => recomputeCardSlot(prev, nextRot));
    } else {
      const nextRot = (backCard.rotation + 90) % 360;
      setBackCard((prev) => recomputeCardSlot(prev, nextRot));
    }
  };

  // Quick Filter Toggle (Original vs Magic)
  const handleToggleMagicFilter = (side: 'front' | 'back') => {
    if (side === 'front') {
      const nextFilter = frontCard.filter === 'magic' ? 'original' : 'magic';
      setFrontCard((prev) => recomputeCardSlot(prev, undefined, nextFilter));
    } else {
      const nextFilter = backCard.filter === 'magic' ? 'original' : 'magic';
      setBackCard((prev) => recomputeCardSlot(prev, undefined, nextFilter));
    }
  };

  // Apply changes from CornerAdjustModal
  const handleModalApply = (
    warped: HTMLCanvasElement,
    corners: [Point, Point, Point, Point],
    filter: ScanFilterType,
    updatedSourceCanvas?: HTMLCanvasElement
  ) => {
    if (activeModalSide === 'front') {
      setFrontCard((prev) => ({
        ...prev,
        sourceCanvas: updatedSourceCanvas || prev.sourceCanvas,
        corners,
        warpedCanvas: warped,
        filter,
      }));
    } else if (activeModalSide === 'back') {
      setBackCard((prev) => ({
        ...prev,
        sourceCanvas: updatedSourceCanvas || prev.sourceCanvas,
        corners,
        warpedCanvas: warped,
        filter,
      }));
    }
    setActiveModalSide(null);
  };

  // Render the final merged A4 sheet / Compact canvas
  const renderMergedCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    if (!frontCard.warpedCanvas && !backCard.warpedCanvas) return;

    const canvas = canvasRef.current;
    const gapPx = mmToPixels(8, dpi);

    let canvasWidthPx: number;
    let canvasHeightPx: number;

    if (outputFormat === 'a4-sheet') {
      canvasWidthPx = mmToPixels(210, dpi);
      canvasHeightPx = mmToPixels(297, dpi);
    } else {
      if (layout === 'horizontal') {
        canvasWidthPx = cardWidthPx * 2 + gapPx * 3;
        canvasHeightPx = cardHeightPx + gapPx * 2 + (showLabels ? 50 : 0);
      } else {
        canvasWidthPx = cardWidthPx + gapPx * 2;
        canvasHeightPx = cardHeightPx * 2 + gapPx * 3 + (showLabels ? 90 : 0);
      }
    }

    canvas.width = canvasWidthPx;
    canvas.height = canvasHeightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clean white paper background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);

    // Card placement coordinates - centered on A4 print sheet
    let frontX = 0, frontY = 0, backX = 0, backY = 0;

    if (outputFormat === 'a4-sheet') {
      const topMargin = layout === 'horizontal' ? 450 : 380;
      if (layout === 'horizontal') {
        const totalW = cardWidthPx * 2 + gapPx;
        frontX = (canvasWidthPx - totalW) / 2;
        frontY = topMargin;
        backX = frontX + cardWidthPx + gapPx;
        backY = topMargin;
      } else {
        frontX = (canvasWidthPx - cardWidthPx) / 2;
        frontY = topMargin;
        backX = frontX;
        backY = frontY + cardHeightPx + gapPx + (showLabels ? 50 : 20);
      }
    } else {
      if (layout === 'horizontal') {
        frontX = gapPx;
        frontY = gapPx + (showLabels ? 30 : 0);
        backX = frontX + cardWidthPx + gapPx;
        backY = frontY;
      } else {
        frontX = gapPx;
        frontY = gapPx + (showLabels ? 30 : 0);
        backX = frontX;
        backY = frontY + cardHeightPx + gapPx + (showLabels ? 50 : 10);
      }
    }

    // Draw single card helper
    const drawCard = (cardCanvas: HTMLCanvasElement | null, x: number, y: number, label: string) => {
      if (!cardCanvas) return;

      ctx.save();

      // Card Label (only if enabled)
      if (showLabels) {
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label.toUpperCase(), x, y - 10);
      }

      // Draw Card Image
      ctx.drawImage(cardCanvas, x, y, cardWidthPx, cardHeightPx);

      // Draw Card Border
      if (borderStyle === 'thin-solid') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cardWidthPx, cardHeightPx);
      } else if (borderStyle === 'dashed') {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(x, y, cardWidthPx, cardHeightPx);
        ctx.setLineDash([]);
      }

      // Cutting Markers for A4 Sheets
      if (outputFormat === 'a4-sheet') {
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1;
        const markLen = 15;

        // Top-left
        ctx.beginPath();
        ctx.moveTo(x - markLen, y);
        ctx.lineTo(x, y);
        ctx.moveTo(x, y - markLen);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + cardWidthPx, y);
        ctx.lineTo(x + cardWidthPx + markLen, y);
        ctx.moveTo(x + cardWidthPx, y - markLen);
        ctx.lineTo(x + cardWidthPx, y);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x - markLen, y + cardHeightPx);
        ctx.lineTo(x, y + cardHeightPx);
        ctx.moveTo(x, y + cardHeightPx);
        ctx.lineTo(x, y + cardHeightPx + markLen);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + cardWidthPx, y + cardHeightPx);
        ctx.lineTo(x + cardWidthPx + markLen, y + cardHeightPx);
        ctx.moveTo(x + cardWidthPx, y + cardHeightPx);
        ctx.lineTo(x + cardWidthPx, y + cardHeightPx + markLen);
        ctx.stroke();
      }

      ctx.restore();
    };

    drawCard(frontCard.warpedCanvas, frontX, frontY, currentPreset.frontLabel);
    drawCard(backCard.warpedCanvas, backX, backY, currentPreset.backLabel);

    // Watermark
    if (showWatermark && watermarkText) {
      ctx.save();
      ctx.translate(canvasWidthPx / 2, canvasHeightPx / 2);
      ctx.rotate((-28 * Math.PI) / 180);
      ctx.font = 'bold 56px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(220, 38, 38, 0.22)';
      ctx.textAlign = 'center';
      ctx.fillText(watermarkText.toUpperCase(), 0, 0);
      ctx.restore();
    }

    incrementStat('idMerger');
  }, [
    frontCard.warpedCanvas,
    backCard.warpedCanvas,
    layout,
    outputFormat,
    borderStyle,
    showLabels,
    showWatermark,
    watermarkText,
    currentPreset,
    cardWidthPx,
    cardHeightPx,
  ]);

  useEffect(() => {
    renderMergedCanvas();
  }, [renderMergedCanvas]);

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(dataUrl);

    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, `${selectedDocType}-merged-a4.pdf`);
  };

  const handlePrint = () => {
    if (!canvasRef.current) return;
    printCanvas(canvasRef.current, `${selectedDocType}-a4-print`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
      <ToolHeader
        title="Two-Sided ID Card Merger"
        description="Upload Aadhaar, Voter ID, PAN, or Driving Licence. Crop, rotate, and merge front & back sides into a clean 300 DPI A4 print sheet."
        categoryName="ID Card Tools"
        categoryPath="/id/merger"
        badge="300 DPI Print Ready"
      />

      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <span>{notification}</span>
          <span className="text-[10px] text-cyan-400/80 font-mono">CR80 (85.6 × 54mm)</span>
        </div>
      )}

      {/* Preset Selector - Responsive Wrap */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
        {DOCUMENT_PRESETS.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDocType(doc.id)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer shadow-xs ${
              selectedDocType === doc.id
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/10 hover:bg-slate-800'
            }`}
          >
            {doc.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Canvas Preview + Upload Slots */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main A4 / Card Output Canvas */}
          <div className="p-3 sm:p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl flex items-center justify-center min-h-[300px] sm:min-h-[480px] overflow-hidden backdrop-blur-xl">
            <div className="p-2 sm:p-3 bg-white rounded-xl shadow-2xl max-w-full max-h-[520px] overflow-auto flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-[340px] sm:max-h-[460px] w-auto max-w-full object-contain border border-slate-200 rounded"
              />
            </div>
          </div>

          {/* Front and Back Upload Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Front Card Slot */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  {currentPreset.frontLabel}
                </span>
              </div>

              {!frontCard.warpedCanvas ? (
                <UploadZone
                  onFileSelect={handleFrontUpload}
                  title="Upload Front Side"
                  subtitle="Upload image or scan copy"
                  className="text-xs !p-4"
                />
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-2 flex items-center justify-center group">
                    <img
                      src={frontCard.warpedCanvas.toDataURL()}
                      alt="Front preview"
                      className="max-h-[140px] w-auto object-contain rounded-xl border border-white/5"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      onClick={() => handleRotateSlot('front')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold transition-all cursor-pointer"
                      title="Rotate 90 degrees"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      onClick={() => handleToggleMagicFilter('front')}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                        frontCard.filter === 'magic'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-white/10'
                      }`}
                      title="Toggle Document Clarity Filter"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Clarity</span>
                    </button>
                  </div>

                  {/* Manual Corner Crop & Reset */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => setActiveModalSide('front')}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-xs transition-all cursor-pointer hover:border-cyan-400"
                    >
                      <Crop className="w-4 h-4 text-cyan-400" />
                      <span>📐 Crop &amp; Adjust Corners</span>
                    </button>

                    <div className="flex items-center justify-between px-1 text-[11px]">
                      <button
                        onClick={() => {
                          if (frontCard.sourceCanvas) {
                            const w = frontCard.sourceCanvas.width;
                            const h = frontCard.sourceCanvas.height;
                            const fullCorners: [Point, Point, Point, Point] = [
                              { x: 0, y: 0 },
                              { x: w, y: 0 },
                              { x: w, y: h },
                              { x: 0, y: h },
                            ];
                            const warped = warpPerspective(frontCard.sourceCanvas, fullCorners, cardWidthPx, cardHeightPx);
                            const filtered = applyScanFilter(warped, frontCard.filter);
                            setFrontCard((prev) => ({
                              ...prev,
                              corners: fullCorners,
                              warpedCanvas: filtered,
                            }));
                            triggerNotice('Reset Front Card to Full Image');
                          }
                        }}
                        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        Reset Full Image
                      </button>

                      <button
                        onClick={() => setFrontCard(initialCardSlot)}
                        className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Back Card Slot */}
            <div className="p-4 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  {currentPreset.backLabel}
                </span>
              </div>

              {!backCard.warpedCanvas ? (
                <UploadZone
                  onFileSelect={handleBackUpload}
                  title="Upload Back Side"
                  subtitle="Upload image or scan copy"
                  className="text-xs !p-4"
                />
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950 p-2 flex items-center justify-center group">
                    <img
                      src={backCard.warpedCanvas.toDataURL()}
                      alt="Back preview"
                      className="max-h-[140px] w-auto object-contain rounded-xl border border-white/5"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      onClick={() => handleRotateSlot('back')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold transition-all cursor-pointer"
                      title="Rotate 90 degrees"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      onClick={() => handleToggleMagicFilter('back')}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-semibold transition-all cursor-pointer ${
                        backCard.filter === 'magic'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-white/10'
                      }`}
                      title="Toggle Document Clarity Filter"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Clarity</span>
                    </button>
                  </div>

                  {/* Manual Corner Crop & Reset */}
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={() => setActiveModalSide('back')}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-bold text-xs shadow-xs transition-all cursor-pointer hover:border-cyan-400"
                    >
                      <Crop className="w-4 h-4 text-cyan-400" />
                      <span>📐 Crop &amp; Adjust Corners</span>
                    </button>

                    <div className="flex items-center justify-between px-1 text-[11px]">
                      <button
                        onClick={() => {
                          if (backCard.sourceCanvas) {
                            const w = backCard.sourceCanvas.width;
                            const h = backCard.sourceCanvas.height;
                            const fullCorners: [Point, Point, Point, Point] = [
                              { x: 0, y: 0 },
                              { x: w, y: 0 },
                              { x: w, y: h },
                              { x: 0, y: h },
                            ];
                            const warped = warpPerspective(backCard.sourceCanvas, fullCorners, cardWidthPx, cardHeightPx);
                            const filtered = applyScanFilter(warped, backCard.filter);
                            setBackCard((prev) => ({
                              ...prev,
                              corners: fullCorners,
                              warpedCanvas: filtered,
                            }));
                            triggerNotice('Reset Back Card to Full Image');
                          }
                        }}
                        className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      >
                        Reset Full Image
                      </button>

                      <button
                        onClick={() => setBackCard(initialCardSlot)}
                        className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer inline-flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Export + Layout Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Export Actions Panel */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4 shadow-2xl backdrop-blur-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Export Merged ID
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleExportPDF}
                disabled={!frontCard.warpedCanvas && !backCard.warpedCanvas}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Download A4 PDF</span>
              </button>

              <DownloadDropdown
                getCanvas={() => canvasRef.current}
                baseFilename={`${selectedDocType}-merged-print`}
              />

              <button
                onClick={handlePrint}
                disabled={!frontCard.warpedCanvas && !backCard.warpedCanvas}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                title="Print Directly"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Layout & Format Settings */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 shadow-xl backdrop-blur-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-heading">
              Print &amp; Layout Settings
            </h3>

            {/* Layout Orientation */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                Card Alignment:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLayout('vertical')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    layout === 'vertical'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                      : 'bg-slate-950/80 text-slate-400 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <Rows className="w-4 h-4" />
                  <span>Vertical (Stacked)</span>
                </button>

                <button
                  onClick={() => setLayout('horizontal')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    layout === 'horizontal'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                      : 'bg-slate-950/80 text-slate-400 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <Columns className="w-4 h-4" />
                  <span>Side by Side</span>
                </button>
              </div>
            </div>

            {/* Output Page Format */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                Canvas Sheet Size:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOutputFormat('a4-sheet')}
                  className={`py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    outputFormat === 'a4-sheet'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                      : 'bg-slate-950/80 text-slate-400 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  📄 A4 Print Sheet
                </button>

                <button
                  onClick={() => setOutputFormat('fit-card')}
                  className={`py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    outputFormat === 'fit-card'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                      : 'bg-slate-950/80 text-slate-400 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  🪪 Fit Cards Only
                </button>
              </div>
            </div>

            {/* Border Style */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">
                Card Cutting Border:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['thin-solid', 'dashed', 'none'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBorderStyle(b)}
                    className={`py-2 rounded-xl border text-[11px] font-bold capitalize transition-all cursor-pointer ${
                      borderStyle === b
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-xs'
                        : 'bg-slate-950/80 text-slate-400 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    {b === 'thin-solid' ? 'Solid Line' : b === 'dashed' ? 'Dashed' : 'No Border'}
                  </button>
                ))}
              </div>
            </div>

            {/* Labels toggle */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Side Labels (FRONT / BACK):</span>
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    showLabels
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {showLabels ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Watermark Toggle */}
            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Security Watermark:</span>
                <button
                  onClick={() => setShowWatermark(!showWatermark)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    showWatermark
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {showWatermark ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {showWatermark && (
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Watermark text..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Corner Adjust Modal */}
      <CornerAdjustModal
        isOpen={activeModalSide !== null}
        onClose={() => setActiveModalSide(null)}
        title={activeModalSide === 'front' ? 'Crop & Adjust Front Card' : 'Crop & Adjust Back Card'}
        sourceCanvas={activeModalSide === 'front' ? frontCard.sourceCanvas : backCard.sourceCanvas}
        initialCorners={activeModalSide === 'front' ? frontCard.corners || undefined : backCard.corners || undefined}
        initialFilter={activeModalSide === 'front' ? frontCard.filter : backCard.filter}
        cardWidthPx={cardWidthPx}
        cardHeightPx={cardHeightPx}
        onApply={handleModalApply}
      />
    </div>
  );
};
