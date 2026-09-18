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
  title = 'Click or drag files here to upload',
  subtitle = 'Supports JPG, PNG, WebP & PDFs up to 25MB',
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
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-500/20 scale-[1.01]'
            : 'border-slate-700/80 hover:border-indigo-500/50 bg-slate-900/60 hover:bg-slate-900/90'
        }`}
      >
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

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-sky-500/30 text-indigo-400 border border-indigo-500/30 group-hover:scale-110 group-hover:border-indigo-400 transition-transform duration-300">
              <UploadCloud className="w-10 h-10 animate-pulse text-indigo-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 rounded-md bg-slate-800 text-sky-400 border border-slate-700 shadow-sm">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
              {title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700/60">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Browse Files
            </span>

            {allowCamera && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                Take Photo
              </button>
            )}

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 bg-slate-800/50">
              <Clipboard className="w-3 h-3 text-slate-400" />
              Paste (Ctrl+V)
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
          {error}
        </div>
      )}
    </div>
  );
};
