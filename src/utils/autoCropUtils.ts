/**
 * Intelligent Subject Saliency and Auto-Crop Algorithms for Nexora Tools
 */

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AspectRatioOption = 'free' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '3:2' | '2:3' | 'passport' | 'id-card';

export const ASPECT_RATIO_VALUES: Record<AspectRatioOption, number | null> = {
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '3:4': 3 / 4,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  '3:2': 3 / 2,
  '2:3': 2 / 3,
  passport: 35 / 45, // ~0.777
  'id-card': 85.6 / 53.98, // ~1.585
};

/**
 * Automatically detects the primary subject (person, product, document, foreground object)
 * and returns the optimal bounding box.
 */
export function detectSubjectCrop(
  img: HTMLImageElement | HTMLCanvasElement,
  targetAspect: number | null = null
): CropRect {
  const origW = img instanceof HTMLImageElement ? img.naturalWidth || img.width : img.width;
  const origH = img instanceof HTMLImageElement ? img.naturalHeight || img.height : img.height;

  if (origW <= 10 || origH <= 10) {
    return { x: 0, y: 0, width: origW, height: origH };
  }

  // Downsample to ~350px for fast saliency calculation
  const targetDim = 350;
  const scale = Math.max(1, Math.max(origW, origH) / targetDim);
  const sw = Math.floor(origW / scale);
  const sh = Math.floor(origH / scale);

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return getDefaultCrop(origW, origH, targetAspect);
  }

  ctx.drawImage(img, 0, 0, sw, sh);
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  // 1. Sample background color from border margins (top, bottom, left, right)
  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
  for (let x = 0; x < sw; x += 3) {
    // Top & bottom rows
    const topIdx = x * 4;
    const botIdx = ((sh - 1) * sw + x) * 4;
    bgR += data[topIdx] + data[botIdx];
    bgG += data[topIdx + 1] + data[botIdx + 1];
    bgB += data[topIdx + 2] + data[botIdx + 2];
    bgCount += 2;
  }
  for (let y = 0; y < sh; y += 3) {
    // Left & right cols
    const leftIdx = (y * sw) * 4;
    const rightIdx = (y * sw + (sw - 1)) * 4;
    bgR += data[leftIdx] + data[rightIdx];
    bgG += data[leftIdx + 1] + data[rightIdx + 1];
    bgB += data[leftIdx + 2] + data[rightIdx + 2];
    bgCount += 2;
  }
  bgR /= bgCount || 1;
  bgG /= bgCount || 1;
  bgB /= bgCount || 1;

  // 2. Compute Saliency Map: Color contrast against background + Sobel edge energy + Center bias
  const saliency = new Float32Array(sw * sh);
  let maxSal = 0;
  const centerX = sw / 2;
  const centerY = sh / 2;
  const maxCenterDist = Math.hypot(centerX, centerY);

  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const idx = (y * sw + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Color distance from background
      const colorDist = Math.hypot(r - bgR, g - bgG, b - bgB);

      // Edge energy (Sobel gradient)
      const idxL = (y * sw + (x - 1)) * 4;
      const idxR = (y * sw + (x + 1)) * 4;
      const idxU = ((y - 1) * sw + x) * 4;
      const idxD = ((y + 1) * sw + x) * 4;

      const lumL = 0.299 * data[idxL] + 0.587 * data[idxL + 1] + 0.114 * data[idxL + 2];
      const lumR = 0.299 * data[idxR] + 0.587 * data[idxR + 1] + 0.114 * data[idxR + 2];
      const lumU = 0.299 * data[idxU] + 0.587 * data[idxU + 1] + 0.114 * data[idxU + 2];
      const lumD = 0.299 * data[idxD] + 0.587 * data[idxD + 1] + 0.114 * data[idxD + 2];

      const edgeMag = Math.hypot(lumR - lumL, lumD - lumU);

      // Center prior (subtle bias toward central 80%)
      const centerDist = Math.hypot(x - centerX, y - centerY);
      const centerFactor = 1 - 0.25 * (centerDist / maxCenterDist);

      const sal = (colorDist * 0.55 + edgeMag * 0.45) * centerFactor;
      saliency[y * sw + x] = sal;
      if (sal > maxSal) maxSal = sal;
    }
  }

  // 3. Extract bounding box of high saliency regions
  const threshold = Math.max(12, maxSal * 0.25);
  let minX = sw, maxX = 0, minY = sh, maxY = 0;
  let salientPixels = 0;

  for (let y = Math.floor(sh * 0.02); y < sh * 0.98; y++) {
    for (let x = Math.floor(sw * 0.02); x < sw * 0.98; x++) {
      if (saliency[y * sw + x] > threshold) {
        salientPixels++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // Fallback if no strong contrast detected
  if (salientPixels < 40 || maxX <= minX || maxY <= minY) {
    return getDefaultCrop(origW, origH, targetAspect);
  }

  // Scale back to original resolution
  let detectedX = Math.max(0, minX * scale);
  let detectedY = Math.max(0, minY * scale);
  let detectedW = Math.min(origW - detectedX, (maxX - minX + 1) * scale);
  let detectedH = Math.min(origH - detectedY, (maxY - minY + 1) * scale);

  // Add breathing padding (~8% on sides, ~10% on top/bottom)
  const padX = detectedW * 0.08;
  const padY = detectedH * 0.10;

  detectedX = Math.max(0, detectedX - padX);
  detectedY = Math.max(0, detectedY - padY);
  detectedW = Math.min(origW - detectedX, detectedW + padX * 2);
  detectedH = Math.min(origH - detectedY, detectedH + padY * 2);

  // Ensure minimum dimensions (at least 20% of image)
  if (detectedW < origW * 0.2 || detectedH < origH * 0.2) {
    return getDefaultCrop(origW, origH, targetAspect);
  }

  // Fit to requested aspect ratio if given
  if (targetAspect && targetAspect > 0) {
    return fitAspectCrop(
      { x: detectedX, y: detectedY, width: detectedW, height: detectedH },
      origW,
      origH,
      targetAspect
    );
  }

  return {
    x: Math.round(detectedX),
    y: Math.round(detectedY),
    width: Math.round(detectedW),
    height: Math.round(detectedH),
  };
}

/**
 * Returns a balanced default crop box matching the target aspect ratio
 */
export function getDefaultCrop(
  origW: number,
  origH: number,
  targetAspect: number | null = null
): CropRect {
  if (!targetAspect || targetAspect <= 0) {
    // 90% centered crop by default
    const w = Math.round(origW * 0.9);
    const h = Math.round(origH * 0.9);
    return {
      x: Math.round((origW - w) / 2),
      y: Math.round((origH - h) / 2),
      width: w,
      height: h,
    };
  }

  const currentAspect = origW / origH;
  let w: number;
  let h: number;

  if (currentAspect > targetAspect) {
    h = Math.round(origH * 0.9);
    w = Math.round(h * targetAspect);
  } else {
    w = Math.round(origW * 0.9);
    h = Math.round(w / targetAspect);
  }

  return {
    x: Math.round((origW - w) / 2),
    y: Math.round((origH - h) / 2),
    width: w,
    height: h,
  };
}

/**
 * Adjusts a crop box to strictly enforce an aspect ratio while keeping the subject centered
 */
export function fitAspectCrop(
  rect: CropRect,
  origW: number,
  origH: number,
  aspect: number
): CropRect {
  let cx = rect.x + rect.width / 2;
  let cy = rect.y + rect.height / 2;

  let newW = rect.width;
  let newH = rect.width / aspect;

  if (newH < rect.height) {
    newH = rect.height;
    newW = rect.height * aspect;
  }

  // Constrain if larger than source image
  if (newW > origW) {
    newW = origW;
    newH = origW / aspect;
  }
  if (newH > origH) {
    newH = origH;
    newW = origH * aspect;
  }

  let x = cx - newW / 2;
  let y = cy - newH / 2;

  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + newW > origW) x = origW - newW;
  if (y + newH > origH) y = origH - newH;

  return {
    x: Math.round(Math.max(0, x)),
    y: Math.round(Math.max(0, y)),
    width: Math.round(Math.min(origW, newW)),
    height: Math.round(Math.min(origH, newH)),
  };
}
