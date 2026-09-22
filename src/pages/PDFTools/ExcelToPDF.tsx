import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  RefreshCw,
  Table,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

export const ExcelToPDF: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<string[][]>([]);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number>(1);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setPdfBlob(null);
    setPdfPreviewUrl(null);

    await parseExcelFile(target);
  };

  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);

      const firstSheet = wb.SheetNames[0] || 'Sheet1';
      setActiveSheet(firstSheet);
      loadSheetData(wb, firstSheet);
    } catch (err) {
      console.error('Excel parse error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
    const worksheet = wb.Sheets[sheetName];
    if (!worksheet) return;

    // Convert sheet to 2D string array
    const rawData = XLSX.utils.sheet_to_json<string[]>(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    });

    const cleanData = rawData.filter((row) => row.some((cell) => cell.toString().trim().length > 0));
    setSheetData(cleanData as string[][]);

    // Auto generate PDF for this sheet
    generatePdfTable(cleanData as string[][], orientation, sheetName);
  };

  const handleSheetChange = (sheetName: string) => {
    if (!workbook) return;
    setActiveSheet(sheetName);
    loadSheetData(workbook, sheetName);
  };

  const handleOrientationChange = (newOrientation: 'landscape' | 'portrait') => {
    setOrientation(newOrientation);
    if (sheetData.length > 0) {
      generatePdfTable(sheetData, newOrientation, activeSheet);
    }
  };

  const generatePdfTable = async (
    data: string[][],
    pageOrientation: 'landscape' | 'portrait',
    currentSheetName: string
  ) => {
    if (data.length === 0) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // A4 dimensions
      const a4Short = 595.28;
      const a4Long = 841.89;
      const pageWidth = pageOrientation === 'landscape' ? a4Long : a4Short;
      const pageHeight = pageOrientation === 'landscape' ? a4Short : a4Long;

      const margin = 35;
      const usableWidth = pageWidth - margin * 2;
      const maxCols = Math.max(...data.map((r) => r.length), 1);
      const colWidth = Math.max(50, usableWidth / Math.min(maxCols, 12));
      const rowHeight = 22;
      const fontSize = maxCols > 8 ? 8 : 9;

      let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      let currentY = pageHeight - margin - 20;

      // Header on first page
      currentPage.drawText(
        `${selectedFile?.name.replace(/\.[^/.]+$/, '')} • ${currentSheetName}`,
        {
          x: margin,
          y: currentY,
          size: 14,
          font: boldFont,
          color: rgb(0.1, 0.15, 0.25),
        }
      );
      currentY -= 25;

      data.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;

        // Check if page overflow
        if (currentY < margin + 30) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          currentY = pageHeight - margin - 20;
        }

        // Row background fill
        if (isHeader) {
          currentPage.drawRectangle({
            x: margin,
            y: currentY - rowHeight + 5,
            width: Math.min(usableWidth, maxCols * colWidth),
            height: rowHeight,
            color: rgb(0.12, 0.18, 0.3),
          });
        } else if (rowIndex % 2 === 1) {
          currentPage.drawRectangle({
            x: margin,
            y: currentY - rowHeight + 5,
            width: Math.min(usableWidth, maxCols * colWidth),
            height: rowHeight,
            color: rgb(0.95, 0.96, 0.98),
          });
        }

        // Draw Cells
        for (let colIndex = 0; colIndex < maxCols; colIndex++) {
          const cellVal = (row[colIndex] || '').toString();
          const xPos = margin + colIndex * colWidth + 5;

          // Truncate if text exceeds cell width
          let displayText = cellVal;
          while (
            (isHeader ? boldFont : font).widthOfTextAtSize(displayText, fontSize) > colWidth - 10 &&
            displayText.length > 3
          ) {
            displayText = displayText.substring(0, displayText.length - 2) + '…';
          }

          currentPage.drawText(displayText, {
            x: xPos,
            y: currentY - 10,
            size: fontSize,
            font: isHeader ? boldFont : font,
            color: isHeader ? rgb(1, 1, 1) : rgb(0.15, 0.15, 0.2),
          });
        }

        currentY -= rowHeight;
      });

      setPageCount(pdfDoc.getPageCount());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      setPdfBlob(blob);
      setPdfPreviewUrl(URL.createObjectURL(blob));
      incrementStat('pdf');
    } catch (err) {
      console.error('Excel to PDF error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob || !selectedFile) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile.name.replace(/\.[^/.]+$/, '')}_${activeSheet}.pdf`;
    a.click();
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Excel (XLSX / CSV) to PDF Table Converter"
        description="Convert Excel spreadsheets, workbooks, and CSV tables into beautifully formatted A4 PDF reports. 100% in-browser RAM execution."
        categoryName="PDF Tools"
        categoryPath="/pdf/excel-to-pdf"
        badge="Pure Client-Side Spreadsheet Engine"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto space-y-6">
          <UploadZone
            onFileSelect={handleFileSelect}
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            title="Upload Excel (.xlsx / .xls / .csv) Spreadsheet"
            subtitle="Converts tables, grids, and multi-sheet workbooks directly to printable PDF"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">Multi-Sheet Support</span>
              <span className="text-xs text-slate-400">Switch between workbook tabs with 1 click</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">Landscape / Portrait</span>
              <span className="text-xs text-slate-400">Auto-fit wide columns and table headers</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-cyan-400 block mb-1">100% Private</span>
              <span className="text-xs text-slate-400">Financials &amp; customer lists stay in your browser</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sheet Data & Controls */}
          <div className="lg:col-span-6 space-y-5">
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
                    <span>{sheetData.length} Rows</span>
                    <span>•</span>
                    <span>{pageCount} PDF Pages</span>
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

            {/* Sheet Tabs & Page Orientation */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-4 shadow-xl">
              {sheetNames.length > 1 && (
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Select Workbook Sheet:</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sheetNames.map((name) => (
                      <button
                        key={name}
                        onClick={() => handleSheetChange(name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          activeSheet === name
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orientation Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  Page Orientation:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOrientationChange('landscape')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                      orientation === 'landscape'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Landscape (Wide Tables)
                  </button>
                  <button
                    onClick={() => handleOrientationChange('portrait')}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-xs ${
                      orientation === 'portrait'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-xs'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Portrait (Standard)
                  </button>
                </div>
              </div>
            </div>

            {/* Live Table Preview */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-white/10 space-y-3 shadow-xl">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-white/10">
                <Table className="w-4 h-4 text-emerald-400" />
                <span>Spreadsheet Grid Preview ({sheetData.length} rows)</span>
              </div>

              <div className="max-h-[320px] overflow-auto rounded-2xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left border-collapse text-[11px]">
                  <tbody>
                    {sheetData.slice(0, 15).map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={
                          rIdx === 0
                            ? 'bg-slate-900 font-bold text-white border-b border-slate-700'
                            : rIdx % 2 === 1
                            ? 'bg-slate-950/80 text-slate-300 border-b border-slate-800/50'
                            : 'bg-slate-900/40 text-slate-300 border-b border-slate-800/50'
                        }
                      >
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 truncate max-w-[140px]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: PDF Preview & Download */}
          <div className="lg:col-span-6 space-y-5">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 space-y-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>PDF Table Document</span>
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {orientation.toUpperCase()}
                </span>
              </div>

              {pdfPreviewUrl ? (
                <div className="space-y-4 animate-in zoom-in-95 duration-150">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>PDF Table compiled successfully with {pageCount} pages!</span>
                  </div>

                  <iframe
                    src={pdfPreviewUrl}
                    title="Excel to PDF Output Preview"
                    className="w-full h-80 rounded-2xl border border-slate-800 bg-slate-950 shadow-inner"
                  />

                  <button
                    onClick={handleDownload}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-all cursor-pointer hover:scale-102"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Spreadsheet Document</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                      <p className="text-xs">Generating vector table PDF...</p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
                      <p className="text-xs">Compiling Excel table into printable A4 PDF...</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
