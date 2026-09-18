export interface PhotoSizePreset {
  id: string;
  name: string;
  description: string;
  widthMm: number;
  heightMm: number;
  widthPx: number; // calculated at 300 DPI
  heightPx: number;
}

export interface PaperSizePreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  description: string;
  popularForStudio?: boolean;
}

export const PASSPORT_SIZE_PRESETS: PhotoSizePreset[] = [
  {
    id: 'in-passport',
    name: 'Indian Passport / Visa (35 × 45 mm)',
    description: 'Standard 3.5cm x 4.5cm for Indian Passport, UK, Schengen & Singapore Visa',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
  },
  {
    id: 'us-visa',
    name: 'US Passport / Visa (2 × 2 inch / 51 × 51 mm)',
    description: 'Square 2x2 inch for US Visa, OCI Card, PAN photo & Indian Visa',
    widthMm: 50.8,
    heightMm: 50.8,
    widthPx: 600,
    heightPx: 600,
  },
  {
    id: 'small-photo',
    name: 'Standard 30 × 40 mm',
    description: 'Admit cards, College applications, Government job forms',
    widthMm: 30,
    heightMm: 40,
    widthPx: 354,
    heightPx: 472,
  },
  {
    id: 'stamp-size',
    name: 'Stamp Size (25 × 35 mm)',
    description: 'Mini stamp photo for certificates, marksheets & passes',
    widthMm: 25,
    heightMm: 35,
    widthPx: 295,
    heightPx: 413,
  },
  {
    id: 'ca-passport',
    name: 'Canada Passport (50 × 70 mm)',
    description: '50mm x 70mm Canadian Passport and official document spec',
    widthMm: 50,
    heightMm: 70,
    widthPx: 591,
    heightPx: 827,
  },
  {
    id: 'custom',
    name: 'Custom Dimensions (mm / inch / px)',
    description: 'Set custom width, height, and DPI specifications',
    widthMm: 35,
    heightMm: 45,
    widthPx: 413,
    heightPx: 531,
  },
];

export const PAPER_SIZE_PRESETS: PaperSizePreset[] = [
  {
    id: '4x6',
    name: '4 × 6 inch (102 × 152 mm - 4R Postcard)',
    widthMm: 101.6,
    heightMm: 152.4,
    description: 'Most popular in Photo Studios & Cyber Cafes for 6-8 photos',
    popularForStudio: true,
  },
  {
    id: 'a4',
    name: 'A4 Sheet (210 × 297 mm)',
    widthMm: 210,
    heightMm: 297,
    description: 'Standard office printer sheet for 16-36+ photos or ID merge',
    popularForStudio: true,
  },
  {
    id: 'a5',
    name: 'A5 Sheet (148 × 210 mm)',
    widthMm: 148,
    heightMm: 210,
    description: 'Half A4 sheet for 8-16 photos',
  },
  {
    id: '5x7',
    name: '5 × 7 inch (127 × 178 mm - 5R)',
    widthMm: 127,
    heightMm: 177.8,
    description: 'Studio photo sheet for 12-16 photos',
  },
  {
    id: 'letter',
    name: 'US Letter (8.5 × 11 inch / 215.9 × 279.4 mm)',
    widthMm: 215.9,
    heightMm: 279.4,
    description: 'Standard North American document paper',
  },
];

export interface PassportSettings {
  presetId: string;
  widthMm: number;
  heightMm: number;
  unit: 'mm' | 'inch' | 'px';
  dpi: number;
  backgroundColor: string;
  customHex: string;
  borderWidth: number;
  borderColor: string;
  showOvalGuide: boolean;
}

export interface SheetSettings {
  paperId: string;
  customWidthMm: number;
  customHeightMm: number;
  orientation: 'portrait' | 'landscape';
  photoWidthMm: number;
  photoHeightMm: number;
  copiesCount: number;
  autoFit: boolean;
  rows: number;
  columns: number;
  gapX: number; // mm
  gapY: number; // mm
  marginX: number; // mm
  marginY: number; // mm
  showCutLines: boolean;
  cutLineStyle: 'solid' | 'dashed' | 'cross-marks';
  showPhotoBorder: boolean;
  photoBorderColor: string;
  bgColor: string;
}
