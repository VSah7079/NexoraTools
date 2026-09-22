import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  Maximize2,
  ScanLine,
  Move,
  Wand2,
  Frame,
  FileCheck,
} from 'lucide-react';
import {
  type Point,
  type ScanFilterType,
  warpPerspective,
  applyScanFilter,
  rotateCanvas,
  autoDetectCardCorners,
  getSmartCenteredCardCorners,
} from '../../utils/perspectiveTransform';

interface CornerAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sourceCanvas: HTMLCanvasElement | null;
  initialCorners?: [Point, Point, Point, Point];
  initialFilter?: ScanFilterType;
  cardWidthPx: number;
  cardHeightPx: number;
  onApply: (
    warpedCanvas: HTMLCanvasElement,
    corners: [Point, Point, Point, Point],
    filter: ScanFilterType,
    updatedSourceCanvas?: HTMLCanvasElement
  ) => void;
}

const CORNER_NAMES = [
  { label: 'Top-Left (TL)', color: '#00f0ff' },
  { label: 'Top-Right (TR)', color: '#3b82f6' },
  { label: 'Bottom-Right (BR)', color: '#a855f7' },
  { label: 'Bottom-Left (BL)', color: '#ec4899' },
];

export const CornerAdjustModal: React.FC<CornerAdjustModalProps> = ({
  isOpen,
  onClose,
  title,
  sourceCanvas,
  initialCorners,
  initialFilter = 'magic',
  cardWidthPx,
  cardHeightPx,
  onApply,
}) => {
  const [activeBaseCanvas, setActiveBaseCanvas] = useState<HTMLCanvasElement | null>(null);
  const [corners, setCorners] = useState<[Point, Point, Point, Point]>([
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ]);
  const [filter, setFilter] = useState<ScanFilterType>(initialFilter);
  const [draggingTarget, setDraggingTarget] = useState<
    'c0' | 'c1' | 'c2' | 'c3' | 'edge-top' | 'edge-bottom' | 'edge-left' | 'edge-right' | 'move-all' | null
  >(null);
  const [dragStart, setDragStart] = useState<{
    clientX: number;
    clientY: number;
    initialCorners: [Point, Point, Point, Point];
  } | null>(null);
  const [magPos, setMagPos] = useState<{ x: number; y: number; cornerLabel?: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize corners on modal open
  useEffect(() => {
    if (isOpen && sourceCanvas) {
      setActiveBaseCanvas(sourceCanvas);
      const w = sourceCanvas.width;
      const h = sourceCanvas.height;

      if (
        initialCorners &&
        initialCorners.length === 4 &&
        !(initialCorners[0].x === 0 && initialCorners[0].y === 0 && initialCorners[2].x === w && initialCorners[2].y === h)
      ) {
        setCorners([...initialCorners] as [Point, Point, Point, Point]);
      } else {
        // Smart Default: Centered CR80 card box or detected card
        const detected = autoDetectCardCorners(sourceCanvas);
        const isFull = detected[0].x <= w * 0.03 && detected[1].x >= w * 0.97;
        if (!isFull) {
          setCorners(detected);
        } else {
          setCorners(getSmartCenteredCardCorners(w, h));
        }
      }
      setFilter(initialFilter);
    }
  }, [isOpen, sourceCanvas, initialCorners, initialFilter]);

  // Compute live straightened preview
  const updateLivePreview = useCallback(() => {
    if (!activeBaseCanvas || !previewCanvasRef.current) return;

    try {
      const warped = warpPerspective(activeBaseCanvas, corners, cardWidthPx, cardHeightPx);
      const filtered = applyScanFilter(warped, filter);

      const pCanvas = previewCanvasRef.current;
      pCanvas.width = filtered.width;
      pCanvas.height = filtered.height;
      const ctx = pCanvas.getContext('2d');
      ctx?.drawImage(filtered, 0, 0);
    } catch {
      // Ignore preview errors during fast dragging
    }
  }, [activeBaseCanvas, corners, filter, cardWidthPx, cardHeightPx]);

  useEffect(() => {
    if (isOpen) {
      updateLivePreview();
    }
  }, [isOpen, updateLivePreview]);

  // Keyboard Hotkeys (Esc to Close, Enter to Apply)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        handleApply();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeBaseCanvas, corners, filter]);

  // Update Magnifier Loupe when dragging a corner (Adobe Scan precision crosshair)
  const updateLoupe = useCallback(
    (cornerPt: Point, mouseClientX: number, mouseClientY: number, label?: string) => {
      if (!activeBaseCanvas || !loupeCanvasRef.current) return;
      setMagPos({ x: mouseClientX, y: mouseClientY, cornerLabel: label });

      const loupe = loupeCanvasRef.current;
      loupe.width = 140;
      loupe.height = 140;
      const ctx = loupe.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 140, 140);

      // Draw magnified circular region
      const zoom = 3.2;
      const sw = 140 / zoom;
      const sh = 140 / zoom;
      const sx = Math.max(0, Math.min(activeBaseCanvas.width - sw, cornerPt.x - sw / 2));
      const sy = Math.max(0, Math.min(activeBaseCanvas.height - sh, cornerPt.y - sh / 2));

      ctx.drawImage(activeBaseCanvas, sx, sy, sw, sh, 0, 0, 140, 140);

      // Glowing Neon Blue Crosshair
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(70, 0);
      ctx.lineTo(70, 140);
      ctx.moveTo(0, 70);
      ctx.lineTo(140, 70);
      ctx.stroke();

      // Outer Ring Target
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(70, 70, 24, 0, Math.PI * 2);
      ctx.stroke();

      // Center Bullseye
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(70, 70, 3, 0, Math.PI * 2);
      ctx.fill();
    },
    [activeBaseCanvas]
  );

  if (!isOpen || !activeBaseCanvas) return null;

  const imgW = activeBaseCanvas.width;
  const imgH = activeBaseCanvas.height;

  // Auto-Detect Card Boundaries
  const handleAutoDetect = () => {
    if (!activeBaseCanvas) return;
    const detected = autoDetectCardCorners(activeBaseCanvas);
    const isFull = detected[0].x <= imgW * 0.03 && detected[1].x >= imgW * 0.97;
    if (!isFull) {
      setCorners(detected);
    } else {
      setCorners(getSmartCenteredCardCorners(imgW, imgH));
    }
  };

  // Reset to Smart Centered Card Frame (85.6 x 54 mm ratio)
  const handleResetCentered = () => {
    if (!activeBaseCanvas) return;
    setCorners(getSmartCenteredCardCorners(imgW, imgH));
  };

  // Reset to full frame
  const handleFullFrame = () => {
    if (!activeBaseCanvas) return;
    const padX = Math.round(imgW * 0.015);
    const padY = Math.round(imgH * 0.015);
    setCorners([
      { x: padX, y: padY },
      { x: imgW - padX, y: padY },
      { x: imgW - padX, y: imgH - padY },
      { x: padX, y: imgH - padY },
    ]);
  };

  // Rotate base image 90 degrees clockwise
  const handleRotate90 = () => {
    if (!activeBaseCanvas) return;
    const rotated = rotateCanvas(activeBaseCanvas, 90);
    setActiveBaseCanvas(rotated);
    setCorners(getSmartCenteredCardCorners(rotated.width, rotated.height));
  };

  // Pointer drag start
  const handlePointerDown = (
    target: 'c0' | 'c1' | 'c2' | 'c3' | 'edge-top' | 'edge-bottom' | 'edge-left' | 'edge-right' | 'move-all',
    e: React.PointerEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingTarget(target);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      initialCorners: [...corners],
    });

    if (target.startsWith('c')) {
      const idx = parseInt(target[1]);
      updateLoupe(corners[idx], e.clientX, e.clientY, CORNER_NAMES[idx].label);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTarget || !dragStart || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = imgW / rect.width;
    const scaleY = imgH / rect.height;

    const deltaX = (e.clientX - dragStart.clientX) * scaleX;
    const deltaY = (e.clientY - dragStart.clientY) * scaleY;
    const init = dragStart.initialCorners;

    const clamp = (val: number, max: number) => Math.max(0, Math.min(max, Math.round(val)));

    if (draggingTarget === 'move-all') {
      // Move entire crop box
      const minX = Math.min(...init.map((c) => c.x));
      const maxX = Math.max(...init.map((c) => c.x));
      const minY = Math.min(...init.map((c) => c.y));
      const maxY = Math.max(...init.map((c) => c.y));

      const boundDeltaX = Math.max(-minX, Math.min(imgW - maxX, deltaX));
      const boundDeltaY = Math.max(-minY, Math.min(imgH - maxY, deltaY));

      setCorners([
        { x: clamp(init[0].x + boundDeltaX, imgW), y: clamp(init[0].y + boundDeltaY, imgH) },
        { x: clamp(init[1].x + boundDeltaX, imgW), y: clamp(init[1].y + boundDeltaY, imgH) },
        { x: clamp(init[2].x + boundDeltaX, imgW), y: clamp(init[2].y + boundDeltaY, imgH) },
        { x: clamp(init[3].x + boundDeltaX, imgW), y: clamp(init[3].y + boundDeltaY, imgH) },
      ]);
    } else if (draggingTarget.startsWith('c')) {
      // Move single corner
      const idx = parseInt(draggingTarget[1]);
      const nextCorners = [...corners] as [Point, Point, Point, Point];
      nextCorners[idx] = {
        x: clamp(init[idx].x + deltaX, imgW),
        y: clamp(init[idx].y + deltaY, imgH),
      };
      setCorners(nextCorners);
      updateLoupe(nextCorners[idx], e.clientX, e.clientY, CORNER_NAMES[idx].label);
    } else if (draggingTarget === 'edge-top') {
      const nextCorners = [...corners] as [Point, Point, Point, Point];
      nextCorners[0] = { x: init[0].x, y: clamp(init[0].y + deltaY, imgH) };
      nextCorners[1] = { x: init[1].x, y: clamp(init[1].y + deltaY, imgH) };
      setCorners(nextCorners);
    } else if (draggingTarget === 'edge-bottom') {
      const nextCorners = [...corners] as [Point, Point, Point, Point];
      nextCorners[3] = { x: init[3].x, y: clamp(init[3].y + deltaY, imgH) };
      nextCorners[2] = { x: init[2].x, y: clamp(init[2].y + deltaY, imgH) };
      setCorners(nextCorners);
    } else if (draggingTarget === 'edge-left') {
      const nextCorners = [...corners] as [Point, Point, Point, Point];
      nextCorners[0] = { x: clamp(init[0].x + deltaX, imgW), y: init[0].y };
      nextCorners[3] = { x: clamp(init[3].x + deltaX, imgW), y: init[3].y };
      setCorners(nextCorners);
    } else if (draggingTarget === 'edge-right') {
      const nextCorners = [...corners] as [Point, Point, Point, Point];
      nextCorners[1] = { x: clamp(init[1].x + deltaX, imgW), y: init[1].y };
      nextCorners[2] = { x: clamp(init[2].x + deltaX, imgW), y: init[2].y };
      setCorners(nextCorners);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTarget !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDraggingTarget(null);
      setDragStart(null);
      setMagPos(null);
    }
  };

  const handleApply = () => {
    if (!activeBaseCanvas) return;
    const warped = warpPerspective(activeBaseCanvas, corners, cardWidthPx, cardHeightPx);
    const filtered = applyScanFilter(warped, filter);
    onApply(filtered, corners, filter, activeBaseCanvas);
    onClose();
  };

  // Polygon points string for SVG overlay
  const polygonPoints = corners
    .map((c) => `${(c.x / imgW) * 100}%,${(c.y / imgH) * 100}%`)
    .join(' ');

  // Midpoint coordinates for edge handles
  const midTop = { x: ((corners[0].x + corners[1].x) / 2 / imgW) * 100, y: ((corners[0].y + corners[1].y) / 2 / imgH) * 100 };
  const midRight = { x: ((corners[1].x + corners[2].x) / 2 / imgW) * 100, y: ((corners[1].y + corners[2].y) / 2 / imgH) * 100 };
  const midBottom = { x: ((corners[3].x + corners[2].x) / 2 / imgW) * 100, y: ((corners[3].y + corners[2].y) / 2 / imgH) * 100 };
  const midLeft = { x: ((corners[0].x + corners[3].x) / 2 / imgW) * 100, y: ((corners[0].y + corners[3].y) / 2 / imgH) * 100 };
  const centerPos = {
    x: ((corners[0].x + corners[1].x + corners[2].x + corners[3].x) / 4 / imgW) * 100,
    y: ((corners[0].y + corners[1].y + corners[2].y + corners[3].y) / 4 / imgH) * 100,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden backdrop-blur-2xl">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-heading font-black text-white">
                  {title}
                </h2>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  CR80 Card Homography
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Align 4 corners to ID card boundary. Perspective warp will automatically straighten tilted angles.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-950/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Alignment Tools */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleAutoDetect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-indigo-950/40 transition-all cursor-pointer"
              title="Automatically detect card edges"
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-300" />
              <span>🪄 Auto-Fit ID Card</span>
            </button>

            <button
              type="button"
              onClick={handleResetCentered}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold transition-all cursor-pointer"
              title="Reset to centered CR80 card frame"
            >
              <Frame className="w-3.5 h-3.5 text-slate-300" />
              <span>Center Card</span>
            </button>

            <button
              type="button"
              onClick={handleFullFrame}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold transition-all cursor-pointer"
              title="Reset corners to full frame edges"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
              <span>Full Frame</span>
            </button>

            <button
              type="button"
              onClick={handleRotate90}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold transition-all cursor-pointer"
              title="Rotate photo 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotate 90°</span>
            </button>
          </div>

          {/* Clarity Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-slate-400 font-semibold text-[11px] hidden sm:inline">Clarity Filter:</span>
            {(
              [
                { id: 'magic', label: '✨ Magic Color' },
                { id: 'original', label: 'Original' },
                { id: 'contrast', label: 'High Contrast' },
                { id: 'bw', label: 'Photocopy B&W' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left / Center Interactive Canvas */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center space-y-3">
            <div
              ref={containerRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative select-none max-w-full max-h-[50vh] sm:max-h-[58vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center cursor-crosshair touch-none"
              style={{
                aspectRatio: `${imgW} / ${imgH}`,
              }}
            >
              {/* Original Source Image */}
              <img
                src={activeBaseCanvas.toDataURL()}
                alt="Original Document"
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Glowing Quad Reticle */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polygon
                  points={polygonPoints}
                  fill="rgba(0, 240, 255, 0.18)"
                  stroke="#00f0ff"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))' }}
                  className="transition-all duration-75"
                />
              </svg>

              {/* Whole Box Drag / Move Center Handle */}
              <div
                onPointerDown={(e) => handlePointerDown('move-all', e)}
                style={{
                  left: `${centerPos.x}%`,
                  top: `${centerPos.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute z-10 cursor-move p-2 group"
                title="Drag to move whole box"
              >
                <div className="p-2 rounded-xl bg-slate-900/90 border border-cyan-400 text-cyan-300 shadow-xl group-hover:scale-110 transition-transform">
                  <Move className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* 4 Edge Push/Pull Handles */}
              <div
                onPointerDown={(e) => handlePointerDown('edge-top', e)}
                style={{ left: `${midTop.x}%`, top: `${midTop.y}%`, transform: 'translate(-50%, -50%)' }}
                className="absolute z-15 cursor-ns-resize p-1.5 group"
                title="Drag top edge"
              >
                <div className="w-6 h-2 rounded-full bg-cyan-400 border border-white shadow-md group-hover:scale-125 transition-transform" />
              </div>

              <div
                onPointerDown={(e) => handlePointerDown('edge-bottom', e)}
                style={{ left: `${midBottom.x}%`, top: `${midBottom.y}%`, transform: 'translate(-50%, -50%)' }}
                className="absolute z-15 cursor-ns-resize p-1.5 group"
                title="Drag bottom edge"
              >
                <div className="w-6 h-2 rounded-full bg-cyan-400 border border-white shadow-md group-hover:scale-125 transition-transform" />
              </div>

              <div
                onPointerDown={(e) => handlePointerDown('edge-left', e)}
                style={{ left: `${midLeft.x}%`, top: `${midLeft.y}%`, transform: 'translate(-50%, -50%)' }}
                className="absolute z-15 cursor-ew-resize p-1.5 group"
                title="Drag left edge"
              >
                <div className="w-2 h-6 rounded-full bg-cyan-400 border border-white shadow-md group-hover:scale-125 transition-transform" />
              </div>

              <div
                onPointerDown={(e) => handlePointerDown('edge-right', e)}
                style={{ left: `${midRight.x}%`, top: `${midRight.y}%`, transform: 'translate(-50%, -50%)' }}
                className="absolute z-15 cursor-ew-resize p-1.5 group"
                title="Drag right edge"
              >
                <div className="w-2 h-6 rounded-full bg-cyan-400 border border-white shadow-md group-hover:scale-125 transition-transform" />
              </div>

              {/* 4 Corner Draggable Handles */}
              {corners.map((corner, idx) => {
                const posX = (corner.x / imgW) * 100;
                const posY = (corner.y / imgH) * 100;
                const isDragging = draggingTarget === `c${idx}`;

                return (
                  <div
                    key={idx}
                    onPointerDown={(e) => handlePointerDown(`c${idx}` as any, e)}
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-20 cursor-grab active:cursor-grabbing p-2 touch-none ${
                      isDragging ? 'scale-125 z-30' : 'hover:scale-110'
                    } transition-transform`}
                  >
                    <div
                      style={{ backgroundColor: CORNER_NAMES[idx].color }}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center ring-4 ring-black/60"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Corner Legend & Instructions */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-medium">
              {CORNER_NAMES.map((c, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: c.color }} />
                  <span>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Live Straightened Preview Card */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="p-5 rounded-3xl bg-slate-950/90 border border-white/10 space-y-3.5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Straightened Preview</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  300 DPI Output
                </span>
              </div>

              {/* Preview Box */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-white/10 shadow-inner flex items-center justify-center overflow-hidden min-h-[180px]">
                <canvas
                  ref={previewCanvasRef}
                  className="w-full h-auto max-h-[220px] object-contain rounded-xl shadow-lg border border-slate-700/50"
                />
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                  <span>Target Dimensions:</span>
                  <span className="font-bold text-cyan-400">85.6 × 54.0 mm</span>
                </div>
                <p>
                  Perspective homography corrects tilted camera angles, removes messy backgrounds, and outputs clean photocopy-ready ID cards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Magnifier Loupe Overlay (Adobe Scan Crosshair while dragging corners) */}
        {draggingTarget?.startsWith('c') && magPos && (
          <div
            style={{
              left: Math.min(window.innerWidth - 160, Math.max(20, magPos.x - 70)),
              top: Math.max(20, magPos.y - 160),
            }}
            className="fixed z-50 pointer-events-none rounded-full overflow-hidden shadow-2xl border-2 border-cyan-400 bg-slate-950 flex flex-col items-center justify-center"
          >
            <canvas ref={loupeCanvasRef} className="w-[140px] h-[140px]" />
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-950/90 border-t border-white/10 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-extrabold text-xs shadow-xl shadow-cyan-950/50 transition-all cursor-pointer hover:scale-102"
          >
            <Check className="w-4 h-4" />
            <span>Apply &amp; Straighten Card</span>
          </button>
        </div>

      </div>
    </div>
  );
};
