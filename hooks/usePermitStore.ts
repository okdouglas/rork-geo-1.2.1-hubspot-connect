import { create } from 'zustand';
import { PermitData } from '@/types/lead';
import { fetchPermitData, getMonthRanges } from '@/lib/permits';

interface PermitFilters {
  state?: 'Oklahoma' | 'Kansas' | 'All';
  operator?: string;
  county?: string;
  monthOf?: string;
  sortOrder?: 'newest' | 'oldest';
}

type PermitStore = {
  permits: PermitData[];
  filteredPermits: PermitData[];
  selectedPermit: PermitData | null;
  filters: PermitFilters;
  isLoading: boolean;
  error: string | null;
  lastFetch: string | null;
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
    sortOrder: 'newest'
  },
  isLoading: false,
  error: null,
  lastFetch: null,
  monthRanges: [],
  
  initializeRanges: () => {
    const monthRanges = getMonthRanges(6);
    set({ monthRanges });
  },
  
  setSelectedPermit: (permit) => set({ selectedPermit: permit }),
  
  setFilters: (newFilters) => {
    set(state => {
      const updatedFilters = { ...state.filters, ...newFilters };
      let filtered = state.permits;
      
      // Apply filters
      if (updatedFilters.state && updatedFilters.state !== 'All') {
        filtered = filtered.filter(permit => permit.location.state === updatedFilters.state);
      }
      
      if (updatedFilters.operator) {
        filtered = filtered.filter(permit => 
          permit.operatorName.toLowerCase().includes(updatedFilters.operator!.toLowerCase())
        );
      }
      
      if (updatedFilters.county) {
        filtered = filtered.filter(permit => 
          permit.location.county.toLowerCase().includes(updatedFilters.county!.toLowerCase())
        );
      }
      
      if (updatedFilters.monthOf) {
        const monthStart = new Date(updatedFilters.monthOf);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        filtered = filtered.filter(permit => {
          const permitDate = new Date(permit.filingDate);
          return permitDate >= monthStart && permitDate <= monthEnd;
        });
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const dateA = new Date(a.filingDate).getTime();
        const dateB = new Date(b.filingDate).getTime();
        return updatedFilters.sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
      });
      
      return {
        filters: updatedFilters,
        filteredPermits: filtered
      };
    });
  },
  
  fetchPermits: async () => {
    const { filters } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      const searchParams = {
        state: filters.state === 'All' ? undefined : filters.state,
        operator: filters.operator,
        county: filters.county,
        monthOf: filters.monthOf
      };
      
      const permits = await fetchPermitData(searchParams);
      
      // Sort permits by date (newest first by default)
      permits.sort((a, b) => {
        const dateA = new Date(a.filingDate).getTime();
        const dateB = new Date(b.filingDate).getTime();
        return filters.sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
      });
      
      set({
        permits,
        filteredPermits: permits,
        isLoading: false,
        lastFetch: new Date().toISOString(),
        error: null
      });
      
      // Apply current filters
      get().setFilters({});
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