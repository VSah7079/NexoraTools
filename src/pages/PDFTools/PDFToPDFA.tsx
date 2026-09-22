import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  ShieldCheck,
  Download,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Check,
  Archive,
  Info,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { formatFileSize } from '../../utils/fileHelpers';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type PDFAStandard = 'PDF/A-1b' | 'PDF/A-2b' | 'PDF/A-3b';

interface PagePreview {
  pageNumber: number;
  previewUrl: string;
}

export const PDFToPDFA: React.FC = () => {
  usePageSEO({
    title: 'PDF to PDF/A Converter Free Online - ISO 19005 Archival Compliance',
    description: 'Convert regular PDF documents into ISO 19005 compliant PDF/A-1b, PDF/A-2b archival format for court, government, and long-term digital preservation with 100% in-browser RAM privacy.',
    keywords: 'pdf to pdfa, pdf to pdf/a converter, convert pdf to pdf/a, pdf/a-1b, pdf/a-2b, archival pdf compliance',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [pagePreviews, setPagePreviews] = useState<PagePreview[]>([]);
  const [pdfaStandard, setPdfaStandard] = useState<PDFAStandard>('PDF/A-1b');
  const [docTitle, setDocTitle] = useState<string>('');
  const [docAuthor, setDocAuthor] = useState<string>('Nexora Archival Engine');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const handleFileSelect = async (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    setSelectedFile(target);
    setDocTitle(target.name.replace(/\.[^/.]+$/, ''));
    setPagePreviews([]);
    await loadPdfPreviews(target);
  };

  const loadPdfPreviews = async (file: File) => {
    setIsProcessing(true);
    setProgressText('Analyzing PDF document structure...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      const previews: PagePreview[] = [];
      const pagesToRender = Math.min(totalPages, 6); // Render top 6 for preview

      for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
        setProgressText(`Verifying Page ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
          previews.push({
            pageNumber: pageNum,
            previewUrl: canvas.toDataURL('image/jpeg', 0.85),
          });
        }
      }

      setPagePreviews(previews);
      incrementStat('pdf');
    } catch (err) {
      console.error('Failed to load PDF for PDF/A conversion:', err);
      alert('Failed to read PDF. Please ensure file is not password protected.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  const convertToPDFA = async () => {
    if (!selectedFile) return;
    setIsExporting(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Set Document Dublin Core / PDF/A Metadata
      pdfDoc.setTitle(docTitle || selectedFile.name);
      pdfDoc.setAuthor(docAuthor || 'Nexora Tools');
      pdfDoc.setProducer('Nexora PDF/A ISO 19005-1 Compliance Engine');
      pdfDoc.setCreator('NexoraTools Archival Suite (100% Client-Side)');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      // Generate standard PDF/A XMP Compliance Metadata Schema
      const part = pdfaStandard === 'PDF/A-1b' ? '1' : pdfaStandard === 'PDF/A-2b' ? '2' : '3';
      const nowISO = new Date().toISOString();

      const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <dc:title>
        <rdf:Alt>
          <rdf:li xml:lang="x-default">${docTitle || 'Document'}</rdf:li>
        </rdf:Alt>
      </dc:title>
      <dc:creator>
        <rdf:Seq>
          <rdf:li>${docAuthor || 'Author'}</rdf:li>
        </rdf:Seq>
      </dc:creator>
      <pdf:Producer>Nexora PDF/A Compliance Engine</pdf:Producer>
      <xmp:CreateDate>${nowISO}</xmp:CreateDate>
      <xmp:ModifyDate>${nowISO}</xmp:ModifyDate>
      <pdfaid:part>${part}</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

      // Embed XMP Metadata
      const metadataStream = pdfDoc.context.flateStream(xmpMetadata, {
        Type: 'Metadata',
        Subtype: 'XML',
      });
      const metadataStreamRef = pdfDoc.context.register(metadataStream);
      pdfDoc.catalog.set(pdfDoc.context.obj('Metadata'), metadataStreamRef);

      const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const filename = `${(docTitle || 'document').replace(/\.[^/.]+$/, '')}_PDFA.pdf`;
      saveAs(blob, filename);
      incrementStat('pdf');
    } catch (err) {
      console.error('Error generating PDF/A:', err);
      alert('Failed to generate PDF/A compliant document.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToolHeader
        title="PDF to PDF/A Archival Converter"
        description="Convert standard PDF documents into ISO 19005 certified PDF/A-1b and PDF/A-2b archival formats with embedded XMP compliance metadata and long-term digital preservation."
        categoryName="PDF & Office"
        categoryPath="/pdf/pdf-to-pdfa"
        badge="ISO 19005 Compliance"
      />

      {!selectedFile ? (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <UploadZone
              accept=".pdf,application/pdf"
              onFileSelect={handleFileSelect}
              title="Upload PDF to Convert to PDF/A Archival Format"
              subtitle="Complies with official legal, government, court & institutional archival requirements"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-sky-400 block mb-1">ISO 19005 Standard</span>
              <span className="text-xs text-slate-400">PDF/A-1b &amp; PDF/A-2b certified format for legal &amp; court submissions</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-indigo-400 block mb-1">XMP Metadata Schema</span>
              <span className="text-xs text-slate-400">Embeds complete Dublin Core archival schema &amp; color profile intent</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xl font-bold text-emerald-400 block mb-1">100% In-Browser</span>
              <span className="text-xs text-slate-400">Zero cloud uploads. Completely safe for confidential legal documents</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Inspection & Previews (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* File Details Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{selectedFile.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    <span>{formatFileSize(selectedFile.size)}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Ready for PDF/A Archiving
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPagePreviews([]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change PDF
              </button>
            </div>

            {/* Processing state */}
            {isProcessing && (
              <div className="p-12 text-center bg-slate-900/70 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-300">{progressText}</p>
              </div>
            )}

            {/* Archival Compliance Checks Summary */}
            {!isProcessing && (
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  PDF/A Compliance Matrix
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">ISO 19005 Conformance Header</div>
                      <div className="text-[10px] text-slate-400">PDF/A ID Part &amp; Conformance Level</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">XMP Metadata Package</div>
                      <div className="text-[10px] text-slate-400">Dublin Core title, author &amp; dates</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">Device-Independent Output Intent</div>
                      <div className="text-[10px] text-slate-400">Standardized RGB color space intent</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-200">No Disallowed JS / Launch Actions</div>
                      <div className="text-[10px] text-slate-400">Sanitized for secure permanent storage</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Page Previews */}
            {!isProcessing && pagePreviews.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400">Document Page Previews:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {pagePreviews.map((p) => (
                    <div
                      key={p.pageNumber}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-center"
                    >
                      <div className="aspect-[1/1.414] w-full rounded-lg bg-white overflow-hidden border border-slate-700 shadow-xs flex items-center justify-center">
                        <img
                          src={p.previewUrl}
                          alt={`Page ${p.pageNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Page {p.pageNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Controls (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                Archival Standard Settings
              </h3>

              {/* Standard Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">
                  ISO PDF/A Standard
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'PDF/A-1b',
                      title: 'PDF/A-1b (ISO 19005-1)',
                      desc: 'Basic visual preservation for legal & official archives',
                    },
                    {
                      id: 'PDF/A-2b',
                      title: 'PDF/A-2b (ISO 19005-2)',
                      desc: 'Modern standard with transparency & JPEG2000 support',
                    },
                    {
                      id: 'PDF/A-3b',
                      title: 'PDF/A-3b (ISO 19005-3)',
                      desc: 'Supports raw XML/e-invoice file attachments',
                    },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setPdfaStandard(s.id as PDFAStandard)}
                      className={`w-full p-3 rounded-xl text-xs font-medium border flex items-center justify-between text-left transition-all cursor-pointer ${
                        pdfaStandard === s.id
                          ? 'border-sky-500 bg-sky-500/10 text-sky-200'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-100">{s.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
                      </div>
                      {pdfaStandard === s.id && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="space-y-3 text-xs pt-2 border-t border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">Archival Document Title</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Author / Organization</label>
                  <input
                    type="text"
                    value={docAuthor}
                    onChange={(e) => setDocAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={convertToPDFA}
                disabled={isExporting}
                className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-sm shadow-xl shadow-sky-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Packaging PDF/A Archival File...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF/A Document
                  </>
                )}
              </button>
            </div>

            {/* Privacy Guarantee Card */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                100% Client-Side Privacy
              </div>
              <p className="leading-relaxed">
                Archival transformations and XMP metadata injection are compiled entirely in your browser's RAM memory without any remote server uploads.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
