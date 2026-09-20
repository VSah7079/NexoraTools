import { saveAs } from 'file-saver';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  saveAs(blob, filename);
}

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  type: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.95
) {
  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, filename);
    }
  }, type, quality);
}

/**
 * Binary search compressor:
 * Iteratively adjusts JPEG/WebP compression quality (and dimensions if needed)
 * to hit the user's exact target file size (in KB) within a small tolerance.
 */
export async function compressToTargetKB(
  canvas: HTMLCanvasElement,
  targetKB: number,
  format: 'image/jpeg' | 'image/webp' = 'image/jpeg',
  maxIterations = 8
): Promise<{ blob: Blob; quality: number; sizeKB: number; width: number; height: number }> {
  const targetBytes = targetKB * 1024;
  let minQuality = 0.05;
  let maxQuality = 0.98;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.8;
  let currentCanvas = canvas;

  const getBlob = (c: HTMLCanvasElement, q: number): Promise<Blob> => {
    return new Promise((resolve) => {
      c.toBlob((b) => resolve(b || new Blob()), format, q);
    });
  };

  // Test at maximum quality first
  const maxBlob = await getBlob(currentCanvas, 0.98);
  if (maxBlob.size <= targetBytes) {
    return {
      blob: maxBlob,
      quality: 0.98,
      sizeKB: +(maxBlob.size / 1024).toFixed(1),
      width: currentCanvas.width,
      height: currentCanvas.height,
    };
  }

  // If even lowest quality on full resolution exceeds target, scale down canvas resolution first
  const lowestBlob = await getBlob(currentCanvas, 0.08);
  if (lowestBlob.size > targetBytes) {
    const scaleFactor = Math.sqrt(targetBytes / lowestBlob.size) * 0.9;
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = Math.max(100, Math.round(canvas.width * scaleFactor));
    scaledCanvas.height = Math.max(100, Math.round(canvas.height * scaleFactor));
    const sCtx = scaledCanvas.getContext('2d');
    if (sCtx) {
      sCtx.imageSmoothingEnabled = true;
      sCtx.imageSmoothingQuality = 'high';
      sCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
      currentCanvas = scaledCanvas;
    }
  }

  // Binary search on quality
  for (let i = 0; i < maxIterations; i++) {
    const midQuality = (minQuality + maxQuality) / 2;
    const currentBlob = await getBlob(currentCanvas, midQuality);

    if (currentBlob.size <= targetBytes) {
      bestBlob = currentBlob;
      bestQuality = midQuality;
      minQuality = midQuality; // try to get higher quality that still fits
    } else {
      maxQuality = midQuality; // too big, decrease quality
    }
  }

  if (!bestBlob) {
    bestBlob = await getBlob(currentCanvas, minQuality);
  }

  return {
    blob: bestBlob,
    quality: +bestQuality.toFixed(2),
    sizeKB: +(bestBlob.size / 1024).toFixed(1),
    width: currentCanvas.width,
    height: currentCanvas.height,
  };
}

/**
 * Direct Print Canvas Utility:
 * Isolates ONLY the canvas document/photo into a dedicated print iframe
 * so that ZERO website UI, navbar, or buttons get printed.
 */
export function printCanvas(canvas: HTMLCanvasElement, title: string = 'Print Document') {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.98);
  const isLandscape = canvas.width > canvas.height;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
            margin: 0mm;
          }
          * {
            box-sizing: border-box;
          }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #FFFFFF !important;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            display: block;
          }
        </style>
      </head>
      <body>
        <img id="print-image" src="${dataUrl}" alt="Print Document" />
        <script>
          const img = document.getElementById('print-image');
          function doPrint() {
            window.focus();
            window.print();
            setTimeout(function() {
              try {
                if (window.parent && window.frameElement) {
                  window.parent.document.body.removeChild(window.frameElement);
                }
              } catch (e) {}
            }, 1000);
          }
          if (img.complete) {
            doPrint();
          } else {
            img.onload = doPrint;
          }
        </script>
      </body>
    </html>
  `);
  doc.close();
}

