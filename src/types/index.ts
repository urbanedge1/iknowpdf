export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'premium';
  tasksUsed: number;
  tasksLimit: number;
  createdAt: Date;
  subscription?: {
    id: string;
    status: 'active' | 'canceled' | 'past_due';
    currentPeriodEnd: Date;
  };
}

export interface PDFFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  free: boolean;
  premium?: boolean;
  action: string;
}

export interface ProcessingJob {
  id: string;
  tool: string;
  files: PDFFile[];
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: {
    downloadUrl: string;
    fileName: string;
  };
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  limitations: string[];
  popular: boolean;
  maxFileSize: number; // in MB
  tasksLimit: number; // -1 for unlimited
}