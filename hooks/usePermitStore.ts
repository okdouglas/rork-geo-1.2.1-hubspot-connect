import { create } from 'zustand';
import { PermitData } from '@/types/lead';
import { fetchPermitData, getWeekRanges } from '@/lib/permits';

interface PermitFilters {
  state?: 'Oklahoma' | 'Kansas' | 'All';
  operator?: string;
  county?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  weekOf?: string;
  monthOf?: string;
}

type PermitStore = {
  permits: PermitData[];
  filteredPermits: PermitData[];
  selectedPermit: PermitData | null;
  filters: PermitFilters;
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;
  weekRanges: Array<{ label: string; value: string }>;
  monthRanges: Array<{ label: string; value: string }>;
  
  // Actions
  setSelectedPermit: (permit: PermitData | null) => void;
  setFilters: (filters: Partial<PermitFilters>) => void;
  fetchPermits: () => Promise<void>;
  refreshPermits: () => Promise<void>;
  getPermitsByOperator: (operatorName: string) => PermitData[];
  getPermitsByCompany: (companyName: string) => PermitData[];
  getPermitStats: () => { 
    oklahoma: number; 
    kansas: number; 
    total: number; 
    thisWeek: number;
    thisMonth: number;
  };
  clearError: () => void;
  initializeRanges: () => void;
};

export const usePermitStore = create<PermitStore>((set, get) => ({
  permits: [],
  filteredPermits: [],
  selectedPermit: null,
  filters: {
    state: 'All',
    dateRange: {
      start: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months ago
      end: new Date().toISOString().split('T')[0] // today
    }
  },
  isLoading: false,
  error: null,
  lastFetch: null,
  weekRanges: [],
  monthRanges: [],
  
  initializeRanges: () => {
    const weekRanges = getWeekRanges(6);
    const monthRanges = getMonthRanges(6);
    set({ weekRanges, monthRanges });
  },
  
  setSelectedPermit: (permit) => set({ selectedPermit: permit }),
  
  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
    
    // Auto-fetch when filters change
    get().fetchPermits();
  },
  
  fetchPermits: async () => {
    const { filters } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const searchParams = {
        state: filters.state === 'All' ? undefined : filters.state,
        operator: filters.operator,
        county: filters.county,
        dateRange: filters.dateRange,
        weekOf: filters.weekOf,
        monthOf: filters.monthOf
      };
      
      const permits = await fetchPermitData(searchParams);
      
      set({
        permits,
        filteredPermits: permits,
        isLoading: false,
        lastFetch: new Date().toISOString(),
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch permits';
      set({
        isLoading: false,
        error: errorMessage,
        permits: [],
        filteredPermits: []
      });
    }
  },
  
  refreshPermits: async () => {
    // Force refresh by clearing cache (if needed) and fetching
    await get().fetchPermits();
  },
  
  getPermitsByOperator: (operatorName) => {
    return get().permits.filter(permit => 
      permit.operatorName.toLowerCase().includes(operatorName.toLowerCase())
    );
  },
  
  getPermitsByCompany: (companyName) => {
    return get().permits.filter(permit => 
      permit.operatorName.toLowerCase().includes(companyName.toLowerCase())
    );
  },
  
  getPermitStats: () => {
    const allPermits = get().permits;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const oklahoma = allPermits.filter(p => p.location.state === 'Oklahoma').length;
    const kansas = allPermits.filter(p => p.location.state === 'Kansas').length;
    
    const thisWeek = allPermits.filter(p => {
      const permitDate = new Date(p.filingDate);
      return permitDate >= oneWeekAgo && permitDate <= now;
    }).length;
    
    const thisMonth = allPermits.filter(p => {
      const permitDate = new Date(p.filingDate);
      return permitDate >= oneMonthAgo && permitDate <= now;
    }).length;
    
    return {
      oklahoma,
      kansas,
      total: oklahoma + kansas,
      thisWeek,
      thisMonth
    };
  },
  
  clearError: () => set({ error: null }),
}));

function getMonthRanges(monthsBack: number = 6): Array<{ label: string; value: string }> {
  const months: Array<{ label: string; value: string }> = [];
  const now = new Date();
  
  for (let i = 0; i < monthsBack; i++) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    months.push({
      label: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      value: monthStart.toISOString().split('T')[0]
    });
  }
  
  return months;
}