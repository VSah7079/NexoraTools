import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sparkles,
  Crop,
  Maximize2,
  Check,
  Circle,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { loadImage, applyCanvasAdjustments } from '../../utils/canvasUtils';
import {
  type CropRect,
  type AspectRatioOption,
  ASPECT_RATIO_VALUES,
  detectSubjectCrop,
  getDefaultCrop,
  fitAspectCrop,
} from '../../utils/autoCropUtils';
import { autoDetectCardCorners } from '../../utils/perspectiveTransform';
import { incrementStat } from '../../services/analyticsTracker';

type DragHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | 'move' | null;
type ViewMode = 'auto' | 'manual';

export const ImageCropRotate: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Active View Mode: 'manual' (interactive 8-handle crop box) or 'auto' (preview)
  const [viewMode, setViewMode] = useState<ViewMode>('manual');

  // Active Crop Box (in base image native coordinates)
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [isCircleMask, setIsCircleMask] = useState<boolean>(false);
  const [autoDetected, setAutoDetected] = useState<boolean>(true);

  // Orientation & Transform
  const [rotation90, setRotation90] = useState<number>(0);
  const [fineAngle, setFineAngle] = useState<number>(0); // -45 to +45 deg
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Lighting & Color
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);

  // Dragging state for interactive crop
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState<{
    clientX: number;
    clientY: number;
    initialCrop: CropRect;
  } | null>(null);

  // Canvases
  const containerRef = useRef<HTMLDivElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);
  const autoPreviewCanvasRef = useRef<HTMLCanvasElement>(null);

  // When image is uploaded: auto-detect subject, crop automatically, and default to 'manual' interactive view
  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    setOriginalImage(img);

    setRotation90(0);
    setFineAngle(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setAspectRatio('free');
    setIsCircleMask(false);

    // Auto-detect subject bounding box immediately
    const detected = detectSubjectCrop(img, null);
    setCrop(detected);
    setAutoDetected(true);
    setViewMode('manual');
  };

  // Run AI Subject Detection
  const handleAutoDetectSubject = () => {
    if (!originalImage) return;
    const detected = detectSubjectCrop(originalImage, ASPECT_RATIO_VALUES[aspectRatio]);
    setCrop(detected);
    setAutoDetected(true);
  };

  // Run Document/Card Edge Auto-Crop
  const handleAutoDetectDocument = () => {
    if (!originalImage) return;
    const sCanvas = document.createElement('canvas');
    sCanvas.width = originalImage.width;
    sCanvas.height = originalImage.height;
    const ctx = sCanvas.getContext('2d');
    ctx?.drawImage(originalImage, 0, 0);

    const corners = autoDetectCardCorners(sCanvas);
    const minX = Math.min(...corners.map((c) => c.x));
    const maxX = Math.max(...corners.map((c) => c.x));
    const minY = Math.min(...corners.map((c) => c.y));
    const maxY = Math.max(...corners.map((c) => c.y));

    const w = Math.max(50, maxX - minX);
    const h = Math.max(50, maxY - minY);

    const docCrop: CropRect = {
      x: Math.round(minX),
      y: Math.round(minY),
      width: Math.round(w),
      height: Math.round(h),
    };

    if (ASPECT_RATIO_VALUES[aspectRatio]) {
      setCrop(
        fitAspectCrop(
          docCrop,
          originalImage.width,
          originalImage.height,
          ASPECT_RATIO_VALUES[aspectRatio]!
        )
      );
    } else {
      setCrop(docCrop);
    }
    setAutoDetected(true);
  };

  // Reset to full frame
  const handleResetCrop = () => {
    if (!originalImage) return;
    const full = getDefaultCrop(originalImage.width, originalImage.height, ASPECT_RATIO_VALUES[aspectRatio]);
    setCrop(full);
    setAutoDetected(false);
  };

  // Change Aspect Ratio Preset
  const handleSelectAspectRatio = (ratio: AspectRatioOption) => {
    setAspectRatio(ratio);
    if (!originalImage) return;

    const targetVal = ASPECT_RATIO_VALUES[ratio];
    if (targetVal) {
      setCrop((prev) => fitAspectCrop(prev, originalImage.width, originalImage.height, targetVal));
    }
  };

  // Render Output Canvas & Auto Preview Canvas
  const renderOutputCanvas = useCallback(() => {
    if (!originalImage) return;

    const targetW = Math.max(1, Math.round(crop.width));
    const targetH = Math.max(1, Math.round(crop.height));

    const isSideways = rotation90 === 90 || rotation90 === 270;
    const outW = isSideways ? targetH : targetW;
    const outH = isSideways ? targetW : targetH;

    const drawOnCanvas = (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, outW, outH);

      applyCanvasAdjustments(ctx, outW, outH, {
        brightness,
        contrast,
        saturation,
        rotation: rotation90,
        flipH,
        flipV,
      });

      ctx.save();

      // Circular crop mask if enabled
      if (isCircleMask) {
        ctx.beginPath();
        ctx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      ctx.translate(outW / 2, outH / 2);
      ctx.rotate(((rotation90 + fineAngle) * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      ctx.drawImage(
        originalImage,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        -targetW / 2,
        -targetH / 2,
        targetW,
        targetH
      );

      ctx.restore();
    };

    drawOnCanvas(outputCanvasRef.current);
    drawOnCanvas(autoPreviewCanvasRef.current);

    incrementStat('cropper');
  }, [
    originalImage,
    crop,
    rotation90,
    fineAngle,
    flipH,
    flipV,
    brightness,
    contrast,
    saturation,
    isCircleMask,
  ]);

  useEffect(() => {
    renderOutputCanvas();
  }, [renderOutputCanvas]);

  // Pointer Drag Handlers for Manual Crop Box
  const handlePointerDown = (handle: DragHandle, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveHandle(handle);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      initialCrop: { ...crop },
    });
    setAutoDetected(false);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !dragStart || !originalImage || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = originalImage.width / rect.width;
    const scaleY = originalImage.height / rect.height;

    const deltaX = (e.clientX - dragStart.clientX) * scaleX;
    const deltaY = (e.clientY - dragStart.clientY) * scaleY;

    const init = dragStart.initialCrop;
    const imgW = originalImage.width;
    const imgH = originalImage.height;
    const targetAspect = ASPECT_RATIO_VALUES[aspectRatio];

    let nextX = init.x;
    let nextY = init.y;
    let nextW = init.width;
    let nextH = init.height;

    if (activeHandle === 'move') {
      nextX = Math.max(0, Math.min(imgW - init.width, init.x + deltaX));
      nextY = Math.max(0, Math.min(imgH - init.height, init.y + deltaY));
    } else {
      if (activeHandle.includes('e')) {
        nextW = Math.max(30, Math.min(imgW - init.x, init.width + deltaX));
      }
      if (activeHandle.includes('s')) {
        nextH = Math.max(30, Math.min(imgH - init.y, init.height + deltaY));
      }
      if (activeHandle.includes('w')) {
        const potentialW = init.width - deltaX;
        if (potentialW >= 30 && init.x + deltaX >= 0) {
          nextX = init.x + deltaX;
          nextW = potentialW;
        }
      }
      if (activeHandle.includes('n')) {
        const potentialH = init.height - deltaY;
        if (potentialH >= 30 && init.y + deltaY >= 0) {
          nextY = init.y + deltaY;
          nextH = potentialH;
        }
      }

      if (targetAspect) {
        if (activeHandle === 'e' || activeHandle === 'w') {
          nextH = nextW / targetAspect;
        } else if (activeHandle === 'n' || activeHandle === 's') {
          nextW = nextH * targetAspect;
        } else {
          nextH = nextW / targetAspect;
        }
      }
    }

    if (nextX < 0) nextX = 0;
    if (nextY < 0) nextY = 0;
    if (nextX + nextW > imgW) nextW = imgW - nextX;
    if (nextY + nextH > imgH) nextH = imgH - nextY;

    setCrop({
      x: Math.round(nextX),
      y: Math.round(nextY),
      width: Math.round(nextW),
      height: Math.round(nextH),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeHandle) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setActiveHandle(null);
      setDragStart(null);
    }
  };

  const imgW = originalImage ? originalImage.width : 1;
  const imgH = originalImage ? originalImage.height : 1;

  const cropLeftPct = (crop.x / imgW) * 100;
  const cropTopPct = (crop.y / imgH) * 100;
  const cropWidthPct = (crop.width / imgW) * 100;
  const cropHeightPct = (crop.height / imgH) * 100;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Smart Auto-Crop & Manual Image Studio"
        description="Upload any photo to automatically detect and crop subjects. Switch to manual mode anytime to drag crop handles, change aspect ratio, straighten, or rotate."
        categoryName="Photo Tools"
        categoryPath="/photo/crop-rotate"
        badge="Instant Auto-Crop"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Image to Auto-Crop"
            subtitle="JPG, PNG, WebP — automatically crops subject upon upload"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Mode Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('auto')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'auto'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Auto-Cropped Result</span>
                {autoDetected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </button>

              <button
                onClick={() => setViewMode('manual')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'manual'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Crop className="w-4 h-4 text-indigo-300" />
                <span>Manual Crop &amp; Fine-Tune</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setOriginalImage(null)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
              >
                Upload New Photo
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Visual Display (Auto Result or Manual 8-Handle Box) */}
            <div className="lg:col-span-7 space-y-4">
              {viewMode === 'auto' ? (
                /* Auto-Cropped Direct View */
                <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[480px]">
                  {/* Status Banner */}
                  <div className="w-full mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Photo automatically cropped and centered by AI.</span>
                    </div>
                    <button
                      onClick={() => setViewMode('manual')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer shadow-sm text-[11px]"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Not Satisfied? Adjust Manually</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Cropped Canvas Display */}
                  <div className="p-3 bg-white/95 rounded-xl shadow-2xl max-w-full max-h-[440px] overflow-hidden flex items-center justify-center">
                    <canvas
                      ref={autoPreviewCanvasRef}
                      className="max-h-[420px] w-auto object-contain rounded border border-slate-200"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                    <span className="font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
                      Output Size: {Math.round(crop.width)} × {Math.round(crop.height)} px
                    </span>
                    <button
                      onClick={handleAutoDetectSubject}
                      className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Re-detect Subject
                    </button>
                    <button
                      onClick={handleAutoDetectDocument}
                      className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Crop className="w-3.5 h-3.5" /> Card / Document Crop
                    </button>
                  </div>
                </div>
              ) : (
                /* Manual Interactive Crop Studio */
                <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[480px]">
                  {/* Manual Quick Bar */}
                  <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleAutoDetectSubject}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Auto Detect</span>
                      </button>

                      <button
                        onClick={handleAutoDetectDocument}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition-all cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Card/Doc</span>
                      </button>

                      <button
                        onClick={handleResetCrop}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition-all cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Full</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                        {Math.round(crop.width)} × {Math.round(crop.height)} px
                      </span>
                      <button
                        onClick={() => setViewMode('auto')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Crop Box Container */}
                  <div
                    ref={containerRef}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    className="relative select-none max-w-full max-h-[500px] rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-950 flex items-center justify-center touch-none"
                    style={{
                      aspectRatio: `${imgW} / ${imgH}`,
                    }}
                  >
                    <img
                      src={originalImage.src}
                      alt="Source"
                      className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Darkened Scrim Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `rgba(0, 0, 0, 0.65)`,
                        clipPath: isCircleMask
                          ? `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`
                          : `polygon(0% 0%, 0% 100%, ${cropLeftPct}% 100%, ${cropLeftPct}% ${cropTopPct}%, ${
                              cropLeftPct + cropWidthPct
                            }% ${cropTopPct}%, ${cropLeftPct + cropWidthPct}% ${
                              cropTopPct + cropHeightPct
                            }%, ${cropLeftPct}% ${
                              cropTopPct + cropHeightPct
                            }%, ${cropLeftPct}% 100%, 100% 100%, 100% 0%)`,
                      }}
                    />

                    {/* Draggable Active Crop Box */}
                    <div
                      onPointerDown={(e) => handlePointerDown('move', e)}
                      style={{
                        left: `${cropLeftPct}%`,
                        top: `${cropTopPct}%`,
                        width: `${cropWidthPct}%`,
                        height: `${cropHeightPct}%`,
                      }}
                      className={`absolute z-20 cursor-move border-2 ${
                        isCircleMask ? 'rounded-full border-cyan-400' : 'border-indigo-400'
                      } shadow-2xl transition-all duration-75`}
                    >
                      {/* Grid Lines */}
                      {!isCircleMask && (
                        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                          <div className="border-r border-b border-indigo-200" />
                          <div className="border-r border-b border-indigo-200" />
                          <div className="border-b border-indigo-200" />
                          <div className="border-r border-b border-indigo-200" />
                          <div className="border-r border-b border-indigo-200" />
                          <div className="border-b border-indigo-200" />
                          <div className="border-r border-b border-indigo-200" />
                          <div className="border-r border-b border-indigo-200" />
                          <div />
                        </div>
                      )}

                      {/* 4 Corner Handles */}
                      <div
                        onPointerDown={(e) => handlePointerDown('nw', e)}
                        className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-sm cursor-nwse-resize shadow-md"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown('ne', e)}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-sm cursor-nesw-resize shadow-md"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown('se', e)}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-sm cursor-nwse-resize shadow-md"
                      />
                      <div
                        onPointerDown={(e) => handlePointerDown('sw', e)}
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-sm cursor-nesw-resize shadow-md"
                      />

                      {/* 4 Edge Midpoint Handles */}
                      {aspectRatio === 'free' && !isCircleMask && (
                        <>
                          <div
                            onPointerDown={(e) => handlePointerDown('n', e)}
                            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border border-indigo-500 rounded-sm cursor-ns-resize shadow-sm"
                          />
                          <div
                            onPointerDown={(e) => handlePointerDown('s', e)}
                            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border border-indigo-500 rounded-sm cursor-ns-resize shadow-sm"
                          />
                          <div
                            onPointerDown={(e) => handlePointerDown('w', e)}
                            className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 bg-white border border-indigo-500 rounded-sm cursor-ew-resize shadow-sm"
                          />
                          <div
                            onPointerDown={(e) => handlePointerDown('e', e)}
                            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 bg-white border border-indigo-500 rounded-sm cursor-ew-resize shadow-sm"
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-[11px] text-slate-400 text-center">
                    Drag the box to reposition, or drag handles to resize.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Aspect Ratio, Rotate, Sliders & Export */}
            <div className="lg:col-span-5 space-y-6">
              {/* Export Panel */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3 shadow-xl">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Download Cropped Image
                </h3>
                <DownloadDropdown
                  getCanvas={() => outputCanvasRef.current}
                  baseFilename="nexora-cropped"
                />
              </div>

              {/* Aspect Ratio Options */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Aspect Ratio Presets
                  </h3>
                  <button
                    onClick={() => setIsCircleMask(!isCircleMask)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      isCircleMask
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Circle className="w-3.5 h-3.5" />
                    <span>Circle Crop</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {(
                    [
                      { id: 'free', label: 'Freeform' },
                      { id: '1:1', label: '1:1 Square' },
                      { id: '4:3', label: '4:3 Photo' },
                      { id: '3:4', label: '3:4 Portrait' },
                      { id: '16:9', label: '16:9 Banner' },
                      { id: '9:16', label: '9:16 Story' },
                      { id: 'passport', label: 'Passport' },
                      { id: 'id-card', label: 'ID Card' },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleSelectAspectRatio(r.id)}
                      className={`py-2 px-1 rounded-xl font-semibold border text-center transition-all ${
                        aspectRatio === r.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation & Orientation */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Rotation &amp; Orientation
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRotation90((r) => (r + 90) % 360)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <RotateCw className="w-4 h-4 text-cyan-400" />
                    <span>Rotate Right 90°</span>
                  </button>
                  <button
                    onClick={() => setRotation90((r) => (r - 90 + 360) % 360)}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <span>Rotate Left 90°</span>
                  </button>
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      flipH
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span>Flip Horizontal</span>
                  </button>
                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      flipV
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <FlipVertical className="w-4 h-4" />
                    <span>Flip Vertical</span>
                  </button>
                </div>

                {/* Straighten Slider */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      Fine Angle Straighten
                    </span>
                    <span className="font-mono text-cyan-300">
                      {fineAngle > 0 ? `+${fineAngle}°` : `${fineAngle}°`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={fineAngle}
                    onChange={(e) => setFineAngle(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Lighting & Enhancement */}
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Lighting &amp; Enhancement
                </h3>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono text-white">
                      {brightness > 0 ? `+${brightness}` : brightness}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Contrast</span>
                    <span className="font-mono text-white">
                      {contrast > 0 ? `+${contrast}` : contrast}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Saturation</span>
                    <span className="font-mono text-white">
                      {saturation > 0 ? `+${saturation}` : saturation}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Master Output Canvas */}
      <canvas ref={outputCanvasRef} className="hidden" />
    </div>
  );
};
