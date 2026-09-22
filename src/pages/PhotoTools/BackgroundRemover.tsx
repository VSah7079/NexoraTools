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
import { usePageSEO } from '../../utils/seoHelper';

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
  usePageSEO({
    title: 'Free AI Background Remover Online (HD & Transparent PNG)',
    description: '100% Free AI Background Remover. Remove image backgrounds automatically in 1-click with zero watermark and high HD quality. Replace with transparent PNG, white, blue, or custom photo backgrounds.',
    keywords: 'bg remover, background remover, remove background, remove bg, remove background from image free, transparent png maker, change photo background online, ai background eraser, nexora tools',
    canonicalPath: '/bg-remover',
    categoryName: 'Photo Suite',
    toolName: 'AI Background Remover',
  });

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('Initializing Deep Neural AI Model...');

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

  // Run Deep Neural AI Background Removal
  const runAiSegmentation = async (source: File | HTMLImageElement) => {
    setIsProcessing(true);
    setProgressStatus('Initializing Deep Neural AI Model...');

    try {
      // 1. Generate pure Alpha Mask and immutable Original Canvas via Neural AI
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

    const newOrig = document.createElement('canvas');
    newOrig.width = cw;
    newOrig.height = ch;
    const oCtx = newOrig.getContext('2d');
    oCtx?.drawImage(orig, cx, cy, cw, ch, 0, 0, cw, ch);

    const newMask = document.createElement('canvas');
    newMask.width = cw;
    newMask.height = ch;
    const mCtx = newMask.getContext('2d');
    mCtx?.drawImage(mask, cx, cy, cw, ch, 0, 0, cw, ch);

    origCanvasRef.current = newOrig;
    maskCanvasRef.current = newMask;

    historyRef.current.push({
      origCanvas: cloneCanvas(newOrig),
      maskCanvas: cloneCanvas(newMask),
    });

    setActiveTool('pointer');
    updateComposite();
  };

  const handleCancelCrop = () => {
    setActiveTool('pointer');
  };

  const handleCropPointerDown = (handle: DragHandle, e: React.PointerEvent) => {
    e.stopPropagation();
    setActiveHandle(handle);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      initialCrop: { ...cropRect },
    });
  };

  const handleCropPointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !dragStart || !resultCanvasRef.current || !origCanvasRef.current) return;

    const rect = resultCanvasRef.current.getBoundingClientRect();
    const scaleX = origCanvasRef.current.width / rect.width;
    const scaleY = origCanvasRef.current.height / rect.height;

    const deltaX = (e.clientX - dragStart.clientX) * scaleX;
    const deltaY = (e.clientY - dragStart.clientY) * scaleY;

    const init = dragStart.initialCrop;
    const imgW = origCanvasRef.current.width;
    const imgH = origCanvasRef.current.height;

    const preset = CROP_RATIO_PRESETS.find((p) => p.id === selectedRatio);
    const fixedRatio = preset?.ratio || null;

    let nextX = init.x;
    let nextY = init.y;
    let nextW = init.width;
    let nextH = init.height;

    if (activeHandle === 'move') {
      nextX = Math.max(0, Math.min(imgW - init.width, init.x + deltaX));
      nextY = Math.max(0, Math.min(imgH - init.height, init.y + deltaY));
    } else {
      if (activeHandle.includes('e')) nextW = Math.max(30, init.width + deltaX);
      if (activeHandle.includes('s')) nextH = Math.max(30, init.height + deltaY);
      if (activeHandle.includes('w')) {
        const proposedW = init.width - deltaX;
        if (proposedW >= 30) {
          nextX = init.x + deltaX;
          nextW = proposedW;
        }
      }
      if (activeHandle.includes('n')) {
        const proposedH = init.height - deltaY;
        if (proposedH >= 30) {
          nextY = init.y + deltaY;
          nextH = proposedH;
        }
      }

      if (fixedRatio) {
        if (activeHandle === 'e' || activeHandle === 'w') {
          nextH = Math.round(nextW / fixedRatio);
        } else {
          nextW = Math.round(nextH * fixedRatio);
        }
      }
    }

    if (nextX + nextW > imgW) nextW = imgW - nextX;
    if (nextY + nextH > imgH) nextH = imgH - nextY;

    setCropRect({
      x: Math.max(0, nextX),
      y: Math.max(0, nextY),
      width: Math.max(30, nextW),
      height: Math.max(30, nextH),
    });
  };

  const handleCropPointerUp = () => {
    setActiveHandle(null);
    setDragStart(null);
  };

  // Brush / Eraser Tool Actions on Alpha Mask Canvas
  const applyBrushToMask = (canvasX: number, canvasY: number, isErase: boolean) => {
    if (!maskCanvasRef.current) return;
    const mask = maskCanvasRef.current;
    const mCtx = mask.getContext('2d');
    if (!mCtx) return;

    mCtx.save();
    mCtx.beginPath();
    mCtx.arc(canvasX, canvasY, brushSize / 2, 0, Math.PI * 2);

    if (isErase) {
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.fillStyle = 'rgba(0, 0, 0, 1)';
      mCtx.fill();
    } else {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.fillStyle = '#FFFFFF';
      mCtx.fill();
    }
    mCtx.restore();

    updateComposite();
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = resultCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'restore' && activeTool !== 'eraser') return;
    setIsBrushing(true);
    const coords = getCanvasCoords(e);
    applyBrushToMask(coords.x, coords.y, activeTool === 'eraser');
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isBrushing || (activeTool !== 'restore' && activeTool !== 'eraser')) return;
    const coords = getCanvasCoords(e);
    applyBrushToMask(coords.x, coords.y, activeTool === 'eraser');
  };

  const handleCanvasMouseUp = () => {
    if (!isBrushing) return;
    setIsBrushing(false);
    if (origCanvasRef.current && maskCanvasRef.current) {
      historyRef.current.push({
        origCanvas: cloneCanvas(origCanvasRef.current),
        maskCanvas: cloneCanvas(maskCanvasRef.current),
      });
      if (historyRef.current.length > 20) historyRef.current.shift();
    }
  };

  const handleUndo = () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const prev = historyRef.current[historyRef.current.length - 1];
    if (prev) {
      origCanvasRef.current = cloneCanvas(prev.origCanvas);
      maskCanvasRef.current = cloneCanvas(prev.maskCanvas);
      updateComposite();
    }
  };

  const handleReset = () => {
    if (!origCanvasRef.current || !initialMaskDataRef.current) return;
    const mask = maskCanvasRef.current;
    if (!mask) return;
    const mCtx = mask.getContext('2d');
    if (mCtx) {
      mCtx.putImageData(initialMaskDataRef.current, 0, 0);
      historyRef.current = [
        {
          origCanvas: cloneCanvas(origCanvasRef.current),
          maskCanvas: cloneCanvas(mask),
        },
      ];
      updateComposite();
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setCustomBgImg(img);
      setSelectedBg('image');
    };
    img.src = URL.createObjectURL(file);
  };

  const cropLeftPct = origCanvasRef.current
    ? (cropRect.x / origCanvasRef.current.width) * 100
    : 0;
  const cropTopPct = origCanvasRef.current
    ? (cropRect.y / origCanvasRef.current.height) * 100
    : 0;
  const cropWidthPct = origCanvasRef.current
    ? (cropRect.width / origCanvasRef.current.width) * 100
    : 100;
  const cropHeightPct = origCanvasRef.current
    ? (cropRect.height / origCanvasRef.current.height) * 100
    : 100;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Deep Neural AI Background Remover & Replacer"
        description="High-precision Deep Neural AI segmentation with zero subject pixel alteration, smart crop, and studio color presets."
        categoryName="Photo Tools"
        categoryPath="/photo/bg-remover"
        badge="Neural AI Engine"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="image/*"
            title="Upload Photo for Deep Neural AI Background Removal"
            subtitle="Precision neural subject isolation • Transparent PNG, Passport White & Studio colors"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-cyan-400 block mb-1">Deep Neural AI</span>
              <span className="text-xs text-slate-400">High-precision ISNet neural boundary detection</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-sky-400 block mb-1">Studio Color Presets</span>
              <span className="text-xs text-slate-400">White, Sky Blue, Navy &amp; Transparent PNG</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% Original Pixels</span>
              <span className="text-xs text-slate-400">Preserves original face, hair &amp; clothes clarity</span>
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
                      Deep Neural AI Processing
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
