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
    phone?: string;
    linkedInUrl?: string;
  };
  linkedInUrl?: string;
  foundAt: string;
  syncedToHubSpot?: boolean;
  hubSpotId?: string;
  serpApiData?: {
    placeId?: string;
    rating?: number;
    reviews?: number;
    type?: string;
  };
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