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

  // Company Methods
  async createCompany(companyData: HubSpotCompany) {
    const properties = {
      name: companyData.name,
      domain: companyData.domain,
      industry: companyData.industry,
      numberofemployees: companyData.numberofemployees,
      state: companyData.state,
      primary_formation: companyData.primary_formation,
      drilling_activity_level: companyData.drilling_activity_level,
      geological_staff_size: companyData.geological_staff_size,
      recent_permits_count: companyData.recent_permits_count,
      last_permit_date: companyData.last_permit_date,
      hs_lead_status: companyData.status,
    };

    return this.makeRequest('/crm/v3/objects/companies', 'POST', { properties });
  }

  async updateCompany(hubspotId: string, companyData: Partial<HubSpotCompany>) {
    return this.makeRequest(`/crm/v3/objects/companies/${hubspotId}`, 'PATCH', {
      properties: companyData
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
    const properties = {
      email: contactData.email,
      firstname: contactData.firstname,
      lastname: contactData.lastname,
      jobtitle: contactData.jobtitle,
      phone: contactData.phone,
      company: contactData.company,
      hs_lead_status: contactData.hs_lead_status || 'NEW',
      geological_expertise: contactData.geological_expertise,
      years_experience: contactData.years_experience,
      education: contactData.education,
      last_contact_date: contactData.last_contact_date,
    };

    return this.makeRequest('/crm/v3/objects/contacts', 'POST', { properties });
  }

  async updateContact(hubspotId: string, contactData: Partial<HubSpotContact>) {
    return this.makeRequest(`/crm/v3/objects/contacts/${hubspotId}`, 'PATCH', {
      properties: contactData
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
    const properties = {
      dealname: dealData.dealname,
      amount: dealData.amount,
      dealstage: dealData.dealstage,
      pipeline: dealData.pipeline,
      closedate: dealData.closedate,
      deal_type: dealData.deal_type,
      formation_target: dealData.formation_target,
      permit_location: dealData.permit_location,
    };

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