import React, { useRef, useState, useEffect, useCallback } from 'react';
import { UploadCloud, Camera, Image as ImageIcon, FileText, Clipboard } from 'lucide-react';
import { formatFileSize } from '../../utils/fileHelpers';

interface UploadZoneProps {
  onFileSelect: (file: File | File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  title?: string;
  subtitle?: string;
  allowCamera?: boolean;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelect,
  accept = 'image/jpeg,image/png,image/webp,image/jpg',
  multiple = false,
  maxSizeMB = 25,
  title = 'Select or drag & drop files here',
  subtitle = 'Supports JPG, PNG, WebP & PDF files up to 25MB',
  allowCamera = true,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandle = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);

      const validFiles: File[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > maxSizeBytes) {
          setError(`File "${file.name}" exceeds ${maxSizeMB}MB limit (${formatFileSize(file.size)})`);
          return;
        }
        validFiles.push(file);
      }

      if (multiple) {
        onFileSelect(validFiles);
      } else {
        onFileSelect(validFiles[0]);
      }
    },
    [maxSizeMB, multiple, onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndHandle(e.dataTransfer.files);
  };

  // Clipboard Paste Support (Ctrl+V anywhere in window or upload zone)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) pastedFiles.push(blob);
        }
      }

      if (pastedFiles.length > 0) {
        if (multiple) {
          onFileSelect(pastedFiles);
        } else {
          onFileSelect(pastedFiles[0]);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [multiple, onFileSelect]);

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all duration-300 overflow-hidden ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/15 shadow-2xl shadow-indigo-500/30 scale-[1.01]'
            : 'border-white/15 hover:border-indigo-500/50 bg-slate-900/70 hover:bg-slate-900/95 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10'
        }`}
      >
        {/* Subtle ambient light inside upload zone */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => validateAndHandle(e.target.files)}
          className="hidden"
        />

        {allowCamera && (
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => validateAndHandle(e.target.files)}
            className="hidden"
          />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="p-5 rounded-3xl bg-gradient-to-tr from-indigo-600/30 via-cyan-500/20 to-purple-600/30 text-indigo-400 border border-white/10 group-hover:scale-110 group-hover:border-indigo-400 transition-transform duration-300 shadow-xl shadow-indigo-950/40">
              <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 group-hover:text-indigo-300 transition-colors" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-slate-900 text-sky-400 border border-white/10 shadow-md">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h4 className="text-lg sm:text-xl font-heading font-bold text-white group-hover:text-indigo-300 transition-colors">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all group-hover:scale-105">
              <FileText className="w-3.5 h-3.5" />
              Browse Files
            </span>

            {allowCamera && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/10 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                Capture with Camera
              </button>
            )}

            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] text-slate-400 bg-slate-800/60 border border-white/5">
              <Clipboard className="w-3 h-3 text-slate-400" />
              Direct Paste (Ctrl+V)
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium animate-in fade-in">
          {error}
        </div>
      )}
    </div>
  );
};
