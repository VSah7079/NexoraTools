import React, { useState } from 'react';
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import type { ImageToPDFSettings, PDFImageItem } from '../../types/pdf';
import { createPDFFromImages } from '../../utils/pdfUtils';
import { downloadBlob, formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

export const ImageToPDF: React.FC = () => {
  usePageSEO({
    title: 'Free JPG to PDF Converter Online (Images to PDF in High Quality)',
    description: 'Convert JPG, PNG, WebP, and photos to PDF document online in seconds. Reorder images, set custom A4/Letter page size, margins, and download multi-page PDF for free with zero watermark.',
    keywords: 'jpg to pdf, image to pdf, convert jpg to pdf free, png to pdf, photo to pdf converter, images to pdf document online, jpgtopdf, nexora tools',
    canonicalPath: '/jpg-to-pdf',
    categoryName: 'PDF Suite',
    toolName: 'JPG to PDF Converter',
  });

  const [images, setImages] = useState<PDFImageItem[]>([]);
  const [settings, setSettings] = useState<ImageToPDFSettings>({
    pageSize: 'a4',
    orientation: 'portrait',
    margin: 'small',
    imageQuality: 0.95,
    addPageNumbers: true,
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleFilesSelect = (files: File | File[]) => {
    const fileList = Array.isArray(files) ? files : [files];
    const newItems: PDFImageItem[] = fileList.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      width: 0,
      height: 0,
      rotation: 0,
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }
    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setImages(newImages);
  };

  const handleGeneratePDF = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      const pdfBytes = await createPDFFromImages(images, settings);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, `nexora-document-${Date.now()}.pdf`);
      incrementStat('pdf');
    } catch (e) {
      console.error('PDF creation error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pb-12">
      <ToolHeader
        title="Image to PDF Converter"
        description="Convert multiple JPG, PNG, and WebP images into a single professional PDF document with custom margins, A4 layout, and reordering."
        categoryName="PDF Suite"
        categoryPath="/pdf/image-to-pdf"
        badge="Multi-Page Ready"
      />

      {images.length === 0 ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            onFileSelect={handleFilesSelect}
            multiple={true}
            title="Upload Images to Convert into PDF"
            subtitle="Select multiple images. You can rearrange, rotate, and adjust margins before creating PDF."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold">
                {images.length} Image{images.length > 1 ? 's' : ''} Selected
              </span>
              <button
                onClick={() => setImages([])}
                className="text-rose-400 hover:text-rose-300 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {images.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm"
                >
                  <span className="text-xs font-bold text-indigo-400 w-5 text-center shrink-0">
                    #{index + 1}
                  </span>

                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">{formatFileSize(item.size)}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === images.length - 1}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-500/10"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <UploadZone
              onFileSelect={handleFilesSelect}
              multiple={true}
              title="Add More Images"
              subtitle="Drag additional pages here"
              className="text-xs !p-4"
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-900 border border-red-500/30 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Generate Document
              </h3>

              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-950/40 transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Building Vector PDF...' : 'Download PDF Document'}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 text-xs">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Page Layout Settings
              </h3>

              <div>
                <label className="text-slate-400 block mb-1">Page Format</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['a4', 'letter', 'fit'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSettings((s) => ({ ...s, pageSize: size }))}
                      className={`py-1.5 rounded-lg uppercase border font-semibold ${
                        settings.pageSize === size
                          ? 'bg-red-500/20 border-red-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Page Margins</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['none', 'small', 'normal'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSettings((s) => ({ ...s, margin: m }))}
                      className={`py-1.5 rounded-lg capitalize border ${
                        settings.margin === m
                          ? 'bg-red-500/20 border-red-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">Add Page Numbers (e.g. 1/4)</span>
                <input
                  type="checkbox"
                  checked={settings.addPageNumbers}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, addPageNumbers: e.target.checked }))
                  }
                  className="rounded accent-red-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
