import { create } from 'zustand';
import { ProcessingJob } from '../types/tools';

interface ProcessingState {
  jobs: ProcessingJob[];
  addJob: (job: ProcessingJob) => void;
  updateProgress: (jobId: string, progress: number, status?: ProcessingJob['status'], result?: any, error?: string) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;
  getActiveJobs: () => ProcessingJob[];
  getCompletedJobs: () => ProcessingJob[];
}

export const useProcessingStore = create<ProcessingState>((set, get) => ({
  jobs: [],

  addJob: (job: ProcessingJob) => {
    set((state) => ({
      jobs: [job, ...state.jobs]
    }));
  },

  updateProgress: (jobId: string, progress: number, status?: ProcessingJob['status'], result?: any, error?: string) => {
    set((state) => ({
      jobs: state.jobs.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              progress,
              status: status || job.status,
              result: result || job.result,
              error: error || job.error,
              endTime: status === 'completed' || status === 'failed' ? Date.now() : job.endTime
            }
          : job
      )
    }));
  },

  removeJob: (jobId: string) => {
    set((state) => ({
      jobs: state.jobs.filter(job => job.id !== jobId)
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      jobs: state.jobs.filter(job => job.status === 'processing' || job.status === 'pending')
    }));
  },

  getActiveJobs: () => {
    return get().jobs.filter(job => job.status === 'processing' || job.status === 'pending');
  },

  getCompletedJobs: () => {
    return get().jobs.filter(job => job.status === 'completed' || job.status === 'failed');
  }
}));