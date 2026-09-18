import React, { useState } from 'react';
import { FileArchive, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize, downloadBlob } from '../../utils/fileHelpers';
import { renderPDFPageToCanvas, getPDFPageCount } from '../../utils/pdfUtils';
import { PDFDocument } from 'pdf-lib';
import { incrementStat } from '../../services/analyticsTracker';

export const CompressPDF: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'recommended' | 'extreme' | 'low'>('recommended');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);

  const handleFileSelect = (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setPdfFile(target);
    setCompressedBlob(null);
  };

  const handleCompress = async () => {
    if (!pdfFile) return;
    setIsCompressing(true);

    try {
      const pageCount = await getPDFPageCount(pdfFile);
      const newPdf = await PDFDocument.create();

      const scale = level === 'extreme' ? 1.0 : level === 'recommended' ? 1.4 : 1.8;
      const quality = level === 'extreme' ? 0.6 : level === 'recommended' ? 0.75 : 0.88;

      for (let i = 1; i <= Math.min(pageCount, 25); i++) {
        const canvas = await renderPDFPageToCanvas(pdfFile, i, scale);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const jpg = await newPdf.embedJpg(dataUrl);

        const page = newPdf.addPage([jpg.width, jpg.height]);
        page.drawImage(jpg, { x: 0, y: 0, width: jpg.width, height: jpg.height });
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setCompressedBlob(blob);
      incrementStat('pdf');
    } catch (e) {
      console.error(e);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !pdfFile) return;
    const base = pdfFile.name.replace(/\.[^/.]+$/, '');
    downloadBlob(compressedBlob, `${base}-compressed.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Compress PDF Document"
        description="Reduce PDF file size for email attachments and portal upload limits without losing readability."
        categoryName="PDF Suite"
        categoryPath="/pdf/compress"
      />

      {!pdfFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            title="Upload PDF to Compress"
            subtitle="Fast in-browser stream and image compression."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{pdfFile.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Original Size: {formatFileSize(pdfFile.size)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPdfFile(null);
                    setCompressedBlob(null);
                  }}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {compressedBlob && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-400 font-semibold block">
                      Compressed PDF Ready
                    </span>
                    <span className="text-xl font-black text-emerald-300 font-mono">
                      {formatFileSize(compressedBlob.size)}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    -{Math.round((1 - compressedBlob.size / pdfFile.size) * 100)}% Reduction
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Compression Strength
              </h3>

              <div className="space-y-2 text-xs">
                {(
                  [
                    { id: 'recommended', label: 'Recommended Compression', desc: 'Good balance of quality & size' },
                    { id: 'extreme', label: 'Extreme Compression', desc: 'Smallest file size for tight upload limits' },
                    { id: 'low', label: 'Light Compression', desc: 'Maximum visual clarity' },
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setLevel(lvl.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      level === lvl.id
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{lvl.label}</span>
                      {level === lvl.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{lvl.desc}</span>
                  </button>
                ))}
              </div>

              {!compressedBlob ? (
                <button
                  onClick={handleCompress}
                  disabled={isCompressing}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>{isCompressing ? 'Compressing PDF...' : 'Compress PDF Document'}</span>
                </button>
              ) : (
                <button
                  onClick={handleDownload}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
