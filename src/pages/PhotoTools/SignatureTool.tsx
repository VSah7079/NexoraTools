import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { cleanSignatureFilter, loadImage } from '../../utils/canvasUtils';
import { compressToTargetKB, downloadBlob } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

export const SignatureTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Signature Settings
  const [threshold, setThreshold] = useState<number>(175);
  const [inkDarkness, setInkDarkness] = useState<number>(1.4);
  const [targetKB, setTargetKB] = useState<number>(20);
  const [compressedResult, setCompressedResult] = useState<{
    blob: Blob;
    sizeKB: number;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setImageFile(target);
    const img = await loadImage(target);
    setOriginalImage(img);
  };

  const processSignature = useCallback(async () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(originalImage, 0, 0);
    cleanSignatureFilter(ctx, canvas.width, canvas.height, threshold, inkDarkness);

    const comp = await compressToTargetKB(canvas, targetKB, 'image/jpeg');
    setCompressedResult({ blob: comp.blob, sizeKB: comp.sizeKB });
    incrementStat('passport');
  }, [originalImage, threshold, inkDarkness, targetKB]);

  useEffect(() => {
    if (originalImage) {
      processSignature();
    }
  }, [originalImage, processSignature]);

  const handleDownload = () => {
    if (!compressedResult || !imageFile) return;
    const base = imageFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(compressedResult.blob, `${base}-signature-clean-${compressedResult.sizeKB}kb.jpg`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Signature Resizer & Enhancer"
        description="Clean paper shadows, darken ink, and compress signature photos to 10-20KB for SSC, UPSC, bank exams and online portals."
        categoryName="Photo Tools"
        categoryPath="/photo/signature"
        badge="Govt Form Ready"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload Photo of Hand-written Signature"
            subtitle="JPG, PNG, or camera photo of signature on white paper."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-white border border-slate-700 shadow-xl flex items-center justify-center min-h-[380px] overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-h-[340px] max-w-full object-contain rounded shadow"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span>
                Clean Output Size:{' '}
                <strong className="text-emerald-400">
                  {compressedResult ? `${compressedResult.sizeKB} KB` : '...'}
                </strong>
              </span>
              <button
                onClick={() => {
                  setOriginalImage(null);
                  setImageFile(null);
                }}
                className="text-rose-400 hover:text-rose-300"
              >
                Change Signature
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border border-rose-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Download Clean Signature
              </h3>
              <button
                onClick={handleDownload}
                disabled={!compressedResult}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download Clean Signature ({compressedResult ? `${compressedResult.sizeKB} KB` : '...'})
                </span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Enhancement Controls
              </h3>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Paper Whitening Threshold</span>
                  <span className="font-mono text-white">{threshold}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="240"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Ink Darkness</span>
                  <span className="font-mono text-white">{inkDarkness}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={inkDarkness}
                  onChange={(e) => setInkDarkness(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Target Portal Size Limit</span>
                  <span className="font-mono text-emerald-400 font-bold">{targetKB} KB</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[10, 20, 50].map((kb) => (
                    <button
                      key={kb}
                      onClick={() => setTargetKB(kb)}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        targetKB === kb
                          ? 'bg-rose-500/20 border-rose-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {kb} KB
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
