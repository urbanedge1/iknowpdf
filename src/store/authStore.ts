import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  incrementTaskUsage: () => void;
}

// Mock user data for demo
const mockUser: User = {
  id: '1',
  email: 'demo@iknowpdf.com',
  name: 'Demo User',
  plan: 'free',
  tasksUsed: 1,
  tasksLimit: 3,
  createdAt: new Date(),
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ 
      user: mockUser, 
      isAuthenticated: true, 
      isLoading: false 
    });
  },

  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      ...mockUser,
      email,
      name,
      tasksUsed: 0,
    };
    set({ 
      user: newUser, 
      isAuthenticated: true, 
      isLoading: false 
    });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }
  },

  incrementTaskUsage: () => {
    const currentUser = get().user;
    if (currentUser) {
      set({ 
        user: { 
          ...currentUser, 
          tasksUsed: currentUser.tasksUsed + 1 
        } 
      });
    }
  },
}));