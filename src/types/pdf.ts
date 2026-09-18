export interface PDFImageItem {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  width: number;
  height: number;
  rotation: number; // 0, 90, 180, 270
}

export interface PDFFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount: number;
}

export interface ImageToPDFSettings {
  pageSize: 'a4' | 'letter' | 'fit';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: 'none' | 'small' | 'normal';
  imageQuality: number; // 0.1 to 1.0
  addPageNumbers: boolean;
}

export interface PDFSplitSettings {
  mode: 'ranges' | 'all' | 'custom';
  pageRanges: string; // e.g. "1-3, 5, 7"
}

export interface PDFCompressSettings {
  quality: 'low' | 'medium' | 'high';
  dpi: number;
}
