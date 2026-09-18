/**
 * Perspective Warp and Document Scanner Algorithms for Nexora Tools
 */

export interface Point {
  x: number;
  y: number;
}

export type ScanFilterType = 'original' | 'magic' | 'bw' | 'grayscale' | 'contrast';

/**
 * Computes the 3x3 projective transformation (Homography) matrix
 * mapping quad corners (p0, p1, p2, p3) to rectangle (0,0, w, h).
 */
export function getPerspectiveTransformMatrix(
  src: [Point, Point, Point, Point],
  dstWidth: number,
  dstHeight: number
): number[] {
  const dst: [Point, Point, Point, Point] = [
    { x: 0, y: 0 },
    { x: dstWidth, y: 0 },
    { x: dstWidth, y: dstHeight },
    { x: 0, y: dstHeight },
  ];

  const a: number[][] = [];
  const b: number[] = [];

  for (let i = 0; i < 4; i++) {
    const s = src[i];
    const d = dst[i];

    a.push([s.x, s.y, 1, 0, 0, 0, -d.x * s.x, -d.x * s.y]);
    b.push(d.x);

    a.push([0, 0, 0, s.x, s.y, 1, -d.y * s.x, -d.y * s.y]);
    b.push(d.y);
  }

  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) {
        maxRow = k;
      }
    }
    const tempA = a[i]; a[i] = a[maxRow]; a[maxRow] = tempA;
    const tempB = b[i]; b[i] = b[maxRow]; b[maxRow] = tempB;

    if (Math.abs(a[i][i]) < 1e-7) continue;

    for (let k = i + 1; k < n; k++) {
      const factor = a[k][i] / a[i][i];
      for (let j = i; j < n; j++) {
        a[k][j] -= factor * a[i][j];
      }
      b[k] -= factor * b[i];
    }
  }

  const h = new Array(9).fill(0);
  h[8] = 1;

  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) {
      sum -= a[i][j] * h[j];
    }
    h[i] = sum / a[i][i];
  }

  return h;
}

/**
 * Applies Perspective Warp from 4 corner points of source image onto a destination canvas
 */
export function warpPerspective(
  sourceCanvas: HTMLCanvasElement,
  corners: [Point, Point, Point, Point],
  outputWidth: number,
  outputHeight: number
): HTMLCanvasElement {
  const destCanvas = document.createElement('canvas');
  destCanvas.width = outputWidth;
  destCanvas.height = outputHeight;
  const dCtx = destCanvas.getContext('2d');
  const sCtx = sourceCanvas.getContext('2d');

  if (!dCtx || !sCtx) return destCanvas;

  const invDst: [Point, Point, Point, Point] = [
    { x: 0, y: 0 },
    { x: outputWidth, y: 0 },
    { x: outputWidth, y: outputHeight },
    { x: 0, y: outputHeight },
  ];

  const a: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const s = invDst[i];
    const d = corners[i];
    a.push([s.x, s.y, 1, 0, 0, 0, -d.x * s.x, -d.x * s.y]);
    b.push(d.x);
    a.push([0, 0, 0, s.x, s.y, 1, -d.y * s.x, -d.y * s.y]);
    b.push(d.y);
  }
  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(a[k][i]) > Math.abs(a[maxRow][i])) maxRow = k;
    }
    const tempA = a[i]; a[i] = a[maxRow]; a[maxRow] = tempA;
    const tempB = b[i]; b[i] = b[maxRow]; b[maxRow] = tempB;
    if (Math.abs(a[i][i]) < 1e-7) continue;
    for (let k = i + 1; k < n; k++) {
      const factor = a[k][i] / a[i][i];
      for (let j = i; j < n; j++) a[k][j] -= factor * a[i][j];
      b[k] -= factor * b[i];
    }
  }
  const mapH = new Array(9).fill(0);
  mapH[8] = 1;
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) sum -= a[i][j] * mapH[j];
    mapH[i] = sum / a[i][i];
  }

  const srcImgData = sCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const srcData = srcImgData.data;
  const sW = sourceCanvas.width;
  const sH = sourceCanvas.height;

  const dstImgData = dCtx.createImageData(outputWidth, outputHeight);
  const dstData = dstImgData.data;

  for (let y = 0; y < outputHeight; y++) {
    for (let x = 0; x < outputWidth; x++) {
      const w = mapH[6] * x + mapH[7] * y + 1;
      const srcX = (mapH[0] * x + mapH[1] * y + mapH[2]) / w;
      const srcY = (mapH[3] * x + mapH[4] * y + mapH[5]) / w;

      const dstIndex = (y * outputWidth + x) * 4;

      if (srcX >= 0 && srcX < sW - 1 && srcY >= 0 && srcY < sH - 1) {
        const x0 = Math.floor(srcX);
        const y0 = Math.floor(srcY);
        const x1 = x0 + 1;
        const y1 = y0 + 1;

        const wx = srcX - x0;
        const wy = srcY - y0;

        const i00 = (y0 * sW + x0) * 4;
        const i10 = (y0 * sW + x1) * 4;
        const i01 = (y1 * sW + x0) * 4;
        const i11 = (y1 * sW + x1) * 4;

        for (let c = 0; c < 3; c++) {
          const top = srcData[i00 + c] * (1 - wx) + srcData[i10 + c] * wx;
          const bot = srcData[i01 + c] * (1 - wx) + srcData[i11 + c] * wx;
          dstData[dstIndex + c] = Math.round(top * (1 - wy) + bot * wy);
        }
        dstData[dstIndex + 3] = 255;
      } else {
        dstData[dstIndex] = 255;
        dstData[dstIndex + 1] = 255;
        dstData[dstIndex + 2] = 255;
        dstData[dstIndex + 3] = 255;
      }
    }
  }

  dCtx.putImageData(dstImgData, 0, 0);
  return destCanvas;
}

/**
 * Apply Document Enhancement Filters
 */
export function applyScanFilter(
  canvas: HTMLCanvasElement,
  filterType: ScanFilterType
): HTMLCanvasElement {
  if (filterType === 'original') return canvas;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (filterType === 'magic') {
      const whitened = lum > 140 ? Math.min(255, lum * 1.25) : lum * 0.85;
      const factor = whitened / (lum || 1);
      data[i] = Math.min(255, Math.round(r * factor));
      data[i + 1] = Math.min(255, Math.round(g * factor));
      data[i + 2] = Math.min(255, Math.round(b * factor));
    } else if (filterType === 'bw') {
      const val = lum > 135 ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    } else if (filterType === 'grayscale') {
      data[i] = lum;
      data[i + 1] = lum;
      data[i + 2] = lum;
    } else if (filterType === 'contrast') {
      const val = Math.max(0, Math.min(255, (lum - 128) * 1.6 + 128));
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
