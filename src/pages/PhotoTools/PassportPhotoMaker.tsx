import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Eye,
  EyeOff,
  Printer,
  Trash2,
  Check,
  Sparkles,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { PASSPORT_SIZE_PRESETS } from '../../types/passport';
import {
  BG_PRESET_COLORS,
  removeBackgroundAI,
} from '../../utils/bgRemovalEngine';
import { loadImage, mmToPixels } from '../../utils/canvasUtils';
import { incrementStat } from '../../services/analyticsTracker';

export const PassportPhotoMaker: React.FC = () => {
  const navigate = useNavigate();
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [segmentedCanvas, setSegmentedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);

  // Settings
  const [selectedPreset, setSelectedPreset] = useState<string>('in-passport');
  const [customWidthMm, setCustomWidthMm] = useState<number>(35);
  const [customHeightMm, setCustomHeightMm] = useState<number>(45);
  
  // Background & AI Segment Settings
  const [aiBgRemoval, setAiBgRemoval] = useState<boolean>(true);
  const [backgroundColor, setBackgroundColor] = useState<string>('white');
  const [customHex, setCustomHex] = useState<string>('#3B82F6');
  const [sensitivity, setSensitivity] = useState<number>(50);
  const [edgeFeather, setEdgeFeather] = useState<number>(3);
  const [showOvalGuide, setShowOvalGuide] = useState<boolean>(true);
  const [showAdvancedBg, setShowAdvancedBg] = useState<boolean>(false);

  // Transform states
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Find active preset
  const activePreset =
    PASSPORT_SIZE_PRESETS.find((p) => p.id === selectedPreset) || PASSPORT_SIZE_PRESETS[0];

  const currentWidthMm = selectedPreset === 'custom' ? customWidthMm : activePreset.widthMm;
  const currentHeightMm = selectedPreset === 'custom' ? customHeightMm : activePreset.heightMm;

  // Handle image upload
  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    setOriginalImage(img);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);

    // Create source canvas for background removal
    const sCanvas = document.createElement('canvas');
    sCanvas.width = img.width;
    sCanvas.height = img.height;
    const sCtx = sCanvas.getContext('2d');
    sCtx?.drawImage(img, 0, 0);
    sourceCanvasRef.current = sCanvas;

    processAiSegmentation(sCanvas, sensitivity, edgeFeather);
  };

  // Perform AI Segmentation on the source photo
  const processAiSegmentation = useCallback(
    async (sCanvas: HTMLCanvasElement, sens: number, feather: number) => {
      setIsProcessingBg(true);

      try {
        const processed = await removeBackgroundAI(sCanvas, {
          sensitivity: sens,
          edgeFeather: feather,
          backgroundColor: 'transparent',
        });
        setSegmentedCanvas(processed);
      } catch (err) {
        console.error('AI background removal error:', err);
      } finally {
        setIsProcessingBg(false);
      }
    },
    []
  );

  // Re-run segmentation when sensitivity or feather changes
  useEffect(() => {
    if (sourceCanvasRef.current && aiBgRemoval) {
      processAiSegmentation(sourceCanvasRef.current, sensitivity, edgeFeather);
    }
  }, [sensitivity, edgeFeather, aiBgRemoval, processAiSegmentation]);

  // Render Passport Canvas
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !originalImage) return;

    const canvas = canvasRef.current;
    const dpi = 300;
    const widthPx = mmToPixels(currentWidthMm, dpi);
    const heightPx = mmToPixels(currentHeightMm, dpi);

    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background Layer
    if (aiBgRemoval && backgroundColor !== 'transparent') {
      let bgColor = '#FFFFFF';
      if (backgroundColor === 'custom') {
        bgColor = customHex;
      } else {
        const preset = BG_PRESET_COLORS.find((p) => p.id === backgroundColor);
        if (preset && preset.color !== 'transparent') bgColor = preset.color;
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, widthPx, heightPx);
    } else if (!aiBgRemoval) {
      // Clear or default background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, widthPx, heightPx);
    }

    // 2. Determine Subject to Draw (AI Transparent Subject or Original)
    const subjectToDraw: CanvasImageSource =
      aiBgRemoval && segmentedCanvas ? segmentedCanvas : originalImage;

    const srcW = aiBgRemoval && segmentedCanvas ? segmentedCanvas.width : originalImage.width;
    const srcH = aiBgRemoval && segmentedCanvas ? segmentedCanvas.height : originalImage.height;

    // 3. Draw Transformed Subject
    ctx.save();
    ctx.translate(widthPx / 2 + panX, heightPx / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);

    const baseScale = Math.max(widthPx / srcW, heightPx / srcH);
    const renderScale = baseScale * zoom;

    const drawW = srcW * renderScale;
    const drawH = srcH * renderScale;

    ctx.drawImage(subjectToDraw, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // 4. Draw ICAO Facial Guide Oval Overlay if enabled
    if (showOvalGuide) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = Math.max(2, Math.round(widthPx * 0.005));
      ctx.setLineDash([8, 6]);

      const ovalCenterX = widthPx / 2;
      const ovalCenterY = heightPx * 0.42;
      const radiusX = widthPx * 0.28;
      const radiusY = heightPx * 0.35;

      ctx.beginPath();
      ctx.ellipse(ovalCenterX, ovalCenterY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
      ctx.beginPath();
      ctx.moveTo(ovalCenterX - radiusX * 1.1, heightPx * 0.45);
      ctx.lineTo(ovalCenterX + radiusX * 1.1, heightPx * 0.45);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)';
      ctx.beginPath();
      ctx.moveTo(ovalCenterX - radiusX * 0.6, heightPx * 0.78);
      ctx.lineTo(ovalCenterX + radiusX * 0.6, heightPx * 0.78);
      ctx.stroke();

      ctx.restore();
    }
  }, [
    originalImage,
    segmentedCanvas,
    aiBgRemoval,
    currentWidthMm,
    currentHeightMm,
    backgroundColor,
    customHex,
    zoom,
    rotation,
    panX,
    panY,
    showOvalGuide,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSendToPrintSheet = () => {
    if (!canvasRef.current) return;
    setShowOvalGuide(false);

    setTimeout(() => {
      if (!canvasRef.current) return;
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.98);
      sessionStorage.setItem('nexora_print_sheet_photo', dataUrl);
      sessionStorage.setItem('nexora_print_photo_w', currentWidthMm.toString());
      sessionStorage.setItem('nexora_print_photo_h', currentHeightMm.toString());
      incrementStat('passport');
      navigate('/print/passport-sheet');
    }, 50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Passport Photo Maker"
        description="Create official passport and visa photos with automatic AI background removal, studio backdrop replacer, and ICAO biometric guides."
        categoryName="Photo Tools"
        categoryPath="/photo/passport"
        badge="AI Background Remover"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Portrait Photo for Passport"
            subtitle="JPG, PNG, or WebP. Automatic background removal & passport color replacer included."
          />

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">35 × 45 mm</span>
              <span className="text-xs text-slate-400">Indian Passport, UK, Schengen Visa</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-sky-400 block mb-1">2 × 2 Inch</span>
              <span className="text-xs text-slate-400">US Visa, OCI Card, PAN Photo</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">AI Background</span>
              <span className="text-xs text-slate-400">Auto removes &amp; replaces with white/blue</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas Preview Area */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[480px]">
              {isProcessingBg && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-20 rounded-2xl flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  <span className="text-xs font-semibold text-cyan-300">
                    Removing &amp; Replacing Background...
                  </span>
                </div>
              )}

              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="relative cursor-move overflow-hidden border-2 border-indigo-500/40 rounded-lg shadow-2xl bg-slate-950 flex items-center justify-center max-w-full"
                style={{
                  maxHeight: '440px',
                  aspectRatio: `${currentWidthMm} / ${currentHeightMm}`,
                }}
              >
                <canvas ref={canvasRef} className="max-h-[440px] w-auto object-contain" />
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <Move className="w-3.5 h-3.5 text-indigo-400" />
                <span>Click &amp; drag inside canvas to position face inside guide</span>
              </div>
            </div>

            {/* Quick Canvas Adjust Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-300 w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.min(3.0, +(z + 0.1).toFixed(2)))}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  onClick={() => setShowOvalGuide(!showOvalGuide)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    showOvalGuide
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {showOvalGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Biometric Guide</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setOriginalImage(null);
                  setSegmentedCanvas(null);
                }}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg ml-auto cursor-pointer"
                title="Change Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Export Action Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Export Options
              </h3>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleSendToPrintSheet}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Send to Print Sheet (4×6 / A4)</span>
                </button>

                <DownloadDropdown
                  getCanvas={() => canvasRef.current}
                  baseFilename={`passport-photo-${currentWidthMm}x${currentHeightMm}mm`}
                />
              </div>
            </div>

            {/* AI Background Remover & Replacer Panel */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-lg shadow-cyan-950/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    AI Background Remover
                  </h3>
                </div>

                <button
                  onClick={() => setAiBgRemoval(!aiBgRemoval)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    aiBgRemoval
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {aiBgRemoval ? '✓ Auto-Remove ON' : 'Original Photo'}
                </button>
              </div>

              {aiBgRemoval && (
                <>
                  {/* Background Color Presets */}
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-medium block">
                      Choose Passport Backdrop:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BG_PRESET_COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setBackgroundColor(color.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                            backgroundColor === color.id
                              ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-xs'
                              : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-600 shadow-inner shrink-0"
                            style={{
                              backgroundColor:
                                color.id === 'transparent' ? 'transparent' : color.color,
                            }}
                          />
                          <span className="truncate">{color.name}</span>
                        </button>
                      ))}

                      {/* Custom Hex Color Button */}
                      <div className="col-span-2 flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <input
                          type="color"
                          value={customHex}
                          onChange={(e) => {
                            setCustomHex(e.target.value);
                            setBackgroundColor('custom');
                          }}
                          className="w-7 h-7 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs text-slate-300 font-medium">
                          Custom Hex Color:
                        </span>
                        <input
                          type="text"
                          value={customHex}
                          onChange={(e) => {
                            setCustomHex(e.target.value);
                            setBackgroundColor('custom');
                          }}
                          className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white ml-auto"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sensitivity & Edge Tuning Toggle */}
                  <button
                    onClick={() => setShowAdvancedBg(!showAdvancedBg)}
                    className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer pt-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{showAdvancedBg ? 'Hide Edge & Sensitivity Controls' : 'Fine-Tune Sensitivity & Edges'}</span>
                  </button>

                  {showAdvancedBg && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>AI Detection Sensitivity:</span>
                          <span className="font-mono text-cyan-400">{sensitivity}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={sensitivity}
                          onChange={(e) => setSensitivity(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>Edge Softening &amp; Feather:</span>
                          <span className="font-mono text-cyan-400">{edgeFeather}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={edgeFeather}
                          onChange={(e) => setEdgeFeather(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Size Preset Selector */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Photo Size Dimensions
              </h3>

              <div className="space-y-2">
                {PASSPORT_SIZE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedPreset === preset.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs sm:text-sm">{preset.name}</span>
                      {selectedPreset === preset.id && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {preset.description}
                    </span>
                  </button>
                ))}
              </div>

              {selectedPreset === 'custom' && (
                <div className="pt-2 grid grid-cols-2 gap-3 border-t border-slate-800">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Width (mm)</label>
                    <input
                      type="number"
                      value={customWidthMm}
                      onChange={(e) => setCustomWidthMm(Math.max(10, parseInt(e.target.value) || 35))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Height (mm)</label>
                    <input
                      type="number"
                      value={customHeightMm}
                      onChange={(e) => setCustomHeightMm(Math.max(10, parseInt(e.target.value) || 45))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-mono"
                    />
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
