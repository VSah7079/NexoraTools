import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Sliders,
  RotateCcw,
  Eraser,
  Paintbrush,
  MousePointer,
  Crop,
  Check,
  X,
  Undo,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import {
  BG_PRESET_COLORS,
  generateAlphaMaskAI,
  compositeWithOriginal,
  type SegmentationOptions,
} from '../../utils/bgRemovalEngine';
import { loadImage } from '../../utils/canvasUtils';
import { incrementStat } from '../../services/analyticsTracker';

type ActiveTool = 'pointer' | 'eraser' | 'restore' | 'crop';
type DragHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | 'move' | null;

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HistoryItem {
  origCanvas: HTMLCanvasElement;
  maskCanvas: HTMLCanvasElement;
}

const CROP_RATIO_PRESETS = [
  { id: 'free', label: 'Freeform', ratio: null },
  { id: '1:1', label: '1:1 Square', ratio: 1 },
  { id: '3:4', label: '3:4 Portrait', ratio: 3 / 4 },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3 },
  { id: '16:9', label: '16:9 Banner', ratio: 16 / 9 },
  { id: 'passport', label: '35×45 Passport', ratio: 35 / 45 },
  { id: 'id-card', label: 'ID Card', ratio: 85.6 / 53.98 },
];

function cloneCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const clone = document.createElement('canvas');
  clone.width = canvas.width;
  clone.height = canvas.height;
  const ctx = clone.getContext('2d');
  ctx?.drawImage(canvas, 0, 0);
  return clone;
}

export const BackgroundRemover: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('Processing AI Neural Segmentation...');

  // Background Options
  const [selectedBg, setSelectedBg] = useState<SegmentationOptions['backgroundColor']>('transparent');
  const [customHex, setCustomHex] = useState<string>('#3B82F6');
  const [threshold, setThreshold] = useState<number>(4);
  const [customBgImg, setCustomBgImg] = useState<HTMLImageElement | null>(null);

  // Active Tool: Pointer / Restore Brush / Eraser Brush / Crop
  const [activeTool, setActiveTool] = useState<ActiveTool>('pointer');
  const [brushSize, setBrushSize] = useState<number>(36);
  const [isBrushing, setIsBrushing] = useState<boolean>(false);

  // Crop Tool State
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
  const [selectedRatio, setSelectedRatio] = useState<string>('free');
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState<{
    clientX: number;
    clientY: number;
    initialCrop: CropRect;
  } | null>(null);

  // Canvases - Two-Layer Architecture
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement | null>(null); // Layer 1: Immutable Source RGB
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Layer 2: Alpha Mask (Editable)
  const initialMaskDataRef = useRef<ImageData | null>(null); // Cached initial AI mask for instant Reset
  const sourceFileRef = useRef<File | null>(null);
  const historyRef = useRef<HistoryItem[]>([]); // Undo History Stack (orig + mask snapshots)

  // Re-composite background over transparent cutout in 0ms
  const updateComposite = useCallback(() => {
    if (!origCanvasRef.current || !maskCanvasRef.current || !resultCanvasRef.current) return;

    const composite = compositeWithOriginal(origCanvasRef.current, maskCanvasRef.current, {
      backgroundColor: selectedBg,
      customHex,
      customBgImage: customBgImg,
      threshold,
    });

    const rCanvas = resultCanvasRef.current;
    rCanvas.width = composite.width;
    rCanvas.height = composite.height;
    const ctx = rCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, rCanvas.width, rCanvas.height);
    ctx.drawImage(composite, 0, 0);
  }, [selectedBg, customHex, customBgImg, threshold]);

  // Run AI Background Removal
  const runAiSegmentation = async (source: File | HTMLImageElement) => {
    setIsProcessing(true);
    setProgressStatus('Initializing Full Neural AI Model...');

    try {
      // 1. Generate pure Alpha Mask and immutable Original Canvas
      const { maskCanvas, origCanvas } = await generateAlphaMaskAI(source, (msg) =>
        setProgressStatus(msg)
      );

      origCanvasRef.current = origCanvas;
      maskCanvasRef.current = maskCanvas;

      // 2. Cache initial mask for instant reset and history
      const mCtx = maskCanvas.getContext('2d');
      if (mCtx) {
        const initData = mCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        initialMaskDataRef.current = initData;
      }

      // Initialize history stack
      historyRef.current = [
        {
          origCanvas: cloneCanvas(origCanvas),
          maskCanvas: cloneCanvas(maskCanvas),
        },
      ];

      // Initialize crop box to 90% centered frame
      const initW = Math.round(origCanvas.width * 0.9);
      const initH = Math.round(origCanvas.height * 0.9);
      setCropRect({
        x: Math.round((origCanvas.width - initW) / 2),
        y: Math.round((origCanvas.height - initH) / 2),
        width: initW,
        height: initH,
      });

      updateComposite();
      incrementStat('passport');
    } catch (err) {
      console.error('Background removal error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    sourceFileRef.current = target;
    const img = await loadImage(target);
    setOriginalImage(img);

    await runAiSegmentation(target);
  };

  // Re-composite when threshold or background changes (Instant in 0ms)
  useEffect(() => {
    if (origCanvasRef.current && maskCanvasRef.current) {
      updateComposite();
    }
  }, [selectedBg, customHex, customBgImg, threshold, updateComposite]);

  // Enter Crop Mode
  const handleToggleCropMode = () => {
    if (activeTool === 'crop') {
      setActiveTool('pointer');
    } else {
      if (origCanvasRef.current) {
        const w = origCanvasRef.current.width;
        const h = origCanvasRef.current.height;
        const cw = Math.round(w * 0.9);
        const ch = Math.round(h * 0.9);
        setCropRect({
          x: Math.round((w - cw) / 2),
          y: Math.round((h - ch) / 2),
          width: cw,
          height: ch,
        });
      }
      setSelectedRatio('free');
      setActiveTool('crop');
    }
  };

  // Select Aspect Ratio Preset for Crop
  const handleSelectCropRatio = (ratioId: string) => {
    setSelectedRatio(ratioId);
    if (!origCanvasRef.current) return;

    const preset = CROP_RATIO_PRESETS.find((p) => p.id === ratioId);
    if (!preset || !preset.ratio) return;

    const targetRatio = preset.ratio;
    const imgW = origCanvasRef.current.width;
    const imgH = origCanvasRef.current.height;

    let nextW = cropRect.width;
    let nextH = Math.round(nextW / targetRatio);

    if (nextH > imgH || cropRect.y + nextH > imgH) {
      nextH = Math.min(imgH, Math.round(imgH * 0.85));
      nextW = Math.round(nextH * targetRatio);
    }
    if (nextW > imgW) {
      nextW = Math.min(imgW, Math.round(imgW * 0.85));
      nextH = Math.round(nextW / targetRatio);
    }

    const nextX = Math.max(0, Math.min(imgW - nextW, Math.round((imgW - nextW) / 2)));
    const nextY = Math.max(0, Math.min(imgH - nextH, Math.round((imgH - nextH) / 2)));

    setCropRect({
      x: nextX,
      y: nextY,
      width: nextW,
      height: nextH,
    });
  };

  // Apply Crop to Both Original Canvas (Layer 1) & Mask Canvas (Layer 2)
  const handleApplyCrop = () => {
    if (!origCanvasRef.current || !maskCanvasRef.current) return;
    const orig = origCanvasRef.current;
    const mask = maskCanvasRef.current;

    const cx = Math.max(0, Math.min(orig.width - 20, Math.round(cropRect.x)));
    const cy = Math.max(0, Math.min(orig.height - 20, Math.round(cropRect.y)));
    const cw = Math.max(20, Math.min(orig.width - cx, Math.round(cropRect.width)));
    const ch = Math.max(20, Math.min(orig.height - cy, Math.round(cropRect.height)));

    // 1. Crop Layer 1: Immutable Original Source Photo Canvas
    const newOrig = document.createElement('canvas');
    newOrig.width = cw;
    newOrig.height = ch;
    const oCtx = newOrig.getContext('2d');
    oCtx?.drawImage(orig, cx, cy, cw, ch, 0, 0, cw, ch);

    // 2. Crop Layer 2: Alpha Mask Canvas
    const newMask = document.createElement('canvas');
    newMask.width = cw;
    newMask.height = ch;
    const mCtx = newMask.getContext('2d');
    mCtx?.drawImage(mask, cx, cy, cw, ch, 0, 0, cw, ch);

    origCanvasRef.current = newOrig;
    maskCanvasRef.current = newMask;

    // Save history
    historyRef.current.push({
      origCanvas: cloneCanvas(newOrig),
      maskCanvas: cloneCanvas(newMask),
    });
    if (historyRef.current.length > 15) historyRef.current.shift();

    setActiveTool('pointer');
    updateComposite();
    incrementStat('cropper');
  };

  // Cancel Crop
  const handleCancelCrop = () => {
    setActiveTool('pointer');
  };

  // Pointer drag for Crop Box handles
  const handleCropPointerDown = (handle: DragHandle, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    setActiveHandle(handle);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      initialCrop: { ...cropRect },
    });
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !dragStart || !origCanvasRef.current || !previewContainerRef.current) return;
    e.preventDefault();

    const rect = previewContainerRef.current.getBoundingClientRect();
    const scaleX = origCanvasRef.current.width / rect.width;
    const scaleY = origCanvasRef.current.height / rect.height;

    const deltaX = (e.clientX - dragStart.clientX) * scaleX;
    const deltaY = (e.clientY - dragStart.clientY) * scaleY;

    const init = dragStart.initialCrop;
    const imgW = origCanvasRef.current.width;
    const imgH = origCanvasRef.current.height;
    const preset = CROP_RATIO_PRESETS.find((p) => p.id === selectedRatio);
    const targetRatio = preset?.ratio || null;

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

      if (targetRatio) {
        if (activeHandle === 'e' || activeHandle === 'w') {
          nextH = Math.round(nextW / targetRatio);
        } else if (activeHandle === 'n' || activeHandle === 's') {
          nextW = Math.round(nextH * targetRatio);
        } else {
          nextH = Math.round(nextW / targetRatio);
        }
      }
    }

    if (nextX < 0) nextX = 0;
    if (nextY < 0) nextY = 0;
    if (nextX + nextW > imgW) nextW = imgW - nextX;
    if (nextY + nextH > imgH) nextH = imgH - nextY;

    setCropRect({
      x: Math.round(nextX),
      y: Math.round(nextY),
      width: Math.round(nextW),
      height: Math.round(nextH),
    });
  };

  const handleCropPointerUp = (e: React.PointerEvent) => {
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

  // Manual Touch-up / Brush handlers on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pointer' || activeTool === 'crop' || !maskCanvasRef.current || !resultCanvasRef.current) return;
    setIsBrushing(true);
    applyBrushAtEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isBrushing || activeTool === 'pointer' || activeTool === 'crop') return;
    applyBrushAtEvent(e);
  };

  const handleCanvasMouseUp = () => {
    if (isBrushing && origCanvasRef.current && maskCanvasRef.current) {
      historyRef.current.push({
        origCanvas: cloneCanvas(origCanvasRef.current),
        maskCanvas: cloneCanvas(maskCanvasRef.current),
      });
      if (historyRef.current.length > 15) historyRef.current.shift();
    }
    setIsBrushing(false);
  };

  const applyBrushAtEvent = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = resultCanvasRef.current;
    const mCanvas = maskCanvasRef.current;
    if (!canvas || !mCanvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = mCanvas.width / rect.width;
    const scaleY = mCanvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const radius = (brushSize * scaleX) / 2;

    const mCtx = mCanvas.getContext('2d');
    if (!mCtx) return;

    mCtx.save();
    mCtx.beginPath();
    mCtx.arc(x, y, radius, 0, Math.PI * 2);

    if (activeTool === 'eraser') {
      // Clear alpha to 0 (make background transparent)
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.fillStyle = 'rgba(0,0,0,1)';
      mCtx.fill();
    } else if (activeTool === 'restore') {
      // Restore alpha to 255 (reveal original photo pixels with 0 modification)
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.fillStyle = 'rgba(255,255,255,1)';
      mCtx.fill();
    }

    mCtx.restore();
    updateComposite();
  };

  const handleUndo = () => {
    if (historyRef.current.length > 1) {
      historyRef.current.pop();
      const prev = historyRef.current[historyRef.current.length - 1];
      if (prev) {
        origCanvasRef.current = cloneCanvas(prev.origCanvas);
        maskCanvasRef.current = cloneCanvas(prev.maskCanvas);
        updateComposite();
      }
    }
  };

  const handleReset = () => {
    if (sourceFileRef.current) {
      runAiSegmentation(sourceFileRef.current);
    } else if (originalImage) {
      runAiSegmentation(originalImage);
    }
  };

  const handleCustomBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = await loadImage(file);
      setCustomBgImg(img);
      setSelectedBg('image');
    }
  };

  const curW = origCanvasRef.current ? origCanvasRef.current.width : 1;
  const curH = origCanvasRef.current ? origCanvasRef.current.height : 1;

  const cropLeftPct = (cropRect.x / curW) * 100;
  const cropTopPct = (cropRect.y / curH) * 100;
  const cropWidthPct = (cropRect.width / curW) * 100;
  const cropHeightPct = (cropRect.height / curH) * 100;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="AI Background Remover & Replacer"
        description="Professional background removal with 100% original photo pixel preservation and interactive cropping. Zero facial retouching, zero color distortion, zero clothing alteration."
        categoryName="Photo Tools"
        categoryPath="/photo/bg-remover"
        badge="100% Pixel Preserved"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto space-y-8">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Photo to Remove Background & Crop"
            subtitle="JPG, PNG, or WebP. 100% of subject pixels, skin tone, clothing, and hair are kept untouched."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-cyan-400 block mb-1">Zero Subject Alteration</span>
              <span className="text-xs text-slate-400">All original pixels, clothes &amp; hair preserved intact</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-sky-400 block mb-1">Interactive Crop Studio</span>
              <span className="text-xs text-slate-400">Custom ratios, 1:1, 3:4, Passport &amp; ID card</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">Lossless Transparent PNG</span>
              <span className="text-xs text-slate-400">True alpha transparency at full resolution</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Preview Area */}
          <div className="lg:col-span-8 space-y-4">
            {/* Interactive Brush & Crop Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-lg">
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveTool('pointer')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTool === 'pointer'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="View / Select Mode"
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Select</span>
                </button>

                <button
                  onClick={handleToggleCropMode}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTool === 'crop'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Interactive Crop Tool"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop Image</span>
                </button>

                <button
                  onClick={() => setActiveTool('restore')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTool === 'restore'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Restore original photo pixels in selected area"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Restore Brush</span>
                </button>

                <button
                  onClick={() => setActiveTool('eraser')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTool === 'eraser'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Erase background residue"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Eraser Brush</span>
                </button>
              </div>

              {(activeTool === 'restore' || activeTool === 'eraser') && (
                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="text-slate-400">Brush Size:</span>
                  <input
                    type="range"
                    min="8"
                    max="120"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-24 accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="font-mono text-cyan-400 w-6">{brushSize}px</span>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleUndo}
                  disabled={historyRef.current.length <= 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  title="Undo last action"
                >
                  <Undo className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>

                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                  title="Reset to fresh AI cutout"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Crop Control Bar (Visible in Crop Mode) */}
            {activeTool === 'crop' && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Crop className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Crop Presets:
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-500/30">
                      {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
                    </span>

                    <button
                      onClick={handleApplyCrop}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Crop</span>
                    </button>

                    <button
                      onClick={handleCancelCrop}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>

                {/* Aspect Ratio Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {CROP_RATIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectCropRatio(preset.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedRatio === preset.id
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                          : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Canvas Container with Interactive Crop Box Overlay */}
            <div
              ref={previewContainerRef}
              onPointerMove={activeTool === 'crop' ? handleCropPointerMove : undefined}
              onPointerUp={activeTool === 'crop' ? handleCropPointerUp : undefined}
              className={`relative p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[300px] sm:min-h-[480px] overflow-hidden select-none ${
                selectedBg === 'transparent' ? 'bg-checkers' : 'bg-slate-950'
              }`}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center z-30 gap-3 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Neural AI Foreground Isolation
                    </h4>
                    <p className="text-xs text-cyan-300 font-mono">
                      {progressStatus}
                    </p>
                  </div>
                </div>
              )}

              <div className="relative max-w-full max-h-[360px] sm:max-h-[520px] flex items-center justify-center">
                <canvas
                  ref={resultCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className={`max-h-[340px] sm:max-h-[480px] w-auto max-w-full object-contain rounded-lg shadow-2xl ${
                    activeTool === 'eraser' || activeTool === 'restore'
                      ? 'cursor-crosshair'
                      : activeTool === 'crop'
                      ? 'cursor-default'
                      : 'cursor-default'
                  }`}
                />

                {/* Interactive Crop Box Overlay */}
                {activeTool === 'crop' && (
                  <div
                    className="absolute inset-0 pointer-events-auto"
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    {/* Darkened Scrim Overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'rgba(0, 0, 0, 0.65)',
                        clipPath: `polygon(0% 0%, 0% 100%, ${cropLeftPct}% 100%, ${cropLeftPct}% ${cropTopPct}%, ${
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
                      onPointerDown={(e) => handleCropPointerDown('move', e)}
                      style={{
                        left: `${cropLeftPct}%`,
                        top: `${cropTopPct}%`,
                        width: `${cropWidthPct}%`,
                        height: `${cropHeightPct}%`,
                      }}
                      className="absolute z-20 cursor-move border-2 border-indigo-400 shadow-2xl transition-all duration-75"
                    >
                      {/* 3x3 Rule-of-Thirds Grid */}
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

                      {/* 4 Corner Handles */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('nw', e)}
                        className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown('ne', e)}
                        className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown('se', e)}
                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown('sw', e)}
                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md"
                      />

                      {/* 4 Edge Handles */}
                      <div
                        onPointerDown={(e) => handleCropPointerDown('n', e)}
                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border border-indigo-600 rounded-sm cursor-ns-resize shadow-sm"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown('s', e)}
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 bg-white border border-indigo-600 rounded-sm cursor-ns-resize shadow-sm"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown('w', e)}
                        className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-6 bg-white border border-indigo-600 rounded-sm cursor-ew-resize shadow-sm"
                      />
                      <div
                        onPointerDown={(e) => handleCropPointerDown('e', e)}
                        className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-6 bg-white border border-indigo-600 rounded-sm cursor-ew-resize shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {activeTool === 'restore' && (
                <div className="absolute bottom-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-emerald-300 font-medium shadow-md">
                  💡 Click &amp; drag on image to restore original photo pixels
                </div>
              )}

              {activeTool === 'eraser' && (
                <div className="absolute bottom-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-rose-300 font-medium shadow-md">
                  💡 Click &amp; drag on image to erase background residue
                </div>
              )}

              {activeTool === 'crop' && (
                <div className="absolute bottom-3 bg-indigo-950/90 border border-indigo-700 px-3 py-1 rounded-full text-[11px] text-indigo-200 font-medium shadow-md">
                  ✂️ Drag box to reposition, drag handles to resize, then click "Apply Crop"
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => {
                  setOriginalImage(null);
                  origCanvasRef.current = null;
                  maskCanvasRef.current = null;
                  initialMaskDataRef.current = null;
                  historyRef.current = [];
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ← Upload Different Image
              </button>

              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400 text-[11px]">
                  {origCanvasRef.current ? `${origCanvasRef.current.width} × ${origCanvasRef.current.height} px` : ''}
                </span>

                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Original Photo RGB Pixels Preserved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Export Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Download Output
                </h3>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Lossless PNG
                </span>
              </div>

              <DownloadDropdown
                getCanvas={() => resultCanvasRef.current}
                baseFilename="nexora-bg-removed"
                defaultFormat={selectedBg === 'transparent' ? 'image/png' : 'image/jpeg'}
                defaultLabel={selectedBg === 'transparent' ? 'Download Transparent PNG' : 'Download HD Photo'}
                className="w-full flex"
              />

              <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Original image dimensions &amp; full RGB fidelity preserved</span>
              </p>
            </div>

            {/* Background Color Selector */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Background Option
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Instant (0ms)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {BG_PRESET_COLORS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg.id as any)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      selectedBg === bg.id
                        ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border border-slate-700 shadow-inner shrink-0 ${
                        bg.id === 'transparent' ? 'bg-checkers' : ''
                      }`}
                      style={bg.id !== 'transparent' ? { backgroundColor: bg.color } : {}}
                    />
                    <span className="truncate">{bg.name}</span>
                  </button>
                ))}
              </div>

              {/* Custom Color Picker */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Custom Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setSelectedBg('custom');
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-slate-300">{customHex}</span>
                </div>
              </div>

              {/* Custom Backdrop Image */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 cursor-pointer transition-colors">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>Upload Custom Backdrop Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Live Cutoff & Edge Tuning Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Edge Cutoff Sensitivity
                </h3>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Live (0ms)
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Softer Hair Edges &larr; &rarr; Crisper Cutoff</span>
                    <span className="font-mono text-cyan-400">{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <Info className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Default: 4% preserves all fine hair strands, sleeves, and edge anti-aliasing.</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
