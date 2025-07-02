export interface Lead {
  id: string;
  companyName: string;
  website?: string;
  industry: string;
  location: string;
  size?: string;
  description?: string;
  contact?: {
    name: string;
    title: string;
    email?: string;
    linkedInUrl?: string;
  };
  linkedInUrl?: string;
  foundAt: string;
  syncedToHubSpot?: boolean;
  hubSpotId?: string;
}

export interface PermitData {
  id: string;
  permitNumber: string;
  operatorName: string;
  location: {
    county: string;
    state: string;
    section: string;
    township: string;
    range: string;
  };
  status: string;
  filingDate: string;
  wellType: string;
  formation?: string;
  depth?: number;
  apiNumber?: string;
}