import { create } from 'zustand';
import { Lead } from '@/types/lead';
import { searchOilGasCompanies } from '@/lib/serpapi';

interface SearchProgress {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  status: string;
}

interface LeadSourcingStore {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  selectedState: 'Oklahoma' | 'Kansas' | null;
  searchProgress: SearchProgress | null;
  syncStatus: {
    totalFound: number;
    totalSynced: number;
    lastSearch: string | null;
    lastSearchState: string | null;
  };
  filters: {
    companyName: string;
    hasWebsite: boolean;
    hasPhone: boolean;
  };
  setSelectedState: (state: 'Oklahoma' | 'Kansas') => void;
  searchLeadsByState: (state: 'Oklahoma' | 'Kansas') => Promise<void>;
  searchLeads: (query: string) => Promise<void>; // Keep for backward compatibility
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  clearLeads: () => void;
  clearError: () => void;
  markAsSynced: (leadId: string, hubSpotId: string) => void;
  setFilters: (filters: Partial<LeadSourcingStore['filters']>) => void;
  getFilteredLeads: () => Lead[];
}

export const useLeadSourcingStore = create<LeadSourcingStore>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,
  selectedState: null,
  searchProgress: null,
  syncStatus: {
    totalFound: 0,
    totalSynced: 0,
    lastSearch: null,
    lastSearchState: null,
  },
  filters: {
    companyName: '',
    hasWebsite: false,
    hasPhone: false,
  },

  setSelectedState: (state) => {
    set({ selectedState: state });
  },

  searchLeadsByState: async (state: 'Oklahoma' | 'Kansas') => {
    set({ 
      isLoading: true, 
      error: null, 
      selectedState: state,
      searchProgress: {
        currentPage: 0,
        totalPages: 5,
        totalResults: 0,
        status: 'Initializing search...'
      }
    });
    
    try {
      const results = await searchOilGasCompanies(state, (progress) => {
        set({ searchProgress: progress });
      });
      
      set({ 
        leads: results,
        isLoading: false,
        searchProgress: {
          currentPage: 5,
          totalPages: 5,
          totalResults: results.length,
          status: `Search complete - Found ${results.length} companies`
        },
        syncStatus: {
          totalFound: results.length,
          totalSynced: results.filter(l => l.syncedToHubSpot).length,
          lastSearch: new Date().toISOString(),
          lastSearchState: state,
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search for leads';
      set({ 
        error: errorMessage,
        isLoading: false,
        searchProgress: null
      });
    }
  },

  // Keep backward compatibility for existing search functionality
  searchLeads: async (query: string) => {
    // Try to determine state from query
    const lowerQuery = query.toLowerCase();
    let state: 'Oklahoma' | 'Kansas';
    
    if (lowerQuery.includes('oklahoma')) {
      state = 'Oklahoma';
    } else if (lowerQuery.includes('kansas')) {
      state = 'Kansas';
    } else {
      // Default to Oklahoma if no state specified
      state = 'Oklahoma';
    }
    
    await get().searchLeadsByState(state);
  },

  addLead: (lead) => {
    set(state => ({
      leads: [...state.leads, lead],
      syncStatus: {
        ...state.syncStatus,
        totalFound: state.syncStatus.totalFound + 1,
      }
    }));
  },

  updateLead: (updatedLead) => {
    set(state => ({
      leads: state.leads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    }));
  },

  clearLeads: () => {
    set({ 
      leads: [],
      selectedState: null,
      searchProgress: null,
      syncStatus: {
        totalFound: 0,
        totalSynced: 0,
        lastSearch: null,
        lastSearchState: null,
      }
    });
  },

  clearError: () => {
    set({ error: null });
  },

  markAsSynced: (leadId, hubSpotId) => {
    set(state => ({
      leads: state.leads.map(lead => 
        lead.id === leadId 
          ? { ...lead, syncedToHubSpot: true, hubSpotId }
          : lead
      ),
      syncStatus: {
        ...state.syncStatus,
        totalSynced: state.syncStatus.totalSynced + 1,
      }
    }));
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  getFilteredLeads: () => {
    const { leads, filters } = get();
    
    return leads.filter(lead => {
      // Company name filter
      if (filters.companyName && !lead.companyName.toLowerCase().includes(filters.companyName.toLowerCase())) {
        return false;
      }
      
      // Website filter
      if (filters.hasWebsite && !lead.website) {
        return false;
      }
      
      // Phone filter
      if (filters.hasPhone && !lead.contact?.phone) {
        return false;
      }
      
      return true;
    });
  },
}));