import { PAPER_SIZE_PRESETS, type SheetSettings } from '../types/passport';
import { mmToPixels } from './canvasUtils';

export interface LayoutGridResult {
  paperWidthMm: number;
  paperHeightMm: number;
  paperWidthPx: number;
  paperHeightPx: number;
  photoWidthPx: number;
  photoHeightPx: number;
  cols: number;
  rows: number;
  totalFitCount: number;
  actualCount: number;
  gapXPx: number;
  gapYPx: number;
  marginXPx: number;
  marginYPx: number;
  positions: Array<{ x: number; y: number; col: number; row: number }>;
}

export function calculateSheetLayout(
  settings: SheetSettings,
  dpi = 300
): LayoutGridResult {
  let paperWidthMm = 210;
  let paperHeightMm = 297;

  if (settings.paperId === 'custom') {
    paperWidthMm = settings.customWidthMm || 210;
    paperHeightMm = settings.customHeightMm || 297;
  } else {
    const preset = PAPER_SIZE_PRESETS.find((p) => p.id === settings.paperId);
    if (preset) {
      paperWidthMm = preset.widthMm;
      paperHeightMm = preset.heightMm;
    }
  }

  // Handle orientation
  if (settings.orientation === 'landscape') {
    const max = Math.max(paperWidthMm, paperHeightMm);
    const min = Math.min(paperWidthMm, paperHeightMm);
    paperWidthMm = max;
    paperHeightMm = min;
  } else {
    const max = Math.max(paperWidthMm, paperHeightMm);
    const min = Math.min(paperWidthMm, paperHeightMm);
    paperWidthMm = min;
    paperHeightMm = max;
  }

  const paperWidthPx = mmToPixels(paperWidthMm, dpi);
  const paperHeightPx = mmToPixels(paperHeightMm, dpi);
  const photoWidthPx = mmToPixels(settings.photoWidthMm, dpi);
  const photoHeightPx = mmToPixels(settings.photoHeightMm, dpi);
  const gapXPx = mmToPixels(settings.gapX, dpi);
  const gapYPx = mmToPixels(settings.gapY, dpi);
  const marginXPx = mmToPixels(settings.marginX, dpi);
  const marginYPx = mmToPixels(settings.marginY, dpi);

  const availableWidth = paperWidthPx - marginXPx * 2;
  const availableHeight = paperHeightPx - marginYPx * 2;

  // Max fits
  const maxCols = Math.max(1, Math.floor((availableWidth + gapXPx) / (photoWidthPx + gapXPx)));
  const maxRows = Math.max(1, Math.floor((availableHeight + gapYPx) / (photoHeightPx + gapYPx)));
  const totalFitCount = maxCols * maxRows;

  let cols = maxCols;
  let rows = maxRows;

  if (!settings.autoFit && settings.columns > 0 && settings.rows > 0) {
    cols = Math.min(settings.columns, maxCols);
    rows = Math.min(settings.rows, maxRows);
  }

  const targetCount = settings.copiesCount > 0 ? settings.copiesCount : totalFitCount;
  const actualCount = Math.min(targetCount, totalFitCount);

  const gridWidth = cols * photoWidthPx + (cols - 1) * gapXPx;
  const startX = marginXPx + Math.max(0, (availableWidth - gridWidth) / 2);
  const startY = marginYPx;

  const positions: Array<{ x: number; y: number; col: number; row: number }> = [];

  let placed = 0;
  for (let r = 0; r < rows && placed < actualCount; r++) {
    for (let c = 0; c < cols && placed < actualCount; c++) {
      const x = startX + c * (photoWidthPx + gapXPx);
      const y = startY + r * (photoHeightPx + gapYPx);
      positions.push({ x, y, col: c, row: r });
      placed++;
    }
  }

  return {
    paperWidthMm,
    paperHeightMm,
    paperWidthPx,
    paperHeightPx,
    photoWidthPx,
    photoHeightPx,
    cols,
    rows,
    totalFitCount,
    actualCount,
    gapXPx,
    gapYPx,
    marginXPx,
    marginYPx,
    positions,
  };
}

/**
 * Render complete Passport Print Sheet onto a 2D canvas
 */
export function renderSheetToCanvas(
  canvas: HTMLCanvasElement,
  photoImage: HTMLImageElement | HTMLCanvasElement,
  settings: SheetSettings,
  layout: LayoutGridResult
) {
  canvas.width = layout.paperWidthPx;
  canvas.height = layout.paperHeightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background Paper
  ctx.fillStyle = settings.bgColor || '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw each photo
  for (const pos of layout.positions) {
    ctx.save();

    // Draw Photo
    ctx.drawImage(
      photoImage,
      0,
      0,
      photoImage.width,
      photoImage.height,
      pos.x,
      pos.y,
      layout.photoWidthPx,
      layout.photoHeightPx
    );

    // Optional Photo Border
    if (settings.showPhotoBorder) {
      ctx.strokeStyle = settings.photoBorderColor || '#cbd5e1';
      ctx.lineWidth = Math.max(1, Math.round(layout.photoWidthPx * 0.003));
      ctx.strokeRect(pos.x, pos.y, layout.photoWidthPx, layout.photoHeightPx);
    }

    // Cutting Lines
    if (settings.showCutLines) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;

      if (settings.cutLineStyle === 'dashed') {
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(pos.x - 2, pos.y - 2, layout.photoWidthPx + 4, layout.photoHeightPx + 4);
      } else if (settings.cutLineStyle === 'cross-marks') {
        ctx.setLineDash([]);
        const markLen = 15;
        // Top-left cross
        ctx.beginPath();
        ctx.moveTo(pos.x - markLen, pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.moveTo(pos.x, pos.y - markLen);
        ctx.lineTo(pos.x, pos.y);
        // Top-right cross
        ctx.moveTo(pos.x + layout.photoWidthPx, pos.y - markLen);
        ctx.lineTo(pos.x + layout.photoWidthPx, pos.y);
        ctx.moveTo(pos.x + layout.photoWidthPx + markLen, pos.y);
        ctx.lineTo(pos.x + layout.photoWidthPx, pos.y);
        // Bottom-left cross
        ctx.moveTo(pos.x - markLen, pos.y + layout.photoHeightPx);
        ctx.lineTo(pos.x, pos.y + layout.photoHeightPx);
        ctx.moveTo(pos.x, pos.y + layout.photoHeightPx + markLen);
        ctx.lineTo(pos.x, pos.y + layout.photoHeightPx);
        // Bottom-right cross
        ctx.moveTo(pos.x + layout.photoWidthPx + markLen, pos.y + layout.photoHeightPx);
        ctx.lineTo(pos.x + layout.photoWidthPx, pos.y + layout.photoHeightPx);
        ctx.moveTo(pos.x + layout.photoWidthPx, pos.y + layout.photoHeightPx + markLen);
        ctx.lineTo(pos.x + layout.photoWidthPx, pos.y + layout.photoHeightPx);
        ctx.stroke();
      } else {
        // Solid thin border
        ctx.setLineDash([]);
        ctx.strokeRect(pos.x - 1, pos.y - 1, layout.photoWidthPx + 2, layout.photoHeightPx + 2);
      }
    }

    ctx.restore();
  }
}
