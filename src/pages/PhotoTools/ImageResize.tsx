import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { loadImage, mmToPixels } from '../../utils/canvasUtils';
import { EXAM_VISA_PRESETS } from '../../data/examPresets';
import { usePageSEO } from '../../utils/seoHelper';

type Unit = 'px' | 'mm' | 'cm' | 'inch';

export const ImageResize: React.FC = () => {
  usePageSEO({
    title: 'Free Image Resizer Online (Pixels, MM, CM, Inches & Custom DPI)',
    description: 'Resize images by pixel dimensions, centimeters, millimeters, or inches. Set custom 300 DPI resolution, lock aspect ratio, and resize for government exams online.',
    keywords: 'image resize, resize image online free, resize image in cm mm inches, photo resizer, change image dimensions, nexora tools',
    canonicalPath: '/image-resize',
    categoryName: 'Photo Suite',
    toolName: 'Image Resizer',
  });

  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Settings
  const [unit, setUnit] = useState<Unit>('px');
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [dpi, setDpi] = useState<number>(300);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    setOriginalImage(img);
    setWidth(img.width);
    setHeight(img.height);
    setAspectRatio(img.width / img.height);
  };

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;

    let targetW = width;
    let targetH = height;

    if (unit === 'mm') {
      targetW = mmToPixels(width, dpi);
      targetH = mmToPixels(height, dpi);
    } else if (unit === 'cm') {
      targetW = mmToPixels(width * 10, dpi);
      targetH = mmToPixels(height * 10, dpi);
    } else if (unit === 'inch') {
      targetW = Math.round(width * dpi);
      targetH = Math.round(height * dpi);
    }

    const canvas = canvasRef.current;
    canvas.width = Math.max(1, targetW);
    canvas.height = Math.max(1, targetH);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
  }, [originalImage, width, height, unit, dpi]);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Image Resizer & DPI Converter"
        description="Resize image dimensions by pixels, millimeters, centimeters, or inches with aspect ratio lock and 300 DPI support."
        categoryName="Photo Tools"
        categoryPath="/photo/resize"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Image to Resize"
            subtitle="JPG, PNG, or WebP. Preserves maximum visual sharpness."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-center min-h-[460px] overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[440px] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span>
                Original: {originalImage.width} × {originalImage.height} px
              </span>
              <button
                onClick={() => {
                  setOriginalImage(null);
                }}
                className="text-rose-400 hover:text-rose-300"
              >
                Change Image
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Download Resized Image
              </h3>
              <DownloadDropdown
                getCanvas={() => canvasRef.current}
                baseFilename="nexora-resized"
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Dimensions &amp; Units
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  1-Click Exam &amp; Visa Dimension Presets:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {EXAM_VISA_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setUnit('mm');
                        setLockAspect(false);
                        setWidth(p.widthMm);
                        setHeight(p.heightMm);
                      }}
                      className="p-2 rounded-xl bg-slate-950 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.widthMm}×{p.heightMm} mm
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
                {(['px', 'mm', 'cm', 'inch'] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`py-1.5 rounded-lg uppercase transition-all ${
                      unit === u
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Width ({unit})
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Height ({unit})
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    lockAspect
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>Lock Aspect Ratio</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">DPI:</span>
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(parseInt(e.target.value))}
                    className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs"
                  >
                    <option value={72}>72 (Web)</option>
                    <option value={150}>150 (Draft Print)</option>
                    <option value={300}>300 (Photo Studio)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
