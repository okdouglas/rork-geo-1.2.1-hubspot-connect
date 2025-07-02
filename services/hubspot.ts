interface HubSpotConfig {
  accessToken: string;
  portalId: string;
}

interface HubSpotContact {
  email: string;
  firstname: string;
  lastname: string;
  jobtitle: string;
  phone?: string;
  company: string;
  hs_lead_status?: string;
  geological_expertise?: string;
  years_experience?: string;
  education?: string;
  last_contact_date?: string;
}

interface HubSpotCompany {
  name: string;
  domain?: string;
  industry: string;
  numberofemployees?: string;
  state: string;
  city?: string;
  phone?: string;
  website?: string;
  description?: string;
  // Custom properties - only set if they exist in HubSpot
  primary_formation?: string;
  drilling_activity_level?: string;
  geological_staff_size?: string;
  recent_permits_count?: string;
  last_permit_date?: string;
  status?: string;
}

interface HubSpotDeal {
  dealname: string;
  amount?: string;
  dealstage: string;
  pipeline: string;
  closedate?: string;
  deal_type?: string;
  formation_target?: string;
  permit_location?: string;
}

interface SyncResult {
  success: boolean;
  id?: string;
  failedFields: { [key: string]: any };
  errors: string[];
}

class HubSpotService {
  private config: HubSpotConfig | null = null;
  private baseUrl = 'https://api.hubapi.com';

  setConfig(config: HubSpotConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH' = 'GET', data?: any) {
    if (!this.config) {
      throw new Error('HubSpot not configured');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HubSpot API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HubSpot API request failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  }

  // Enhanced method to try syncing fields individually and collect failures
  private async syncWithFallback(
    endpoint: string, 
    method: 'POST' | 'PATCH',
    allProperties: { [key: string]: any },
    coreFields: string[]
  ): Promise<SyncResult> {
    const failedFields: { [key: string]: any } = {};
    const errors: string[] = [];
    let recordId: string | undefined;

    // First, try with core fields only
    const coreProperties: { [key: string]: any } = {};
    coreFields.forEach(field => {
      if (allProperties[field] !== undefined) {
        coreProperties[field] = allProperties[field];
      }
    });

    try {
      const result = await this.makeRequest(endpoint, method, { properties: coreProperties });
      recordId = result.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      errors.push(`Core fields failed: ${errorMessage}`);
      
      // If core fields fail, try with just the most essential field
      const essentialField = coreFields[0];
      if (allProperties[essentialField]) {
        try {
          const result = await this.makeRequest(endpoint, method, { 
            properties: { [essentialField]: allProperties[essentialField] } 
          });
          recordId = result.id;
          
          // Mark all other core fields as failed
          coreFields.slice(1).forEach(field => {
            if (allProperties[field] !== undefined) {
              failedFields[field] = allProperties[field];
            }
          });
        } catch (essentialError) {
          const essentialErrorMessage = essentialError instanceof Error ? essentialError.message : 'Unknown error occurred';
          errors.push(`Essential field failed: ${essentialErrorMessage}`);
          return { success: false, failedFields: allProperties, errors };
        }
      } else {
        return { success: false, failedFields: allProperties, errors };
      }
    }

    // Now try to update with additional fields one by one
    const remainingFields = Object.keys(allProperties).filter(field => !coreFields.includes(field));
    
    for (const field of remainingFields) {
      if (allProperties[field] !== undefined && recordId) {
        try {
          await this.makeRequest(`${endpoint}/${recordId}`, 'PATCH', {
            properties: { [field]: allProperties[field] }
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          failedFields[field] = allProperties[field];
          errors.push(`Field '${field}' failed: ${errorMessage}`);
        }
      }
    }

    return {
      success: true,
      id: recordId,
      failedFields,
      errors
    };
  }

  // Helper method to create comprehensive notes from failed fields and permit data
  private createPermitNote(permitData: any, failedFields: { [key: string]: any } = {}): string {
    const noteLines = ['Drilling Permit Details:'];
    
    // Core permit information
    if (permitData.operatorName) noteLines.push(`Operator: ${permitData.operatorName}`);
    if (permitData.apiNumber) noteLines.push(`API Number: ${permitData.apiNumber}`);
    if (permitData.wellType) noteLines.push(`Well Type: ${permitData.wellType}`);
    if (permitData.location?.county && permitData.location?.state) {
      noteLines.push(`County: ${permitData.location.county}, ${permitData.location.state}`);
    }
    if (permitData.filingDate) noteLines.push(`Permit Date: ${permitData.filingDate}`);
    if (permitData.formation) noteLines.push(`Formation: ${permitData.formation}`);
    if (permitData.depth) noteLines.push(`Depth: ${permitData.depth} ft`);
    if (permitData.status) noteLines.push(`Status: ${permitData.status}`);
    
    // Location details
    if (permitData.location?.section || permitData.location?.township || permitData.location?.range) {
      const locationParts = [];
      if (permitData.location.section) locationParts.push(`Sec ${permitData.location.section}`);
      if (permitData.location.township) locationParts.push(`${permitData.location.township}`);
      if (permitData.location.range) locationParts.push(`${permitData.location.range}`);
      if (locationParts.length > 0) {
        noteLines.push(`Location: ${locationParts.join('-')}`);
      }
    }
    
    // Permit source link
    const permitUrl = this.getPermitUrl(permitData);
    if (permitUrl) {
      noteLines.push(`Source: ${permitUrl}`);
    }
    
    // Failed fields if any
    if (Object.keys(failedFields).length > 0) {
      noteLines.push('');
      noteLines.push('Additional Data (Field Restrictions):');
      Object.entries(failedFields).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        noteLines.push(`• ${formattedKey}: ${value}`);
      });
    }

    noteLines.push('');
    noteLines.push(`Synced on: ${new Date().toLocaleDateString()}`);
    
    return noteLines.join('\n');
  }

  private getPermitUrl(permitData: any): string {
    if (permitData.location?.state === 'Oklahoma' && permitData.apiNumber) {
      return `https://ogwellbore.occ.ok.gov/WellBrowse.aspx?APINumber=${permitData.apiNumber}`;
    } else if (permitData.location?.state === 'Kansas' && permitData.apiNumber) {
      return `https://www.kgs.ku.edu/Magellan/Qualified/index.html?api=${permitData.apiNumber}`;
    }
    return '';
  }

  // Enhanced company creation with fallback
  async createCompanyWithFallback(companyData: HubSpotCompany): Promise<SyncResult> {
    const coreFields = ['name', 'industry', 'state'];
    const allProperties = this.createSafeCompanyProperties(companyData);
    
    const result = await this.syncWithFallback(
      '/crm/v3/objects/companies',
      'POST',
      allProperties,
      coreFields
    );

    // If there are failed fields, create a note
    if (result.success && result.id && Object.keys(result.failedFields).length > 0) {
      try {
        const noteContent = this.createFailedFieldsNote(result.failedFields, 'Company');
        await this.createNote(noteContent, 'company', result.id);
      } catch (noteError) {
        const noteErrorMessage = noteError instanceof Error ? noteError.message : 'Unknown error occurred';
        result.errors.push(`Failed to create note: ${noteErrorMessage}`);
      }
    }

    return result;
  }

  // Enhanced contact creation with fallback
  async createContactWithFallback(contactData: HubSpotContact): Promise<SyncResult> {
    const coreFields = ['email', 'firstname', 'lastname'];
    const allProperties = this.createSafeContactProperties(contactData);
    
    const result = await this.syncWithFallback(
      '/crm/v3/objects/contacts',
      'POST',
      allProperties,
      coreFields
    );

    // If there are failed fields, create a note
    if (result.success && result.id && Object.keys(result.failedFields).length > 0) {
      try {
        const noteContent = this.createFailedFieldsNote(result.failedFields, 'Contact');
        await this.createNote(noteContent, 'contact', result.id);
      } catch (noteError) {
        const noteErrorMessage = noteError instanceof Error ? noteError.message : 'Unknown error occurred';
        result.errors.push(`Failed to create note: ${noteErrorMessage}`);
      }
    }

    return result;
  }

  // Enhanced permit-to-deal creation
  async createDealFromPermitWithFallback(permitData: any): Promise<SyncResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Create deal name from permit data
      const dealName = `${permitData.operatorName} - ${permitData.formation || 'Drilling'} Opportunity`;
      
      const dealData = {
        dealname: dealName,
        dealstage: 'appointmentscheduled',
        pipeline: 'default',
        closedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const newDeal = await this.makeRequest('/crm/v3/objects/deals', 'POST', { properties: dealData });
      
      // Create comprehensive note with all permit details
      try {
        const noteContent = this.createPermitNote(permitData);
        await this.createNote(noteContent, 'deal', newDeal.id);
      } catch (noteError) {
        const noteErrorMessage = noteError instanceof Error ? noteError.message : 'Unknown error occurred';
        warnings.push(`Deal created but note creation failed: ${noteErrorMessage}`);
      }

      // Try to find and associate with company
      try {
        const existingCompany = await this.searchCompanyByName(permitData.operatorName);
        if (existingCompany.results && existingCompany.results.length > 0) {
          await this.associateDealWithCompany(newDeal.id, existingCompany.results[0].id);
        } else {
          // Create company if it doesn't exist
          const companyData: HubSpotCompany = {
            name: permitData.operatorName,
            industry: 'Oil & Gas',
            state: permitData.location?.state || 'Unknown',
            description: `Oil & Gas operator with recent drilling permits`
          };
          
          const companyResult = await this.createCompanyWithFallback(companyData);
          if (companyResult.success && companyResult.id) {
            await this.associateDealWithCompany(newDeal.id, companyResult.id);
          }
        }
      } catch (associationError) {
        const associationErrorMessage = associationError instanceof Error ? associationError.message : 'Unknown error occurred';
        warnings.push(`Deal created but company association failed: ${associationErrorMessage}`);
      }

      return {
        success: true,
        id: newDeal.id,
        failedFields: {},
        errors: warnings // Treat warnings as non-critical errors
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      errors.push(`Failed to create deal: ${errorMessage}`);
      return { success: false, failedFields: {}, errors };
    }
  }

  // Enhanced update methods
  async updateCompanyWithFallback(hubspotId: string, companyData: Partial<HubSpotCompany>): Promise<SyncResult> {
    const coreFields = ['name'];
    const allProperties = this.createSafeCompanyProperties(companyData as HubSpotCompany);
    
    const result = await this.syncWithFallback(
      `/crm/v3/objects/companies`,
      'PATCH',
      allProperties,
      coreFields
    );

    result.id = hubspotId; // For updates, we already know the ID

    // If there are failed fields, create a note
    if (result.success && Object.keys(result.failedFields).length > 0) {
      try {
        const noteContent = this.createFailedFieldsNote(result.failedFields, 'Company Update');
        await this.createNote(noteContent, 'company', hubspotId);
      } catch (noteError) {
        const noteErrorMessage = noteError instanceof Error ? noteError.message : 'Unknown error occurred';
        result.errors.push(`Failed to create note: ${noteErrorMessage}`);
      }
    }

    return result;
  }

  async updateContactWithFallback(hubspotId: string, contactData: Partial<HubSpotContact>): Promise<SyncResult> {
    const coreFields = ['email'];
    const allProperties = this.createSafeContactProperties(contactData as HubSpotContact);
    
    const result = await this.syncWithFallback(
      `/crm/v3/objects/contacts`,
      'PATCH',
      allProperties,
      coreFields
    );

    result.id = hubspotId; // For updates, we already know the ID

    // If there are failed fields, create a note
    if (result.success && Object.keys(result.failedFields).length > 0) {
      try {
        const noteContent = this.createFailedFieldsNote(result.failedFields, 'Contact Update');
        await this.createNote(noteContent, 'contact', hubspotId);
      } catch (noteError) {
        const noteErrorMessage = noteError instanceof Error ? noteError.message : 'Unknown error occurred';
        result.errors.push(`Failed to create note: ${noteErrorMessage}`);
      }
    }

    return result;
  }

  // Helper method to create comprehensive notes from failed fields
  private createFailedFieldsNote(failedFields: { [key: string]: any }, recordType: string): string {
    if (Object.keys(failedFields).length === 0) return '';

    const noteLines = [`Additional ${recordType} Data (Auto-synced):`];
    
    Object.entries(failedFields).forEach(([key, value]) => {
      const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      noteLines.push(`• ${formattedKey}: ${value}`);
    });

    noteLines.push('');
    noteLines.push(`Synced on: ${new Date().toLocaleDateString()}`);
    
    return noteLines.join('\n');
  }

  // Keep original methods for backward compatibility
  private createSafeCompanyProperties(companyData: HubSpotCompany) {
    const standardProperties: any = {
      name: companyData.name,
      industry: companyData.industry,
      state: companyData.state,
    };

    if (companyData.domain) standardProperties.domain = companyData.domain;
    if (companyData.numberofemployees) standardProperties.numberofemployees = companyData.numberofemployees;
    if (companyData.city) standardProperties.city = companyData.city;
    if (companyData.phone) standardProperties.phone = companyData.phone;
    if (companyData.website) standardProperties.website = companyData.website;

    const customData = [];
    if (companyData.primary_formation) customData.push(`Primary Formation: ${companyData.primary_formation}`);
    if (companyData.drilling_activity_level) customData.push(`Drilling Activity: ${companyData.drilling_activity_level}`);
    if (companyData.geological_staff_size) customData.push(`Geological Staff: ${companyData.geological_staff_size}`);
    if (companyData.recent_permits_count) customData.push(`Recent Permits: ${companyData.recent_permits_count}`);
    if (companyData.last_permit_date) customData.push(`Last Permit Date: ${companyData.last_permit_date}`);
    if (companyData.status) customData.push(`Status: ${companyData.status}`);

    if (customData.length > 0) {
      const existingDescription = companyData.description || '';
      standardProperties.description = existingDescription + 
        (existingDescription ? '\n\n' : '') + 
        'Geological Data:\n' + customData.join('\n');
    } else if (companyData.description) {
      standardProperties.description = companyData.description;
    }

    return standardProperties;
  }

  private createSafeContactProperties(contactData: HubSpotContact) {
    const standardProperties: any = {
      email: contactData.email,
      firstname: contactData.firstname,
      lastname: contactData.lastname,
      jobtitle: contactData.jobtitle,
      company: contactData.company,
    };

    if (contactData.phone) standardProperties.phone = contactData.phone;
    if (contactData.hs_lead_status) standardProperties.hs_lead_status = contactData.hs_lead_status;

    const customData = [];
    if (contactData.geological_expertise) customData.push(`Expertise: ${contactData.geological_expertise}`);
    if (contactData.years_experience) customData.push(`Experience: ${contactData.years_experience} years`);
    if (contactData.education) customData.push(`Education: ${contactData.education}`);
    if (contactData.last_contact_date) customData.push(`Last Contact: ${contactData.last_contact_date}`);

    if (customData.length > 0) {
      standardProperties.notes_last_contacted = customData.join('; ');
    }

    return standardProperties;
  }

  // Original methods - now use fallback versions internally
  async createCompany(companyData: HubSpotCompany) {
    const result = await this.createCompanyWithFallback(companyData);
    if (!result.success) {
      throw new Error(result.errors.join('; '));
    }
    return { id: result.id };
  }

  async updateCompany(hubspotId: string, companyData: Partial<HubSpotCompany>) {
    const result = await this.updateCompanyWithFallback(hubspotId, companyData);
    if (!result.success) {
      throw new Error(result.errors.join('; '));
    }
    return { id: result.id };
  }

  async createContact(contactData: HubSpotContact) {
    const result = await this.createContactWithFallback(contactData);
    if (!result.success) {
      throw new Error(result.errors.join('; '));
    }
    return { id: result.id };
  }

  async updateContact(hubspotId: string, contactData: Partial<HubSpotContact>) {
    const result = await this.updateContactWithFallback(hubspotId, contactData);
    if (!result.success) {
      throw new Error(result.errors.join('; '));
    }
    return { id: result.id };
  }

  async searchCompanyByName(name: string) {
    const searchData = {
      filterGroups: [{
        filters: [{
          propertyName: 'name',
          operator: 'EQ',
          value: name
        }]
      }]
    };

    return this.makeRequest('/crm/v3/objects/companies/search', 'POST', searchData);
  }

  async searchContactByEmail(email: string) {
    const searchData = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email
        }]
      }]
    };

    return this.makeRequest('/crm/v3/objects/contacts/search', 'POST', searchData);
  }

  // Deal Methods
  async createDeal(dealData: HubSpotDeal) {
    const properties: any = {
      dealname: dealData.dealname,
      dealstage: dealData.dealstage,
      pipeline: dealData.pipeline,
    };

    if (dealData.amount) properties.amount = dealData.amount;
    if (dealData.closedate) properties.closedate = dealData.closedate;

    const customData = [];
    if (dealData.deal_type) customData.push(`Type: ${dealData.deal_type}`);
    if (dealData.formation_target) customData.push(`Formation: ${dealData.formation_target}`);
    if (dealData.permit_location) customData.push(`Location: ${dealData.permit_location}`);

    if (customData.length > 0) {
      properties.description = customData.join('\n');
    }

    return this.makeRequest('/crm/v3/objects/deals', 'POST', { properties });
  }

  // Association Methods
  async associateContactWithCompany(contactId: string, companyId: string) {
    const associationData = {
      from: { id: contactId },
      to: { id: companyId },
      type: 'contact_to_company'
    };

    return this.makeRequest('/crm/v3/associations/contacts/companies/batch/create', 'POST', {
      inputs: [associationData]
    });
  }

  async associateDealWithCompany(dealId: string, companyId: string) {
    const associationData = {
      from: { id: dealId },
      to: { id: companyId },
      type: 'deal_to_company'
    };

    return this.makeRequest('/crm/v3/associations/deals/companies/batch/create', 'POST', {
      inputs: [associationData]
    });
  }

  async associateDealWithContact(dealId: string, contactId: string) {
    const associationData = {
      from: { id: dealId },
      to: { id: contactId },
      type: 'deal_to_contact'
    };

    return this.makeRequest('/crm/v3/associations/deals/contacts/batch/create', 'POST', {
      inputs: [associationData]
    });
  }

  // Activity/Note Methods
  async createNote(content: string, associatedObjectType: 'company' | 'contact' | 'deal', associatedObjectId: string) {
    const noteData = {
      properties: {
        hs_note_body: content,
        hs_timestamp: new Date().toISOString(),
      },
      associations: [{
        to: { id: associatedObjectId },
        types: [{
          associationCategory: 'HUBSPOT_DEFINED',
          associationTypeId: associatedObjectType === 'company' ? 190 : associatedObjectType === 'contact' ? 202 : 214
        }]
      }]
    };

    return this.makeRequest('/crm/v3/objects/notes', 'POST', noteData);
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.makeRequest('/crm/v3/objects/companies?limit=1');
      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error: errorMessage };
    }
  }
}

export const hubspotService = new HubSpotService();
export type { HubSpotConfig, HubSpotContact, HubSpotCompany, HubSpotDeal, SyncResult };