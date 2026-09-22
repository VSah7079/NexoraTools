import React, { useState } from 'react';
import { Scissors, Trash2 } from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { getPDFPageCount, parsePageRangeString, splitPDF } from '../../utils/pdfUtils';
import { downloadBlob } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

export const SplitPDF: React.FC = () => {
  usePageSEO({
    title: 'Free Split PDF Online (Extract Selected Pages from PDF)',
    description: 'Split PDF files and extract specific page ranges or individual pages into separate PDF files. Free, secure in-browser execution with zero watermark.',
    keywords: 'split pdf, extract pdf pages, separate pdf pages online free, pdf splitter, cut pdf pages, nexora tools',
    canonicalPath: '/split-pdf',
    categoryName: 'PDF Suite',
    toolName: 'Split PDF',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);
  const [rangeInput, setRangeInput] = useState<string>('1-2');
  const [isSplitting, setIsSplitting] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setPdfFile(target);
    try {
      const count = await getPDFPageCount(target);
      setPageCount(count);
      setRangeInput(`1-${Math.min(count, 3)}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExtract = async () => {
    if (!pdfFile) return;
    setIsSplitting(true);

    try {
      const pagesToKeep = parsePageRangeString(rangeInput, pageCount);
      if (pagesToKeep.length === 0) {
        alert('Please specify a valid page range.');
        setIsSplitting(false);
        return;
      }

      const splitBytes = await splitPDF(pdfFile, pagesToKeep);
      const blob = new Blob([splitBytes as unknown as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, `split-pages-${pagesToKeep.join('-')}.pdf`);
      incrementStat('pdf');
    } catch (e) {
      console.error('PDF split error:', e);
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Split & Extract PDF Pages"
        description="Extract specific pages or page ranges (e.g. 1-3, 5, 8) into a separate, clean PDF document."
        categoryName="PDF Suite"
        categoryPath="/pdf/split"
      />

      {!pdfFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            title="Upload PDF to Split"
            subtitle="Extract selected page ranges in seconds."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{pdfFile.name}</h3>
                  <p className="text-xs text-slate-400">Total {pageCount} pages detected</p>
                </div>
                <button
                  onClick={() => setPdfFile(null)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <label className="text-xs text-slate-400 block mb-2">Available Pages:</label>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
                    >
                      P{i + 1}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-900 border border-violet-500/30 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Extract Specification
              </h3>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Page Ranges (e.g. 1-3, 5)
                </label>
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="e.g. 1-3, 5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm"
                />
              </div>

              <button
                onClick={handleExtract}
                disabled={isSplitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Scissors className="w-4 h-4" />
                <span>{isSplitting ? 'Extracting Pages...' : 'Extract & Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
