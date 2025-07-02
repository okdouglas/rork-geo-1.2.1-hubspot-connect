import { create } from 'zustand';
import { permits } from '@/mocks/permits';
import { Permit } from '@/types';

type PermitStore = {
  permits: Permit[];
  filteredPermits: Permit[];
  selectedPermit: Permit | null;
  setSelectedPermit: (permit: Permit | null) => void;
  filterPermits: (criteria: {
    companyId?: string;
    state?: 'Oklahoma' | 'Kansas' | 'All';
    status?: 'Filed' | 'Approved' | 'Drilling' | 'Completed' | 'All';
    formationTarget?: string;
    dateRange?: { start: string; end: string };
  }) => void;
  getPermitsByCompany: (companyId: string) => Permit[];
  getPermitStats: () => { oklahoma: number; kansas: number; total: number; };
  addPermit: (permit: Permit) => void;
  updatePermit: (permit: Permit) => void;
};

export const usePermitStore = create<PermitStore>((set, get) => ({
  permits: permits,
  filteredPermits: permits,
  selectedPermit: null,
  setSelectedPermit: (permit) => set({ selectedPermit: permit }),
  filterPermits: (criteria) => {
    set((state) => {
      let filtered = state.permits;
      
      if (criteria.companyId) {
        filtered = filtered.filter(permit => permit.companyId === criteria.companyId);
      }
      
      if (criteria.state && criteria.state !== 'All') {
        filtered = filtered.filter(permit => permit.state === criteria.state);
      }
      
      if (criteria.status && criteria.status !== 'All') {
        filtered = filtered.filter(permit => permit.status === criteria.status);
      }
      
      if (criteria.formationTarget) {
        filtered = filtered.filter(permit => 
          permit.formationTarget.toLowerCase().includes(criteria.formationTarget!.toLowerCase())
        );
      }
      
      if (criteria.dateRange) {
        const startDate = new Date(criteria.dateRange.start);
        const endDate = new Date(criteria.dateRange.end);
        
        filtered = filtered.filter(permit => {
          const permitDate = new Date(permit.filingDate);
          return permitDate >= startDate && permitDate <= endDate;
        });
      }
      
      return { filteredPermits: filtered };
    });
  },
  getPermitsByCompany: (companyId) => {
    return get().permits.filter(permit => permit.companyId === companyId);
  },
  getPermitStats: () => {
    const allPermits = get().permits;
    const oklahoma = allPermits.filter(p => p.state === 'Oklahoma').length;
    const kansas = allPermits.filter(p => p.state === 'Kansas').length;
    
    return {
      oklahoma,
      kansas,
      total: oklahoma + kansas
    };
  },
  addPermit: (permit) => {
    set((state) => ({
      permits: [...state.permits, permit],
      filteredPermits: [...state.filteredPermits, permit]
    }));
  },
  updatePermit: (permit) => {
    set((state) => ({
      permits: state.permits.map(p => p.id === permit.id ? permit : p),
      filteredPermits: state.filteredPermits.map(p => p.id === permit.id ? permit : p),
      selectedPermit: state.selectedPermit?.id === permit.id ? permit : state.selectedPermit
    }));
  },
}));