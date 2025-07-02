import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hubspotService, HubSpotConfig } from '@/services/hubspot';
import { Company } from '@/types';
import { Contact } from '@/types';
import { Permit } from '@/types';
import { Lead } from '@/types/lead';

interface HubSpotSyncStatus {
  isConfigured: boolean;
  lastSync: string | null;
  isSyncing: boolean;
  syncErrors: string[];
}

interface HubSpotStore {
  config: HubSpotConfig | null;
  syncStatus: HubSpotSyncStatus;
  setConfig: (config: HubSpotConfig) => void;
  clearConfig: () => void;
  testConnection: () => Promise<boolean>;
  syncCompany: (companyId: string) => Promise<boolean>;
  syncContact: (contactId: string) => Promise<boolean>;
  syncLeadToHubSpot: (leadId: string) => Promise<boolean>;
  syncAllCompanies: () => Promise<void>;
  syncAllContacts: () => Promise<void>;
  createDealFromPermit: (permitId: string) => Promise<boolean>;
  setSyncing: (isSyncing: boolean) => void;
  addSyncError: (error: string) => void;
  clearSyncErrors: () => void;
}

export const useHubSpotStore = create<HubSpotStore>()(
  persist(
    (set, get) => ({
      config: null,
      syncStatus: {
        isConfigured: false,
        lastSync: null,
        isSyncing: false,
        syncErrors: [],
      },

      setConfig: (config) => {
        hubspotService.setConfig(config);
        set({ 
          config,
          syncStatus: { ...get().syncStatus, isConfigured: true }
        });
      },

      clearConfig: () => {
        set({ 
          config: null,
          syncStatus: {
            isConfigured: false,
            lastSync: null,
            isSyncing: false,
            syncErrors: [],
          }
        });
      },

      testConnection: async () => {
        const { config } = get();
        if (!config) return false;

        try {
          hubspotService.setConfig(config);
          const result = await hubspotService.testConnection();
          return result.success;
        } catch (error) {
          console.error('HubSpot connection test failed:', error);
          return false;
        }
      },

      syncCompany: async (companyId) => {
        const { addSyncError } = get();
        
        try {
          // Get company data from store
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          const companyStore = useCompanyStore.getState();
          const company = companyStore.companies.find((c: Company) => c.id === companyId);
          
          if (!company) {
            addSyncError(`Company ${companyId} not found`);
            return false;
          }

          // Check if company already exists in HubSpot
          const existingCompany = await hubspotService.searchCompanyByName(company.name);
          
          const hubspotData = {
            name: company.name,
            industry: 'Oil & Gas',
            state: company.state,
            primary_formation: company.primaryFormation,
            drilling_activity_level: company.drillingActivityLevel,
            geological_staff_size: company.geologicalStaffSize.toString(),
            recent_permits_count: company.recentPermitsCount.toString(),
            last_permit_date: company.lastPermitDate,
            status: company.status,
            numberofemployees: company.size === 'Small' ? '10-50' : 
                              company.size === 'Medium' ? '51-200' : '200+',
          };

          if (existingCompany.results && existingCompany.results.length > 0) {
            await hubspotService.updateCompany(existingCompany.results[0].id, hubspotData);
          } else {
            await hubspotService.createCompany(hubspotData);
          }

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to sync company: ${errorMessage}`);
          return false;
        }
      },

      syncContact: async (contactId) => {
        const { addSyncError } = get();
        
        try {
          // Get contact data from store
          const { useContactStore } = await import('@/hooks/useContactStore');
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          
          const contactStore = useContactStore.getState();
          const companyStore = useCompanyStore.getState();
          
          const contact = contactStore.contacts.find((c: Contact) => c.id === contactId);
          if (!contact) {
            addSyncError(`Contact ${contactId} not found`);
            return false;
          }

          const company = companyStore.companies.find((c: Company) => c.id === contact.companyId);

          // Check if contact already exists
          const existingContact = await hubspotService.searchContactByEmail(contact.email);
          
          // Split name into first and last name
          const nameParts = contact.name.split(' ');
          const firstname = nameParts[0] || '';
          const lastname = nameParts.slice(1).join(' ') || '';
          
          const hubspotData = {
            email: contact.email,
            firstname: firstname,
            lastname: lastname,
            jobtitle: contact.title,
            phone: contact.phone,
            company: company?.name || '',
            geological_expertise: contact.expertise.join(', '),
            years_experience: contact.yearsExperience?.toString(),
            education: contact.education,
            last_contact_date: contact.lastContactDate,
          };

          if (existingContact.results && existingContact.results.length > 0) {
            await hubspotService.updateContact(existingContact.results[0].id, hubspotData);
          } else {
            const newContact = await hubspotService.createContact(hubspotData);
            
            // Associate with company if it exists
            if (company) {
              const existingCompany = await hubspotService.searchCompanyByName(company.name);
              if (existingCompany.results && existingCompany.results.length > 0) {
                await hubspotService.associateContactWithCompany(
                  newContact.id, 
                  existingCompany.results[0].id
                );
              }
            }
          }

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to sync contact: ${errorMessage}`);
          return false;
        }
      },

      syncLeadToHubSpot: async (leadId) => {
        const { addSyncError } = get();
        
        try {
          // Get lead data from store
          const { useLeadSourcingStore } = await import('@/hooks/useLeadSourcingStore');
          const leadStore = useLeadSourcingStore.getState();
          const lead = leadStore.leads.find((l: Lead) => l.id === leadId);
          
          if (!lead) {
            addSyncError(`Lead ${leadId} not found`);
            return false;
          }

          // Check if company already exists in HubSpot
          const existingCompany = await hubspotService.searchCompanyByName(lead.companyName);
          
          let companyId: string;
          
          if (existingCompany.results && existingCompany.results.length > 0) {
            companyId = existingCompany.results[0].id;
            
            // Update existing company with new data
            const updateData = {
              industry: lead.industry,
              state: lead.location,
              domain: lead.website,
              numberofemployees: lead.size,
              hs_lead_status: 'NEW',
            };
            
            await hubspotService.updateCompany(companyId, updateData);
          } else {
            // Create new company
            const companyData = {
              name: lead.companyName,
              industry: lead.industry,
              state: lead.location,
              domain: lead.website,
              numberofemployees: lead.size || 'Unknown',
            };
            
            const newCompany = await hubspotService.createCompany(companyData);
            companyId = newCompany.id;
          }

          // Create contact if available
          if (lead.contact && lead.contact.email) {
            const existingContact = await hubspotService.searchContactByEmail(lead.contact.email);
            
            if (!existingContact.results || existingContact.results.length === 0) {
              const nameParts = lead.contact.name.split(' ');
              const firstname = nameParts[0] || '';
              const lastname = nameParts.slice(1).join(' ') || '';
              
              const contactData = {
                email: lead.contact.email,
                firstname: firstname,
                lastname: lastname,
                jobtitle: lead.contact.title,
                company: lead.companyName,
                hs_lead_status: 'NEW',
              };
              
              const newContact = await hubspotService.createContact(contactData);
              
              // Associate contact with company
              await hubspotService.associateContactWithCompany(newContact.id, companyId);
            }
          }

          // Create a note about the lead source
          await hubspotService.createNote(
            `Lead sourced from LinkedIn search on ${new Date(lead.foundAt).toLocaleDateString()}. Industry: ${lead.industry}. Location: ${lead.location}.${lead.description ? ` Description: ${lead.description}` : ''}`,
            'company',
            companyId
          );

          // Mark lead as synced
          leadStore.markAsSynced(leadId, companyId);

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to sync lead: ${errorMessage}`);
          console.error('Lead sync error:', error);
          return false;
        }
      },

      syncAllCompanies: async () => {
        const { setSyncing, clearSyncErrors } = get();
        
        setSyncing(true);
        clearSyncErrors();
        
        try {
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          const companyStore = useCompanyStore.getState();
          
          for (const company of companyStore.companies) {
            await get().syncCompany(company.id);
          }
          
          set(state => ({
            syncStatus: {
              ...state.syncStatus,
              lastSync: new Date().toISOString(),
              isSyncing: false,
            }
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          get().addSyncError(`Bulk sync failed: ${errorMessage}`);
          setSyncing(false);
        }
      },

      syncAllContacts: async () => {
        const { setSyncing, clearSyncErrors } = get();
        
        setSyncing(true);
        clearSyncErrors();
        
        try {
          const { useContactStore } = await import('@/hooks/useContactStore');
          const contactStore = useContactStore.getState();
          
          for (const contact of contactStore.contacts) {
            await get().syncContact(contact.id);
          }
          
          set(state => ({
            syncStatus: {
              ...state.syncStatus,
              lastSync: new Date().toISOString(),
              isSyncing: false,
            }
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          get().addSyncError(`Bulk sync failed: ${errorMessage}`);
          setSyncing(false);
        }
      },

      createDealFromPermit: async (permitId) => {
        const { addSyncError } = get();
        
        try {
          const { usePermitStore } = await import('@/hooks/usePermitStore');
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          const { useContactStore } = await import('@/hooks/useContactStore');
          
          const permitStore = usePermitStore.getState();
          const companyStore = useCompanyStore.getState();
          const contactStore = useContactStore.getState();
          
          const permit = permitStore.permits.find((p: Permit) => p.id === permitId);
          if (!permit) {
            addSyncError(`Permit ${permitId} not found`);
            return false;
          }

          const company = companyStore.companies.find((c: Company) => c.id === permit.companyId);
          const companyContacts = contactStore.contacts.filter((c: Contact) => c.companyId === permit.companyId);

          const dealData = {
            dealname: `${company?.name || 'Unknown'} - ${permit.formationTarget} Opportunity`,
            dealstage: 'appointmentscheduled',
            pipeline: 'default',
            deal_type: 'New Permit Opportunity',
            formation_target: permit.formationTarget,
            permit_location: `${permit.county} County, ${permit.state}`,
            closedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
          };

          const newDeal = await hubspotService.createDeal(dealData);

          // Associate with company
          if (company) {
            const existingCompany = await hubspotService.searchCompanyByName(company.name);
            if (existingCompany.results && existingCompany.results.length > 0) {
              await hubspotService.associateDealWithCompany(newDeal.id, existingCompany.results[0].id);
            }
          }

          // Associate with primary contact
          if (companyContacts.length > 0) {
            const primaryContact = companyContacts.find((c: Contact) => c.title.includes('Chief') || c.title.includes('VP')) 
                                 || companyContacts[0];
            
            const existingContact = await hubspotService.searchContactByEmail(primaryContact.email);
            if (existingContact.results && existingContact.results.length > 0) {
              await hubspotService.associateDealWithContact(newDeal.id, existingContact.results[0].id);
            }
          }

          // Add note about the permit
          await hubspotService.createNote(
            `New drilling permit filed for ${permit.formationTarget} in ${permit.county} County, ${permit.state}. Filed on ${permit.filingDate}. Location: Section ${permit.location.section}-${permit.location.township}-${permit.location.range}`,
            'deal',
            newDeal.id
          );

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to create deal: ${errorMessage}`);
          return false;
        }
      },

      setSyncing: (isSyncing) => {
        set(state => ({
          syncStatus: { ...state.syncStatus, isSyncing }
        }));
      },

      addSyncError: (error) => {
        set(state => ({
          syncStatus: {
            ...state.syncStatus,
            syncErrors: [...state.syncStatus.syncErrors, error]
          }
        }));
      },

      clearSyncErrors: () => {
        set(state => ({
          syncStatus: { ...state.syncStatus, syncErrors: [] }
        }));
      },
    }),
    {
      name: 'hubspot-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ config: state.config }),
    }
  )
);