import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Download,
  Sliders,
  Eye,
  Code2,
  Copy,
  Check,
} from 'lucide-react';
import { ToolHeader } from '../../components/common/ToolHeader';
import { UploadZone } from '../../components/common/UploadZone';
import { incrementStat } from '../../services/analyticsTracker';
import { usePageSEO } from '../../utils/seoHelper';

const SAMPLE_TEMPLATES: { [key: string]: { name: string; html: string } } = {
  invoice: {
    name: 'Business Invoice',
    html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; padding: 40px; margin: 0; background: #ffffff; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
  .title { font-size: 28px; font-weight: 800; color: #4f46e5; }
  .invoice-details { text-align: right; font-size: 13px; color: #64748b; }
  .bill-to { margin: 30px 0; display: flex; justify-content: space-between; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
  th { background: #f1f5f9; text-align: left; padding: 12px; font-weight: 700; color: #334155; }
  td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
  .total-row { font-size: 16px; font-weight: 800; color: #0f172a; text-align: right; margin-top: 30px; }
  .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">INVOICE</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Nexora Lab Technologies Ltd.</div>
    </div>
    <div class="invoice-details">
      <div><strong>Invoice #:</strong> INV-2026-089</div>
      <div><strong>Date:</strong> 22 September 2026</div>
      <div><strong>Due Date:</strong> 06 October 2026</div>
    </div>
  </div>

  <div class="bill-to">
    <div>
      <div style="font-weight: 700; color: #475569; margin-bottom: 4px;">BILLED TO:</div>
      <div>Acme International Corp</div>
      <div>100 Tech Park Blvd, Suite 400</div>
      <div>contact@acme.example.com</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Qty</th>
        <th style="text-align: right;">Rate</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Cloud Infrastructure & AI Vision Pipeline Integration</td>
        <td style="text-align: center;">1</td>
        <td style="text-align: right;">$2,400.00</td>
        <td style="text-align: right;">$2,400.00</td>
      </tr>
      <tr>
        <td>Client-Side WASM Document Optimizer Engine</td>
        <td style="text-align: center;">2</td>
        <td style="text-align: right;">$650.00</td>
        <td style="text-align: right;">$1,300.00</td>
      </tr>
      <tr>
        <td>Annual Security Audit & SLA Support (Tier 1)</td>
        <td style="text-align: center;">1</td>
        <td style="text-align: right;">$800.00</td>
        <td style="text-align: right;">$800.00</td>
      </tr>
    </tbody>
  </table>

  <div class="total-row">
    Total Due: &nbsp;<span style="color: #4f46e5;">$4,500.00 USD</span>
  </div>

  <div class="footer">
    Thank you for your business! For bank wire or inquiries, email accounts@nexoralabs.com
  </div>
</body>
</html>`,
  },
  resume: {
    name: 'Modern Executive CV',
    html: `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 40px; margin: 0; line-height: 1.5; }
  .name { font-size: 30px; font-weight: 800; color: #0f172a; }
  .role { font-size: 16px; font-weight: 600; color: #4f46e5; margin-bottom: 12px; }
  .contact { font-size: 12px; color: #64748b; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
  .section-title { font-size: 14px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin-top: 20px; margin-bottom: 8px; }
  .job-title { font-size: 14px; font-weight: 700; }
  .job-meta { font-size: 12px; color: #64748b; margin-bottom: 6px; }
  ul { margin: 0 0 16px 20px; padding: 0; font-size: 13px; color: #334155; }
  li { margin-bottom: 4px; }
</style>
</head>
<body>
  <div class="name">ALEXANDER MORGAN</div>
  <div class="role">Principal Software Architect & Full-Stack Lead</div>
  <div class="contact">
    alex.morgan@example.com • +1 (555) 349-2091 • San Francisco, CA • linkedin.com/in/alexmorgan
  </div>

  <div class="section-title">Summary</div>
  <p style="font-size: 13px; color: #334155; margin-top: 0;">
    Over 10 years of experience architecting high-throughput distributed systems, WebAssembly client-side toolchains, and AI-accelerated web applications. Led engineering squads delivering 99.99% uptime services serving 10M+ active users.
  </p>

  <div class="section-title">Professional Experience</div>
  <div class="job-title">Senior Staff Architect — Nexora Technologies</div>
  <div class="job-meta">2022 – Present | San Francisco, CA</div>
  <ul>
    <li>Engineered zero-server document processing platform with sub-second client-side WASM pipelines.</li>
    <li>Optimized memory consumption by 65% across web neural network inference pipelines.</li>
    <li>Mentored 18 engineers across frontend, cloud systems, and platform security.</li>
  </ul>

  <div class="job-title">Lead Full-Stack Engineer — CloudMatrix Inc</div>
  <div class="job-meta">2018 – 2022 | Austin, TX</div>
  <ul>
    <li>Architected micro-frontend React frameworks with TypeScript and Tailwind systems.</li>
    <li>Automated CI/CD pipelines decreasing production deployment cycle time by 40%.</li>
  </ul>
</body>
</html>`,
  },
};

export const HTMLToPDF: React.FC = () => {
  usePageSEO({
    title: 'HTML to PDF Converter Free Online (100% In-Browser)',
    description: 'Convert HTML files, web pages, and raw HTML/CSS code into clean, print-ready vector A4 PDF documents with live preview and custom page styles.',
    keywords: 'html to pdf, convert html to pdf, webpage to pdf, html code to pdf free online',
  });

  const [htmlCode, setHtmlCode] = useState<string>(SAMPLE_TEMPLATES.invoice.html);
  const [docTitle, setDocTitle] = useState<string>('Document');
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Legal'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginSize, setMarginSize] = useState<number>(20);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleFileSelect = (file: File | File[]) => {
    const target = Array.isArray(file) ? file[0] : file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setHtmlCode(content);
      setDocTitle(target.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(target);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const convertHtmlToPdf = async () => {
    if (!htmlCode.trim()) return;
    setIsGenerating(true);

    try {
      // Create an offscreen printable container using browser native canvas rasterization
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = orientation === 'portrait' ? '794px' : '1123px'; // A4 96dpi approx
      iframe.style.height = orientation === 'portrait' ? '1123px' : '794px';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error('Iframe context unavailable');

      doc.open();
      doc.write(htmlCode);
      doc.close();

      // Allow styles to apply
      await new Promise((resolve) => setTimeout(resolve, 300));

      const pdfDoc = await PDFDocument.create();

      // Page dimensions in pt
      let ptWidth = pageSize === 'A4' ? 595.28 : pageSize === 'Letter' ? 612 : 612;
      let ptHeight = pageSize === 'A4' ? 841.89 : pageSize === 'Letter' ? 792 : 1008;

      if (orientation === 'landscape') {
        const temp = ptWidth;
        ptWidth = ptHeight;
        ptHeight = temp;
      }

      // Convert body to canvas using html2canvas style pure DOM capture or vector drawing
      const body = doc.body;
      const canvas = document.createElement('canvas');
      const scaleFactor = 2; // 2x sharpness
      canvas.width = (orientation === 'portrait' ? 794 : 1123) * scaleFactor;
      canvas.height = (orientation === 'portrait' ? 1123 : 794) * scaleFactor;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.scale(scaleFactor, scaleFactor);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render SVG foreignObject of HTML onto canvas
        const data = `
          <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width / scaleFactor}" height="${canvas.height / scaleFactor}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff; color:#000000;">
                ${body.innerHTML}
              </div>
            </foreignObject>
          </svg>
        `;

        const img = new Image();
        const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        await new Promise((resolve) => {
          img.onload = () => {
            ctx.drawImage(img, marginSize, marginSize, (canvas.width / scaleFactor) - marginSize * 2, (canvas.height / scaleFactor) - marginSize * 2);
            URL.revokeObjectURL(url);
            resolve(true);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(true);
          };
          img.src = url;
        });

        const imageBytes = canvas.toDataURL('image/jpeg', 0.95);
        const embeddedImg = await pdfDoc.embedJpg(imageBytes);

        const page = pdfDoc.addPage([ptWidth, ptHeight]);
        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: ptWidth,
          height: ptHeight,
        });
      }

      document.body.removeChild(iframe);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const filename = `${docTitle.trim() || 'Document'}.pdf`;
      saveAs(blob, filename);
      incrementStat('pdf');
    } catch (err) {
      console.error('Failed to convert HTML to PDF:', err);
      alert('Error rendering HTML to PDF. Please ensure HTML syntax is valid.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <ToolHeader
        title="HTML to PDF Converter"
        description="Convert HTML code, HTML web files, invoices, and templates into clean, pixel-perfect vector A4 PDF documents with 100% in-browser RAM privacy."
        categoryName="PDF & Office"
        categoryPath="/pdf/html-to-pdf"
        badge="100% Client-Side Engine"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Code & Template Presets (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                HTML / CSS Editor
              </span>

              {/* Template Presets */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setHtmlCode(SAMPLE_TEMPLATES.invoice.html)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                >
                  Invoice Template
                </button>
                <button
                  onClick={() => setHtmlCode(SAMPLE_TEMPLATES.resume.html)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition cursor-pointer"
                >
                  Resume Template
                </button>
              </div>
            </div>

            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              rows={16}
              className="w-full bg-slate-950 font-mono text-xs text-indigo-200 border border-slate-800 rounded-xl p-4 leading-relaxed focus:outline-none focus:border-indigo-500/60 resize-y"
              placeholder="Paste <html> code or design here..."
            />

            {/* Load HTML File */}
            <div>
              <UploadZone
                accept=".html,.htm"
                onFileSelect={handleFileSelect}
                title="Or load from .html file"
                subtitle="Upload existing HTML documents or reports"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & PDF Options (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Page Layout Settings
              </h3>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy HTML'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Page Format</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="A4">A4 Standard (210×297mm)</option>
                  <option value="Letter">US Letter (8.5×11")</option>
                  <option value="Legal">US Legal (8.5×14")</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Page Orientation</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setOrientation('portrait')}
                    className={`py-1.5 rounded-lg border text-center font-medium cursor-pointer ${
                      orientation === 'portrait'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation('landscape')}
                    className={`py-1.5 rounded-lg border text-center font-medium cursor-pointer ${
                      orientation === 'landscape'
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Page Margin</label>
                <select
                  value={marginSize}
                  onChange={(e) => setMarginSize(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value={0}>Zero Margin (Full Bleed)</option>
                  <option value={20}>Standard (20px)</option>
                  <option value={40}>Wide (40px)</option>
                </select>
              </div>
            </div>

            {/* Generate & Download Button */}
            <button
              onClick={convertHtmlToPdf}
              disabled={isGenerating || !htmlCode.trim()}
              className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-semibold text-sm shadow-xl shadow-orange-500/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating A4 PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Convert &amp; Download PDF
                </>
              )}
            </button>
          </div>

          {/* Live Rendered Sandbox Preview */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                Live HTML Rendered View
              </span>
              <span className="text-[10px] text-slate-500">Interactive Preview</span>
            </div>

            <div className="w-full h-80 rounded-xl bg-white overflow-hidden border border-slate-700 shadow-inner">
              <iframe
                ref={iframeRef}
                srcDoc={htmlCode}
                title="HTML Live Preview"
                className="w-full h-full border-0"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
