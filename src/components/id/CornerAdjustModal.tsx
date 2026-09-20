import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  RotateCw,
  Maximize2,
  ScanLine,
  Sliders,
} from 'lucide-react';
import {
  type Point,
  type ScanFilterType,
  warpPerspective,
  applyScanFilter,
  rotateCanvas,
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

const CORNER_NAMES = ['Top-Left (TL)', 'Top-Right (TR)', 'Bottom-Right (BR)', 'Bottom-Left (BL)'];
const CORNER_COLORS = [
  '#00f0ff', // Cyber Cyan (TL)
  '#3b82f6', // Bright Blue (TR)
  '#a855f7', // Vivid Violet (BR)
  '#ec4899', // Pink (BL)
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
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [magPos, setMagPos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize or reset when opened
  useEffect(() => {
    if (isOpen && sourceCanvas) {
      setActiveBaseCanvas(sourceCanvas);

      if (initialCorners && initialCorners.length === 4) {
        setCorners([...initialCorners] as [Point, Point, Point, Point]);
      } else {
        const w = sourceCanvas.width;
        const h = sourceCanvas.height;
        setCorners([
          { x: Math.round(w * 0.02), y: Math.round(h * 0.02) },
          { x: Math.round(w * 0.98), y: Math.round(h * 0.02) },
          { x: Math.round(w * 0.98), y: Math.round(h * 0.98) },
          { x: Math.round(w * 0.02), y: Math.round(h * 0.98) },
        ]);
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
      // Fallback
    }
  }, [activeBaseCanvas, corners, filter, cardWidthPx, cardHeightPx]);

  useEffect(() => {
    if (isOpen) {
      updateLivePreview();
    }
  }, [isOpen, updateLivePreview]);

  // Update Magnifier Loupe when dragging a corner (Adobe Scan precision crosshair)
  const updateLoupe = useCallback(
    (cornerPt: Point, mouseClientX: number, mouseClientY: number) => {
      if (!activeBaseCanvas || !loupeCanvasRef.current) return;
      setMagPos({ x: mouseClientX, y: mouseClientY });

      const loupe = loupeCanvasRef.current;
      loupe.width = 130;
      loupe.height = 130;
      const ctx = loupe.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, 130, 130);

      // Draw magnified circular region
      const zoom = 2.8;
      const sw = 130 / zoom;
      const sh = 130 / zoom;
      const sx = Math.max(0, Math.min(activeBaseCanvas.width - sw, cornerPt.x - sw / 2));
      const sy = Math.max(0, Math.min(activeBaseCanvas.height - sh, cornerPt.y - sh / 2));

      ctx.drawImage(activeBaseCanvas, sx, sy, sw, sh, 0, 0, 130, 130);

      // Adobe Scan glowing blue crosshair
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(65, 0);
      ctx.lineTo(65, 130);
      ctx.moveTo(0, 65);
      ctx.lineTo(130, 65);
      ctx.stroke();

      // Outer ring target
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(65, 65, 20, 0, Math.PI * 2);
      ctx.stroke();
    },
    [activeBaseCanvas]
  );

  if (!isOpen || !activeBaseCanvas) return null;

  const imgW = activeBaseCanvas.width;
  const imgH = activeBaseCanvas.height;

  // Reset to full frame with 2% margin
  const handleFullFrame = () => {
    if (!activeBaseCanvas) return;
    const padX = Math.round(imgW * 0.02);
    const padY = Math.round(imgH * 0.02);
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
    const w = rotated.width;
    const h = rotated.height;
    setCorners([
      { x: Math.round(w * 0.02), y: Math.round(h * 0.02) },
      { x: Math.round(w * 0.98), y: Math.round(h * 0.02) },
      { x: Math.round(w * 0.98), y: Math.round(h * 0.98) },
      { x: Math.round(w * 0.02), y: Math.round(h * 0.98) },
    ]);
  };

  // Pointer drag handlers
  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingIdx(idx);
    updateLoupe(corners[idx], e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx === null || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = Math.max(rect.left, Math.min(rect.right, e.clientX));
    const clientY = Math.max(rect.top, Math.min(rect.bottom, e.clientY));

    const relX = (clientX - rect.left) / rect.width;
    const relY = (clientY - rect.top) / rect.height;

    const newX = Math.round(Math.max(0, Math.min(imgW, relX * imgW)));
    const newY = Math.round(Math.max(0, Math.min(imgH, relY * imgH)));

    const nextCorners = [...corners] as [Point, Point, Point, Point];
    nextCorners[draggingIdx] = { x: newX, y: newY };
    setCorners(nextCorners);

    updateLoupe(nextCorners[draggingIdx], e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingIdx !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDraggingIdx(null);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden backdrop-blur-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Manual Corner Reticle
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Drag the 4 corner handles to align with the ID card boundary. Live magnifier crosshair ensures exact alignment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Toolbar */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleRotate90}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotate 90°</span>
            </button>
            <button
              onClick={handleFullFrame}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-300" />
              <span>Reset to Full Frame</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">Clarity Filter:</span>
            {(['magic', 'original', 'contrast'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                {f === 'magic' ? '✨ Magic Color' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Main Interactive Crop Canvas */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center">
            <div
              ref={containerRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative select-none max-w-full max-h-[50vh] sm:max-h-[56vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center cursor-crosshair touch-none"
              style={{
                aspectRatio: `${imgW} / ${imgH}`,
              }}
            >
              {/* Source Image Display */}
              <img
                src={activeBaseCanvas.toDataURL()}
                alt="Original ID Card"
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Adobe Scan Neon Reticle Polygon */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polygon
                  points={polygonPoints}
                  fill="rgba(0, 240, 255, 0.18)"
                  stroke="#00f0ff"
                  strokeWidth="3"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.8))' }}
                  className="transition-all duration-75"
                />
              </svg>

              {/* 4 Interactive Corner Handles */}
              {corners.map((corner, idx) => {
                const posX = (corner.x / imgW) * 100;
                const posY = (corner.y / imgH) * 100;
                const isDragging = draggingIdx === idx;

                return (
                  <div
                    key={idx}
                    onPointerDown={(e) => handlePointerDown(idx, e)}
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
                      style={{ backgroundColor: CORNER_COLORS[idx] }}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-xl flex items-center justify-center ring-4 ring-black/50"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Corner Legend */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
              {CORNER_NAMES.map((name, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: CORNER_COLORS[i] }}
                  />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Live De-Skewed Preview */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <div className="p-5 rounded-3xl bg-slate-950/80 border border-white/10 space-y-3 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-heading">
                  Straightened Preview
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  300 DPI Live Output
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-2xl shadow-inner flex items-center justify-center overflow-hidden min-h-[170px]">
                <canvas
                  ref={previewCanvasRef}
                  className="w-full h-auto max-h-[220px] object-contain rounded-xl border border-slate-200 shadow-sm"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Perspective homography automatically rectifies all 4 angles into standard CR80 card dimensions (**85.6 × 54 mm**) with razor-sharp text clarity.
              </p>
            </div>
          </div>
        </div>

        {/* Magnifier Loupe Overlay (Adobe Scan Crosshair while dragging) */}
        {draggingIdx !== null && magPos && (
          <div
            style={{
              left: Math.min(window.innerWidth - 150, Math.max(20, magPos.x - 65)),
              top: Math.max(20, magPos.y - 150),
            }}
            className="fixed z-50 pointer-events-none rounded-full overflow-hidden shadow-2xl border-2 border-cyan-400 bg-slate-950"
          >
            <canvas ref={loupeCanvasRef} className="w-[130px] h-[130px]" />
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:to-indigo-600 text-white font-bold text-xs shadow-xl shadow-cyan-950/50 transition-all cursor-pointer hover:scale-102"
          >
            <Check className="w-4 h-4" />
            <span>Apply &amp; Straighten Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
