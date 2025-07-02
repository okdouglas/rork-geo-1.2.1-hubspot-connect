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

  // Helper method to create safe properties object with only standard HubSpot properties
  private createSafeCompanyProperties(companyData: HubSpotCompany) {
    // Standard HubSpot company properties that always exist
    const standardProperties: any = {
      name: companyData.name,
      industry: companyData.industry,
      state: companyData.state,
    };

    // Optional standard properties
    if (companyData.domain) standardProperties.domain = companyData.domain;
    if (companyData.numberofemployees) standardProperties.numberofemployees = companyData.numberofemployees;
    if (companyData.city) standardProperties.city = companyData.city;
    if (companyData.phone) standardProperties.phone = companyData.phone;
    if (companyData.website) standardProperties.website = companyData.website;

    // Create description with custom data
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

  // Helper method to create safe contact properties
  private createSafeContactProperties(contactData: HubSpotContact) {
    // Standard HubSpot contact properties
    const standardProperties: any = {
      email: contactData.email,
      firstname: contactData.firstname,
      lastname: contactData.lastname,
      jobtitle: contactData.jobtitle,
      company: contactData.company,
    };

    // Optional standard properties
    if (contactData.phone) standardProperties.phone = contactData.phone;
    if (contactData.hs_lead_status) standardProperties.hs_lead_status = contactData.hs_lead_status;

    // Create notes with custom data
    const customData = [];
    if (contactData.geological_expertise) customData.push(`Expertise: ${contactData.geological_expertise}`);
    if (contactData.years_experience) customData.push(`Experience: ${contactData.years_experience} years`);
    if (contactData.education) customData.push(`Education: ${contactData.education}`);
    if (contactData.last_contact_date) customData.push(`Last Contact: ${contactData.last_contact_date}`);

    if (customData.length > 0) {
      // Store custom data in notes field or description if available
      standardProperties.notes_last_contacted = customData.join('; ');
    }

    return standardProperties;
  }

  // Company Methods
  async createCompany(companyData: HubSpotCompany) {
    const properties = this.createSafeCompanyProperties(companyData);
    return this.makeRequest('/crm/v3/objects/companies', 'POST', { properties });
  }

  async updateCompany(hubspotId: string, companyData: Partial<HubSpotCompany>) {
    const properties = this.createSafeCompanyProperties(companyData as HubSpotCompany);
    return this.makeRequest(`/crm/v3/objects/companies/${hubspotId}`, 'PATCH', {
      properties
    });
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

  // Contact Methods
  async createContact(contactData: HubSpotContact) {
    const properties = this.createSafeContactProperties(contactData);
    return this.makeRequest('/crm/v3/objects/contacts', 'POST', { properties });
  }

  async updateContact(hubspotId: string, contactData: Partial<HubSpotContact>) {
    const properties = this.createSafeContactProperties(contactData as HubSpotContact);
    return this.makeRequest(`/crm/v3/objects/contacts/${hubspotId}`, 'PATCH', {
      properties
    });
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
    // Only use standard deal properties
    const properties: any = {
      dealname: dealData.dealname,
      dealstage: dealData.dealstage,
      pipeline: dealData.pipeline,
    };

    // Optional standard properties
    if (dealData.amount) properties.amount = dealData.amount;
    if (dealData.closedate) properties.closedate = dealData.closedate;

    // Put custom data in description
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
export type { HubSpotConfig, HubSpotContact, HubSpotCompany, HubSpotDeal };