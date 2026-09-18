import React, { useState, useEffect } from 'react';
import {
  Minimize2,
  Download,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { compressToTargetKB, formatFileSize, downloadBlob } from '../../utils/fileHelpers';
import { loadImage } from '../../utils/canvasUtils';
import { incrementStat } from '../../services/analyticsTracker';

const TARGET_PRESETS = [
  { id: 20, label: '20 KB', desc: 'SSC, UPSC, Govt Signature limits' },
  { id: 50, label: '50 KB', desc: 'State PSC, Banking & Passport portals' },
  { id: 100, label: '100 KB', desc: 'Admit cards, Visa & College forms' },
  { id: 200, label: '200 KB', desc: 'Standard identity document upload' },
  { id: 500, label: '500 KB', desc: 'High quality web optimization' },
];

export const ImageCompress: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [targetKB, setTargetKB] = useState<number>(50);
  const [customKB, setCustomKB] = useState<number>(50);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const [compressedResult, setCompressedResult] = useState<{
    blob: Blob;
    quality: number;
    sizeKB: number;
    width: number;
    height: number;
  } | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setImageFile(target);
    const img = await loadImage(target);
    setOriginalImage(img);
  };

  useEffect(() => {
    if (!originalImage || !imageFile) return;

    const runCompression = async () => {
      setIsCompressing(true);
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(originalImage, 0, 0);

      const target = isCustom ? customKB : targetKB;
      const res = await compressToTargetKB(canvas, target, 'image/jpeg');
      setCompressedResult(res);
      setIsCompressing(false);
      incrementStat('passport');
    };

    runCompression();
  }, [originalImage, imageFile, targetKB, customKB, isCustom]);

  const handleDownload = () => {
    if (!compressedResult || !imageFile) return;
    const baseName = imageFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(compressedResult.blob, `${baseName}-compressed-${compressedResult.sizeKB}kb.jpg`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Image Compressor (Exact KB)"
        description="Compress photos to exact target file sizes (20KB, 50KB, 100KB, 200KB) for government exams, job portals, and visa applications."
        categoryName="Photo Tools"
        categoryPath="/photo/compress"
        badge="Binary Search Optimizer"
      />

      {!originalImage || !imageFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Image to Compress"
            subtitle="JPG, PNG, or WebP. We will hit your exact target KB requirement."
          />

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {TARGET_PRESETS.slice(0, 4).map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-lg font-bold text-emerald-400 block">{p.label}</span>
                <span className="text-[11px] text-slate-400">{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Preview & Compression comparison */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Minimize2 className="w-4 h-4 text-emerald-400" />
                  Compression Statistics
                </h3>

                <button
                  onClick={() => {
                    setOriginalImage(null);
                    setImageFile(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  title="Upload another"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Original */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400 font-medium">Original File Size</div>
                  <div className="text-2xl font-black text-slate-200">
                    {formatFileSize(imageFile.size)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {originalImage.width} × {originalImage.height} px
                  </div>
                </div>

                {/* Compressed */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/50 to-slate-950 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                    <span>Compressed Output</span>
                    {compressedResult && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px]">
                        -{Math.round((1 - compressedResult.blob.size / imageFile.size) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {isCompressing
                      ? 'Optimizing...'
                      : compressedResult
                      ? `${compressedResult.sizeKB} KB`
                      : '---'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {compressedResult
                      ? `${compressedResult.width} × ${compressedResult.height} px (${Math.round(
                          compressedResult.quality * 100
                        )}% Quality)`
                      : '---'}
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div className="relative p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[380px] overflow-hidden">
                <img
                  src={URL.createObjectURL(compressedResult ? compressedResult.blob : imageFile)}
                  alt="Compressed Preview"
                  className="max-h-[340px] w-auto object-contain rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Download Button */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Download Compressed Photo
              </h3>

              <button
                onClick={handleDownload}
                disabled={!compressedResult || isCompressing}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download Compressed Image ({compressedResult ? `${compressedResult.sizeKB} KB` : '...'})
                </span>
              </button>
            </div>

            {/* Target Size Presets */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Target File Size
              </h3>

              <div className="space-y-2">
                {TARGET_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setIsCustom(false);
                      setTargetKB(preset.id);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      !isCustom && targetKB === preset.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-emerald-400">{preset.label}</span>
                      {!isCustom && targetKB === preset.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {preset.desc}
                    </span>
                  </button>
                ))}

                {/* Custom KB option */}
                <div
                  onClick={() => setIsCustom(true)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isCustom
                      ? 'bg-emerald-600/20 border-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">Custom Target Size (KB)</span>
                    {isCustom && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="5000"
                      value={customKB}
                      onChange={(e) => {
                        setIsCustom(true);
                        setCustomKB(Math.max(5, parseInt(e.target.value) || 20));
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                    />
                    <span className="text-xs text-slate-400 font-mono">KB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
