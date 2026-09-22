/**
 * Perspective Warp, Document Scanner & Adobe Scan Style Intelligent ID Card Auto-Detection Algorithms
 * for Nexora Tools (Aadhaar, Voter ID, PAN, Driving Licence, Passport)
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
 * Eliminates perspective skew, trapezoid distortion, and background borders.
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
 * Adobe Scan-Grade Intelligent ID Card & Aadhaar Auto-Detector.
 * Accurately detects card boundary corners across mobile camera photos (portrait or landscape),
 * table surfaces, bedsheets, cloth, shadows, and scanner sheets without cutting off content.
 */
export function autoDetectCardCorners(
  canvas: HTMLCanvasElement
): [Point, Point, Point, Point] {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  
  // Safe default: Full card frame with 2% inset
  const defaultFullCrop: [Point, Point, Point, Point] = [
    { x: Math.round(width * 0.02), y: Math.round(height * 0.02) },
    { x: Math.round(width * 0.98), y: Math.round(height * 0.02) },
    { x: Math.round(width * 0.98), y: Math.round(height * 0.98) },
    { x: Math.round(width * 0.02), y: Math.round(height * 0.98) },
  ];

  if (!ctx || width < 20 || height < 20) {
    return defaultFullCrop;
  }

  // 1. Downsample to standardized size for robust computer vision contour processing
  const maxDim = 400;
  const scale = Math.max(1, Math.max(width, height) / maxDim);
  const sw = Math.floor(width / scale);
  const sh = Math.floor(height / scale);

  const smCanvas = document.createElement('canvas');
  smCanvas.width = sw;
  smCanvas.height = sh;
  const smCtx = smCanvas.getContext('2d');
  if (!smCtx) return defaultFullCrop;

  smCtx.drawImage(canvas, 0, 0, sw, sh);
  const imgData = smCtx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  // 2. Convert to Grayscale with 3x3 Gaussian smoothing to suppress fabric/bedsheet texture
  const gray = new Float32Array(sw * sh);
  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const idx = (y * sw + x) * 4;
      gray[y * sw + x] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
  }

  const blurred = new Float32Array(sw * sh);
  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const sum =
        gray[(y - 1) * sw + (x - 1)] * 1 + gray[(y - 1) * sw + x] * 2 + gray[(y - 1) * sw + (x + 1)] * 1 +
        gray[y * sw + (x - 1)] * 2 + gray[y * sw + x] * 4 + gray[y * sw + (x + 1)] * 2 +
        gray[(y + 1) * sw + (x - 1)] * 1 + gray[(y + 1) * sw + x] * 2 + gray[(y + 1) * sw + (x + 1)] * 1;
      blurred[y * sw + x] = sum / 16;
    }
  }

  // 3. Compute Sobel Gradient Magnitude & Color Variation
  const gradient = new Float32Array(sw * sh);
  let maxGrad = 0;

  for (let y = 1; y < sh - 1; y++) {
    for (let x = 1; x < sw - 1; x++) {
      const gx =
        -1 * blurred[(y - 1) * sw + (x - 1)] + 1 * blurred[(y - 1) * sw + (x + 1)] +
        -2 * blurred[y * sw + (x - 1)] + 2 * blurred[y * sw + (x + 1)] +
        -1 * blurred[(y + 1) * sw + (x - 1)] + 1 * blurred[(y + 1) * sw + (x + 1)];

      const gy =
        -1 * blurred[(y - 1) * sw + (x - 1)] - 2 * blurred[(y - 1) * sw + x] - 1 * blurred[(y - 1) * sw + (x + 1)] +
        1 * blurred[(y + 1) * sw + (x - 1)] + 2 * blurred[(y + 1) * sw + x] + 1 * blurred[(y + 1) * sw + (x + 1)];

      const mag = Math.hypot(gx, gy);
      gradient[y * sw + x] = mag;
      if (mag > maxGrad) maxGrad = mag;
    }
  }

  // 4. Inward Scanning for Strong Continuous Boundary Edges
  const edgeThreshold = Math.max(25, maxGrad * 0.28);
  const padX = Math.max(2, Math.floor(sw * 0.02));
  const padY = Math.max(2, Math.floor(sh * 0.02));

  // Top Boundary
  let topBound = padY;
  for (let y = padY; y < Math.floor(sh * 0.45); y++) {
    let strongCount = 0;
    for (let x = padX; x < sw - padX; x++) {
      if (gradient[y * sw + x] > edgeThreshold) strongCount++;
    }
    if (strongCount > sw * 0.28) {
      topBound = y;
      break;
    }
  }

  // Bottom Boundary
  let bottomBound = sh - padY;
  for (let y = sh - padY - 1; y > Math.floor(sh * 0.55); y--) {
    let strongCount = 0;
    for (let x = padX; x < sw - padX; x++) {
      if (gradient[y * sw + x] > edgeThreshold) strongCount++;
    }
    if (strongCount > sw * 0.28) {
      bottomBound = y;
      break;
    }
  }

  // Left Boundary
  let leftBound = padX;
  for (let x = padX; x < Math.floor(sw * 0.45); x++) {
    let strongCount = 0;
    for (let y = topBound; y <= bottomBound; y++) {
      if (gradient[y * sw + x] > edgeThreshold) strongCount++;
    }
    if (strongCount > (bottomBound - topBound) * 0.28) {
      leftBound = x;
      break;
    }
  }

  // Right Boundary
  let rightBound = sw - padX;
  for (let x = sw - padX - 1; x > Math.floor(sw * 0.55); x--) {
    let strongCount = 0;
    for (let y = topBound; y <= bottomBound; y++) {
      if (gradient[y * sw + x] > edgeThreshold) strongCount++;
    }
    if (strongCount > (bottomBound - topBound) * 0.28) {
      rightBound = x;
      break;
    }
  }

  // 5. Corner Points Calculation & Validation
  const detectedTL: Point = {
    x: Math.min(width, Math.max(0, Math.round(leftBound * scale))),
    y: Math.min(height, Math.max(0, Math.round(topBound * scale))),
  };
  const detectedTR: Point = {
    x: Math.min(width, Math.max(0, Math.round(rightBound * scale))),
    y: Math.min(height, Math.max(0, Math.round(topBound * scale))),
  };
  const detectedBR: Point = {
    x: Math.min(width, Math.max(0, Math.round(rightBound * scale))),
    y: Math.min(height, Math.max(0, Math.round(bottomBound * scale))),
  };
  const detectedBL: Point = {
    x: Math.min(width, Math.max(0, Math.round(leftBound * scale))),
    y: Math.min(height, Math.max(0, Math.round(bottomBound * scale))),
  };

  const detectedW = detectedTR.x - detectedTL.x;
  const detectedH = detectedBL.y - detectedTL.y;

  // Validation: If detected boundary covers less than 30% of width/height or looks erroneous,
  // safely default to full image frame so the user's card is NEVER accidentally cropped out!
  if (detectedW < width * 0.35 || detectedH < height * 0.25) {
    return defaultFullCrop;
  }

  return [detectedTL, detectedTR, detectedBR, detectedBL];
}

/**
 * Returns a smart centered bounding box with standard CR80 ID Card aspect ratio (85.6 : 54)
 */
export function getSmartCenteredCardCorners(width: number, height: number): [Point, Point, Point, Point] {
  const cardRatio = 85.6 / 54;
  let targetW = width * 0.76;
  let targetH = targetW / cardRatio;

  if (targetH > height * 0.76) {
    targetH = height * 0.76;
    targetW = targetH * cardRatio;
  }

  const left = Math.round((width - targetW) / 2);
  const top = Math.round((height - targetH) / 2);
  const right = Math.round(left + targetW);
  const bottom = Math.round(top + targetH);

  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

/**
 * Intelligent e-Aadhaar Dual Side Extractor.
 * When a single e-Aadhaar slip or 2-sided photo is uploaded, automatically extracts
 * and crops the Front and Back sides simultaneously into CR80 card dimensions.
 */
export function extractDualAadhaarSides(
  sourceCanvas: HTMLCanvasElement,
  cardWidthPx: number,
  cardHeightPx: number
): { frontCanvas: HTMLCanvasElement; backCanvas: HTMLCanvasElement } | null {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const isTall = height > width;

  if (isTall) {
    // In standard e-Aadhaar A4 slips, the bottom 38% has Front on left and Back on right
    const cardRegionTop = Math.round(height * 0.63);
    const cardRegionHeight = Math.round(height * 0.34);
    const cardRegionBottom = cardRegionTop + cardRegionHeight;
    const midX = Math.round(width * 0.5);

    // Front (Bottom Left)
    const frontCorners: [Point, Point, Point, Point] = [
      { x: Math.round(width * 0.04), y: cardRegionTop },
      { x: Math.round(midX - width * 0.01), y: cardRegionTop },
      { x: Math.round(midX - width * 0.01), y: cardRegionBottom },
      { x: Math.round(width * 0.04), y: cardRegionBottom },
    ];

    // Back (Bottom Right)
    const backCorners: [Point, Point, Point, Point] = [
      { x: Math.round(midX + width * 0.01), y: cardRegionTop },
      { x: Math.round(width * 0.96), y: cardRegionTop },
      { x: Math.round(width * 0.96), y: cardRegionBottom },
      { x: Math.round(midX + width * 0.01), y: cardRegionBottom },
    ];

    const frontCanvas = warpPerspective(sourceCanvas, frontCorners, cardWidthPx, cardHeightPx);
    const backCanvas = warpPerspective(sourceCanvas, backCorners, cardWidthPx, cardHeightPx);

    return { frontCanvas, backCanvas };
  } else {
    // Horizontal side-by-side scan
    const midX = Math.round(width * 0.5);

    const frontCorners: [Point, Point, Point, Point] = [
      { x: Math.round(width * 0.02), y: Math.round(height * 0.04) },
      { x: Math.round(midX - width * 0.01), y: Math.round(height * 0.04) },
      { x: Math.round(midX - width * 0.01), y: Math.round(height * 0.96) },
      { x: Math.round(width * 0.02), y: Math.round(height * 0.96) },
    ];

    const backCorners: [Point, Point, Point, Point] = [
      { x: Math.round(midX + width * 0.01), y: Math.round(height * 0.04) },
      { x: Math.round(width * 0.98), y: Math.round(height * 0.04) },
      { x: Math.round(width * 0.98), y: Math.round(height * 0.96) },
      { x: Math.round(midX + width * 0.01), y: Math.round(height * 0.96) },
    ];

    const frontCanvas = warpPerspective(sourceCanvas, frontCorners, cardWidthPx, cardHeightPx);
    const backCanvas = warpPerspective(sourceCanvas, backCorners, cardWidthPx, cardHeightPx);

    return { frontCanvas, backCanvas };
  }
}

/**
 * Rotate a canvas by specified degrees (90, 180, 270)
 */
export function rotateCanvas(
  sourceCanvas: HTMLCanvasElement,
  degrees: number
): HTMLCanvasElement {
  const normDeg = ((degrees % 360) + 360) % 360;
  if (normDeg === 0) return sourceCanvas;

  const dest = document.createElement('canvas');
  const isSideways = normDeg === 90 || normDeg === 270;
  dest.width = isSideways ? sourceCanvas.height : sourceCanvas.width;
  dest.height = isSideways ? sourceCanvas.width : sourceCanvas.height;

  const ctx = dest.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.translate(dest.width / 2, dest.height / 2);
  ctx.rotate((normDeg * Math.PI) / 180);
  ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2);

  return dest;
}

/**
 * Apply Document Enhancement Filters (Magic Clarity, Contrast, Black & White)
 * Adobe Scan-style "Magic Color" removes shadows and enhances ink/text.
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
      // Gentle shadow removal and document background whitening while preserving text & photo contrast
      const whitened = lum > 135 ? Math.min(255, lum * 1.15 + 12) : lum * 0.94;
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
      const val = Math.max(0, Math.min(255, (lum - 128) * 1.5 + 128));
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}
