import { 
  FileText, Upload, Download, Shield, Edit3, Scissors, Merge, 
  Compass as Compress, RotateCcw, Image, FileSignature, Users, 
  Cloud, Lock, Zap, Star, Check, X, Menu, ChevronDown, ArrowRight, 
  Play, Eye, Copy, FileImage, FileSpreadsheet, Presentation,
  ScanLine, Type, Crop, Palette, FileCheck, RefreshCw
} from 'lucide-react';
import { PDFTool } from '../types';

export const pdfTools: PDFTool[] = [
  // Create & Convert
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one document',
    icon: Merge,
    category: 'Create & Convert',
    free: true,
    action: 'merge'
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract pages or split into multiple files',
    icon: Scissors,
    category: 'Create & Convert',
    free: true,
    action: 'split'
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce file size without quality loss',
    icon: Compress,
    category: 'Create & Convert',
    free: true,
    action: 'compress'
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to editable Word document',
    icon: FileText,
    category: 'Create & Convert',
    free: true,
    action: 'pdf-to-word'
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables to Excel spreadsheet',
    icon: FileSpreadsheet,
    category: 'Create & Convert',
    free: true,
    action: 'pdf-to-excel'
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    description: 'Convert PDF to PowerPoint presentation',
    icon: Presentation,
    category: 'Create & Convert',
    free: true,
    action: 'pdf-to-ppt'
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to JPG images',
    icon: FileImage,
    category: 'Create & Convert',
    free: true,
    action: 'pdf-to-jpg'
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert JPG, PNG images to PDF',
    icon: Image,
    category: 'Create & Convert',
    free: true,
    action: 'image-to-pdf'
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF',
    icon: FileText,
    category: 'Create & Convert',
    free: true,
    action: 'word-to-pdf'
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF',
    icon: FileSpreadsheet,
    category: 'Create & Convert',
    free: true,
    action: 'excel-to-pdf'
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Convert web pages to PDF',
    icon: FileText,
    category: 'Create & Convert',
    free: true,
    action: 'html-to-pdf'
  },
  {
    id: 'scan-to-pdf',
    name: 'Scan to PDF',
    description: 'Create PDF from scanned documents',
    icon: ScanLine,
    category: 'Create & Convert',
    free: true,
    action: 'scan-to-pdf'
  },

  // Edit & Annotate
  {
    id: 'edit-pdf',
    name: 'Edit PDF',
    description: 'Edit text and images directly in PDF',
    icon: Edit3,
    category: 'Edit & Annotate',
    free: true,
    action: 'edit'
  },
  {
    id: 'annotate-pdf',
    name: 'Annotate PDF',
    description: 'Add comments, highlights, and notes',
    icon: Type,
    category: 'Edit & Annotate',
    free: true,
    action: 'annotate'
  },
  {
    id: 'rotate-pages',
    name: 'Rotate Pages',
    description: 'Rotate pages to correct orientation',
    icon: RotateCcw,
    category: 'Edit & Annotate',
    free: true,
    action: 'rotate'
  },
  {
    id: 'add-watermark',
    name: 'Add Watermark',
    description: 'Add text or image watermarks',
    icon: Image,
    category: 'Edit & Annotate',
    free: true,
    action: 'watermark'
  },
  {
    id: 'page-numbers',
    name: 'Page Numbers',
    description: 'Add page numbers to your PDF',
    icon: FileText,
    category: 'Edit & Annotate',
    free: true,
    action: 'page-numbers'
  },
  {
    id: 'crop-pdf',
    name: 'Crop PDF',
    description: 'Crop pages to remove unwanted areas',
    icon: Crop,
    category: 'Edit & Annotate',
    free: true,
    action: 'crop'
  },

  // Security & Recovery
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Add password protection and permissions',
    icon: Lock,
    category: 'Security & Recovery',
    free: true,
    action: 'protect'
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove password protection',
    icon: Shield,
    category: 'Security & Recovery',
    free: true,
    action: 'unlock'
  },
  {
    id: 'redact-pdf',
    name: 'Redact PDF',
    description: 'Remove sensitive information permanently',
    icon: Edit3,
    category: 'Security & Recovery',
    free: true,
    action: 'redact'
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    description: 'Fix corrupted or damaged PDF files',
    icon: RefreshCw,
    category: 'Security & Recovery',
    free: true,
    action: 'repair'
  },

  // E-Signature
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    description: 'Add your digital signature to documents',
    icon: FileSignature,
    category: 'E-Signature',
    free: false,
    action: 'sign'
  },
  {
    id: 'request-signature',
    name: 'Request Signature',
    description: 'Send documents to others for signing',
    icon: Users,
    category: 'E-Signature',
    free: false,
    action: 'request-sign'
  },
  {
    id: 'digital-certificates',
    name: 'Digital Certificates',
    description: 'Advanced digital signatures with certificates',
    icon: Shield,
    category: 'E-Signature',
    free: false,
    premium: true,
    action: 'certificates'
  },

  // Page & Batch Management
  {
    id: 'organize-pages',
    name: 'Organize Pages',
    description: 'Reorder, delete, and organize PDF pages',
    icon: Copy,
    category: 'Page & Batch Management',
    free: true,
    action: 'organize'
  },
  {
    id: 'extract-pages',
    name: 'Extract Pages',
    description: 'Extract specific pages from PDF',
    icon: FileText,
    category: 'Page & Batch Management',
    free: true,
    action: 'extract'
  },
  {
    id: 'compare-pdf',
    name: 'Compare PDFs',
    description: 'Compare two PDF documents for differences',
    icon: Eye,
    category: 'Page & Batch Management',
    free: true,
    action: 'compare'
  },
  {
    id: 'batch-process',
    name: 'Batch Processing',
    description: 'Process multiple files simultaneously',
    icon: Copy,
    category: 'Page & Batch Management',
    free: false,
    premium: true,
    action: 'batch'
  }
];

export const toolCategories = [
  'Create & Convert',
  'Edit & Annotate', 
  'Security & Recovery',
  'E-Signature',
  'Page & Batch Management'
];