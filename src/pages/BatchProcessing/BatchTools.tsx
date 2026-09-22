import React, { useState } from 'react';
import {
  Trash2,
  Sparkles,
  FileArchive,
  CheckCircle2,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize, compressToTargetKB } from '../../utils/fileHelpers';
import { loadImage } from '../../utils/canvasUtils';
import { removeBackgroundClientSide, BG_PRESET_COLORS } from '../../utils/bgRemovalEngine';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  processedBlob: Blob | null;
  processedSizeKB?: number;
}

export const BatchTools: React.FC = () => {
  usePageSEO({
    title: 'Free Batch Photo & Document Processing (Bulk Compress, Convert & ZIP)',
    description: 'Process hundreds of photos and documents simultaneously. Bulk compress to exact KB, batch change background colors, and download everything in 1-click ZIP archive.',
    keywords: 'batch photo processing, bulk image compressor, bulk background changer, batch convert photos, zip download bulk images, nexora tools',
    canonicalPath: '/batch-tools',
    categoryName: 'Batch Suite',
    toolName: 'Batch Processing Tools',
  });

  const [items, setItems] = useState<BatchItem[]>([]);
  const [batchAction, setBatchAction] = useState<'compress' | 'bg-color' | 'passport'>('compress');
  const [targetKB, setTargetKB] = useState<number>(50);
  const [bgColor, setBgColor] = useState<string>('white');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFilesSelect = (files: File | File[]) => {
    const list = Array.isArray(files) ? files : [files];
    const newItems: BatchItem[] = list.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      processedBlob: null,
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleProcessAll = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const updated = [...items];

    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'processing';
      setItems([...updated]);

      try {
        const img = await loadImage(updated[i].file);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        if (batchAction === 'bg-color') {
          const processedCanvas = removeBackgroundClientSide(canvas, {
            sensitivity: 50,
            edgeFeather: 2,
            backgroundColor: bgColor as any,
          });
          const blob = await new Promise<Blob>((resolve) =>
            processedCanvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.95)
          );
          updated[i].processedBlob = blob;
          updated[i].processedSizeKB = +(blob.size / 1024).toFixed(1);
        } else if (batchAction === 'compress') {
          const comp = await compressToTargetKB(canvas, targetKB, 'image/jpeg');
          updated[i].processedBlob = comp.blob;
          updated[i].processedSizeKB = comp.sizeKB;
        } else if (batchAction === 'passport') {
          const processedSubject = removeBackgroundClientSide(canvas, {
            sensitivity: 50,
            edgeFeather: 2,
            backgroundColor: 'transparent',
          });

          const pCanvas = document.createElement('canvas');
          pCanvas.width = 413;
          pCanvas.height = 531;
          const pCtx = pCanvas.getContext('2d');
          if (pCtx) {
            pCtx.fillStyle = '#FFFFFF';
            pCtx.fillRect(0, 0, 413, 531);
            pCtx.drawImage(processedSubject, 0, 0, 413, 531);
          }
          const blob = await new Promise<Blob>((resolve) =>
            pCanvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', 0.95)
          );
          updated[i].processedBlob = blob;
          updated[i].processedSizeKB = +(blob.size / 1024).toFixed(1);
        }

        updated[i].status = 'done';
      } catch (e) {
        console.error(e);
        updated[i].status = 'error';
      }

      setItems([...updated]);
    }

    setIsProcessing(false);
    incrementStat('batch', items.length);
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((item) => item.processedBlob !== null);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    for (let i = 0; i < doneItems.length; i++) {
      const it = doneItems[i];
      if (it.processedBlob) {
        const base = it.file.name.replace(/\.[^/.]+$/, '');
        zip.file(`${base}-batch-${batchAction}.jpg`, it.processedBlob);
      }
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `nexora-batch-${batchAction}-${Date.now()}.zip`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Batch Photo Processor"
        description="Process up to 20 images simultaneously: batch compress to target KB, replace background colors, or generate passport crops, and export all as a ZIP archive."
        categoryName="Batch Processing"
        categoryPath="/batch"
        badge="Multi-File Engine"
      />

      {items.length === 0 ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFilesSelect}
            multiple={true}
            title="Upload Multiple Photos for Batch Processing"
            subtitle="Select multiple portrait photos or documents (up to 20 files)."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold">{items.length} Files in Queue</span>
              <button
                onClick={() => setItems([])}
                className="text-rose-400 hover:text-rose-300"
              >
                Clear Queue
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.previewUrl}
                      alt={item.file.name}
                      className="w-12 h-12 object-cover rounded-lg border border-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{item.file.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {formatFileSize(item.file.size)}{' '}
                        {item.processedSizeKB ? (
                          <strong className="text-emerald-400">→ {item.processedSizeKB} KB</strong>
                        ) : null}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === 'processing' && (
                      <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        Processing...
                      </span>
                    )}
                    {item.status === 'done' && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Done
                      </span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-xs text-slate-500">Ready</span>
                    )}
                    <button
                      onClick={() => setItems((prev) => prev.filter((it) => it.id !== item.id))}
                      className="p-1.5 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <UploadZone
              onFileSelect={handleFilesSelect}
              multiple={true}
              title="Add More Photos to Batch"
              subtitle="Drag & drop additional files"
              className="text-xs !p-4"
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-fuchsia-950/60 via-slate-900 to-slate-900 border border-fuchsia-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Run Batch Operation
              </h3>

              <button
                onClick={handleProcessAll}
                disabled={isProcessing}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isProcessing ? 'Processing Batch...' : `Apply to All (${items.length} Files)`}</span>
              </button>

              {items.some((it) => it.status === 'done') && (
                <button
                  onClick={handleDownloadAllZip}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>Download Processed ZIP</span>
                </button>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Batch Action
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setBatchAction('compress')}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    batchAction === 'compress'
                      ? 'bg-fuchsia-600/20 border-fuchsia-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">Exact KB Compression</div>
                  <div className="text-[11px] text-slate-400">Compress all files to target size limit</div>
                </button>

                <button
                  onClick={() => setBatchAction('bg-color')}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    batchAction === 'bg-color'
                      ? 'bg-fuchsia-600/20 border-fuchsia-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">Batch Background Color</div>
                  <div className="text-[11px] text-slate-400">Replace backdrop with passport white/blue</div>
                </button>

                <button
                  onClick={() => setBatchAction('passport')}
                  className={`w-full p-3 rounded-xl border text-left transition-all ${
                    batchAction === 'passport'
                      ? 'bg-fuchsia-600/20 border-fuchsia-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">Passport Ratio (35×45mm)</div>
                  <div className="text-[11px] text-slate-400">Resize all photos to standard passport spec</div>
                </button>
              </div>

              {batchAction === 'compress' && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-slate-400 block mb-1">Target Limit (KB)</label>
                  <div className="grid grid-cols-4 gap-1.5 font-bold">
                    {[20, 50, 100, 200].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => setTargetKB(kb)}
                        className={`py-1.5 rounded-lg border ${
                          targetKB === kb
                            ? 'bg-fuchsia-500/20 border-fuchsia-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {kb}KB
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {batchAction === 'bg-color' && (
                <div className="pt-2 border-t border-slate-800">
                  <label className="text-slate-400 block mb-1">Backdrop Color</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {BG_PRESET_COLORS.filter((p) => p.id !== 'transparent').map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setBgColor(c.id)}
                        className={`p-2 rounded-lg border flex items-center gap-2 ${
                          bgColor === c.id
                            ? 'bg-fuchsia-500/20 border-fuchsia-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    ))}
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
