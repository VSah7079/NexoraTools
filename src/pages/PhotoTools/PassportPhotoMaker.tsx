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
  ChevronDown,
  FileCheck2,
  Award,
  Calendar,
  User,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Smile,
  ShieldCheck,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { PASSPORT_SIZE_PRESETS } from '../../types/passport';
import { EXAM_VISA_PRESETS } from '../../data/examPresets';
import {
  BG_PRESET_COLORS,
  removeBackgroundAI,
} from '../../utils/bgRemovalEngine';
import { loadImage, mmToPixels } from '../../utils/canvasUtils';
import {
  detectFaceAndHead,
  calculatePassportFraming,
  getTopSafeFraming,
  getFullFitFraming,
  type DetectedFace,
} from '../../utils/faceDetectionUtils';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

export const PassportPhotoMaker: React.FC = () => {
  usePageSEO({
    title: 'Free Passport Photo Maker Online (35×45mm, 2×2", Govt Exam Presets)',
    description: 'Create official 35x45mm and 2x2 inch passport and visa photos online. Features automatic AI face detection, anti-cutoff head positioning, backdrop color replacer (white/blue), and SSC/UPSC exam date strips.',
    keywords: 'passport photo maker, passport size photo, create passport photo online free, 35x45mm photo maker, 2x2 inch photo, indian passport photo maker, us visa photo, ssc upsc photo maker, nexora tools',
    canonicalPath: '/passport-photo-maker',
    categoryName: 'Photo Suite',
    toolName: 'Passport Photo Maker',
  });

  const navigate = useNavigate();
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [segmentedCanvas, setSegmentedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);
  const [isDetectingFace, setIsDetectingFace] = useState<boolean>(false);
  const detectedFaceRef = useRef<DetectedFace | null>(null);

  // Settings
  const [selectedPreset, setSelectedPreset] = useState<string>('in-passport');
  const [customWidthMm, setCustomWidthMm] = useState<number>(35);
  const [customHeightMm, setCustomHeightMm] = useState<number>(45);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'standard' | 'exam_visa'>('exam_visa');
  const presetDropdownRef = useRef<HTMLDivElement>(null);

  // Name & Date on Photo (SSC, UPSC, NEET, etc.)
  const [addNameDateStrip, setAddNameDateStrip] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `DOP: ${dd}-${mm}-${yyyy}`;
  });

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (presetDropdownRef.current && !presetDropdownRef.current.contains(event.target as Node)) {
        setIsPresetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    setRotation(0);

    const widthPx = mmToPixels(currentWidthMm, 300);
    const heightPx = mmToPixels(currentHeightMm, 300);

    // Auto-detect face and compute anti-cutoff passport framing
    setIsDetectingFace(true);
    try {
      const detected = await detectFaceAndHead(img);
      detectedFaceRef.current = detected;
      const framing = calculatePassportFraming(img.width, img.height, widthPx, heightPx, detected);
      setZoom(framing.zoom);
      setPanX(framing.panX);
      setPanY(framing.panY);
    } catch {
      const framing = getTopSafeFraming(img.width, img.height, widthPx, heightPx, 1.0);
      setZoom(framing.zoom);
      setPanX(framing.panX);
      setPanY(framing.panY);
    } finally {
      setIsDetectingFace(false);
    }

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

    // 4. Draw Official Name & Date Strip (SSC / UPSC / NTA format)
    if (addNameDateStrip && (candidateName.trim() || photoDate.trim())) {
      const stripHeight = Math.round(heightPx * 0.18);
      const stripY = heightPx - stripHeight;

      // Solid White Strip
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, stripY, widthPx, stripHeight);

      // Top separating hairline border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(widthPx * 0.004));
      ctx.beginPath();
      ctx.moveTo(0, stripY);
      ctx.lineTo(widthPx, stripY);
      ctx.stroke();

      // Typography
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const fontSize = Math.round(stripHeight * 0.32);

      if (candidateName.trim() && photoDate.trim()) {
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.fillText(candidateName.trim().toUpperCase(), widthPx / 2, stripY + stripHeight * 0.32);
        ctx.font = `600 ${Math.round(fontSize * 0.85)}px Arial, sans-serif`;
        ctx.fillText(photoDate.trim().toUpperCase(), widthPx / 2, stripY + stripHeight * 0.72);
      } else if (candidateName.trim()) {
        ctx.font = `bold ${Math.round(fontSize * 1.1)}px Arial, sans-serif`;
        ctx.fillText(candidateName.trim().toUpperCase(), widthPx / 2, stripY + stripHeight * 0.5);
      } else if (photoDate.trim()) {
        ctx.font = `600 ${Math.round(fontSize * 1.0)}px Arial, sans-serif`;
        ctx.fillText(photoDate.trim().toUpperCase(), widthPx / 2, stripY + stripHeight * 0.5);
      }
    }
  }, [
    originalImage,
    segmentedCanvas,
    aiBgRemoval,
    backgroundColor,
    customHex,
    currentWidthMm,
    currentHeightMm,
    panX,
    panY,
    rotation,
    zoom,
    addNameDateStrip,
    candidateName,
    photoDate,
  ]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse & Touch Dragging for Single Photo Framing
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

  // Touch handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - panX,
        y: e.touches[0].clientY - panY,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStart.x);
    setPanY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel Zoom on Canvas
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((z) => Math.max(0.2, Math.min(4.0, +(z + zoomFactor).toFixed(2))));
  };

  // Preset Anti-Cutoff Framing Handlers
  const handleAutoFaceFit = async () => {
    if (!originalImage) return;
    const widthPx = mmToPixels(currentWidthMm, 300);
    const heightPx = mmToPixels(currentHeightMm, 300);

    if (!detectedFaceRef.current) {
      setIsDetectingFace(true);
      detectedFaceRef.current = await detectFaceAndHead(originalImage);
      setIsDetectingFace(false);
    }

    const framing = calculatePassportFraming(
      originalImage.width,
      originalImage.height,
      widthPx,
      heightPx,
      detectedFaceRef.current
    );
    setZoom(framing.zoom);
    setPanX(framing.panX);
    setPanY(framing.panY);
  };

  const handleAlignTopHead = () => {
    if (!originalImage) return;
    const widthPx = mmToPixels(currentWidthMm, 300);
    const heightPx = mmToPixels(currentHeightMm, 300);
    const framing = getTopSafeFraming(originalImage.width, originalImage.height, widthPx, heightPx, zoom);
    setPanX(framing.panX);
    setPanY(framing.panY);
  };

  const handleFitFull = () => {
    if (!originalImage) return;
    const widthPx = mmToPixels(currentWidthMm, 300);
    const heightPx = mmToPixels(currentHeightMm, 300);
    const framing = getFullFitFraming(originalImage.width, originalImage.height, widthPx, heightPx);
    setZoom(framing.zoom);
    setPanX(framing.panX);
    setPanY(framing.panY);
  };

  const handleCenter = () => {
    setPanX(0);
    setPanY(0);
  };

  const nudge = (dx: number, dy: number) => {
    setPanX((px) => px + dx);
    setPanY((py) => py + dy);
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
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Passport Photo Maker"
        description="Create official passport and visa photos with automatic AI face detection, anti-cutoff head positioning, studio backdrop replacer, and ICAO biometric guides."
        categoryName="Photo Tools"
        categoryPath="/photo/passport"
        badge="AI Biometric Framing"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Portrait Photo for Passport"
            subtitle="JPG, PNG, or WebP. Automatic face detection, anti-cutoff head positioning & backdrop replacer included."
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
              <span className="text-xl font-bold text-emerald-400 block mb-1">Anti-Cutoff AI</span>
              <span className="text-xs text-slate-400">Auto-aligns head with 10% safe headroom</span>
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

              {isDetectingFace && (
                <div className="absolute top-4 left-4 z-20 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                  <Smile className="w-3.5 h-3.5 animate-pulse" />
                  <span>Detecting Face &amp; Aligning Head...</span>
                </div>
              )}

              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
                className="relative cursor-move overflow-hidden border-2 border-indigo-500/40 rounded-lg shadow-2xl bg-slate-950 flex items-center justify-center max-w-full select-none"
                style={{
                  maxHeight: '440px',
                  aspectRatio: `${currentWidthMm} / ${currentHeightMm}`,
                }}
              >
                <canvas ref={canvasRef} className="max-h-[440px] w-auto object-contain" />

                {/* Biometric Guide SVG Overlay (UI Only - Not baked into photo) */}
                {showOvalGuide && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Head Oval */}
                    <ellipse cx="50" cy="43" rx="28" ry="34" fill="none" stroke="rgba(56, 189, 248, 0.85)" strokeWidth="1.5" strokeDasharray="4 3" />
                    {/* Eye Level Line */}
                    <line x1="20" y1="46" x2="80" y2="46" stroke="rgba(251, 191, 36, 0.8)" strokeWidth="1.2" strokeDasharray="3 3" />
                    {/* Chin Line */}
                    <line x1="34" y1="77" x2="66" y2="77" stroke="rgba(52, 211, 153, 0.9)" strokeWidth="1.5" />
                  </svg>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <Move className="w-3.5 h-3.5 text-indigo-400" />
                <span>Drag to reposition | Scroll wheel to zoom | Head is safe inside guideline</span>
              </div>
            </div>

            {/* Smart Framing Quick Presets Toolbar */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Smart Anti-Cutoff Framing Presets
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">10% Safe Headroom</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={handleAutoFaceFit}
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  title="Auto-detect face and position head with 10% safe headroom"
                >
                  <Smile className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Auto Face Fit</span>
                </button>

                <button
                  type="button"
                  onClick={handleAlignTopHead}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Align photo top to guarantee head/hair is never cut off"
                >
                  <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fit Head (Top)</span>
                </button>

                <button
                  type="button"
                  onClick={handleFitFull}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Fit whole photo inside passport box"
                >
                  <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Fit Full Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleCenter}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Center photo horizontally & vertically"
                >
                  <Move className="w-3.5 h-3.5 text-amber-400" />
                  <span>Center</span>
                </button>
              </div>

              {/* Nudge & Zoom Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2)))}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                  />
                  <span className="font-mono text-slate-300 w-12 text-center text-[11px]">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(4.0, +(z + 0.1).toFixed(2)))}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Directional Nudges */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => nudge(-15, 0)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    title="Nudge Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => nudge(0, -15)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    title="Nudge Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => nudge(0, 15)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    title="Nudge Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => nudge(15, 0)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                    title="Nudge Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Rotate & Guide */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer text-[11px]"
                  >
                    <RotateCw className="w-3 h-3 text-indigo-400" />
                    <span>Rotate</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowOvalGuide(!showOvalGuide)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer text-[11px] ${
                      showOvalGuide
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {showOvalGuide ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    <span>Biometric Guide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOriginalImage(null);
                      setSegmentedCanvas(null);
                    }}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg cursor-pointer ml-1"
                    title="Change Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
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

            {/* Official Indian Exam & Visa Quick Presets */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Govt Exam &amp; Visa Standards
                  </h3>
                </div>
                <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('exam_visa')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      activeTab === 'exam_visa'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Exams &amp; Visa
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('standard')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      activeTab === 'standard'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Standard
                  </button>
                </div>
              </div>

              {activeTab === 'exam_visa' ? (
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {EXAM_VISA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset('custom');
                        setCustomWidthMm(preset.widthMm);
                        setCustomHeightMm(preset.heightMm);
                        if (preset.bgColorHex) {
                          setCustomHex(preset.bgColorHex);
                          setBackgroundColor(preset.bgColorHex === '#ffffff' ? 'white' : 'custom');
                          setAiBgRemoval(true);
                        }
                        if (preset.requireNameDate) {
                          setAddNameDateStrip(true);
                        }
                      }}
                      className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-800/50 text-left transition-all group flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors truncate">
                            {preset.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                            {preset.widthMm}×{preset.heightMm}mm
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                          {preset.notes}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5 text-[9px] text-slate-500">
                        <span className="capitalize">{preset.bgRequirement || 'White'}</span>
                        {preset.requireNameDate && (
                          <span className="text-amber-400">· Name/Date Req.</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="relative" ref={presetDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-indigo-500/60 text-left transition-all cursor-pointer flex items-center justify-between shadow-inner group"
                  >
                    <div className="space-y-0.5 pr-2 min-w-0">
                      <span className="font-semibold text-xs sm:text-sm text-white block truncate group-hover:text-indigo-300 transition-colors">
                        {activePreset.name}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {activePreset.description}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-transform duration-200 shrink-0 ${
                        isPresetDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isPresetDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl shadow-black/90 z-50 space-y-1 max-h-64 overflow-y-auto backdrop-blur-2xl">
                      {PASSPORT_SIZE_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(preset.id);
                            setIsPresetDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                            selectedPreset === preset.id
                              ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-xs'
                              : 'bg-slate-950/60 border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="space-y-0.5 min-w-0">
                            <span className="font-semibold text-xs text-white block">
                              {preset.name}
                            </span>
                            <span className="text-[10.5px] text-slate-400 block leading-tight">
                              {preset.description}
                            </span>
                          </div>
                          {selectedPreset === preset.id && (
                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Official Name & Date on Photo (SSC / NTA Strip) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Name &amp; Date on Photo
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddNameDateStrip(!addNameDateStrip)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    addNameDateStrip
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {addNameDateStrip ? '✓ Enabled' : 'Disabled'}
                </button>
              </div>

              {addNameDateStrip && (
                <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Candidate Name:
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. RAHUL SHARMA"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white uppercase focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      Date of Photo (DOP):
                    </label>
                    <input
                      type="text"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      placeholder="e.g. DOP: 15-08-2024"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
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
