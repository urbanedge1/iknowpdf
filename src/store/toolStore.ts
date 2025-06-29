import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UsageStats } from '../types/tools';

interface ToolState {
  usageStats: UsageStats;
  incrementUsage: (toolId: string) => void;
  isToolAvailable: (toolId: string) => boolean;
  getRemainingUses: (toolId: string) => number;
  resetUsage: (toolId: string) => void;
  getUsagePercentage: (toolId: string) => number;
}

const MAX_USES_PER_TOOL = 50;

export const useToolStore = create<ToolState>()(
  persist(
    (set, get) => ({
      usageStats: {},

      incrementUsage: (toolId: string) => {
        set((state) => ({
          usageStats: {
            ...state.usageStats,
            [toolId]: {
              count: (state.usageStats[toolId]?.count || 0) + 1,
              lastUsed: Date.now()
            }
          }
        }));
      },

      isToolAvailable: (toolId: string) => {
        const stats = get().usageStats[toolId];
        return !stats || stats.count < MAX_USES_PER_TOOL;
      },

      getRemainingUses: (toolId: string) => {
        const stats = get().usageStats[toolId];
        const used = stats?.count || 0;
        return Math.max(0, MAX_USES_PER_TOOL - used);
      },

      resetUsage: (toolId: string) => {
        set((state) => ({
          usageStats: {
            ...state.usageStats,
            [toolId]: {
              count: 0,
              lastUsed: Date.now()
            }
          }
        }));
      },

      getUsagePercentage: (toolId: string) => {
        const stats = get().usageStats[toolId];
        const used = stats?.count || 0;
        return (used / MAX_USES_PER_TOOL) * 100;
      }
    }),
    {
      name: 'tool-usage-storage',
      version: 1
    }
  )
);