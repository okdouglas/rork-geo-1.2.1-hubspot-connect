import { create } from 'zustand';
import { Lead } from '@/types/lead';
import { searchLinkedInCompanies } from '@/lib/linkedin';

interface LeadSourcingStore {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;
  syncStatus: {
    totalFound: number;
    totalSynced: number;
    lastSearch: string | null;
  };
  searchLeads: (query: string) => Promise<void>;
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  clearLeads: () => void;
  clearError: () => void;
  markAsSynced: (leadId: string, hubSpotId: string) => void;
}

export const useLeadSourcingStore = create<LeadSourcingStore>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,
  syncStatus: {
    totalFound: 0,
    totalSynced: 0,
    lastSearch: null,
  },

  searchLeads: async (query: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const results = await searchLinkedInCompanies(query);
      
      set({ 
        leads: results,
        isLoading: false,
        syncStatus: {
          totalFound: results.length,
          totalSynced: results.filter(l => l.syncedToHubSpot).length,
          lastSearch: new Date().toISOString(),
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search for leads';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
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
      syncStatus: {
        totalFound: 0,
        totalSynced: 0,
        lastSearch: null,
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
}));