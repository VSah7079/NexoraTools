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
  Undo,
  ShieldCheck,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import {
  BG_PRESET_COLORS,
  removeBackgroundAI,
  compositeWithOriginal,
  type SegmentationOptions,
} from '../../utils/bgRemovalEngine';
import { loadImage } from '../../utils/canvasUtils';
import { incrementStat } from '../../services/analyticsTracker';

export const BackgroundRemover: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('Processing AI Neural Segmentation...');

  // Background Options
  const [selectedBg, setSelectedBg] = useState<SegmentationOptions['backgroundColor']>('transparent');
  const [customHex, setCustomHex] = useState<string>('#3B82F6');
  const [threshold, setThreshold] = useState<number>(4);
  const [customBgImg, setCustomBgImg] = useState<HTMLImageElement | null>(null);

  // Brush / Touch-up Tool
  const [activeTool, setActiveTool] = useState<'pointer' | 'eraser' | 'restore'>('pointer');
  const [brushSize, setBrushSize] = useState<number>(36);
  const [isBrushing, setIsBrushing] = useState<boolean>(false);

  // Canvases
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const origCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceFileRef = useRef<File | null>(null);
  const historyRef = useRef<ImageData[]>([]);

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
      // 1. Build Original Canvas
      const img = source instanceof HTMLImageElement ? source : await loadImage(source);
      const oCanvas = document.createElement('canvas');
      oCanvas.width = img.naturalWidth || img.width;
      oCanvas.height = img.naturalHeight || img.height;
      const oCtx = oCanvas.getContext('2d');
      oCtx?.drawImage(img, 0, 0);
      origCanvasRef.current = oCanvas;

      // 2. Run AI Segmentation to get mask
      const segmentedResult = await removeBackgroundAI(source, {
        backgroundColor: 'transparent',
        threshold,
        onProgress: (msg) => setProgressStatus(msg),
      });

      // Save mask
      maskCanvasRef.current = segmentedResult;

      // Save initial history
      const ctx = segmentedResult.getContext('2d');
      if (ctx) {
        historyRef.current = [ctx.getImageData(0, 0, segmentedResult.width, segmentedResult.height)];
      }

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

  // Manual Touch-up / Brush handlers on canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pointer' || !maskCanvasRef.current || !resultCanvasRef.current) return;
    setIsBrushing(true);
    applyBrushAtEvent(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isBrushing || activeTool === 'pointer') return;
    applyBrushAtEvent(e);
  };

  const handleCanvasMouseUp = () => {
    if (isBrushing && maskCanvasRef.current) {
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx) {
        const imgData = ctx.getImageData(
          0,
          0,
          maskCanvasRef.current.width,
          maskCanvasRef.current.height
        );
        historyRef.current.push(imgData);
        if (historyRef.current.length > 12) historyRef.current.shift();
      }
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

    const mCtx = mCanvas.getContext('2d');
    if (!mCtx) return;

    mCtx.save();
    mCtx.beginPath();
    mCtx.arc(x, y, (brushSize * scaleX) / 2, 0, Math.PI * 2);

    if (activeTool === 'eraser') {
      mCtx.globalCompositeOperation = 'destination-out';
      mCtx.fillStyle = 'rgba(0,0,0,1)';
      mCtx.fill();
    } else if (activeTool === 'restore' && origCanvasRef.current) {
      mCtx.globalCompositeOperation = 'source-over';
      mCtx.fillStyle = 'rgba(255,255,255,1)';
      mCtx.clip();
      mCtx.drawImage(origCanvasRef.current, 0, 0, mCanvas.width, mCanvas.height);
    }

    mCtx.restore();
    updateComposite();
  };

  const handleUndo = () => {
    if (historyRef.current.length > 1 && maskCanvasRef.current) {
      historyRef.current.pop();
      const prev = historyRef.current[historyRef.current.length - 1];
      const ctx = maskCanvasRef.current.getContext('2d');
      if (ctx && prev) {
        ctx.putImageData(prev, 0, 0);
        updateComposite();
      }
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

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="AI Background Remover & Replacer"
        description="Automatically remove and replace photo backgrounds with 100% original photo quality. Zero distortion, zero subject loss, only the background behind the photo is changed."
        categoryName="Photo Tools"
        categoryPath="/photo/bg-remover"
        badge="Zero Photo Alteration"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Photo to Change Background"
            subtitle="JPG, PNG, or WebP. 100% of clothing, arms, faces, and group subjects are preserved intact."
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-cyan-400 block mb-1">Zero Subject Loss</span>
              <span className="text-xs text-slate-400">All original pixels, clothes &amp; limbs kept untouched</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-sky-400 block mb-1">Passport Backdrops</span>
              <span className="text-xs text-slate-400">1-click White, Sky Blue, Navy &amp; Grey presets</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">Live Detail Slider</span>
              <span className="text-xs text-slate-400">Adjust background cutoff in real-time (0ms)</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Preview Area */}
          <div className="lg:col-span-8 space-y-4">
            {/* Interactive Brush Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
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
                  onClick={() => setActiveTool('restore')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                    activeTool === 'restore'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Restore parts of clothing or body from original photo"
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

              {activeTool !== 'pointer' && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Brush Size:</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
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
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  title="Undo last touch-up"
                >
                  <Undo className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>

                <button
                  onClick={() => {
                    setThreshold(4);
                    if (sourceFileRef.current) {
                      runAiSegmentation(sourceFileRef.current);
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Reset to fresh AI cutout"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Canvas Container */}
            <div
              className={`relative p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[480px] overflow-hidden ${
                selectedBg === 'transparent' ? 'bg-checkers' : 'bg-slate-950'
              }`}
            >
              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center z-20 gap-3 p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      AI Background Replacement
                    </h4>
                    <p className="text-xs text-cyan-300 font-mono">
                      {progressStatus}
                    </p>
                  </div>
                </div>
              )}

              <div className="max-w-full max-h-[520px] overflow-auto flex items-center justify-center">
                <canvas
                  ref={resultCanvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                  className={`max-h-[480px] w-auto object-contain rounded-lg shadow-2xl ${
                    activeTool !== 'pointer' ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                />
              </div>

              {activeTool !== 'pointer' && (
                <div className="absolute bottom-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-cyan-300 font-medium shadow-md">
                  💡 Click &amp; drag on image to {activeTool === 'restore' ? 'restore original details' : 'erase background'}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <button
                onClick={() => {
                  setOriginalImage(null);
                  origCanvasRef.current = null;
                  maskCanvasRef.current = null;
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                ← Upload Different Image
              </button>

              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Original Photo Pixels Preserved</span>
              </div>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-4 space-y-6">
            {/* Export Bar */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Download Output
              </h3>

              <DownloadDropdown
                getCanvas={() => resultCanvasRef.current}
                baseFilename="nexora-bg-changed"
                className="w-full flex"
              />
            </div>

            {/* Background Color Selector */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Replace Background
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

            {/* Live Detail & Clothing Protection Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  Subject Detail Protection
                </h3>
                <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  Live (0ms)
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Keep All Clothing &amp; Arms &larr; &rarr; Cut More Background</span>
                    <span className="font-mono text-cyan-400">{threshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    💡 <strong>Default: 4%</strong> preserves all sleeves, arms, and matching clothes with zero cutting.
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
