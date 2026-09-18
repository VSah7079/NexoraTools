export type ToolCategory = 'photo' | 'id-card' | 'pdf' | 'print' | 'scanner' | 'batch';

export interface ToolItem {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  category: ToolCategory;
  path: string;
  iconName: string;
  badge?: string;
  popular?: boolean;
  color: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  statusText?: string;
  error?: string | null;
}
