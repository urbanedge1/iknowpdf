import { create } from 'zustand';
import { PDFFile, ProcessingJob } from '../types';

interface FileState {
  files: PDFFile[];
  jobs: ProcessingJob[];
  isUploading: boolean;
  uploadFile: (file: File) => Promise<PDFFile>;
  removeFile: (id: string) => void;
  processFiles: (toolId: string, fileIds: string[]) => Promise<ProcessingJob>;
  updateJobProgress: (jobId: string, progress: number) => void;
  completeJob: (jobId: string, result: any) => void;
  clearFiles: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  jobs: [],
  isUploading: false,

  uploadFile: async (file: File): Promise<PDFFile> => {
    set({ isUploading: true });
    
    // Simulate file upload
    const pdfFile: PDFFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      status: 'uploading',
    };

    set(state => ({ files: [...state.files, pdfFile] }));

    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const completedFile = {
      ...pdfFile,
      status: 'completed' as const,
      url: URL.createObjectURL(file),
    };

    set(state => ({
      files: state.files.map(f => f.id === pdfFile.id ? completedFile : f),
      isUploading: false,
    }));

    return completedFile;
  },

  removeFile: (id: string) => {
    set(state => ({
      files: state.files.filter(f => f.id !== id)
    }));
  },

  processFiles: async (toolId: string, fileIds: string[]): Promise<ProcessingJob> => {
    const files = get().files.filter(f => fileIds.includes(f.id));
    
    const job: ProcessingJob = {
      id: Math.random().toString(36).substr(2, 9),
      tool: toolId,
      files,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };

    set(state => ({ jobs: [...state.jobs, job] }));

    // Simulate processing
    setTimeout(() => {
      set(state => ({
        jobs: state.jobs.map(j => 
          j.id === job.id ? { ...j, status: 'processing' } : j
        )
      }));

      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // Complete the job
          setTimeout(() => {
            get().completeJob(job.id, {
              downloadUrl: '#',
              fileName: `processed_${files[0]?.name || 'document.pdf'}`,
            });
          }, 500);
        }
        get().updateJobProgress(job.id, progress);
      }, 300);
    }, 1000);

    return job;
  },

  updateJobProgress: (jobId: string, progress: number) => {
    set(state => ({
      jobs: state.jobs.map(j => 
        j.id === jobId ? { ...j, progress } : j
      )
    }));
  },

  completeJob: (jobId: string, result: any) => {
    set(state => ({
      jobs: state.jobs.map(j => 
        j.id === jobId ? { 
          ...j, 
          status: 'completed', 
          progress: 100, 
          result,
          completedAt: new Date() 
        } : j
      )
    }));
  },

  clearFiles: () => {
    set({ files: [], jobs: [] });
  },
}));