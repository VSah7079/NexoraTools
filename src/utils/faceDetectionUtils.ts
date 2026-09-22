/**
 * Intelligent Face & Biometric Head Detection Utility for Passport Photos
 * Ensures heads / hair ("mundi") are never cut off and perfectly positioned according to ICAO specs.
 */

export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  headTopY: number;
  confidence?: number;
}

export interface FramingTransform {
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Detect face and head position in an image.
 * Uses native browser FaceDetector API if available, with an advanced skin-tone & saliency fallback.
 */
export async function detectFaceAndHead(
  img: HTMLImageElement | HTMLCanvasElement
): Promise<DetectedFace | null> {
  const origW = img instanceof HTMLImageElement ? img.naturalWidth || img.width : img.width;
  const origH = img instanceof HTMLImageElement ? img.naturalHeight || img.height : img.height;

  if (origW <= 20 || origH <= 20) return null;

  // 1. Try Native Browser FaceDetector (Chrome, Edge, Android Chrome)
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      const FaceDetectorClass = (window as unknown as { FaceDetector: new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => { detect: (image: ImageBitmapSource) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> } }).FaceDetector;
      const detector = new FaceDetectorClass({ fastMode: false, maxDetectedFaces: 3 });
      const detectedFaces = await detector.detect(img);

      if (detectedFaces && detectedFaces.length > 0) {
        // Pick the most prominent/largest face
        let bestFace = detectedFaces[0].boundingBox;
        let maxArea = bestFace.width * bestFace.height;

        for (let i = 1; i < detectedFaces.length; i++) {
          const box = detectedFaces[i].boundingBox;
          const area = box.width * box.height;
          if (area > maxArea) {
            maxArea = area;
            bestFace = box;
          }
        }

        // Top of head estimation (hair/crown typically extends ~28% of face height above face box)
        const headTopY = Math.max(0, bestFace.y - bestFace.height * 0.28);

        return {
          x: Math.max(0, bestFace.x),
          y: Math.max(0, bestFace.y),
          width: Math.min(origW, bestFace.width),
          height: Math.min(origH, bestFace.height),
          headTopY,
          confidence: 0.95,
        };
      }
    } catch {
      // Continue to client-side fallback
    }
  }

  // 2. Client-side Saliency & Skin-Cluster Face Detection Fallback
  return detectFaceFallback(img, origW, origH);
}

/**
 * Robust pure JavaScript skin-tone and head-cluster saliency face detector.
 */
function detectFaceFallback(
  img: HTMLImageElement | HTMLCanvasElement,
  origW: number,
  origH: number
): DetectedFace | null {
  // Downscale image to ~320px for high-speed analysis (< 15ms)
  const maxDim = 320;
  const scale = Math.max(1, Math.max(origW, origH) / maxDim);
  const sw = Math.floor(origW / scale);
  const sh = Math.floor(origH / scale);

  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, sw, sh);
  const imgData = ctx.getImageData(0, 0, sw, sh);
  const data = imgData.data;

  // Track skin-like pixels (using YCbCr + HSV range matching all skin tones)
  const skinMap = new Uint8Array(sw * sh);
  let totalSkinPixels = 0;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const idx = (y * sw + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // YCbCr transformation
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

      // Skin tone loci filter
      const isSkinYCbCr = cb >= 77 && cb <= 128 && cr >= 133 && cr <= 173;

      // HSV filter for additional robustness
      const maxVal = Math.max(r, g, b);
      const minVal = Math.min(r, g, b);
      const delta = maxVal - minVal;

      let h = 0;
      if (delta > 0) {
        if (maxVal === r) {
          h = ((g - b) / delta) % 6;
        } else if (maxVal === g) {
          h = (b - r) / delta + 2;
        } else {
          h = (r - g) / delta + 4;
        }
        h = Math.round(h * 60);
        if (h < 0) h += 360;
      }
      const s = maxVal === 0 ? 0 : delta / maxVal;
      const v = maxVal / 255;

      const isSkinHSV = (h <= 50 || h >= 335) && s >= 0.12 && s <= 0.78 && v >= 0.2;

      if (isSkinYCbCr || isSkinHSV) {
        // Vertical weighting: prioritize upper 65% of photo (head/face area)
        const verticalWeight = y < sh * 0.65 ? 1 : 0.4;
        if (Math.random() < verticalWeight) {
          skinMap[y * sw + x] = 1;
          totalSkinPixels++;
        }
      }
    }
  }

  if (totalSkinPixels < 60) return null;

  // Find bounding box of topmost skin density cluster (Face & Forehead)
  // Scan vertical profile in upper 75%
  const rowSkinCounts = new Int32Array(sh);
  for (let y = 0; y < sh; y++) {
    let count = 0;
    for (let x = 0; x < sw; x++) {
      if (skinMap[y * sw + x] === 1) count++;
    }
    rowSkinCounts[y] = count;
  }

  // Find the highest row with substantial skin pixels (head top / forehead)
  const minRowThreshold = Math.max(4, sw * 0.04);
  let topY = -1;
  for (let y = 2; y < sh * 0.75; y++) {
    if (rowSkinCounts[y] >= minRowThreshold) {
      topY = y;
      break;
    }
  }

  if (topY === -1) return null;

  // Find face vertical extent (typically 20% to 50% of photo height)
  let bottomY = Math.min(sh - 1, topY + Math.floor(sh * 0.35));
  let minX = sw;
  let maxX = 0;

  for (let y = topY; y <= bottomY; y++) {
    for (let x = 0; x < sw; x++) {
      if (skinMap[y * sw + x] === 1) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (maxX <= minX) return null;

  const detectedW = (maxX - minX + 1) * scale;
  const detectedH = (bottomY - topY + 1) * scale;
  const detectedX = minX * scale;
  const detectedY = topY * scale;

  // Estimate head crown (top of hair is ~25% higher than forehead skin)
  const headTopY = Math.max(0, detectedY - detectedH * 0.25);

  return {
    x: detectedX,
    y: detectedY,
    width: detectedW,
    height: detectedH,
    headTopY,
    confidence: 0.8,
  };
}

/**
 * Calculates optimal biometric passport framing (zoom, panX, panY)
 * so that head/hair is NEVER cut off and perfectly positioned.
 */
export function calculatePassportFraming(
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number,
  face: DetectedFace | null
): FramingTransform {
  const baseScale = Math.max(canvasW / srcW, canvasH / srcH);

  if (face && face.height > 10 && face.width > 10) {
    // 1. Target Face Height on Passport Canvas: 62% of photo height (ICAO standard: 60-70%)
    const targetFaceHeightPx = canvasH * 0.62;
    let renderScale = targetFaceHeightPx / face.height;

    // Constrain scale relative to baseScale (0.6x to 3.8x)
    const minScale = baseScale * 0.6;
    const maxScale = baseScale * 3.8;
    renderScale = Math.max(minScale, Math.min(maxScale, renderScale));

    const zoom = +(renderScale / baseScale).toFixed(2);

    // 2. Horizontally Center Face
    const faceCenterX = face.x + face.width / 2;
    const panX = Math.round(-(faceCenterX - srcW / 2) * renderScale);

    // 3. Position Head Crown with 10% Safe Headroom from Canvas Top (Anti-Cutoff)
    const headTopY = face.headTopY !== undefined ? face.headTopY : Math.max(0, face.y - face.height * 0.25);
    const targetHeadTopCanvasY = canvasH * 0.10; // 10% headroom

    // canvasY = (canvasH / 2 + panY) + (headTopY - srcH / 2) * renderScale
    const panY = Math.round(targetHeadTopCanvasY - canvasH / 2 - (headTopY - srcH / 2) * renderScale);

    return { zoom, panX, panY };
  }

  // Fallback when no face detected: Align top of photo with 6% safe headroom
  return getTopSafeFraming(srcW, srcH, canvasW, canvasH, 1.0);
}

/**
 * Computes Top-Safe framing so the top of the photo (head/hair) is never cut off at canvas Y=0.
 */
export function getTopSafeFraming(
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number,
  zoom = 1.0
): FramingTransform {
  const baseScale = Math.max(canvasW / srcW, canvasH / srcH);
  const renderScale = baseScale * zoom;
  const drawH = srcH * renderScale;

  // If drawn image height is taller than canvas, shift it down so top lands at 6% headroom
  let panY = 0;
  if (drawH > canvasH) {
    const targetTopY = canvasH * 0.06; // 6% safe margin
    // top on canvas = canvasH / 2 + panY - drawH / 2 = targetTopY
    panY = Math.round(targetTopY - canvasH / 2 + drawH / 2);
  }

  return { zoom, panX: 0, panY };
}

/**
 * Computes Full-Fit framing (entire photo scaled into canvas with no cropping)
 */
export function getFullFitFraming(
  srcW: number,
  srcH: number,
  canvasW: number,
  canvasH: number
): FramingTransform {
  const baseScale = Math.max(canvasW / srcW, canvasH / srcH);
  const fitScale = Math.min(canvasW / srcW, canvasH / srcH);
  const zoom = +(fitScale / baseScale).toFixed(2);

  return { zoom, panX: 0, panY: 0 };
}
