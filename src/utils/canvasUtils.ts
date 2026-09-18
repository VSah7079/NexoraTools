/**
 * Canvas and Image Processing Utilities for Nexora Tools
 */

export const MM_TO_INCH = 1 / 25.4;

export function mmToPixels(mm: number, dpi = 300): number {
  return Math.round(mm * MM_TO_INCH * dpi);
}

export function pixelsToMm(pixels: number, dpi = 300): number {
  return (pixels / dpi) * 25.4;
}

export function loadImage(src: string | File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));

    if (typeof src === 'string') {
      img.src = src;
    } else {
      const url = URL.createObjectURL(src);
      img.src = url;
      img.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    }
  });
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100 (0 = normal)
  contrast: number;   // -100 to 100 (0 = normal)
  saturation: number; // -100 to 100 (0 = normal)
  sharpness?: number; // 0 to 100
  rotation: number;   // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export function applyCanvasAdjustments(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  adjustments: ImageAdjustments
) {
  const { brightness, contrast, saturation } = adjustments;
  
  const b = 100 + brightness;
  const c = 100 + contrast;
  const s = 100 + saturation;
  ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
}

/**
 * Enhanced Clean Signature / Threshold filter
 */
export function cleanSignatureFilter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold = 175,
  inkDarkness = 1.3
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum > threshold) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    } else {
      const darkFactor = Math.max(0, (lum / threshold) * 255 * (1 / inkDarkness));
      data[i] = darkFactor;
      data[i + 1] = darkFactor;
      data[i + 2] = darkFactor;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
