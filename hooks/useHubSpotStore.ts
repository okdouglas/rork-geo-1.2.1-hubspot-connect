import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hubspotService, HubSpotConfig, SyncResult } from '@/services/hubspot';
import { Company } from '@/types';
import { Contact } from '@/types';
import { Permit } from '@/types';
import { Lead } from '@/types/lead';

interface HubSpotSyncStatus {
  isConfigured: boolean;
  lastSync: string | null;
  isSyncing: boolean;
  syncErrors: string[];
  syncWarnings: string[];
}

interface SyncResultSummary {
  success: boolean;
  warnings: string[];
  errors: string[];
  hubspotId?: string;
}

interface HubSpotStore {
  config: HubSpotConfig | null;
  syncStatus: HubSpotSyncStatus;
  setConfig: (config: HubSpotConfig) => void;
  clearConfig: () => void;
  testConnection: () => Promise<boolean>;
  syncCompany: (companyId: string) => Promise<SyncResultSummary>;
  syncContact: (contactId: string) => Promise<SyncResultSummary>;
  syncLeadToHubSpot: (leadId: string) => Promise<SyncResultSummary>;
  syncAllCompanies: () => Promise<void>;
  syncAllContacts: () => Promise<void>;
  createDealFromPermit: (permitId: string) => Promise<SyncResultSummary>;
  setSyncing: (isSyncing: boolean) => void;
  addSyncError: (error: string) => void;
  addSyncWarning: (warning: string) => void;
  clearSyncErrors: () => void;
  clearSyncWarnings: () => void;
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
        syncWarnings: [],
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
            syncWarnings: [],
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

      syncCompany: async (companyId): Promise<SyncResultSummary> => {
        const { addSyncError, addSyncWarning } = get();
        
        try {
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          const companyStore = useCompanyStore.getState();
          const company = companyStore.companies.find((c: Company) => c.id === companyId);
          
          if (!company) {
            const error = `Company ${companyId} not found`;
            addSyncError(error);
            return { success: false, errors: [error], warnings: [] };
          }

          // Check if company already exists in HubSpot
          const existingCompany = await hubspotService.searchCompanyByName(company.name);
          
          const hubspotData = {
            name: company.name,
            industry: 'Oil & Gas',
            state: company.state,
            numberofemployees: company.size === 'Small' ? '1-10' : 
                              company.size === 'Medium' ? '11-50' : '51-200',
            primary_formation: company.primaryFormation,
            drilling_activity_level: company.drillingActivityLevel,
            geological_staff_size: company.geologicalStaffSize.toString(),
            recent_permits_count: company.recentPermitsCount.toString(),
            last_permit_date: company.lastPermitDate,
            status: company.status,
          };

          let result: SyncResult;

          if (existingCompany.results && existingCompany.results.length > 0) {
            result = await hubspotService.updateCompanyWithFallback(existingCompany.results[0].id, hubspotData);
          } else {
            result = await hubspotService.createCompanyWithFallback(hubspotData);
          }

          // Handle warnings for failed fields
          if (result.errors.length > 0) {
            result.errors.forEach(error => addSyncError(error));
          }

          if (Object.keys(result.failedFields).length > 0) {
            const failedFieldNames = Object.keys(result.failedFields).join(', ');
            const warning = `Some fields stored as notes: ${failedFieldNames}`;
            addSyncWarning(warning);
          }

          return {
            success: result.success,
            warnings: Object.keys(result.failedFields).length > 0 ? 
              [`Some data stored as notes due to field restrictions`] : [],
            errors: result.errors,
            hubspotId: result.id
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to sync company: ${errorMessage}`);
          console.error('Company sync error:', error);
          return { success: false, errors: [errorMessage], warnings: [] };
        }
      },

      syncContact: async (contactId): Promise<SyncResultSummary> => {
        const { addSyncError, addSyncWarning } = get();
        
        try {
          const { useContactStore } = await import('@/hooks/useContactStore');
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          
          const contactStore = useContactStore.getState();
          const companyStore = useCompanyStore.getState();
          
          const contact = contactStore.contacts.find((c: Contact) => c.id === contactId);
          if (!contact) {
            const error = `Contact ${contactId} not found`;
            addSyncError(error);
            return { success: false, errors: [error], warnings: [] };
          }

          const company = companyStore.companies.find((c: Company) => c.id === contact.companyId);

          // Check if contact already exists
          const existingContact = await hubspotService.searchContactByEmail(contact.email);
          
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
            hs_lead_status: 'NEW',
            geological_expertise: contact.expertise.join(', '),
            years_experience: contact.yearsExperience?.toString(),
            education: contact.education,
            last_contact_date: contact.lastContactDate,
          };

          let result: SyncResult;
          let contactHubSpotId: string;

          if (existingContact.results && existingContact.results.length > 0) {
            contactHubSpotId = existingContact.results[0].id;
            result = await hubspotService.updateContactWithFallback(contactHubSpotId, hubspotData);
          } else {
            result = await hubspotService.createContactWithFallback(hubspotData);
            contactHubSpotId = result.id!;
            
            // Associate with company if it exists
            if (company) {
              try {
                const existingCompany = await hubspotService.searchCompanyByName(company.name);
                if (existingCompany.results && existingCompany.results.length > 0) {
                  await hubspotService.associateContactWithCompany(
                    contactHubSpotId, 
                    existingCompany.results[0].id
                  );
                }
              } catch (associationError) {
                const associationErrorMessage = associationError instanceof Error ? associationError.message : 'Unknown error occurred';
                addSyncWarning(`Contact synced but association failed: ${associationErrorMessage}`);
              }
            }
          }

          // Handle warnings for failed fields
          if (result.errors.length > 0) {
            result.errors.forEach(error => addSyncError(error));
          }

          if (Object.keys(result.failedFields).length > 0) {
            const failedFieldNames = Object.keys(result.failedFields).join(', ');
            const warning = `Some contact fields stored as notes: ${failedFieldNames}`;
            addSyncWarning(warning);
          }

          return {
            success: result.success,
            warnings: Object.keys(result.failedFields).length > 0 ? 
              [`Some data stored as notes due to field restrictions`] : [],
            errors: result.errors,
            hubspotId: contactHubSpotId
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to sync contact: ${errorMessage}`);
          console.error('Contact sync error:', error);
          return { success: false, errors: [errorMessage], warnings: [] };
        }
      },

      syncLeadToHubSpot: async (leadId): Promise<SyncResultSummary> => {
        const { addSyncError, addSyncWarning } = get();
        
        try {
          const { useLeadSourcingStore } = await import('@/hooks/useLeadSourcingStore');
          const leadStore = useLeadSourcingStore.getState();
          const lead = leadStore.leads.find((l: Lead) => l.id === leadId);
          
          if (!lead) {
            const error = `Lead ${leadId} not found`;
            addSyncError(error);
            return { success: false, errors: [error], warnings: [] };
          }

          // Check if company already exists in HubSpot
          const existingCompany = await hubspotService.searchCompanyByName(lead.companyName);
          
          let companyId: string;
          let companyResult: SyncResult;
          
          if (existingCompany.results && existingCompany.results.length > 0) {
            companyId = existingCompany.results[0].id;
            
            // Update existing company with new data
            const updateData = {
              name: lead.companyName,
              industry: lead.industry || 'Oil & Gas',
              state: lead.location || 'Unknown',
              domain: lead.website,
              numberofemployees: lead.size || 'Unknown',
              description: lead.description,
            };
            
            companyResult = await hubspotService.updateCompanyWithFallback(companyId, updateData);
          } else {
            // Create new company
            const companyData = {
              name: lead.companyName,
              industry: lead.industry || 'Oil & Gas',
              state: lead.location || 'Unknown',
              domain: lead.website,
              numberofemployees: lead.size || 'Unknown',
              description: lead.description,
            };
            
            companyResult = await hubspotService.createCompanyWithFallback(companyData);
            companyId = companyResult.id!;
          }

          const warnings: string[] = [];
          const errors: string[] = [];

          // Handle company sync results
          if (companyResult.errors.length > 0) {
            companyResult.errors.forEach(error => {
              addSyncError(error);
              errors.push(error);
            });
          }

          if (Object.keys(companyResult.failedFields).length > 0) {
            const warning = `Some company data stored as notes due to field restrictions`;
            addSyncWarning(warning);
            warnings.push(warning);
          }

          // Create contact if available
          if (lead.contact && lead.contact.email) {
            try {
              const existingContact = await hubspotService.searchContactByEmail(lead.contact.email);
              
              if (!existingContact.results || existingContact.results.length === 0) {
                const nameParts = lead.contact.name.split(' ');
                const firstname = nameParts[0] || '';
                const lastname = nameParts.slice(1).join(' ') || '';
                
                const contactData = {
                  email: lead.contact.email,
                  firstname: firstname,
                  lastname: lastname,
                  jobtitle: lead.contact.title || 'Unknown',
                  company: lead.companyName,
                  hs_lead_status: 'NEW',
                };
                
                const contactResult = await hubspotService.createContactWithFallback(contactData);
                
                if (contactResult.success && contactResult.id) {
                  // Associate contact with company
                  try {
                    await hubspotService.associateContactWithCompany(contactResult.id, companyId);
                  } catch (associationError) {
                    const associationErrorMessage = associationError instanceof Error ? associationError.message : 'Unknown error occurred';
                    const warning = `Contact created but association failed: ${associationErrorMessage}`;
                    addSyncWarning(warning);
                    warnings.push(warning);
                  }
                }

                // Handle contact sync results
                if (contactResult.errors.length > 0) {
                  contactResult.errors.forEach(error => {
                    addSyncError(error);
                    errors.push(error);
                  });
                }

                if (Object.keys(contactResult.failedFields).length > 0) {
                  const warning = `Some contact data stored as notes due to field restrictions`;
                  addSyncWarning(warning);
                  warnings.push(warning);
                }
              }
            } catch (contactError) {
              const contactErrorMessage = contactError instanceof Error ? contactError.message : 'Unknown error occurred';
              const warning = `Company synced but contact creation failed: ${contactErrorMessage}`;
              addSyncWarning(warning);
              warnings.push(warning);
            }
          }

          // Create a note about the lead source
          try {
            const noteContent = `Lead sourced from LinkedIn search on ${new Date(lead.foundAt).toLocaleDateString()}.
Industry: ${lead.industry || 'Oil & Gas'}
Location: ${lead.location || 'Unknown'}
${lead.description ? `Description: ${lead.description}` : ''}
${lead.website ? `Website: ${lead.website}` : ''}`;

            await hubspotService.createNote(noteContent, 'company', companyId);
          } catch (noteError) {
            const noteErrorMessage = noteError instanceof Error ? noteError.message : 'Unknown error occurred';
            const warning = `Lead synced but note creation failed: ${noteErrorMessage}`;
            addSyncWarning(warning);
            warnings.push(warning);
          }

          // Mark lead as synced
          try {
            leadStore.markAsSynced(leadId, companyId);
          } catch (markError) {
            console.error('Failed to mark lead as synced:', markError);
          }

          return {
            success: companyResult.success,
            warnings,
            errors,
            hubspotId: companyId
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to sync lead: ${errorMessage}`);
          console.error('Lead sync error:', error);
          return { success: false, errors: [errorMessage], warnings: [] };
        }
      },

      syncAllCompanies: async () => {
        const { setSyncing, clearSyncErrors, clearSyncWarnings } = get();
        
        setSyncing(true);
        clearSyncErrors();
        clearSyncWarnings();
        
        try {
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          const companyStore = useCompanyStore.getState();
          
          for (const company of companyStore.companies) {
            await get().syncCompany(company.id);
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
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
        const { setSyncing, clearSyncErrors, clearSyncWarnings } = get();
        
        setSyncing(true);
        clearSyncErrors();
        clearSyncWarnings();
        
        try {
          const { useContactStore } = await import('@/hooks/useContactStore');
          const contactStore = useContactStore.getState();
          
          for (const contact of contactStore.contacts) {
            await get().syncContact(contact.id);
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
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

      createDealFromPermit: async (permitId): Promise<SyncResultSummary> => {
        const { addSyncError, addSyncWarning } = get();
        
        try {
          const { usePermitStore } = await import('@/hooks/usePermitStore');
          const { useCompanyStore } = await import('@/hooks/useCompanyStore');
          const { useContactStore } = await import('@/hooks/useContactStore');
          
          const permitStore = usePermitStore.getState();
          const companyStore = useCompanyStore.getState();
          const contactStore = useContactStore.getState();
          
          const permit = permitStore.permits.find((p: Permit) => p.id === permitId);
          if (!permit) {
            const error = `Permit ${permitId} not found`;
            addSyncError(error);
            return { success: false, errors: [error], warnings: [] };
          }

          const company = companyStore.companies.find((c: Company) => c.id === permit.companyId);
          const companyContacts = contactStore.contacts.filter((c: Contact) => c.companyId === permit.companyId);

          const dealData = {
            dealname: `${company?.name || 'Unknown'} - ${permit.formationTarget} Opportunity`,
            dealstage: 'appointmentscheduled',
            pipeline: 'default',
            closedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            deal_type: 'New Permit Opportunity',
            formation_target: permit.formationTarget,
            permit_location: `${permit.county} County, ${permit.state}`,
          };

          const newDeal = await hubspotService.createDeal(dealData);
          const warnings: string[] = [];

          // Associate with company
          if (company) {
            try {
              const existingCompany = await hubspotService.searchCompanyByName(company.name);
              if (existingCompany.results && existingCompany.results.length > 0) {
                await hubspotService.associateDealWithCompany(newDeal.id, existingCompany.results[0].id);
              }
            } catch (associationError) {
              const associationErrorMessage = associationError instanceof Error ? associationError.message : 'Unknown error occurred';
              const warning = `Deal created but company association failed: ${associationErrorMessage}`;
              addSyncWarning(warning);
              warnings.push(warning);
            }
          }

          // Associate with primary contact
          if (companyContacts.length > 0) {
            try {
              const primaryContact = companyContacts.find((c: Contact) => c.title.includes('Chief') || c.title.includes('VP')) 
                                   || companyContacts[0];
              
              const existingContact = await hubspotService.searchContactByEmail(primaryContact.email);
              if (existingContact.results && existingContact.results.length > 0) {
                await hubspotService.associateDealWithContact(newDeal.id, existingContact.results[0].id);
              }
            } catch (associationError) {
              const associationErrorMessage = associationError instanceof Error ? associationError.message : 'Unknown error occurred';
              const warning = `Deal created but contact association failed: ${associationErrorMessage}`;
              addSyncWarning(warning);
              warnings.push(warning);
            }
          }

          // Add note about the permit
          try {
            const noteContent = `New drilling permit filed for ${permit.formationTarget} in ${permit.county} County, ${permit.state}.
Filed on: ${permit.filingDate}
Location: Section ${permit.location.section}-${permit.location.township}-${permit.location.range}
Permit Type: ${permit.type}
Status: ${permit.status}`;

            await hubspotService.createNote(noteContent, 'deal', newDeal.id);
          } catch (noteError) {
            const noteErrorMessage = noteError instanceof Error ? noteError.message : 'Unknown error occurred';
            const warning = `Deal created but note creation failed: ${noteErrorMessage}`;
            addSyncWarning(warning);
            warnings.push(warning);
          }

          return {
            success: true,
            warnings,
            errors: [],
            hubspotId: newDeal.id
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          addSyncError(`Failed to create deal: ${errorMessage}`);
          console.error('Deal creation error:', error);
          return { success: false, errors: [errorMessage], warnings: [] };
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

      addSyncWarning: (warning) => {
        set(state => ({
          syncStatus: {
            ...state.syncStatus,
            syncWarnings: [...state.syncStatus.syncWarnings, warning]
          }
        }));
      },

      clearSyncErrors: () => {
        set(state => ({
          syncStatus: { ...state.syncStatus, syncErrors: [] }
        }));
      },

      clearSyncWarnings: () => {
        set(state => ({
          syncStatus: { ...state.syncStatus, syncWarnings: [] }
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