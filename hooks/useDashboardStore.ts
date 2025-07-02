import { create } from 'zustand';
import { permits } from '@/mocks/permits';
import { workflows } from '@/mocks/workflows';
import { DashboardStats } from '@/types';

const calculateStats = (): DashboardStats => {
  const currentDate = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(currentDate.getMonth() - 1);
  
  const newPermits = permits.filter(p => {
    const permitDate = new Date(p.filingDate);
    return permitDate >= oneMonthAgo && permitDate <= currentDate;
  }).length;
  
  return {
    totalProspects: 7, // Mock contacts who are prospects
    newPermits,
    activeWorkflows: workflows.filter(w => w.isActive).length,
    meetingsScheduled: 12, // Mock meetings scheduled
    responseRate: 28 // Percentage response rate
  };
};

type DashboardStoreState = {
  stats: DashboardStats;
  refreshStats: () => void;
};

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  stats: calculateStats(),
  refreshStats: () => set({ stats: calculateStats() })
}));