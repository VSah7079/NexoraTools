import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Printer,
  Scissors,
  Check,
  ChevronDown,
  Maximize2,
  FileText,
  Sparkles,
  RotateCw,
  Plus,
  Minus,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Sun,
  Palette,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  LayoutGrid,
  Download,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize,
  Smile,
  ShieldCheck,
  Move,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { PAPER_SIZE_PRESETS, PASSPORT_SIZE_PRESETS, type SheetSettings } from '../../types/passport';
import { calculateSheetLayout, renderSheetToCanvas, type LayoutGridResult } from '../../utils/printCalculations';
import { BG_PRESET_COLORS, removeBackgroundAI } from '../../utils/bgRemovalEngine';
import { loadImage, mmToPixels } from '../../utils/canvasUtils';
import {
  detectFaceAndHead,
  calculatePassportFraming,
  getTopSafeFraming,
  getFullFitFraming,
  type DetectedFace,
} from '../../utils/faceDetectionUtils';
import { PDFDocument } from 'pdf-lib';
import { downloadBlob, printCanvas } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

export const PassportPhotoSheet: React.FC = () => {
  usePageSEO({
    title: 'Free Passport Photo Sheet Generator (4×6 & A4 Print Studio)',
    description: 'Auto-arrange and print 6, 8, or 30 passport photos on 4x6" photo paper or A4 sheets. 300 DPI high-resolution output with cutting lines and border guides.',
    keywords: 'passport photo sheet, 4x6 passport photo print, a4 passport sheet generator, print passport photos online, passport print studio, cyber cafe photo sheet, nexora tools',
    canonicalPath: '/passport-sheet',
    categoryName: 'Print Studio',
    toolName: 'Passport Photo Print Studio',
  });

  // Raw uploaded photo & AI segmentation state
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [segmentedCanvas, setSegmentedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState<boolean>(false);
  const [isDetectingFace, setIsDetectingFace] = useState<boolean>(false);
  const detectedFaceRef = useRef<DetectedFace | null>(null);

  // Active studio view mode: 'sheet' = full print sheet grid, 'photo' = single photo framing
  const [studioView, setStudioView] = useState<'sheet' | 'photo'>('sheet');
  // Active settings tab: 'layout' = paper & copies, 'edit' = background, lighting & crop
  const [activeTab, setActiveTab] = useState<'layout' | 'edit'>('layout');

  // Photo Framing & Adjustments
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Lighting & Color Enhancements
  const [brightness, setBrightness] = useState<number>(0); // -50 to +50
  const [contrast, setContrast] = useState<number>(0);     // -50 to +50
  const [saturation, setSaturation] = useState<number>(0); // -50 to +50
  const [showOvalGuide, setShowOvalGuide] = useState<boolean>(true);

  // AI Background Settings
  const [aiBgRemoval, setAiBgRemoval] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('white');
  const [customHex, setCustomHex] = useState<string>('#3B82F6');

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
    rows: 0,
    columns: 0, // 0 = automatically use maximum columns to fill page width
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

  // Dropdown States
  const [selectedPhotoPreset, setSelectedPhotoPreset] = useState<string>('in-passport');
  const [isPhotoPresetDropdownOpen, setIsPhotoPresetDropdownOpen] = useState<boolean>(false);
  const photoPresetDropdownRef = useRef<HTMLDivElement>(null);

  const [isPaperDropdownOpen, setIsPaperDropdownOpen] = useState<boolean>(false);
  const paperDropdownRef = useRef<HTMLDivElement>(null);

  const [currentLayout, setCurrentLayout] = useState<LayoutGridResult | null>(null);

  // Canvas Refs
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const singlePhotoCanvasRef = useRef<HTMLCanvasElement>(null);

  // Read sessionStorage if navigated from PassportPhotoMaker
  useEffect(() => {
    const storedPhoto = sessionStorage.getItem('nexora_print_sheet_photo');
    const storedW = sessionStorage.getItem('nexora_print_photo_w');
    const storedH = sessionStorage.getItem('nexora_print_photo_h');

    if (storedPhoto) {
      loadImage(storedPhoto).then(async (img) => {
        setOriginalImage(img);
        const w = storedW ? parseFloat(storedW) : 35;
        const h = storedH ? parseFloat(storedH) : 45;

        // Find matching preset
        const matching = PASSPORT_SIZE_PRESETS.find((p) => p.widthMm === w && p.heightMm === h);
        if (matching) {
          setSelectedPhotoPreset(matching.id);
        }

        setSettings((s) => {
          const next = { ...s, photoWidthMm: w, photoHeightMm: h };
          const layout = calculateSheetLayout(next, 300);
          return {
            ...next,
            copiesCount: s.autoFit ? layout.totalFitCount : Math.min(s.copiesCount, layout.totalFitCount),
          };
        });

        // Compute framing
        const widthPx = mmToPixels(w, 300);
        const heightPx = mmToPixels(h, 300);
        const detected = await detectFaceAndHead(img);
        detectedFaceRef.current = detected;
        const framing = calculatePassportFraming(img.width, img.height, widthPx, heightPx, detected);
        setZoom(framing.zoom);
        setPanX(framing.panX);
        setPanY(framing.panY);
      }).catch((err) => {
        console.error('Failed to load photo from session storage:', err);
      });
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (photoPresetDropdownRef.current && !photoPresetDropdownRef.current.contains(event.target as Node)) {
        setIsPhotoPresetDropdownOpen(false);
      }
      if (paperDropdownRef.current && !paperDropdownRef.current.contains(event.target as Node)) {
        setIsPaperDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activePhotoPreset =
    PASSPORT_SIZE_PRESETS.find((p) => p.id === selectedPhotoPreset) || PASSPORT_SIZE_PRESETS[0];

  const activePaperPreset =
    PAPER_SIZE_PRESETS.find((p) => p.id === settings.paperId) || PAPER_SIZE_PRESETS[0];

  // Handle Photo Preset Change
  const handleSelectPhotoPreset = (presetId: string) => {
    setSelectedPhotoPreset(presetId);
    setIsPhotoPresetDropdownOpen(false);
    const found = PASSPORT_SIZE_PRESETS.find((p) => p.id === presetId);
    if (found && presetId !== 'custom') {
      setSettings((s) => {
        const nextSettings = {
          ...s,
          photoWidthMm: found.widthMm,
          photoHeightMm: found.heightMm,
          columns: 0,
          rows: 0,
        };
        const nextLayout = calculateSheetLayout(nextSettings, 300);
        return {
          ...nextSettings,
          copiesCount: s.autoFit ? nextLayout.totalFitCount : Math.min(s.copiesCount, nextLayout.totalFitCount),
        };
      });

      // Recalculate framing for new aspect ratio
      if (originalImage) {
        const widthPx = mmToPixels(found.widthMm, 300);
        const heightPx = mmToPixels(found.heightMm, 300);
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
      }
    }
  };

  // Handle Paper Preset Change
  const handleSelectPaperPreset = (paperId: string) => {
    setSettings((s) => {
      const nextSettings = {
        ...s,
        paperId,
        columns: 0,
        rows: 0,
      };
      const nextLayout = calculateSheetLayout(nextSettings, 300);
      return {
        ...nextSettings,
        copiesCount: s.autoFit ? nextLayout.totalFitCount : Math.min(s.copiesCount, nextLayout.totalFitCount),
      };
    });
    setIsPaperDropdownOpen(false);
  };

  // Handle Image Upload
  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    setOriginalImage(img);
    setSegmentedCanvas(null);
    setRotation(0);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);

    const widthPx = mmToPixels(settings.photoWidthMm, 300);
    const heightPx = mmToPixels(settings.photoHeightMm, 300);

    // Auto detect face & set intelligent anti-cutoff framing
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
  };

  // Handle AI Background Extraction
  const handleRunAiBgRemoval = async () => {
    if (!originalImage) return;
    setIsProcessingBg(true);
    setAiBgRemoval(true);
    try {
      const result = await removeBackgroundAI(originalImage, {
        backgroundColor: 'transparent',
      });
      setSegmentedCanvas(result);
    } catch (err) {
      console.error('AI BG removal error:', err);
    } finally {
      setIsProcessingBg(false);
    }
  };

  // Generate Single Processed Photo Canvas (300 DPI)
  const getProcessedPhotoCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!originalImage) return null;

    const widthPx = mmToPixels(settings.photoWidthMm, 300);
    const heightPx = mmToPixels(settings.photoHeightMm, 300);

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Draw Background
    if (aiBgRemoval && segmentedCanvas) {
      let bgColor = '#FFFFFF';
      if (backgroundColor === 'custom') {
        bgColor = customHex;
      } else {
        const preset = BG_PRESET_COLORS.find((p) => p.id === backgroundColor);
        if (preset && preset.color !== 'transparent') bgColor = preset.color;
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, widthPx, heightPx);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, widthPx, heightPx);
    }

    // 2. Draw Transformed Subject
    const subjectToDraw: CanvasImageSource =
      aiBgRemoval && segmentedCanvas ? segmentedCanvas : originalImage;

    const srcW = aiBgRemoval && segmentedCanvas ? segmentedCanvas.width : originalImage.width;
    const srcH = aiBgRemoval && segmentedCanvas ? segmentedCanvas.height : originalImage.height;

    ctx.save();
    ctx.filter = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
    ctx.translate(widthPx / 2 + panX, heightPx / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);

    const baseScale = Math.max(widthPx / srcW, heightPx / srcH);
    const renderScale = baseScale * zoom;

    const drawW = srcW * renderScale;
    const drawH = srcH * renderScale;

    ctx.drawImage(subjectToDraw, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    return canvas;
  }, [
    originalImage,
    segmentedCanvas,
    aiBgRemoval,
    backgroundColor,
    customHex,
    settings.photoWidthMm,
    settings.photoHeightMm,
    brightness,
    contrast,
    saturation,
    panX,
    panY,
    rotation,
    zoom,
  ]);

  // Draw Single Photo Preview Canvas
  const drawSinglePhotoPreview = useCallback(() => {
    if (!singlePhotoCanvasRef.current || !originalImage) return;
    const canvas = singlePhotoCanvasRef.current;
    const widthPx = mmToPixels(settings.photoWidthMm, 300);
    const heightPx = mmToPixels(settings.photoHeightMm, 300);

    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const processed = getProcessedPhotoCanvas();
    if (processed) {
      ctx.drawImage(processed, 0, 0);
    }
  }, [originalImage, settings.photoWidthMm, settings.photoHeightMm, getProcessedPhotoCanvas]);

  // Draw Print Sheet Canvas
  const drawSheet = useCallback(() => {
    if (!originalImage || !sheetCanvasRef.current) return;

    const processed = getProcessedPhotoCanvas();
    if (!processed) return;

    const layout = calculateSheetLayout(settings, 300);
    setCurrentLayout(layout);
    renderSheetToCanvas(sheetCanvasRef.current, processed, settings, layout);
    incrementStat('passport');
  }, [originalImage, settings, getProcessedPhotoCanvas]);

  useEffect(() => {
    drawSheet();
    drawSinglePhotoPreview();
  }, [drawSheet, drawSinglePhotoPreview]);

  // Mouse Drag / Pan for Single Photo Framing
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

  // Touch handlers for mobile
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

  // Wheel zoom on preview
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setZoom((z) => Math.max(0.2, Math.min(4.0, +(z + delta).toFixed(2))));
  };

  // Preset Anti-Cutoff Framing Handlers
  const handleAutoFaceFit = async () => {
    if (!originalImage) return;
    const widthPx = mmToPixels(settings.photoWidthMm, 300);
    const heightPx = mmToPixels(settings.photoHeightMm, 300);

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
    const widthPx = mmToPixels(settings.photoWidthMm, 300);
    const heightPx = mmToPixels(settings.photoHeightMm, 300);
    const framing = getTopSafeFraming(originalImage.width, originalImage.height, widthPx, heightPx, zoom);
    setPanX(framing.panX);
    setPanY(framing.panY);
  };

  const handleFitFull = () => {
    if (!originalImage) return;
    const widthPx = mmToPixels(settings.photoWidthMm, 300);
    const heightPx = mmToPixels(settings.photoHeightMm, 300);
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

  // Adjust copies count safely
  const adjustCopies = (delta: number) => {
    if (!currentLayout) return;
    setSettings((s) => {
      const maxFit = currentLayout.totalFitCount;
      const nextVal = Math.max(1, Math.min(maxFit, s.copiesCount + delta));
      return { ...s, copiesCount: nextVal, autoFit: false };
    });
  };

  // Auto Fill full sheet
  const handleAutoFill = () => {
    if (!currentLayout) return;
    setSettings((s) => ({
      ...s,
      copiesCount: currentLayout.totalFitCount,
      autoFit: true,
    }));
  };

  // Studio Auto Enhance Lighting Preset
  const handleStudioAutoEnhance = () => {
    setBrightness(8);
    setContrast(12);
    setSaturation(8);
  };

  const handleResetLighting = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
  };

  const handleResetFraming = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setRotation(0);
  };

  // Export PDF at 300 DPI
  const handleExportPDF = async () => {
    if (!sheetCanvasRef.current || !currentLayout) return;
    const dataUrl = sheetCanvasRef.current.toDataURL('image/jpeg', 0.98);

    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(dataUrl);

    const ptW = currentLayout.paperWidthMm * (72 / 25.4);
    const ptH = currentLayout.paperHeightMm * (72 / 25.4);

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

  // Direct Browser Print (Full Sheet)
  const handlePrint = () => {
    if (!sheetCanvasRef.current) return;
    printCanvas(sheetCanvasRef.current, `passport-sheet-${settings.paperId}`);
  };

  // Direct Browser Print (Single Photo)
  const handlePrintSinglePhoto = () => {
    const processed = getProcessedPhotoCanvas();
    if (!processed) return;
    printCanvas(processed, `passport-single-photo-${settings.photoWidthMm}x${settings.photoHeightMm}`);
  };

  // Download Single Photo JPG
  const handleDownloadSinglePhoto = () => {
    const processed = getProcessedPhotoCanvas();
    if (!processed) return;
    processed.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `passport-photo-${settings.photoWidthMm}x${settings.photoHeightMm}.jpg`);
      }
    }, 'image/jpeg', 0.98);
  };

  const totalPossible = currentLayout?.totalFitCount || 8;
  const isFullyFilled = settings.copiesCount >= totalPossible;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
      <ToolHeader
        title="Passport Photo Studio & Print Sheet Generator"
        description="All-in-one studio: Automatic AI face detection, anti-cutoff head positioning, AI background replacer, lighting retouch, and auto-arranged 300 DPI print sheets."
        categoryName="Print Studio"
        categoryPath="/print/passport-sheet"
        badge="Anti-Cutoff AI Studio"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto space-y-8">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Portrait Photo to Edit & Print"
            subtitle="JPG, PNG, or WebP. Automatic face alignment (no head cutoffs), AI background replacer, lighting enhance & print sheet included."
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm shadow-lg hover:border-emerald-500/30 transition-all">
              <span className="text-xl font-bold text-emerald-400 block mb-1">4 × 6" (4R) Paper</span>
              <span className="text-xs text-slate-400">Fits 6 to 8 passport photos (Photo Studio Standard)</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm shadow-lg hover:border-cyan-500/30 transition-all">
              <span className="text-xl font-bold text-cyan-400 block mb-1">A4 Full Sheet</span>
              <span className="text-xs text-slate-400">Fits 30 passport photos across 5 columns</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-sm shadow-lg hover:border-indigo-500/30 transition-all">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Anti-Cutoff AI</span>
              <span className="text-xs text-slate-400">Auto-aligns head with 10% safe headroom</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Canvas Studio Preview */}
          <div className="lg:col-span-7 space-y-4">
            {/* Sheet / Photo View Switcher Card */}
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-4">
              {/* Preview Header Bar with View Mode Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/60 text-xs">
                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStudioView('sheet')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      studioView === 'sheet'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Print Sheet View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStudioView('photo');
                      setActiveTab('edit');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      studioView === 'photo'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Single Photo Edit</span>
                  </button>
                </div>

                {/* Right Quick Actions */}
                <div className="flex items-center gap-2">
                  {studioView === 'photo' && (
                    <button
                      type="button"
                      onClick={() => setShowOvalGuide((v) => !v)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer ${
                        showOvalGuide
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="Toggle Face Biometric Guide"
                    >
                      {showOvalGuide ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>Biometric Oval</span>
                    </button>
                  )}

                  {studioView === 'sheet' && (
                    <button
                      type="button"
                      onClick={() =>
                        setSettings((s) => {
                          const nextSettings = {
                            ...s,
                            orientation: (s.orientation === 'portrait' ? 'landscape' : 'portrait') as 'portrait' | 'landscape',
                            columns: 0,
                            rows: 0,
                          };
                          const nextLayout = calculateSheetLayout(nextSettings, 300);
                          return {
                            ...nextSettings,
                            copiesCount: s.autoFit ? nextLayout.totalFitCount : Math.min(s.copiesCount, nextLayout.totalFitCount),
                          };
                        })
                      }
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                      title="Rotate Sheet Orientation"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Rotate Sheet</span>
                    </button>
                  )}

                  {/* Change Photo */}
                  <button
                    type="button"
                    onClick={() => {
                      setOriginalImage(null);
                      setSegmentedCanvas(null);
                      sessionStorage.removeItem('nexora_print_sheet_photo');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>New Photo</span>
                  </button>
                </div>
              </div>

              {/* Interactive Canvas Presentation Area */}
              <div
                className="p-3 sm:p-5 bg-slate-950/70 rounded-2xl border border-slate-800/50 flex items-center justify-center min-h-[340px] sm:min-h-[460px] max-h-[560px] overflow-auto relative select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
              >
                {isDetectingFace && (
                  <div className="absolute top-4 left-4 z-20 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                    <Smile className="w-3.5 h-3.5 animate-pulse" />
                    <span>Detecting Face &amp; Aligning Head...</span>
                  </div>
                )}

                {/* 1. Full Print Sheet Canvas */}
                <div
                  className={`p-3 bg-white rounded-lg shadow-2xl max-w-full flex items-center justify-center transition-all ${
                    studioView === 'sheet' ? 'block' : 'hidden'
                  }`}
                >
                  <canvas
                    ref={sheetCanvasRef}
                    className="max-h-[460px] w-auto object-contain border border-slate-200 block shadow-sm"
                  />
                </div>

                {/* 2. Single Photo Interactive Edit Canvas */}
                <div
                  className={`relative p-2 bg-white rounded-lg shadow-2xl flex items-center justify-center cursor-move transition-all ${
                    studioView === 'photo' ? 'block' : 'hidden'
                  }`}
                >
                  <canvas
                    ref={singlePhotoCanvasRef}
                    className="max-h-[420px] w-auto object-contain border border-slate-200 block shadow-sm"
                  />

                  {/* Face Biometric Guide Overlay */}
                  {showOvalGuide && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <ellipse
                        cx="50"
                        cy="43"
                        rx="28"
                        ry="34"
                        fill="none"
                        stroke="rgba(56, 189, 248, 0.85)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      {/* Eyes Line */}
                      <line
                        x1="20"
                        y1="46"
                        x2="80"
                        y2="46"
                        stroke="rgba(251, 191, 36, 0.8)"
                        strokeWidth="1.2"
                        strokeDasharray="3 3"
                      />
                      {/* Chin Line */}
                      <line
                        x1="34"
                        y1="77"
                        x2="66"
                        y2="77"
                        stroke="rgba(52, 211, 153, 0.9)"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Smart Anti-Cutoff Framing Presets Toolbar */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Anti-Cutoff Framing Presets
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Head Safe (10% Headroom)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={handleAutoFaceFit}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Auto-detect face and position head with 10% safe headroom"
                  >
                    <Smile className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Auto Face Fit</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAlignTopHead}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    title="Align photo top to guarantee head/hair is never cut off"
                  >
                    <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fit Head (Top)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleFitFull}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    title="Fit whole photo inside passport frame"
                  >
                    <Maximize className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Fit Full Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCenter}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-700"
                    title="Center photo"
                  >
                    <Move className="w-3.5 h-3.5 text-amber-400" />
                    <span>Center</span>
                  </button>
                </div>

                {/* Nudges & Zoom Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2)))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
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
                      className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                    <span className="font-mono text-slate-300 text-[11px] w-10 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(4.0, +(z + 0.1).toFixed(2)))}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Directional Nudges */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => nudge(-15, 0)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                      title="Nudge Left"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => nudge(0, -15)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                      title="Nudge Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => nudge(0, 15)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                      title="Nudge Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => nudge(15, 0)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                      title="Nudge Right"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Reset button */}
                  <button
                    type="button"
                    onClick={handleResetFraming}
                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Bottom Sheet Status & Drag hint */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                {studioView === 'sheet' ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Grid: <strong className="text-white font-mono">{currentLayout?.cols || 2} Cols × {currentLayout?.rows || 4} Rows</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>
                        Capacity:{' '}
                        <strong className="text-emerald-400 font-mono">
                          {settings.copiesCount} / {totalPossible} Photos
                        </strong>{' '}
                        ({Math.round((settings.copiesCount / totalPossible) * 100)}% Full)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between">
                    <span className="text-indigo-300 text-[11px] flex items-center gap-1">
                      <Move className="w-3 h-3 text-indigo-400" />
                      Drag canvas or use arrow buttons to frame head inside oval guide.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Full Studio Settings Panel */}
          <div className="lg:col-span-5 space-y-5">
            {/* Top Hero Bar: 1-Click Print & Export */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-emerald-400" />
                  Print &amp; Export Studio
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  300 DPI Studio
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-500/20 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Printer className="w-4 h-4" />
                  <span>1-Click Print Sheet</span>
                </button>

                <DownloadDropdown
                  getCanvas={() => sheetCanvasRef.current}
                  baseFilename={`passport-sheet-${settings.paperId}`}
                  onExportPDF={handleExportPDF}
                  onPrint={handlePrint}
                />
              </div>

              {/* Single Photo Direct Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Single Photo:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSinglePhoto}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Download Single</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintSinglePhoto}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3 text-emerald-400" />
                    <span>Print Single</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Studio Mode Selector Tabs */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('layout')}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'layout'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Sheet &amp; Layout</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('edit');
                  setStudioView('photo');
                }}
                className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'edit'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Photo Edit &amp; AI BG</span>
              </button>
            </div>

            {/* TAB 1: SHEET & LAYOUT CONTROLS */}
            {activeTab === 'layout' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* 1. Photo Size Dimensions Dropdown */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs backdrop-blur-xl transition-all ${
                    isPhotoPresetDropdownOpen
                      ? 'relative z-40 ring-1 ring-indigo-500/50 shadow-2xl shadow-indigo-950/40'
                      : 'relative z-20'
                  }`}
                  ref={photoPresetDropdownRef}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                      1. Photo Size Dimensions
                    </h3>
                    <span className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {settings.photoWidthMm} × {settings.photoHeightMm} mm
                    </span>
                  </div>

                  {/* Dropdown Trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPhotoPresetDropdownOpen((prev) => !prev);
                        setIsPaperDropdownOpen(false);
                      }}
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-indigo-500/60 text-left transition-all cursor-pointer flex items-center justify-between shadow-inner group"
                    >
                      <div className="space-y-0.5 pr-2 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm text-white block truncate group-hover:text-indigo-300 transition-colors">
                          {activePhotoPreset.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {activePhotoPreset.description}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-transform duration-200 shrink-0 ${isPhotoPresetDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Options List */}
                    {isPhotoPresetDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl shadow-black/90 z-50 space-y-1 max-h-64 overflow-y-auto backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                        {PASSPORT_SIZE_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPhotoPreset(preset.id)}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                              selectedPhotoPreset === preset.id
                                ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm'
                                : 'bg-slate-950/60 border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-semibold text-xs text-white block">{preset.name}</span>
                              <span className="text-[10.5px] text-slate-400 block leading-tight">
                                {preset.description}
                              </span>
                            </div>
                            {selectedPhotoPreset === preset.id && (
                              <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Paper Size Selector */}
                <div
                  className={`p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs backdrop-blur-xl transition-all ${
                    isPaperDropdownOpen
                      ? 'relative z-30 ring-1 ring-emerald-500/50 shadow-2xl shadow-emerald-950/40'
                      : 'relative z-10'
                  }`}
                  ref={paperDropdownRef}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      2. Print Sheet Paper Size
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {activePaperPreset.name.split('(')[0]}
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPaperDropdownOpen((prev) => !prev);
                        setIsPhotoPresetDropdownOpen(false);
                      }}
                      className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-emerald-500/60 text-left transition-all cursor-pointer flex items-center justify-between shadow-inner group"
                    >
                      <div className="space-y-0.5 pr-2 min-w-0">
                        <span className="font-semibold text-xs sm:text-sm text-white block truncate group-hover:text-emerald-300 transition-colors">
                          {activePaperPreset.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {activePaperPreset.description}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-transform duration-200 shrink-0 ${isPaperDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isPaperDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-2xl bg-slate-900 border border-emerald-500/40 shadow-2xl shadow-black/90 z-50 space-y-1 max-h-64 overflow-y-auto backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                        {PAPER_SIZE_PRESETS.map((paper) => (
                          <button
                            key={paper.id}
                            type="button"
                            onClick={() => handleSelectPaperPreset(paper.id)}
                            className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                              settings.paperId === paper.id
                                ? 'bg-emerald-600/20 border-emerald-500/60 text-white shadow-sm'
                                : 'bg-slate-950/60 border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-semibold text-xs text-white block">{paper.name}</span>
                              <span className="text-[10.5px] text-slate-400 block leading-tight">
                                {paper.description}
                              </span>
                            </div>
                            {settings.paperId === paper.id && (
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Number of Copies & Auto Fill */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-xs backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5 text-indigo-400" />
                      3. Number of Copies
                    </h3>
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        isFullyFilled
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      }`}
                    >
                      {isFullyFilled ? '✓ Sheet Full' : `Auto Fill Full (${totalPossible})`}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex-1 justify-between">
                      <button
                        type="button"
                        onClick={() => adjustCopies(-1)}
                        disabled={settings.copiesCount <= 1}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-mono font-bold text-base text-white">
                        {settings.copiesCount} <span className="text-xs font-normal text-slate-400">Photos</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustCopies(1)}
                        disabled={settings.copiesCount >= totalPossible}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {[2, 4, 6, 8, 12, 16, 30].map((num) => {
                        if (num > totalPossible) return null;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSettings((s) => ({ ...s, copiesCount: num, autoFit: false }))}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              settings.copiesCount === num
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Cut Lines & Border Options */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-xs backdrop-blur-xl">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-cyan-400" />
                    4. Guidelines &amp; Borders
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.showCutLines}
                        onChange={(e) => setSettings((s) => ({ ...s, showCutLines: e.target.checked }))}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-300">Cutting Guides</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                      <input
                        type="checkbox"
                        checked={settings.showPhotoBorder}
                        onChange={(e) => setSettings((s) => ({ ...s, showPhotoBorder: e.target.checked }))}
                        className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-slate-300">Photo Border</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PHOTO EDIT & AI RETOUCH CONTROLS */}
            {activeTab === 'edit' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* AI Background Replacer */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-xs backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-indigo-400" />
                      AI Background Replacer
                    </h3>

                    <button
                      type="button"
                      onClick={handleRunAiBgRemoval}
                      disabled={isProcessingBg}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3 h-3 ${isProcessingBg ? 'animate-spin' : ''}`} />
                      <span>{isProcessingBg ? 'Extracting...' : '1-Click AI BG'}</span>
                    </button>
                  </div>

                  {/* Background Color Presets */}
                  <div>
                    <label className="text-slate-400 block mb-2 font-medium">Passport Backdrop Color:</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BG_PRESET_COLORS.map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => {
                            if (!segmentedCanvas && !isProcessingBg) {
                              handleRunAiBgRemoval();
                            }
                            setAiBgRemoval(true);
                            setBackgroundColor(bg.id);
                          }}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                            aiBgRemoval && backgroundColor === bg.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span
                            className="w-5 h-5 rounded-full border border-slate-600 shadow-sm block"
                            style={{ backgroundColor: bg.color === 'transparent' ? '#ffffff' : bg.color }}
                          />
                          <span className="text-[10px] font-medium truncate w-full">{bg.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Color Input & Original BG Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setAiBgRemoval(false)}
                      className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        !aiBgRemoval
                          ? 'bg-slate-700 border-slate-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Keep Original BG
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Custom Hex:</span>
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                          setBackgroundColor('custom');
                          setAiBgRemoval(true);
                        }}
                        className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Framing & Crop Controls */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-xs backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Framing &amp; Positioning
                    </h3>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCw className="w-3 h-3 text-indigo-400" />
                      <span>Rotate 90°</span>
                    </button>
                  </div>

                  {/* Zoom Slider */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Face Zoom Scale:</span>
                      <span className="font-mono text-cyan-400">{(zoom * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ZoomOut className="w-4 h-4 text-slate-500" />
                      <input
                        type="range"
                        min="0.2"
                        max="4.0"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      />
                      <ZoomIn className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>

                  {/* Pan X and Pan Y Manual Sliders */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Pan X (Horizontal):</span>
                        <span className="font-mono text-slate-200">{panX}px</span>
                      </div>
                      <input
                        type="range"
                        min="-600"
                        max="600"
                        step="5"
                        value={panX}
                        onChange={(e) => setPanX(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Pan Y (Vertical):</span>
                        <span className="font-mono text-slate-200">{panY}px</span>
                      </div>
                      <input
                        type="range"
                        min="-600"
                        max="600"
                        step="5"
                        value={panY}
                        onChange={(e) => setPanY(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Studio Lighting & Color Enhancements */}
                <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3.5 text-xs backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Studio Lighting &amp; Color
                    </h3>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleStudioAutoEnhance}
                        className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-Enhance</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleResetLighting}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Brightness:</span>
                      <span className="font-mono text-amber-400">{brightness > 0 ? `+${brightness}` : brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={brightness}
                      onChange={(e) => setBrightness(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Contrast:</span>
                      <span className="font-mono text-cyan-400">{contrast > 0 ? `+${contrast}` : contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={contrast}
                      onChange={(e) => setContrast(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Saturation:</span>
                      <span className="font-mono text-indigo-400">{saturation > 0 ? `+${saturation}` : saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={saturation}
                      onChange={(e) => setSaturation(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
