export type DocumentType = 
  | 'aadhaar'
  | 'voter'
  | 'pan'
  | 'driving_licence'
  | 'ayushman'
  | 'eshram'
  | 'college_id'
  | 'employee_id'
  | 'generic_id'
  | 'other';

export interface DocumentPreset {
  id: DocumentType;
  title: string;
  subtitle: string;
  frontLabel: string;
  backLabel: string;
  defaultLayout: 'horizontal' | 'vertical';
  aspectRatio: number; // width / height (standard CR80 card is 85.6 / 53.98 = ~1.585)
  recommendedWidthMm: number;
  recommendedHeightMm: number;
}

export const DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: 'aadhaar',
    title: 'Aadhaar Card',
    subtitle: 'Merge Front (Name/Photo/UID) & Back (Address/QR) on A4 or single page',
    frontLabel: 'Aadhaar Front Side',
    backLabel: 'Aadhaar Back Side',
    defaultLayout: 'vertical',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'ayushman',
    title: 'Ayushman Card (PM-JAY)',
    subtitle: 'Pradhan Mantri Jan Arogya Yojana Golden Card 2-Side Merge',
    frontLabel: 'Ayushman Front (Photo & ABHA)',
    backLabel: 'Ayushman Back (Guidelines & QR)',
    defaultLayout: 'vertical',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'eshram',
    title: 'E-Shram Card (UAN)',
    subtitle: 'Ministry of Labour & Employment E-Shram National Card',
    frontLabel: 'E-Shram Front (UAN/Photo)',
    backLabel: 'E-Shram Back (Occupation/QR)',
    defaultLayout: 'vertical',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'voter',
    title: 'Voter ID (EPIC)',
    subtitle: 'Election Commission Voter Identity Card two-side merger',
    frontLabel: 'Voter ID Front',
    backLabel: 'Voter ID Back',
    defaultLayout: 'horizontal',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'pan',
    title: 'PAN Card',
    subtitle: 'Income Tax Permanent Account Number Card',
    frontLabel: 'PAN Front Side',
    backLabel: 'PAN Back Side (if applicable)',
    defaultLayout: 'horizontal',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'driving_licence',
    title: 'Driving Licence',
    subtitle: 'State Transport Department Driving Licence 2-Side Merge',
    frontLabel: 'Licence Front',
    backLabel: 'Licence Back (Categories)',
    defaultLayout: 'vertical',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'college_id',
    title: 'College / Student ID',
    subtitle: 'University, School or Institution ID Card',
    frontLabel: 'Student ID Front',
    backLabel: 'Student ID Back',
    defaultLayout: 'horizontal',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'employee_id',
    title: 'Employee ID Card',
    subtitle: 'Corporate / Office Staff ID Card',
    frontLabel: 'Employee Front',
    backLabel: 'Employee Back',
    defaultLayout: 'horizontal',
    aspectRatio: 1.585,
    recommendedWidthMm: 85.6,
    recommendedHeightMm: 53.98,
  },
  {
    id: 'generic_id',
    title: 'Generic 2-Side Document',
    subtitle: 'Passports, Certificates, Badges or Two-Page Receipts',
    frontLabel: 'Document Side 1',
    backLabel: 'Document Side 2',
    defaultLayout: 'vertical',
    aspectRatio: 1.414,
    recommendedWidthMm: 100,
    recommendedHeightMm: 70,
  },
];

export interface IDMergerSettings {
  documentType: DocumentType;
  layout: 'horizontal' | 'vertical'; // Side-by-side vs Stacked
  outputFormat: 'a4-sheet' | 'fit-card'; // A4 print ready vs compact combined image
  cardScaleMm: number; // 85.6 mm (standard)
  gapMm: number; // spacing between front & back
  borderStyle: 'none' | 'thin-solid' | 'dashed' | 'rounded-shadow';
  borderColor: string;
  showLabels: boolean; // "FRONT" / "BACK"
  watermarkText: string;
  showWatermark: boolean;
  watermarkOpacity: number;
}
