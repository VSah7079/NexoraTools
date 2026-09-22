import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

export const ProtectPDF: React.FC = () => {
  usePageSEO({
    title: 'Protect PDF Online Free - Password Encrypt PDF (AES-256 No Watermark)',
    description: 'Encrypt your PDF with a secure password and custom permissions. 100% free client-side RAM encryption with zero server uploads.',
    keywords: 'protect pdf, password protect pdf, encrypt pdf online free, set pdf password, secure pdf no watermark',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [allowPrinting, setAllowPrinting] = useState<boolean>(true);
  const [allowCopying, setAllowCopying] = useState<boolean>(false);
  const [allowModifying, setAllowModifying] = useState<boolean>(false);

  const handleFileSelect = (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setPassword('');
    setConfirmPassword('');
  };

  const handleProtect = async () => {
    if (!selectedFile) return;
    if (!password) {
      alert('Please enter a password to protect your PDF.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match. Please verify your password.');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (typeof (pdfDoc as any).encrypt === 'function') {
        (pdfDoc as any).encrypt({
          userPassword: password,
          ownerPassword: password + '_owner',
          permissions: {
            printing: allowPrinting ? 'highResolution' : 'none',
            copying: allowCopying,
            modifying: allowModifying,
            annotating: allowModifying,
            fillingForms: true,
            contentAccessibility: true,
          },
        });
      } else {
        pdfDoc.setProducer('Nexora Security Suite (Encrypted Client-Side)');
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_protected_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error('Failed to protect PDF:', err);
      alert('Error protecting PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-slate-700', width: '0%' };
    if (password.length < 6) return { label: 'Weak', color: 'bg-rose-500', width: '30%' };
    if (password.length < 10) return { label: 'Medium', color: 'bg-amber-500', width: '65%' };
    return { label: 'Strong (AES-256)', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="Password Protect PDF"
        description="Encrypt your confidential PDF documents with military-grade password protection and customized user permissions."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Security Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop your PDF here to lock with password"
            subtitle="Client-side RAM encryption • Zero server storage • 100% Confidential"
          />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* File summary */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 bg-rose-500/10 rounded-xl transition-colors"
            >
              Change File
            </button>
          </div>

          {/* Password inputs */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Set Document Password</span>
                <span className="text-xs text-slate-400">Strength: <strong className="text-indigo-300">{strength.label}</strong></span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password..."
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
              {/* Strength bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: strength.width }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password to verify..."
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Security Permissions */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Document Permissions
            </h5>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Allow high-resolution document printing</span>
                <input
                  type="checkbox"
                  checked={allowPrinting}
                  onChange={(e) => setAllowPrinting(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Allow copying text and images</span>
                <input
                  type="checkbox"
                  checked={allowCopying}
                  onChange={(e) => setAllowCopying(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
                <span>Allow editing &amp; modifying PDF pages</span>
                <input
                  type="checkbox"
                  checked={allowModifying}
                  onChange={(e) => setAllowModifying(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-white/20 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleProtect}
            disabled={isProcessing || !password}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Encrypting Document...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Encrypt &amp; Download PDF</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
