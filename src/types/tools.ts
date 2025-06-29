export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  tags: string[];
  supportedFormats: string[];
  outputFormats: string[];
  maxFileSize: string;
  maxFiles: number;
  processingTime: string;
  features: string[];
  options?: ToolOption[];
}

export interface ToolOption {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  choices?: string[];
  default?: any;
  min?: number;
  max?: number;
}

export interface ProcessingJob {
  id: string;
  toolId: string;
  toolName: string;
  files: { name: string; size: number }[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: number;
  endTime?: number;
  result?: any;
  error?: string;
}

export interface UsageStats {
  [toolId: string]: {
    count: number;
    lastUsed: number;
  };
}