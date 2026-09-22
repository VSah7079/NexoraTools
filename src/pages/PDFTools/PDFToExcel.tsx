import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  RefreshCw,
  Table,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const PDFToExcel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [extractedRows, setExtractedRows] = useState<string[][]>([]);
  const [xlsxBlob, setXlsxBlob] = useState<Blob | null>(null);
  const [csvBlob, setCsvBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setExtractedRows([]);
    setXlsxBlob(null);
    setCsvBlob(null);

    await processPdfToExcel(target);
  };

  const processPdfToExcel = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Scanning PDF pages for tabular data...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const allRows: string[][] = [];

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgressText(`Extracting tabular rows from Page ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        // Group text items by Y coordinates (rows)
        const rowMap = new Map<number, Array<{ x: number; text: string }>>();

        for (const item of textContent.items as any[]) {
          if (!('str' in item) || !item.str.trim()) continue;
          // Quantize Y coordinate by 4px to group cells in the same row
          const y = Math.round(item.transform[5] / 4) * 4;
          const x = Math.round(item.transform[4]);

          if (!rowMap.has(y)) {
            rowMap.set(y, []);
          }
          rowMap.get(y)!.push({ x, text: item.str });
        }

        // Sort rows from top to bottom
        const sortedY = Array.from(rowMap.keys()).sort((a, b) => b - a);

        for (const y of sortedY) {
          const cells = rowMap.get(y)!;
          // Sort cells from left to right (by X position)
          cells.sort((a, b) => a.x - b.x);
          const rowTextArray = cells.map((c) => c.text);
          if (rowTextArray.length > 0) {
            allRows.push(rowTextArray);
          }
        }
      }

      setExtractedRows(allRows);

      // Build XLSX Workbook
      setProgressText('Compiling Microsoft Excel (.xlsx) workbook...');
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(allRows);

      // Set auto column width
      const maxCols = Math.max(...allRows.map((r) => r.length), 1);
      ws['!cols'] = Array(maxCols).fill({ wch: 18 });

      XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');

      // Generate XLSX Blob
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const xBlob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      setXlsxBlob(xBlob);

      // Generate CSV Blob
      const csvString = XLSX.utils.sheet_to_csv(ws);
      const cBlob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      setCsvBlob(cBlob);

      incrementStat('pdf');
    } catch (err) {
      console.error('PDF to Excel extraction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadXlsx = () => {
    if (!xlsxBlob || !selectedFile) return;
    const url = URL.createObjectURL(xlsxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_extracted.xlsx`;
    a.click();
  };

  const handleDownloadCsv = () => {
    if (!csvBlob || !selectedFile) return;
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_extracted.csv`;
    a.click();
  };

  const handleCopyTable = () => {
    const tsv = extractedRows.map((r) => r.join('\t')).join('\n');
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="PDF to Excel (XLSX / CSV) Converter"
        description="Extract structured tables, bank statements, reports, and data grids from PDF documents into editable Microsoft Excel (.xlsx) and CSV spreadsheets."
        categoryName="PDF Tools"
        categoryPath="/pdf/pdf-to-excel"
        badge="Pure Client-Side Data Extractor"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept="application/pdf"
            title="Upload PDF to Extract Tables & Convert to Excel (.xlsx)"
            subtitle="Automatically extracts statement columns, marksheet tables, and data rows with 100% privacy"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">XLSX &amp; CSV</span>
              <span className="text-xs text-slate-400">Download formatted Excel or universal CSV formats</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Smart Table Alignment</span>
              <span className="text-xs text-slate-400">Groups horizontal coordinates into spreadsheet rows &amp; cells</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-cyan-400 block mb-1">100% Private</span>
              <span className="text-xs text-slate-400">Bank statements &amp; invoices processed in browser RAM</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Grid Preview & Row Data */}
          <div className="lg:col-span-7 space-y-5">
            {/* File Info Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="font-bold text-sm text-white truncate">{selectedFile.name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span>{extractedRows.length} Data Rows Extracted</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-slate-400 hover:text-rose-400 font-medium cursor-pointer"
              >
                Change File
              </button>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-white/10 text-center space-y-4 shadow-xl">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                <div className="text-sm font-bold text-white">{progressText}</div>
              </div>
            )}

            {/* Extracted Grid Preview */}
            {!isProcessing && extractedRows.length > 0 && (
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Table className="w-4 h-4 text-emerald-400" />
                    <span>Extracted Table Preview</span>
                  </span>

                  <button
                    onClick={handleCopyTable}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Table (TSV)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="max-h-[380px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <tbody>
                      {extractedRows.slice(0, 25).map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className={
                            rIdx === 0
                              ? 'bg-slate-900 font-bold text-emerald-300 border-b border-slate-700'
                              : rIdx % 2 === 1
                              ? 'bg-slate-950/80 text-slate-300 border-b border-slate-800/50'
                              : 'bg-slate-900/40 text-slate-300 border-b border-slate-800/50'
                          }
                        >
                          <td className="px-2 py-1 text-[10px] font-mono text-slate-500 border-r border-slate-800">
                            {rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-1.5 truncate max-w-[160px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Download & Formats */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Download Spreadsheets</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  .XLSX &amp; .CSV
                </span>
              </div>

              {xlsxBlob ? (
                <div className="space-y-3 animate-in zoom-in-95 duration-150">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Table extracted successfully into {extractedRows.length} spreadsheet rows!</span>
                  </div>

                  <button
                    onClick={handleDownloadXlsx}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-all cursor-pointer hover:scale-102"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Microsoft Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={handleDownloadCsv}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV Format (.csv)</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                  <p className="text-xs leading-relaxed">
                    Analyzing PDF layout, identifying grid lines and building Excel columns...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
