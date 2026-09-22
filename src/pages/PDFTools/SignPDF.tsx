import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  PenTool,
  Upload,
  Type,
  Eraser,
  Download,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type SignMode = 'draw' | 'type' | 'upload';

export const SignPDF: React.FC = () => {
  usePageSEO({
    title: 'Sign PDF Online Free - Digital PDF Signature & Stamp Placer (No Watermark)',
    description: 'Create and place digital signatures, stamps, and dates onto any page of your PDF. 100% free client-side RAM processing.',
    keywords: 'sign pdf, digital signature pdf, sign pdf online free, add signature to pdf, sign document online free no watermark',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sign modes & data
  const [signMode, setSignMode] = useState<SignMode>('draw');
  const [typedName, setTypedName] = useState<string>('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [penColor, setPenColor] = useState<string>('#1e40af'); // blue-800 default ink
  const [addDateStamp, setAddDateStamp] = useState<boolean>(true);

  // Signature placement on preview canvas (percentage coordinates)
  const [sigPosition, setSigPosition] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 60,
    y: 75,
    width: 25,
    height: 12,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setCurrentPage(1);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      setTotalPages(pdf.numPages);
      await renderPage(pdf, 1);
    } catch (err: any) {
      console.error(err);
      alert('Failed to load PDF: ' + err.message);
    }
  };

  const renderPage = async (pdfOrNull: any, pageNum: number) => {
    try {
      let pdf = pdfOrNull;
      if (!pdf && selectedFile) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      }
      if (!pdf) return;

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
        setPreviewImageUrl(canvas.toDataURL('image/jpeg', 0.9));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Drawing Pad Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureDataUrl(null);
    }
  };

  const handleTypeSignature = (text: string) => {
    setTypedName(text);
    if (!text.trim()) {
      setSignatureDataUrl(null);
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = penColor;
      ctx.font = 'italic 44px "Brush Script MT", "Segoe Script", cursive, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, 200, 70);
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSignatureDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSignedPDF = async () => {
    if (!selectedFile || !signatureDataUrl) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const targetPage = pages[currentPage - 1];
      const { width, height } = targetPage.getSize();

      const sigImgBytes = await fetch(signatureDataUrl).then((r) => r.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigImgBytes);

      const sigW = (sigPosition.width / 100) * width;
      const sigH = (sigPosition.height / 100) * height;
      const sigX = (sigPosition.x / 100) * width;
      const sigY = height - (sigPosition.y / 100) * height - sigH;

      targetPage.drawImage(sigImage, {
        x: sigX,
        y: sigY,
        width: sigW,
        height: sigH,
      });

      if (addDateStamp) {
        const dateStr = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        targetPage.drawText(`Date: ${dateStr}`, {
          x: sigX,
          y: Math.max(10, sigY - 12),
          size: 8,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_signed_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save signed PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Sign PDF Online"
        description="Sign PDF documents digitally by drawing, typing cursive signature, or uploading your signature stamp with live placement on any page."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Security Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop your PDF here to sign"
            subtitle="Draw signature • Type signature • Upload stamp • 100% RAM Privacy"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Signature Creator Panel */}
          <div className="lg:col-span-5 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-indigo-400" />
                  Create Signature
                </h3>
                <p className="text-xs text-slate-400">{selectedFile.name}</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 bg-rose-500/10 rounded-lg"
              >
                Change PDF
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/60 rounded-xl border border-white/5">
              {[
                { id: 'draw', label: 'Draw', icon: PenTool },
                { id: 'type', label: 'Type', icon: Type },
                { id: 'upload', label: 'Upload', icon: Upload },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSignMode(m.id as SignMode)}
                    className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                      signMode === m.id
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mode 1: Draw Canvas */}
            {signMode === 'draw' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Draw with mouse or fingertip:</span>
                  <button
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
                  >
                    <Eraser className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="border border-white/20 bg-white rounded-xl overflow-hidden touch-none">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 cursor-crosshair block"
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Type Signature */}
            {signMode === 'type' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">Type Your Full Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => handleTypeSignature(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {typedName && (
                  <div className="p-4 bg-white rounded-xl text-center shadow-inner">
                    <span
                      style={{
                        fontFamily: '"Brush Script MT", "Segoe Script", cursive, sans-serif',
                        color: penColor,
                        fontSize: '32px',
                      }}
                    >
                      {typedName}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mode 3: Upload Stamp */}
            {signMode === 'upload' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">Upload Signature Image (PNG/JPG)</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleSignatureUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {/* Color & Date Stamp Settings */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Ink Color</label>
                <div className="flex items-center gap-2">
                  {['#1e40af', '#0f172a', '#b91c1c'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setPenColor(c);
                        if (signMode === 'type' && typedName) handleTypeSignature(typedName);
                      }}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        penColor === c ? 'scale-110 border-white ring-2 ring-indigo-500' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-center">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addDateStamp}
                    onChange={(e) => setAddDateStamp(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Attach Date Stamp</span>
                </label>
              </div>
            </div>

            {/* Sign and Download */}
            <button
              onClick={handleSaveSignedPDF}
              disabled={isExporting || !signatureDataUrl}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Stamping Signed PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Sign &amp; Download PDF</span>
                </>
              )}
            </button>
          </div>

          {/* PDF Page Interactive Preview & Signature Placement */}
          <div className="lg:col-span-7 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Select Signature Position (Page {currentPage} of {totalPages})
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    const prev = Math.max(1, currentPage - 1);
                    setCurrentPage(prev);
                    renderPage(null, prev);
                  }}
                  disabled={currentPage <= 1}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-200"
                >
                  Prev Page
                </button>
                <button
                  onClick={() => {
                    const next = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(next);
                    renderPage(null, next);
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-200"
                >
                  Next Page
                </button>
              </div>
            </div>

            {/* Position Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
              <span>Quick Position:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSigPosition({ x: 10, y: 80, width: 25, height: 12 })}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Bottom-Left
                </button>
                <button
                  onClick={() => setSigPosition({ x: 65, y: 80, width: 25, height: 12 })}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Bottom-Right (Standard)
                </button>
                <button
                  onClick={() => setSigPosition({ x: 38, y: 80, width: 25, height: 12 })}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  Bottom-Center
                </button>
              </div>
            </div>

            {/* Preview Sheet with Placed Signature */}
            <div className="relative w-full aspect-[1/1.35] bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
              {previewImageUrl ? (
                <div className="relative max-h-full max-w-full shadow-2xl border border-white/20 bg-white">
                  <img
                    src={previewImageUrl}
                    alt="PDF Page Preview"
                    className="max-h-[500px] w-auto object-contain block"
                  />
                  {signatureDataUrl && (
                    <div
                      className="absolute border-2 border-dashed border-indigo-500 bg-indigo-500/10 p-1 flex flex-col items-center justify-center rounded cursor-move transition-all"
                      style={{
                        left: `${sigPosition.x}%`,
                        top: `${sigPosition.y}%`,
                        width: `${sigPosition.width}%`,
                        height: `${sigPosition.height}%`,
                      }}
                    >
                      <img
                        src={signatureDataUrl}
                        alt="Signature"
                        className="max-w-full max-h-full object-contain"
                      />
                      {addDateStamp && (
                        <span className="text-[8px] text-slate-700 font-mono mt-0.5 whitespace-nowrap">
                          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
