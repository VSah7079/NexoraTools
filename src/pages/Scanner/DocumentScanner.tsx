import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FileText,
  Check,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { DownloadDropdown } from '../../components/common/DownloadDropdown';
import {
  type Point,
  type ScanFilterType,
  applyScanFilter,
  warpPerspective,
} from '../../utils/perspectiveTransform';
import { loadImage } from '../../utils/canvasUtils';
import { PDFDocument } from 'pdf-lib';
import { downloadBlob } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';

export const DocumentScanner: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // 4 Corners: [TL, TR, BR, BL]
  const [corners, setCorners] = useState<[Point, Point, Point, Point]>([
    { x: 20, y: 20 },
    { x: 300, y: 20 },
    { x: 300, y: 400 },
    { x: 20, y: 400 },
  ]);

  // Filter
  const [selectedFilter, setSelectedFilter] = useState<ScanFilterType>('magic');

  // Canvases
  const warpedCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const img = await loadImage(target);
    setOriginalImage(img);

    const padX = img.width * 0.05;
    const padY = img.height * 0.05;
    setCorners([
      { x: padX, y: padY },
      { x: img.width - padX, y: padY },
      { x: img.width - padX, y: img.height - padY },
      { x: padX, y: img.height - padY },
    ]);
  };

  const processWarp = useCallback(() => {
    if (!originalImage || !warpedCanvasRef.current) return;

    const sCanvas = document.createElement('canvas');
    sCanvas.width = originalImage.width;
    sCanvas.height = originalImage.height;
    const sCtx = sCanvas.getContext('2d');
    sCtx?.drawImage(originalImage, 0, 0);

    const topW = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
    const botW = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
    const outW = Math.max(200, Math.round(Math.max(topW, botW)));

    const leftH = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
    const rightH = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
    const outH = Math.max(200, Math.round(Math.max(leftH, rightH)));

    const warped = warpPerspective(sCanvas, corners, outW, outH);
    const filtered = applyScanFilter(warped, selectedFilter);

    const wCanvas = warpedCanvasRef.current;
    wCanvas.width = filtered.width;
    wCanvas.height = filtered.height;
    const wCtx = wCanvas.getContext('2d');
    wCtx?.drawImage(filtered, 0, 0);

    incrementStat('scanner');
  }, [originalImage, corners, selectedFilter]);

  useEffect(() => {
    if (originalImage) {
      processWarp();
    }
  }, [originalImage, processWarp]);

  const handleExportPDF = async () => {
    if (!warpedCanvasRef.current) return;
    const dataUrl = warpedCanvasRef.current.toDataURL('image/jpeg', 0.95);
    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(dataUrl);

    const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: jpgImage.width,
      height: jpgImage.height,
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    downloadBlob(blob, `scanned-document-${Date.now()}.pdf`);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Document & ID Card Scanner"
        description="Perspective correction, 4-corner de-skewing, and magic document enhancement filters for receipts, certificates, and ID cards."
        categoryName="Scanner"
        categoryPath="/scanner"
        badge="Perspective Homography"
      />

      {!originalImage ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFileSelect}
            title="Upload or Capture Document Photo"
            subtitle="JPG, PNG, or direct camera shot of document/certificate/ID card."
            cameraMode="document"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Canvas Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-center min-h-[460px] overflow-hidden">
              <div className="p-2 bg-white rounded-lg shadow-2xl max-w-full max-h-[500px] overflow-auto flex items-center justify-center">
                <canvas
                  ref={warpedCanvasRef}
                  className="max-h-[460px] w-auto object-contain border border-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span>Filter: <strong className="text-cyan-400 uppercase">{selectedFilter}</strong></span>
              <button
                onClick={() => {
                  setOriginalImage(null);
                }}
                className="text-rose-400 hover:text-rose-300"
              >
                Scan Another Document
              </button>
            </div>
          </div>

          {/* Right Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Export Scanned Document
              </h3>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </button>

                <DownloadDropdown
                  getCanvas={() => warpedCanvasRef.current}
                  baseFilename="nexora-scanned-document"
                  onExportPDF={handleExportPDF}
                />
              </div>
            </div>

            {/* Document Filters */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Document Enhancement Filters
              </h3>

              <div className="space-y-2">
                {(
                  [
                    { id: 'magic', label: 'Magic Document Color', desc: 'Whitens background and sharpens text' },
                    { id: 'bw', label: 'Crisp B&W', desc: 'Binary black and white for pure text documents' },
                    { id: 'grayscale', label: 'Grayscale', desc: 'Smooth gray tones for photocopies' },
                    { id: 'contrast', label: 'High Contrast', desc: 'Boosts visibility of faint ink and stamps' },
                    { id: 'original', label: 'Original Colors', desc: 'No filter applied' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFilter(f.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedFilter === f.id
                        ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{f.label}</span>
                      {selectedFilter === f.id && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">{f.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
