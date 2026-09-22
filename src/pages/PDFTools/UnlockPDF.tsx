import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Unlock,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const UnlockPDF: React.FC = () => {
  usePageSEO({
    title: 'Unlock PDF Online Free - Remove Password & Restrictions (No Watermark)',
    description: 'Instantly remove passwords, print locks, and copy restrictions from your PDF document. 100% private in-browser RAM decryption.',
    keywords: 'unlock pdf, remove pdf password, decrypt pdf online free, pdf password remover, remove print restriction from pdf',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setPassword('');
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      try {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        await loadingTask.promise;
        setIsPasswordRequired(false);
      } catch (err: any) {
        if (err.name === 'PasswordException' || err.message?.toLowerCase().includes('password')) {
          setIsPasswordRequired(true);
        } else {
          setIsPasswordRequired(false);
        }
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnlock = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      if (isPasswordRequired && password) {
        try {
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(arrayBuffer),
            password: password,
          });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;

          const newPdf = await PDFDocument.create();
          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
              const imgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
              const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
              const embeddedImg = await newPdf.embedJpg(imgBytes);
              const newPage = newPdf.addPage([viewport.width / 2, viewport.height / 2]);
              newPage.drawImage(embeddedImg, {
                x: 0,
                y: 0,
                width: viewport.width / 2,
                height: viewport.height / 2,
              });
            }
          }

          const pdfBytes = await newPdf.save();
          const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
          const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
          saveAs(blob, `${baseName}_unlocked_Nexora.pdf`);

          incrementStat('pdf');
          return;
        } catch (err: any) {
          setErrorMessage('Incorrect password. Please verify and try again.');
          return;
        }
      }

      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
        saveAs(blob, `${baseName}_unlocked_Nexora.pdf`);
        incrementStat('pdf');
      } catch (err) {
        setErrorMessage('Failed to decrypt document. Incorrect password or unsupported encryption.');
      }
    } catch (err: any) {
      console.error('Failed to unlock PDF:', err);
      setErrorMessage(err.message || 'Error unlocking PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Unlock PDF & Remove Password"
        description="Permanently remove passwords, print restrictions, and editing permissions from your PDF documents in seconds."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Security Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop locked PDF here to remove password"
            subtitle="Remove owner & user passwords • 100% Client-side RAM decryption"
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* File summary */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setErrorMessage(null);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 bg-rose-500/10 rounded-xl transition-colors"
            >
              Change File
            </button>
          </div>

          {/* Password Input (if document is protected) */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              {isPasswordRequired ? 'Enter Document Password to Unlock' : 'Enter Password (if known or required)'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isPasswordRequired ? 'Enter current password...' : 'Leave empty if only owner lock'}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Once unlocked, an unencrypted copy with full print, copy, and edit permissions will be downloaded.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Unlock Button */}
          <button
            onClick={handleUnlock}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Removing Password Protection...</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Unlock &amp; Download PDF</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
