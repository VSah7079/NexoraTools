import React, { useState, useRef, useEffect } from 'react';
import { Download, Printer, ChevronDown, FileImage, FileText, Check } from 'lucide-react';
import { downloadCanvas } from '../../utils/fileHelpers';

interface DownloadDropdownProps {
  getCanvas: () => HTMLCanvasElement | null;
  baseFilename?: string;
  defaultFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
  defaultLabel?: string;
  onPrint?: () => void;
  onExportPDF?: () => void;
  disabled?: boolean;
  className?: string;
}

export const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  getCanvas,
  baseFilename = 'nexora-export',
  defaultFormat = 'image/jpeg',
  defaultLabel,
  onPrint,
  onExportPDF,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (format: 'image/jpeg' | 'image/png' | 'image/webp') => {
    const canvas = getCanvas();
    if (!canvas) return;

    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const filename = `${baseFilename}-${Date.now()}.${ext}`;
    downloadCanvas(canvas, filename, format, 0.98);

    setDownloadedFormat(ext);
    setTimeout(() => setDownloadedFormat(null), 2000);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-flex items-center rounded-xl shadow-lg shadow-indigo-950/50 ${className}`} ref={dropdownRef}>
      {/* Primary 1-Click Download Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => handleDownload(defaultFormat)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-l-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {downloadedFormat ? (
          <Check className="w-4 h-4 text-emerald-300" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>
          {downloadedFormat
            ? `Saved .${downloadedFormat}!`
            : defaultLabel || (defaultFormat === 'image/png' ? 'Download PNG' : defaultFormat === 'image/webp' ? 'Download WebP' : 'Download JPG')}
        </span>
      </button>

      {/* Dropdown Toggle */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-2.5 rounded-r-xl bg-indigo-700 hover:bg-indigo-600 text-white border-l border-indigo-500/40 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronDown className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Image Formats
          </div>

          <button
            onClick={() => handleDownload('image/jpeg')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-sky-400" />
              <span>High Quality JPG</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">.jpg</span>
          </button>

          <button
            onClick={() => handleDownload('image/png')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-purple-400" />
              <span>Lossless PNG (Transparent)</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">.png</span>
          </button>

          <button
            onClick={() => handleDownload('image/webp')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <FileImage className="w-4 h-4 text-emerald-400" />
              <span>Modern WebP</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">.webp</span>
          </button>

          {(onExportPDF || onPrint) && (
            <div className="my-1 border-t border-slate-800" />
          )}

          {onExportPDF && (
            <button
              onClick={() => {
                onExportPDF();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-400" />
                <span>Export as PDF (Print Spec)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">.pdf</span>
            </button>
          )}

          {onPrint && (
            <button
              onClick={() => {
                onPrint();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:bg-emerald-950/50 hover:text-emerald-200 transition-colors text-left"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Direct Browser Print</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
