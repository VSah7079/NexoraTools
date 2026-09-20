/**
 * Client-Side AI Background Removal & Segmentation Engine for Nexora Tools
 * Uses non-destructive Two-Layer Alpha Compositing (Matching remove.bg architecture).
 *
 * Layer 1: ORIGINAL PHOTO (Source of Truth - 100% pixel preserved, zero alterations)
 * Layer 2: ALPHA MASK (Segmentation + Brushes - controls transparency 0 to 255)
 *
 * Final Composition: R_orig, G_orig, B_orig + Alpha_mask
 */

import { removeBackground } from '@imgly/background-removal';

export interface SegmentationOptions {
  model?: 'isnet' | 'isnet_fp16';
  threshold?: number; // 0 to 100 (Fine-tune background cutoff)
  sensitivity?: number;
  edgeFeather?: number;
  backgroundColor: 'transparent' | 'white' | 'skyblue' | 'blue' | 'navy' | 'grey' | 'red' | 'custom' | 'image';
  customHex?: string;
  customBgImage?: HTMLImageElement | null;
  onProgress?: (progressText: string) => void;
}

export const BG_PRESET_COLORS = [
  { id: 'transparent', name: 'Transparent (PNG)', color: 'transparent', hex: '' },
  { id: 'white', name: 'Passport White', color: '#FFFFFF', hex: '#FFFFFF' },
  { id: 'skyblue', name: 'Passport Sky Blue', color: '#87CEEB', hex: '#87CEEB' },
  { id: 'blue', name: 'Studio Blue', color: '#2563EB', hex: '#2563EB' },
  { id: 'navy', name: 'Official Navy', color: '#1E3A8A', hex: '#1E3A8A' },
  { id: 'grey', name: 'Neutral Grey', color: '#E2E8F0', hex: '#E2E8F0' },
  { id: 'red', name: 'Red Backdrop', color: '#DC2626', hex: '#DC2626' },
];

/**
 * Parse Hex color string to RGB values
 */
function parseColorHex(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length !== 6) return { r: 255, g: 255, b: 255 };
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Pure Non-Destructive Two-Layer Compositing:
 * Copies 100% exact original photo RGB values for any foreground pixel.
 * Zero filters, zero skin shifts, zero retouching, zero generative distortion.
 * Combines original RGB with the alpha matte channel.
 */
export function compositeWithOriginal(
  origCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement,
  options: SegmentationOptions
): HTMLCanvasElement {
  const width = origCanvas.width;
  const height = origCanvas.height;

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  const origCtx = origCanvas.getContext('2d');
  const maskCtx = maskCanvas.getContext('2d');

  if (!outCtx || !origCtx || !maskCtx) return origCanvas;

  const origData = origCtx.getImageData(0, 0, width, height).data;
  const maskData = maskCtx.getImageData(0, 0, width, height).data;

  // Determine Background Color / Backdrop
  let bgR = 255;
  let bgG = 255;
  let bgB = 255;
  let isCustomImage = false;

  if (options.backgroundColor !== 'transparent') {
    let hex = '#FFFFFF';
    if (options.backgroundColor === 'custom' && options.customHex) {
      hex = options.customHex;
    } else {
      const preset = BG_PRESET_COLORS.find((p) => p.id === options.backgroundColor);
      if (preset && preset.color !== 'transparent') hex = preset.color;
    }
    const parsed = parseColorHex(hex);
    bgR = parsed.r;
    bgG = parsed.g;
    bgB = parsed.b;

    outCtx.fillStyle = hex;
    outCtx.fillRect(0, 0, width, height);

    if (options.backgroundColor === 'image' && options.customBgImage) {
      outCtx.drawImage(options.customBgImage, 0, 0, width, height);
      isCustomImage = true;
    }
  }

  const outImgData = outCtx.getImageData(0, 0, width, height);
  const outData = outImgData.data;
  const totalPixels = width * height;

  // Cutoff threshold (defaults to 4 if specified in options)
  const cutoff = options.threshold !== undefined ? Math.max(0, Math.min(80, options.threshold * 2)) : 8;

  for (let idx = 0; idx < totalPixels; idx++) {
    const i = idx * 4;
    const rawAlpha = maskData[i + 3];

    let effectiveAlpha = 0;

    if (rawAlpha <= cutoff) {
      effectiveAlpha = 0;
    } else if (rawAlpha >= 250) {
      effectiveAlpha = 255;
    } else {
      // Smooth Hermite anti-aliasing curve for natural hair, fur, and silhouette edges
      const t = (rawAlpha - cutoff) / (250 - cutoff);
      effectiveAlpha = Math.round(t * t * (3 - 2 * t) * 255);
    }

    if (effectiveAlpha === 0) {
      // 100% Removed Background Pixel
      if (options.backgroundColor === 'transparent') {
        outData[i] = 0;
        outData[i + 1] = 0;
        outData[i + 2] = 0;
        outData[i + 3] = 0;
      } else if (!isCustomImage) {
        outData[i] = bgR;
        outData[i + 1] = bgG;
        outData[i + 2] = bgB;
        outData[i + 3] = 255;
      }
    } else if (effectiveAlpha === 255) {
      // 100% Solid Foreground: EXACT original photo RGB pixels with 0 modification
      outData[i] = origData[i];
      outData[i + 1] = origData[i + 1];
      outData[i + 2] = origData[i + 2];
      outData[i + 3] = 255;
    } else {
      // Natural Edge Semi-Transparency (Hair, thin strands, antialiasing)
      if (options.backgroundColor === 'transparent') {
        // Transparent PNG: Exact original RGB with soft alpha channel
        outData[i] = origData[i];
        outData[i + 1] = origData[i + 1];
        outData[i + 2] = origData[i + 2];
        outData[i + 3] = effectiveAlpha;
      } else {
        // Blend exact original RGB onto the chosen backdrop color
        const normAlpha = effectiveAlpha / 255;
        const destR = isCustomImage ? outData[i] : bgR;
        const destG = isCustomImage ? outData[i + 1] : bgG;
        const destB = isCustomImage ? outData[i + 2] : bgB;

        outData[i] = Math.round(origData[i] * normAlpha + destR * (1 - normAlpha));
        outData[i + 1] = Math.round(origData[i + 1] * normAlpha + destG * (1 - normAlpha));
        outData[i + 2] = Math.round(origData[i + 2] * normAlpha + destB * (1 - normAlpha));
        outData[i + 3] = 255;
      }
    }
  }

  outCtx.putImageData(outImgData, 0, 0);
  return outCanvas;
}

/**
 * Creates a dedicated Alpha Mask Canvas from a source image using Neural ISNet.
 * Returns a Canvas where the Alpha channel represents the foreground matte.
 */
export async function generateAlphaMaskAI(
  imageSource: Blob | File | HTMLImageElement | HTMLCanvasElement,
  onProgress?: (progressText: string) => void
): Promise<{ maskCanvas: HTMLCanvasElement; origCanvas: HTMLCanvasElement }> {
  let inputBlob: Blob;
  let width = 0;
  let height = 0;

  if (imageSource instanceof Blob) {
    inputBlob = imageSource;
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = URL.createObjectURL(imageSource);
    });
    width = img.naturalWidth || img.width;
    height = img.naturalHeight || img.height;
  } else if (imageSource instanceof HTMLCanvasElement) {
    width = imageSource.width;
    height = imageSource.height;
    inputBlob = await new Promise<Blob>((resolve) =>
      imageSource.toBlob((b) => resolve(b || new Blob()), 'image/png')
    );
  } else if (imageSource instanceof HTMLImageElement) {
    width = imageSource.naturalWidth || imageSource.width;
    height = imageSource.naturalHeight || imageSource.height;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d');
    ctx?.drawImage(imageSource, 0, 0);
    inputBlob = await new Promise<Blob>((resolve) =>
      tempCanvas.toBlob((b) => resolve(b || new Blob()), 'image/png')
    );
  } else {
    throw new Error('Unsupported image source');
  }

  // 1. Build Original Canvas (Immutable source of truth)
  const origCanvas = document.createElement('canvas');
  origCanvas.width = width;
  origCanvas.height = height;
  const oCtx = origCanvas.getContext('2d');
  const origImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(inputBlob);
  });
  oCtx?.drawImage(origImg, 0, 0, width, height);

  // 2. Run Neural Segmentation to generate Alpha Mask
  onProgress?.('Segmenting foreground with Neural AI...');

  const transparentBlob = await removeBackground(inputBlob, {
    model: 'isnet',
    rescale: true,
    output: { format: 'image/png', quality: 1.0 },
    progress: (_key: string, current: number, total: number) => {
      if (total > 0) {
        const pct = Math.round((current / total) * 100);
        onProgress?.(`AI Neural Processing: ${pct}%`);
      } else {
        onProgress?.(`Detecting subject & foreground boundary...`);
      }
    },
  });

  const maskImg = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(transparentBlob);
  });

  // 3. Render pure Alpha Mask Canvas (White RGB with neural Alpha channel)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mCtx = maskCanvas.getContext('2d');
  if (mCtx) {
    mCtx.drawImage(maskImg, 0, 0, width, height);
    // Standardize to pure white with alpha channel
    const imgData = mCtx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      // data[i + 3] remains the exact neural alpha matte
    }
    mCtx.putImageData(imgData, 0, 0);
  }

  return { maskCanvas, origCanvas };
}

/**
 * AI Background Removal using Two-Layer Architecture:
 * Yields a transparent or color-composited canvas with 100% original photo pixels.
 */
export async function removeBackgroundAI(
  imageSource: Blob | File | HTMLImageElement | HTMLCanvasElement,
  options?: SegmentationOptions
): Promise<HTMLCanvasElement> {
  try {
    const { maskCanvas, origCanvas } = await generateAlphaMaskAI(imageSource, options?.onProgress);
    return compositeWithOriginal(origCanvas, maskCanvas, options || { backgroundColor: 'transparent' });
  } catch (err) {
    console.error('Background removal error:', err);
    if (imageSource instanceof HTMLCanvasElement) return imageSource;
    const fallbackCanvas = document.createElement('canvas');
    return fallbackCanvas;
  }
}

/**
 * Helper to export lossless transparent PNG from original photo + alpha mask
 */
export function exportTransparentPng(
  origCanvas: HTMLCanvasElement,
  maskCanvas: HTMLCanvasElement
): Promise<Blob | null> {
  const composite = compositeWithOriginal(origCanvas, maskCanvas, {
    backgroundColor: 'transparent',
  });
  return new Promise<Blob | null>((resolve) =>
    composite.toBlob((blob) => resolve(blob), 'image/png')
  );
}

export function cleanAndDefringeAlpha(
  canvas: HTMLCanvasElement,
  _options?: {
    hazeRemoval?: number;
    edgeChoke?: number;
  }
): HTMLCanvasElement {
  return canvas;
}

export function removeBackgroundClientSide(
  inputCanvas: HTMLCanvasElement,
  options: SegmentationOptions
): HTMLCanvasElement {
  return compositeWithOriginal(inputCanvas, inputCanvas, options);
}
