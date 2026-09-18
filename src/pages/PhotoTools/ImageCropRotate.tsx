import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { loadImage, applyCanvasAdjustments } from '../../utils/canvasUtils';

export const ImageCropRotate: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Crop & Adjustments
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    setOriginalImage(img);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
  };

  const renderCanvas = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const isSideways = rotation === 90 || rotation === 270;
    const width = isSideways ? originalImage.height : originalImage.width;
    const height = isSideways ? originalImage.width : originalImage.height;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    applyCanvasAdjustments(ctx, width, height, {
      brightness,
      contrast,
      saturation,
      rotation,
      flipH,
      flipV,
    });

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(
      originalImage,
      -originalImage.width / 2,
      -originalImage.height / 2,
      originalImage.width,
      originalImage.height
    );
    ctx.restore();
  }, [originalImage, rotation, flipH, flipV, brightness, contrast, saturation]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Crop, Rotate & Enhance"
        description="Quick rotation by 90°, horizontal/vertical flip, and brightness/contrast enhancement."
        categoryName="Photo Tools"
        categoryPath="/photo/crop-rotate"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Image to Crop & Rotate"
            subtitle="JPG, PNG, or WebP."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-center min-h-[460px] overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[440px] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Download Result
              </h3>
              <DownloadDropdown
                getCanvas={() => canvasRef.current}
                baseFilename="nexora-enhanced"
              />
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Orientation &amp; Flip
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                  <span>Rotate Right 90°</span>
                </button>
                <button
                  onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Rotate Left 90°</span>
                </button>
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    flipH ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Flip Horizontal</span>
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    flipV ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  <span>Flip Vertical</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Lighting &amp; Color
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Brightness</span>
                    <span className="font-mono text-white">{brightness > 0 ? `+${brightness}` : brightness}</span>
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
                    <span className="font-mono text-white">{contrast > 0 ? `+${contrast}` : contrast}</span>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
