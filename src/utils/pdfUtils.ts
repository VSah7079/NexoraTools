import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { ImageToPDFSettings, PDFImageItem } from '../types/pdf';

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}

export async function createPDFFromImages(
  images: PDFImageItem[],
  settings: ImageToPDFSettings
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    const item = images[i];
    const imageBytes = await item.file.arrayBuffer();

    let embeddedImage;
    if (item.file.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBytes);
    }

    let pageWidth = 595.28;
    let pageHeight = 841.89;

    if (settings.pageSize === 'letter') {
      pageWidth = 612;
      pageHeight = 792;
    } else if (settings.pageSize === 'fit') {
      pageWidth = embeddedImage.width;
      pageHeight = embeddedImage.height;
    }

    if (settings.orientation === 'landscape' && pageWidth < pageHeight) {
      const temp = pageWidth;
      pageWidth = pageHeight;
      pageHeight = temp;
    } else if (settings.orientation === 'auto') {
      if (embeddedImage.width > embeddedImage.height && pageWidth < pageHeight) {
        const temp = pageWidth;
        pageWidth = pageHeight;
        pageHeight = temp;
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    let margin = 0;
    if (settings.margin === 'small') margin = 20;
    if (settings.margin === 'normal') margin = 36;

    const availableW = pageWidth - margin * 2;
    const availableH = pageHeight - margin * 2;

    const scale = Math.min(
      availableW / embeddedImage.width,
      availableH / embeddedImage.height,
      1
    );

    const drawW = embeddedImage.width * scale;
    const drawH = embeddedImage.height * scale;

    const drawX = margin + (availableW - drawW) / 2;
    const drawY = margin + (availableH - drawH) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });

    if (settings.addPageNumbers) {
      page.drawText(`${i + 1} / ${images.length}`, {
        x: pageWidth / 2 - 15,
        y: 15,
        size: 9,
        color: rgb(0.4, 0.4, 0.4),
      });
    }
  }

  return await pdfDoc.save();
}

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const fileBytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(fileBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

export async function splitPDF(
  file: File,
  pageIndicesToKeep: number[]
): Promise<Uint8Array> {
  const fileBytes = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(fileBytes);
  const newPdf = await PDFDocument.create();

  const zeroBasedIndices = pageIndicesToKeep
    .map((idx) => idx - 1)
    .filter((idx) => idx >= 0 && idx < srcPdf.getPageCount());

  const copiedPages = await newPdf.copyPages(srcPdf, zeroBasedIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return await newPdf.save();
}

export function parsePageRangeString(rangeStr: string, maxPages: number): number[] {
  const pagesSet = new Set<number>();
  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const from = Math.max(1, Math.min(start, end));
        const to = Math.min(maxPages, Math.max(start, end));
        for (let i = from; i <= to; i++) {
          pagesSet.add(i);
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= maxPages) {
        pagesSet.add(p);
      }
    }
  }

  return Array.from(pagesSet).sort((a, b) => a - b);
}

export async function renderPDFPageToCanvas(
  file: File | ArrayBuffer,
  pageNumber: number,
  scale = 2.0
): Promise<HTMLCanvasElement> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Failed to get canvas context');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderContext: any = {
    canvasContext: ctx,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  return canvas;
}

export async function getPDFPageCount(file: File): Promise<number> {
  const data = await file.arrayBuffer();
  const pdf = await PDFDocument.load(data, { ignoreEncryption: true });
  return pdf.getPageCount();
}
