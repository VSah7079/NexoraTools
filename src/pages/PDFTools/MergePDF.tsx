import React, { useState } from 'react';
import { Layers, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { mergePDFs } from '../../utils/pdfUtils';
import { downloadBlob, formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

export const MergePDF: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);

  const handleFilesSelect = (files: File | File[]) => {
    const list = Array.isArray(files) ? files : [files];
    setPdfFiles((prev) => [...prev, ...list]);
  };

  const handleRemove = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === pdfFiles.length - 1)
    ) {
      return;
    }
    const newFiles = [...pdfFiles];
    const target = direction === 'up' ? index - 1 : index + 1;
    const temp = newFiles[index];
    newFiles[index] = newFiles[target];
    newFiles[target] = temp;
    setPdfFiles(newFiles);
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) return;
    setIsMerging(true);

    try {
      const mergedBytes = await mergePDFs(pdfFiles);
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, `merged-document-${Date.now()}.pdf`);
      incrementStat('pdf');
    } catch (e) {
      console.error('PDF merge error:', e);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Merge PDF Files"
        description="Combine multiple PDF documents into a single organized file in seconds with instant client-side processing."
        categoryName="PDF Suite"
        categoryPath="/pdf/merge"
      />

      {pdfFiles.length === 0 ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFilesSelect}
            accept="application/pdf"
            multiple={true}
            title="Upload Multiple PDF Files to Merge"
            subtitle="Drag & drop 2 or more PDF documents here."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold">{pdfFiles.length} PDF Files Added</span>
              <button
                onClick={() => setPdfFiles([])}
                className="text-rose-400 hover:text-rose-300"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-2">
              {pdfFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-blue-400 w-5 text-center shrink-0">
                      #{index + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                      <p className="text-[11px] text-slate-400">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === pdfFiles.length - 1}
                      className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(index)}
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
              accept="application/pdf"
              multiple={true}
              title="Add More PDF Files"
              subtitle="Drag additional PDFs here"
              className="text-xs !p-4"
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-900 border border-blue-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Merge &amp; Save
              </h3>

              <button
                onClick={handleMerge}
                disabled={pdfFiles.length < 2 || isMerging}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Layers className="w-4 h-4" />
                <span>{isMerging ? 'Merging Documents...' : `Merge ${pdfFiles.length} PDFs`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
