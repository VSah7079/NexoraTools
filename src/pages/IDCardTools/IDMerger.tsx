import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  RotateCw,
  FileText,
  Columns,
  Rows,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import { DOCUMENT_PRESETS, type DocumentType } from '../../types/idMerger';
import { loadImage, mmToPixels } from '../../utils/canvasUtils';
import { PDFDocument } from 'pdf-lib';
import { downloadBlob } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

export const IDMerger: React.FC = () => {
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>('aadhaar');

  // Files
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [frontImg, setFrontImg] = useState<HTMLImageElement | null>(null);
  const [frontRot, setFrontRot] = useState<number>(0);

  const [backFile, setBackFile] = useState<File | null>(null);
  const [backImg, setBackImg] = useState<HTMLImageElement | null>(null);
  const [backRot, setBackRot] = useState<number>(0);

  // Settings
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('vertical');
  const [outputFormat, setOutputFormat] = useState<'a4-sheet' | 'fit-card'>('a4-sheet');
  const [borderStyle, setBorderStyle] = useState<'none' | 'thin-solid' | 'dashed' | 'rounded-shadow'>('thin-solid');
  const [showLabels] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [watermarkText, setWatermarkText] = useState<string>('FOR VERIFICATION ONLY');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentPreset =
    DOCUMENT_PRESETS.find((p) => p.id === selectedDocType) || DOCUMENT_PRESETS[0];

  useEffect(() => {
    setLayout(currentPreset.defaultLayout);
  }, [currentPreset]);

  const handleFrontUpload = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setFrontFile(target);
    const img = await loadImage(target);
    setFrontImg(img);
    setFrontRot(0);
  };

  const handleBackUpload = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setBackFile(target);
    const img = await loadImage(target);
    setBackImg(img);
    setBackRot(0);
  };

  const renderMergedCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    if (!frontImg && !backImg) return;

    const canvas = canvasRef.current;
    const dpi = 300;

    const cardWidthMm = currentPreset.recommendedWidthMm;
    const cardHeightMm = currentPreset.recommendedHeightMm;
    const cardWidthPx = mmToPixels(cardWidthMm, dpi);
    const cardHeightPx = mmToPixels(cardHeightMm, dpi);
    const gapPx = mmToPixels(8, dpi);

    let canvasWidthPx: number;
    let canvasHeightPx: number;

    if (outputFormat === 'a4-sheet') {
      canvasWidthPx = mmToPixels(210, dpi);
      canvasHeightPx = mmToPixels(297, dpi);
    } else {
      if (layout === 'horizontal') {
        canvasWidthPx = cardWidthPx * 2 + gapPx * 3;
        canvasHeightPx = cardHeightPx + gapPx * 2 + (showLabels ? 40 : 0);
      } else {
        canvasWidthPx = cardWidthPx + gapPx * 2;
        canvasHeightPx = cardHeightPx * 2 + gapPx * 3 + (showLabels ? 80 : 0);
      }
    }

    canvas.width = canvasWidthPx;
    canvas.height = canvasHeightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidthPx, canvasHeightPx);

    if (outputFormat === 'a4-sheet') {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentPreset.title, canvasWidthPx / 2, 100);

      ctx.fillStyle = '#64748b';
      ctx.font = '20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Official Identity Document (2-Sided Copy)', canvasWidthPx / 2, 135);
    }

    let frontX = 0, frontY = 0, backX = 0, backY = 0;

    if (outputFormat === 'a4-sheet') {
      const topMargin = 200;
      if (layout === 'horizontal') {
        const totalW = cardWidthPx * 2 + gapPx;
        frontX = (canvasWidthPx - totalW) / 2;
        frontY = topMargin;
        backX = frontX + cardWidthPx + gapPx;
        backY = topMargin;
      } else {
        frontX = (canvasWidthPx - cardWidthPx) / 2;
        frontY = topMargin;
        backX = frontX;
        backY = frontY + cardHeightPx + gapPx + 40;
      }
    } else {
      if (layout === 'horizontal') {
        frontX = gapPx;
        frontY = gapPx + (showLabels ? 25 : 0);
        backX = frontX + cardWidthPx + gapPx;
        backY = frontY;
      } else {
        frontX = gapPx;
        frontY = gapPx + (showLabels ? 25 : 0);
        backX = frontX;
        backY = frontY + cardHeightPx + gapPx + (showLabels ? 25 : 0);
      }
    }

    const drawCard = (
      img: HTMLImageElement | null,
      x: number,
      y: number,
      rot: number,
      label: string
    ) => {
      ctx.save();

      if (showLabels) {
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x + cardWidthPx / 2, y - 10);
      }

      if (img) {
        ctx.save();
        ctx.beginPath();
        if (borderStyle === 'rounded-shadow') {
          ctx.roundRect(x, y, cardWidthPx, cardHeightPx, 16);
        } else {
          ctx.rect(x, y, cardWidthPx, cardHeightPx);
        }
        ctx.clip();

        ctx.translate(x + cardWidthPx / 2, y + cardHeightPx / 2);
        ctx.rotate((rot * Math.PI) / 180);
        const isSideways = rot === 90 || rot === 270;
        const dw = isSideways ? cardHeightPx : cardWidthPx;
        const dh = isSideways ? cardWidthPx : cardHeightPx;
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x, y, cardWidthPx, cardHeightPx);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Upload ${label}`, x + cardWidthPx / 2, y + cardHeightPx / 2);
      }

      if (borderStyle !== 'none') {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        if (borderStyle === 'dashed') {
          ctx.setLineDash([8, 6]);
        } else {
          ctx.setLineDash([]);
        }

        if (borderStyle === 'rounded-shadow') {
          ctx.beginPath();
          ctx.roundRect(x, y, cardWidthPx, cardHeightPx, 16);
          ctx.stroke();
        } else {
          ctx.strokeRect(x, y, cardWidthPx, cardHeightPx);
        }
      }

      ctx.restore();
    };

    drawCard(frontImg, frontX, frontY, frontRot, currentPreset.frontLabel);
    drawCard(backImg, backX, backY, backRot, currentPreset.backLabel);

    if (showWatermark && watermarkText) {
      ctx.save();
      ctx.translate(canvasWidthPx / 2, canvasHeightPx / 2);
      ctx.rotate((-30 * Math.PI) / 180);
      ctx.font = 'bold 48px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.textAlign = 'center';
      ctx.fillText(watermarkText.toUpperCase(), 0, 0);
      ctx.restore();
    }

    incrementStat('idMerger');
  }, [
    frontImg,
    backImg,
    frontRot,
    backRot,
    layout,
    outputFormat,
    borderStyle,
    showLabels,
    showWatermark,
    watermarkText,
    currentPreset,
  ]);

  useEffect(() => {
    renderMergedCanvas();
  }, [renderMergedCanvas]);

  const handleExportPDF = async () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(dataUrl);

    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, `${selectedDocType}-merged-a4.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Two-Sided ID Card Merger"
        description="Merge front and back sides of Aadhaar, Voter ID, PAN, Driving Licence, and Student ID into an A4 print-ready sheet or compact image."
        categoryName="ID Card Tools"
        categoryPath="/id/merger"
        badge="A4 Print Ready"
      />

      <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DOCUMENT_PRESETS.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDocType(doc.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedDocType === doc.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {doc.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-center min-h-[500px] overflow-hidden">
            <div className="p-3 bg-white rounded-lg shadow-2xl max-w-full max-h-[520px] overflow-auto flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-h-[480px] w-auto object-contain border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>{currentPreset.frontLabel}</span>
                {frontImg && (
                  <button
                    onClick={() => setFrontRot((r) => (r + 90) % 360)}
                    className="p-1 text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Rotate</span>
                  </button>
                )}
              </div>
              <UploadZone
                onFileSelect={handleFrontUpload}
                title={frontFile ? frontFile.name : `Upload Front Side`}
                subtitle="JPG, PNG, WebP"
                className="text-xs !p-4"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>{currentPreset.backLabel}</span>
                {backImg && (
                  <button
                    onClick={() => setBackRot((r) => (r + 90) % 360)}
                    className="p-1 text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[11px]"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Rotate</span>
                  </button>
                )}
              </div>
              <UploadZone
                onFileSelect={handleBackUpload}
                title={backFile ? backFile.name : `Upload Back Side`}
                subtitle="JPG, PNG, WebP"
                className="text-xs !p-4"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Export Merged ID
            </h3>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleExportPDF}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-950/40 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Export Vector PDF (A4)</span>
              </button>

              <DownloadDropdown
                getCanvas={() => canvasRef.current}
                baseFilename={`${selectedDocType}-merged`}
                onPrint={handlePrint}
                onExportPDF={handleExportPDF}
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Layout &amp; Orientation
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLayout('vertical')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  layout === 'vertical'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Rows className="w-4 h-4 text-indigo-400" />
                <span>Vertical (Stacked)</span>
              </button>

              <button
                onClick={() => setLayout('horizontal')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                  layout === 'horizontal'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Columns className="w-4 h-4 text-indigo-400" />
                <span>Horizontal (Side-by-Side)</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs text-slate-400 block mb-1.5">Output Format</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setOutputFormat('a4-sheet')}
                  className={`p-2.5 rounded-lg border font-medium ${
                    outputFormat === 'a4-sheet'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  A4 Print Ready Sheet
                </button>
                <button
                  onClick={() => setOutputFormat('fit-card')}
                  className={`p-2.5 rounded-lg border font-medium ${
                    outputFormat === 'fit-card'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Compact Fit Card
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="text-xs text-slate-400 block mb-1.5">Card Borders</label>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                {(['thin-solid', 'dashed', 'none'] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBorderStyle(b)}
                    className={`py-1.5 rounded-lg capitalize border ${
                      borderStyle === b
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {b.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Security Watermark Overlay</span>
                <input
                  type="checkbox"
                  checked={showWatermark}
                  onChange={(e) => setShowWatermark(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                />
              </label>

              {showWatermark && (
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Watermark text..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
