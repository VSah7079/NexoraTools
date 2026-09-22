import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  FileCheck2,
  Download,
  RefreshCw,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

interface DetectedFormField {
  name: string;
  type: string;
  value: string;
}

export const PDFForms: React.FC = () => {
  usePageSEO({
    title: 'PDF Forms Filler & Flatten - Fill Interactive PDF Forms (No Watermark)',
    description: 'Fill out interactive PDF forms, check checkboxes, enter text fields, and flatten PDF forms to secure read-only document format.',
    keywords: 'fill pdf form online free, pdf form filler, flatten pdf form, fill interactive pdf, make pdf form read only',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fields, setFields] = useState<DetectedFormField[]>([]);
  const [flattenOnExport, setFlattenOnExport] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleFileSelect = async (files: File | File[]) => {
    const file = Array.isArray(files) ? files[0] : files;
    setSelectedFile(file);
    setFields([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const form = pdfDoc.getForm();
      const rawFields = form.getFields();

      const parsed: DetectedFormField[] = rawFields.map((f) => {
        const name = f.getName();
        const type = f.constructor.name;
        let value = '';
        try {
          if (typeof (f as any).getText === 'function') {
            value = (f as any).getText() || '';
          } else if (typeof (f as any).isChecked === 'function') {
            value = (f as any).isChecked() ? 'true' : 'false';
          }
        } catch (e) {
          // ignore
        }
        return { name, type, value };
      });

      setFields(parsed);
      incrementStat('pdf');
    } catch (err: any) {
      console.error(err);
      alert('Could not inspect PDF forms: ' + err.message);
    }
  };

  const updateFieldValue = (index: number, val: string) => {
    setFields((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], value: val };
      return copy;
    });
  };

  const handleExportForm = async () => {
    if (!selectedFile) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const form = pdfDoc.getForm();

      fields.forEach((field) => {
        try {
          const f = form.getField(field.name);
          if (typeof (f as any).setText === 'function') {
            (f as any).setText(field.value);
          } else if (typeof (f as any).check === 'function' && typeof (f as any).uncheck === 'function') {
            if (field.value === 'true') (f as any).check();
            else (f as any).uncheck();
          }
        } catch (e) {
          // Ignore field mapping error
        }
      });

      if (flattenOnExport) {
        form.flatten();
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes).buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      saveAs(blob, `${baseName}_filled_Nexora.pdf`);

      incrementStat('pdf');
    } catch (err: any) {
      console.error(err);
      alert('Failed to save PDF form: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ToolHeader
        title="PDF Forms Filler & Form Flattening"
        description="Inspect interactive PDF form fields, enter text or toggle checkboxes, and export clean flattened documents."
        categoryName="PDF Suite"
        categoryPath="/pdf"
        badge="Edit Suite"
      />

      {!selectedFile ? (
        <div className="max-w-3xl mx-auto">
          <UploadZone
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            title="Drop interactive PDF form here"
            subtitle="Fill text fields &amp; checkboxes • Flatten into read-only PDF • 100% RAM Privacy"
          />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* File summary */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)} • {fields.length} Form Fields Detected</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedFile(null);
                setFields([]);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 bg-rose-500/10 rounded-xl"
            >
              Change File
            </button>
          </div>

          {/* Form Fields List */}
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Detected Interactive Fields</span>
              <span className="text-purple-400">{fields.length} Fields</span>
            </h5>

            {fields.length === 0 ? (
              <div className="p-6 bg-slate-950/40 border border-white/5 rounded-2xl text-center text-xs text-slate-400 space-y-2">
                <p>No interactive AcroForm fields were detected in this PDF.</p>
                <p className="text-[11px] text-slate-500">
                  Tip: If your document is a standard scanned document, you can use our <strong>Edit PDF</strong> or <strong>Sign PDF</strong> tools to add text directly!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {fields.map((f, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span className="font-mono text-purple-300">{f.name}</span>
                      <span className="text-[10px] text-slate-500">{f.type}</span>
                    </label>

                    {f.type.includes('CheckBox') ? (
                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={f.value === 'true'}
                          onChange={(e) => updateFieldValue(idx, e.target.checked ? 'true' : 'false')}
                          className="w-4 h-4 rounded bg-slate-800 border-white/20 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-xs text-slate-300">Checked</span>
                      </label>
                    ) : (
                      <input
                        type="text"
                        value={f.value}
                        onChange={(e) => updateFieldValue(idx, e.target.value)}
                        placeholder={`Enter ${f.name}...`}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Flatten options */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={flattenOnExport}
                onChange={(e) => setFlattenOnExport(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-white/20 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                Flatten Form (permanently lock fields into non-editable static PDF for security)
              </span>
            </label>
          </div>

          {/* Action button */}
          <button
            onClick={handleExportForm}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm shadow-xl shadow-purple-600/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Form...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save &amp; Download Filled PDF</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
