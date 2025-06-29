import { FileText, Upload, Download, Shield, Edit3, Scissors, Merge, Compass as Compress, RotateCcw, Image, FileSignature, Users, Cloud, Lock, Zap, Star, Check, X, Menu, ChevronDown, ArrowRight, Play, Eye, Copy, FileImage, FileSpreadsheet, Presentation, ScanLine, Type, Crop, Palette, FileCheck, RefreshCw, Music, Video, Archive, Code, Database, Calculator, Hash, QrCode, Smartphone, Monitor, Printer, Globe, Mail, Calendar, Clock, BarChart, PieChart, TrendingUp, Filter, Search, Replace, Layers, Grid, Sliders, Paintbrush, Eraser, Move, Maximize, Minimize, RotateCw, FlipHorizontal, FlipVertical, Contrast, Copyright as Brightness, Volume2, VolumeX, FastForward, Rewind, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic, Camera, Webcam } from 'lucide-react';
import { Tool } from '../types/tools';

export const allTools: Tool[] = [
  // File Conversion Tools
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files with preserved formatting',
    icon: FileText,
    category: 'File Conversion',
    tags: ['pdf', 'word', 'docx', 'convert', 'editable'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.docx', '.doc'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 30s',
    features: [
      'Preserves original formatting',
      'Maintains text layout and fonts',
      'Extracts images and tables',
      'Supports multi-page documents',
      'OCR for scanned PDFs'
    ],
    options: [
      {
        key: 'ocrLanguage',
        label: 'OCR Language',
        type: 'select',
        choices: ['English', 'Spanish', 'French', 'German', 'Chinese'],
        default: 'English'
      },
      {
        key: 'preserveImages',
        label: 'Preserve Images',
        type: 'boolean',
        default: true
      }
    ]
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format with professional quality',
    icon: FileText,
    category: 'File Conversion',
    tags: ['word', 'pdf', 'docx', 'convert', 'professional'],
    supportedFormats: ['.docx', '.doc'],
    outputFormats: ['.pdf'],
    maxFileSize: '50MB',
    maxFiles: 1,
    processingTime: '< 15s',
    features: [
      'High-quality PDF output',
      'Preserves formatting and layout',
      'Maintains hyperlinks',
      'Supports headers and footers',
      'Password protection option'
    ],
    options: [
      {
        key: 'quality',
        label: 'Output Quality',
        type: 'select',
        choices: ['High', 'Medium', 'Low'],
        default: 'High'
      },
      {
        key: 'password',
        label: 'Password Protection',
        type: 'text',
        default: ''
      }
    ]
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF with table formatting preserved',
    icon: FileSpreadsheet,
    category: 'File Conversion',
    tags: ['excel', 'pdf', 'xlsx', 'spreadsheet', 'convert'],
    supportedFormats: ['.xlsx', '.xls'],
    outputFormats: ['.pdf'],
    maxFileSize: '50MB',
    maxFiles: 1,
    processingTime: '< 20s',
    features: [
      'Preserves table structure',
      'Maintains cell formatting',
      'Supports multiple sheets',
      'Auto-fit to page size',
      'Custom page orientation'
    ]
  },
  {
    id: 'ppt-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF format',
    icon: Presentation,
    category: 'File Conversion',
    tags: ['powerpoint', 'pdf', 'pptx', 'presentation', 'convert'],
    supportedFormats: ['.pptx', '.ppt'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 25s',
    features: [
      'Preserves slide layouts',
      'Maintains animations info',
      'Supports speaker notes',
      'Custom slide range',
      'Handout formats'
    ]
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images to PDF documents with customizable layouts',
    icon: Image,
    category: 'File Conversion',
    tags: ['image', 'pdf', 'jpg', 'png', 'convert'],
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'],
    outputFormats: ['.pdf'],
    maxFileSize: '50MB',
    maxFiles: 20,
    processingTime: '< 10s',
    features: [
      'Multiple images per page',
      'Custom page layouts',
      'Image compression options',
      'Auto-rotation detection',
      'Batch processing'
    ],
    options: [
      {
        key: 'layout',
        label: 'Page Layout',
        type: 'select',
        choices: ['1 per page', '2 per page', '4 per page', 'Auto'],
        default: '1 per page'
      },
      {
        key: 'quality',
        label: 'Image Quality',
        type: 'select',
        choices: ['High', 'Medium', 'Low'],
        default: 'High'
      }
    ]
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    description: 'Convert PDF pages to high-quality images',
    icon: FileImage,
    category: 'File Conversion',
    tags: ['pdf', 'image', 'jpg', 'png', 'convert'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.jpg', '.png'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 20s',
    features: [
      'High-resolution output',
      'Multiple format options',
      'Custom DPI settings',
      'Page range selection',
      'Batch export'
    ]
  },

  // PDF Tools
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into a single document',
    icon: Merge,
    category: 'PDF Tools',
    tags: ['pdf', 'merge', 'combine', 'join'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 20,
    processingTime: '< 15s',
    features: [
      'Unlimited file merging',
      'Custom page order',
      'Bookmark preservation',
      'Password protection',
      'Drag & drop reordering'
    ]
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Split PDF documents into separate files or extract specific pages',
    icon: Scissors,
    category: 'PDF Tools',
    tags: ['pdf', 'split', 'extract', 'pages'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 10s',
    features: [
      'Split by page ranges',
      'Extract specific pages',
      'Split into equal parts',
      'Custom file naming',
      'Bookmark preservation'
    ]
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    icon: Compress,
    category: 'PDF Tools',
    tags: ['pdf', 'compress', 'reduce', 'size', 'optimize'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 20s',
    features: [
      'Smart compression algorithms',
      'Quality preservation',
      'Image optimization',
      'Font subsetting',
      'Metadata cleaning'
    ]
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate PDF pages to correct orientation',
    icon: RotateCcw,
    category: 'PDF Tools',
    tags: ['pdf', 'rotate', 'orientation', 'pages'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 5s',
    features: [
      'Rotate individual pages',
      'Batch rotation',
      '90°, 180°, 270° rotation',
      'Auto-orientation detection',
      'Preview before processing'
    ]
  },
  {
    id: 'watermark-pdf',
    name: 'Add Watermark',
    description: 'Add text or image watermarks to PDF documents',
    icon: Palette,
    category: 'PDF Tools',
    tags: ['pdf', 'watermark', 'text', 'image', 'brand'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 15s',
    features: [
      'Text and image watermarks',
      'Custom positioning',
      'Transparency control',
      'Multiple pages support',
      'Batch watermarking'
    ]
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Add password protection and security to PDF files',
    icon: Lock,
    category: 'PDF Tools',
    tags: ['pdf', 'password', 'protect', 'security', 'encrypt'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 10s',
    features: [
      'Password protection',
      'Permission controls',
      'Encryption options',
      'Print restrictions',
      'Copy protection'
    ]
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove password protection from PDF files',
    icon: Shield,
    category: 'PDF Tools',
    tags: ['pdf', 'unlock', 'remove', 'password', 'decrypt'],
    supportedFormats: ['.pdf'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 5s',
    features: [
      'Password removal',
      'Permission unlocking',
      'Batch processing',
      'Security validation',
      'Original quality preservation'
    ]
  },

  // Image Tools
  {
    id: 'resize-image',
    name: 'Resize Image',
    description: 'Resize images to specific dimensions or percentages',
    icon: Maximize,
    category: 'Image Tools',
    tags: ['image', 'resize', 'dimensions', 'scale'],
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
    outputFormats: ['.jpg', '.png', '.webp'],
    maxFileSize: '50MB',
    maxFiles: 10,
    processingTime: '< 5s',
    features: [
      'Custom dimensions',
      'Percentage scaling',
      'Aspect ratio preservation',
      'Batch processing',
      'Quality optimization'
    ]
  },
  {
    id: 'compress-image',
    name: 'Compress Image',
    description: 'Reduce image file size while maintaining visual quality',
    icon: Compress,
    category: 'Image Tools',
    tags: ['image', 'compress', 'optimize', 'size'],
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    outputFormats: ['.jpg', '.png', '.webp'],
    maxFileSize: '50MB',
    maxFiles: 20,
    processingTime: '< 10s',
    features: [
      'Lossless compression',
      'Quality control',
      'Format optimization',
      'Batch processing',
      'Size comparison'
    ]
  },
  {
    id: 'crop-image',
    name: 'Crop Image',
    description: 'Crop images to remove unwanted areas or focus on specific regions',
    icon: Crop,
    category: 'Image Tools',
    tags: ['image', 'crop', 'trim', 'cut'],
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    outputFormats: ['.jpg', '.png'],
    maxFileSize: '50MB',
    maxFiles: 1,
    processingTime: '< 5s',
    features: [
      'Custom crop areas',
      'Aspect ratio presets',
      'Smart crop detection',
      'Preview functionality',
      'Precision controls'
    ]
  },
  {
    id: 'rotate-image',
    name: 'Rotate Image',
    description: 'Rotate images to correct orientation or create artistic effects',
    icon: RotateCw,
    category: 'Image Tools',
    tags: ['image', 'rotate', 'orientation', 'flip'],
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    outputFormats: ['.jpg', '.png'],
    maxFileSize: '50MB',
    maxFiles: 10,
    processingTime: '< 5s',
    features: [
      'Custom angle rotation',
      'Flip horizontal/vertical',
      'Auto-orientation',
      'Batch processing',
      'Quality preservation'
    ]
  },
  {
    id: 'convert-image',
    name: 'Convert Image Format',
    description: 'Convert images between different formats (JPG, PNG, WebP, etc.)',
    icon: RefreshCw,
    category: 'Image Tools',
    tags: ['image', 'convert', 'format', 'jpg', 'png', 'webp'],
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'],
    outputFormats: ['.jpg', '.png', '.webp', '.gif', '.bmp'],
    maxFileSize: '50MB',
    maxFiles: 20,
    processingTime: '< 10s',
    features: [
      'Multiple format support',
      'Quality control',
      'Transparency preservation',
      'Batch conversion',
      'Metadata handling'
    ]
  },
  {
    id: 'remove-background',
    name: 'Remove Background',
    description: 'Automatically remove backgrounds from images using AI',
    icon: Eraser,
    category: 'Image Tools',
    tags: ['image', 'background', 'remove', 'ai', 'transparent'],
    supportedFormats: ['.jpg', '.jpeg', '.png'],
    outputFormats: ['.png'],
    maxFileSize: '25MB',
    maxFiles: 5,
    processingTime: '< 30s',
    features: [
      'AI-powered detection',
      'High-quality results',
      'Transparent background',
      'Edge refinement',
      'Batch processing'
    ]
  },

  // Audio Tools
  {
    id: 'convert-audio',
    name: 'Convert Audio',
    description: 'Convert audio files between different formats',
    icon: Music,
    category: 'Audio Tools',
    tags: ['audio', 'convert', 'mp3', 'wav', 'format'],
    supportedFormats: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
    outputFormats: ['.mp3', '.wav', '.flac', '.aac'],
    maxFileSize: '100MB',
    maxFiles: 10,
    processingTime: '< 60s',
    features: [
      'Multiple format support',
      'Quality control',
      'Bitrate adjustment',
      'Metadata preservation',
      'Batch conversion'
    ]
  },
  {
    id: 'compress-audio',
    name: 'Compress Audio',
    description: 'Reduce audio file size while maintaining quality',
    icon: Compress,
    category: 'Audio Tools',
    tags: ['audio', 'compress', 'reduce', 'size', 'mp3'],
    supportedFormats: ['.mp3', '.wav', '.flac', '.aac'],
    outputFormats: ['.mp3', '.aac'],
    maxFileSize: '100MB',
    maxFiles: 10,
    processingTime: '< 45s',
    features: [
      'Smart compression',
      'Quality preservation',
      'Bitrate optimization',
      'Batch processing',
      'Size comparison'
    ]
  },
  {
    id: 'trim-audio',
    name: 'Trim Audio',
    description: 'Cut and trim audio files to specific durations',
    icon: Scissors,
    category: 'Audio Tools',
    tags: ['audio', 'trim', 'cut', 'edit', 'duration'],
    supportedFormats: ['.mp3', '.wav', '.flac', '.aac'],
    outputFormats: ['.mp3', '.wav'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 30s',
    features: [
      'Precise timing control',
      'Fade in/out effects',
      'Multiple segments',
      'Waveform preview',
      'Quality preservation'
    ]
  },
  {
    id: 'merge-audio',
    name: 'Merge Audio',
    description: 'Combine multiple audio files into one',
    icon: Merge,
    category: 'Audio Tools',
    tags: ['audio', 'merge', 'combine', 'join'],
    supportedFormats: ['.mp3', '.wav', '.flac', '.aac'],
    outputFormats: ['.mp3', '.wav'],
    maxFileSize: '100MB',
    maxFiles: 20,
    processingTime: '< 60s',
    features: [
      'Seamless merging',
      'Custom order',
      'Crossfade effects',
      'Volume normalization',
      'Gap insertion'
    ]
  },

  // Video Tools
  {
    id: 'convert-video',
    name: 'Convert Video',
    description: 'Convert videos between different formats',
    icon: Video,
    category: 'Video Tools',
    tags: ['video', 'convert', 'mp4', 'avi', 'format'],
    supportedFormats: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'],
    outputFormats: ['.mp4', '.avi', '.mov', '.webm'],
    maxFileSize: '500MB',
    maxFiles: 5,
    processingTime: '< 300s',
    features: [
      'Multiple format support',
      'Quality control',
      'Resolution adjustment',
      'Codec selection',
      'Batch conversion'
    ]
  },
  {
    id: 'compress-video',
    name: 'Compress Video',
    description: 'Reduce video file size while maintaining quality',
    icon: Compress,
    category: 'Video Tools',
    tags: ['video', 'compress', 'reduce', 'size', 'optimize'],
    supportedFormats: ['.mp4', '.avi', '.mov', '.wmv'],
    outputFormats: ['.mp4', '.webm'],
    maxFileSize: '500MB',
    maxFiles: 3,
    processingTime: '< 300s',
    features: [
      'Smart compression',
      'Quality preservation',
      'Resolution optimization',
      'Bitrate control',
      'Size comparison'
    ]
  },
  {
    id: 'trim-video',
    name: 'Trim Video',
    description: 'Cut and trim video files to specific durations',
    icon: Scissors,
    category: 'Video Tools',
    tags: ['video', 'trim', 'cut', 'edit', 'duration'],
    supportedFormats: ['.mp4', '.avi', '.mov', '.wmv'],
    outputFormats: ['.mp4'],
    maxFileSize: '500MB',
    maxFiles: 1,
    processingTime: '< 180s',
    features: [
      'Precise timing control',
      'Frame-accurate cutting',
      'Multiple segments',
      'Preview functionality',
      'Quality preservation'
    ]
  },

  // Document Tools
  {
    id: 'extract-text',
    name: 'Extract Text',
    description: 'Extract text content from documents and images',
    icon: Type,
    category: 'Document Tools',
    tags: ['text', 'extract', 'ocr', 'document', 'image'],
    supportedFormats: ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    outputFormats: ['.txt', '.docx'],
    maxFileSize: '50MB',
    maxFiles: 10,
    processingTime: '< 60s',
    features: [
      'OCR technology',
      'Multiple languages',
      'Text formatting',
      'Batch processing',
      'High accuracy'
    ]
  },
  {
    id: 'word-count',
    name: 'Word Count',
    description: 'Count words, characters, and paragraphs in documents',
    icon: Calculator,
    category: 'Document Tools',
    tags: ['word', 'count', 'characters', 'statistics', 'document'],
    supportedFormats: ['.txt', '.docx', '.pdf'],
    outputFormats: ['.txt', '.json'],
    maxFileSize: '25MB',
    maxFiles: 10,
    processingTime: '< 10s',
    features: [
      'Word counting',
      'Character counting',
      'Paragraph analysis',
      'Reading time estimation',
      'Detailed statistics'
    ]
  },
  {
    id: 'compare-documents',
    name: 'Compare Documents',
    description: 'Compare two documents and highlight differences',
    icon: Eye,
    category: 'Document Tools',
    tags: ['compare', 'diff', 'document', 'changes', 'highlight'],
    supportedFormats: ['.txt', '.docx', '.pdf'],
    outputFormats: ['.html', '.pdf'],
    maxFileSize: '25MB',
    maxFiles: 2,
    processingTime: '< 30s',
    features: [
      'Side-by-side comparison',
      'Highlighted differences',
      'Change tracking',
      'Detailed reports',
      'Multiple formats'
    ]
  },

  // Data Tools
  {
    id: 'csv-to-json',
    name: 'CSV to JSON',
    description: 'Convert CSV files to JSON format',
    icon: Database,
    category: 'Data Tools',
    tags: ['csv', 'json', 'convert', 'data', 'format'],
    supportedFormats: ['.csv'],
    outputFormats: ['.json'],
    maxFileSize: '25MB',
    maxFiles: 10,
    processingTime: '< 15s',
    features: [
      'Automatic field detection',
      'Custom delimiters',
      'Data validation',
      'Nested JSON support',
      'Batch conversion'
    ]
  },
  {
    id: 'json-to-csv',
    name: 'JSON to CSV',
    description: 'Convert JSON files to CSV format',
    icon: Database,
    category: 'Data Tools',
    tags: ['json', 'csv', 'convert', 'data', 'format'],
    supportedFormats: ['.json'],
    outputFormats: ['.csv'],
    maxFileSize: '25MB',
    maxFiles: 10,
    processingTime: '< 15s',
    features: [
      'Flatten nested objects',
      'Custom field selection',
      'Data formatting',
      'Header customization',
      'Batch conversion'
    ]
  },
  {
    id: 'excel-to-csv',
    name: 'Excel to CSV',
    description: 'Convert Excel spreadsheets to CSV format',
    icon: FileSpreadsheet,
    category: 'Data Tools',
    tags: ['excel', 'csv', 'convert', 'spreadsheet', 'data'],
    supportedFormats: ['.xlsx', '.xls'],
    outputFormats: ['.csv'],
    maxFileSize: '50MB',
    maxFiles: 10,
    processingTime: '< 20s',
    features: [
      'Multiple sheet support',
      'Custom delimiters',
      'Data formatting',
      'Header options',
      'Batch processing'
    ]
  },

  // Archive Tools
  {
    id: 'create-zip',
    name: 'Create ZIP',
    description: 'Create ZIP archives from multiple files',
    icon: Archive,
    category: 'Archive Tools',
    tags: ['zip', 'archive', 'compress', 'bundle'],
    supportedFormats: ['*'],
    outputFormats: ['.zip'],
    maxFileSize: '100MB',
    maxFiles: 50,
    processingTime: '< 60s',
    features: [
      'Multiple file support',
      'Folder structure preservation',
      'Compression levels',
      'Password protection',
      'Custom naming'
    ]
  },
  {
    id: 'extract-zip',
    name: 'Extract ZIP',
    description: 'Extract files from ZIP archives',
    icon: Archive,
    category: 'Archive Tools',
    tags: ['zip', 'extract', 'unzip', 'decompress'],
    supportedFormats: ['.zip', '.rar', '.7z'],
    outputFormats: ['*'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 30s',
    features: [
      'Multiple archive formats',
      'Selective extraction',
      'Folder structure preservation',
      'Password support',
      'Preview contents'
    ]
  },

  // Utility Tools
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for text, URLs, and data',
    icon: QrCode,
    category: 'Utility Tools',
    tags: ['qr', 'code', 'generator', 'url', 'text'],
    supportedFormats: ['text'],
    outputFormats: ['.png', '.svg'],
    maxFileSize: '1MB',
    maxFiles: 1,
    processingTime: '< 5s',
    features: [
      'Custom size options',
      'Error correction levels',
      'Color customization',
      'Logo embedding',
      'Batch generation'
    ]
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA1, SHA256 hashes for files',
    icon: Hash,
    category: 'Utility Tools',
    tags: ['hash', 'md5', 'sha1', 'sha256', 'checksum'],
    supportedFormats: ['*'],
    outputFormats: ['.txt'],
    maxFileSize: '100MB',
    maxFiles: 10,
    processingTime: '< 30s',
    features: [
      'Multiple hash algorithms',
      'File integrity verification',
      'Batch processing',
      'Comparison tools',
      'Export results'
    ]
  },
  {
    id: 'url-shortener',
    name: 'URL Shortener',
    description: 'Create short URLs for long web addresses',
    icon: Globe,
    category: 'Utility Tools',
    tags: ['url', 'shortener', 'link', 'web'],
    supportedFormats: ['text'],
    outputFormats: ['text'],
    maxFileSize: '1KB',
    maxFiles: 100,
    processingTime: '< 2s',
    features: [
      'Custom short codes',
      'Click tracking',
      'Expiration dates',
      'Bulk shortening',
      'Analytics dashboard'
    ]
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords with custom criteria',
    icon: Lock,
    category: 'Utility Tools',
    tags: ['password', 'generator', 'security', 'random'],
    supportedFormats: ['none'],
    outputFormats: ['.txt'],
    maxFileSize: '1KB',
    maxFiles: 1,
    processingTime: '< 1s',
    features: [
      'Custom length',
      'Character sets',
      'Strength indicators',
      'Bulk generation',
      'Secure randomization'
    ]
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Extract color palettes from images',
    icon: Palette,
    category: 'Utility Tools',
    tags: ['color', 'palette', 'extract', 'image', 'design'],
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif'],
    outputFormats: ['.json', '.css', '.png'],
    maxFileSize: '25MB',
    maxFiles: 5,
    processingTime: '< 15s',
    features: [
      'Dominant color extraction',
      'Custom palette sizes',
      'Color format options',
      'Export formats',
      'Batch processing'
    ]
  }
];

export const toolCategories = [
  'File Conversion',
  'PDF Tools',
  'Image Tools',
  'Audio Tools',
  'Video Tools',
  'Document Tools',
  'Data Tools',
  'Archive Tools',
  'Utility Tools'
];