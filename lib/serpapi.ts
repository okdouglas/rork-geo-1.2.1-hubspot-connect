import { Lead } from '@/types/lead';

interface SerpAPILocalResult {
  title: string;
  link?: string;
  address?: string;
  phone?: string;
  snippet?: string;
  place_id?: string;
  rating?: number;
  reviews?: number;
  type?: string;
}

interface SerpAPIResponse {
  local_results?: SerpAPILocalResult[];
  search_metadata?: {
    status: string;
    google_url?: string;
  };
  error?: string;
}

const SERPAPI_KEY = 'faa714c5a68ea6e43e50b99d000f512a8d67553765f6d7e7f95cdca376dcb314';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

export async function searchOilGasCompanies(state: 'Oklahoma' | 'Kansas'): Promise<Lead[]> {
  try {
    const query = `Oil and Gas companies in ${state}`;
    
    const params = new URLSearchParams({
      api_key: SERPAPI_KEY,
      engine: 'google',
      q: query,
      tbm: 'lcl', // Local results
      num: '20', // Number of results
    });

    const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
    }

    const data: SerpAPIResponse = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    if (!data.local_results || data.local_results.length === 0) {
      console.warn('No local results found from SerpAPI, using fallback data');
      return generateFallbackData(state);
    }

    // Convert SerpAPI results to Lead format
    const leads: Lead[] = data.local_results.map((result, index) => {
      // Extract company name and clean it up
      const companyName = result.title || 'Unknown Company';
      
      // Try to extract contact info from snippet or use available data
      const contact = extractContactInfo(result);
      
      return {
        id: `serp-${Date.now()}-${index}`,
        companyName: companyName,
        website: result.link,
        industry: 'Oil & Gas',
        location: result.address || `${state}, USA`,
        description: result.snippet,
        contact: contact,
        foundAt: new Date().toISOString(),
        syncedToHubSpot: false,
        serpApiData: {
          placeId: result.place_id,
          rating: result.rating,
          reviews: result.reviews,
          type: result.type,
        }
      };
    });

    return leads;

  } catch (error) {
    console.error('SerpAPI search error:', error);
    
    // Fallback to mock data if SerpAPI fails
    console.warn('Falling back to mock data due to SerpAPI error');
    return generateFallbackData(state);
  }
}

function extractContactInfo(result: SerpAPILocalResult) {
  // Try to extract contact name from snippet or title
  const snippet = result.snippet || '';
  const title = result.title || '';
  
  // Look for common patterns in snippets that might contain contact info
  const contactPatterns = [
    /Contact:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /Manager:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /President:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
    /CEO:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
  ];

  let contactName = '';
  let contactTitle = '';

  for (const pattern of contactPatterns) {
    const match = snippet.match(pattern);
    if (match) {
      contactName = match[1];
      contactTitle = match[0].split(':')[0] || 'Contact';
      break;
    }
  }

  // If no contact found in snippet, generate a generic one
  if (!contactName) {
    const companyName = result.title || 'Company';
    const firstWord = companyName.split(' ')[0];
    contactName = `${firstWord} Representative`;
    contactTitle = 'Business Contact';
  }

  return {
    name: contactName,
    title: contactTitle,
    phone: result.phone,
  };
}

function generateFallbackData(state: 'Oklahoma' | 'Kansas'): Lead[] {
  const oklahomaMockData = [
    {
      id: `fallback-${Date.now()}-1`,
      companyName: "Sooner State Energy LLC",
      website: "https://soonerstateenergy.com",
      industry: "Oil & Gas Exploration",
      location: "Oklahoma City, OK",
      description: "Independent oil and gas exploration company focused on unconventional resources in the STACK and SCOOP plays.",
      contact: {
        name: "Sarah Johnson",
        title: "Chief Geologist",
        phone: "(405) 555-0123"
      },
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
    },
    {
      id: `fallback-${Date.now()}-2`,
      companyName: "Redrock Petroleum Corp",
      website: "https://redrockpetroleum.com",
      industry: "Oil & Gas Production",
      location: "Tulsa, OK",
      description: "Mid-size exploration and production company with assets across the Anadarko Basin.",
      contact: {
        name: "Michael Chen",
        title: "VP of Operations",
        phone: "(918) 555-0456"
      },
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
    },
    {
      id: `fallback-${Date.now()}-3`,
      companyName: "Cherokee Nation Energy",
      website: "https://cherokeeenergy.com",
      industry: "Oil & Gas Development",
      location: "Bartlesville, OK",
      description: "Tribal energy company focused on sustainable oil and gas development on Cherokee Nation lands.",
      contact: {
        name: "Lisa Blackhorse",
        title: "Environmental Manager",
        phone: "(918) 555-0789"
      },
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
    }
  ];

  const kansasMockData = [
    {
      id: `fallback-${Date.now()}-1`,
      companyName: "Prairie Wind Resources",
      website: "https://prairiewindresources.com",
      industry: "Oil & Gas Production",
      location: "Wichita, KS",
      description: "Regional oil and gas producer specializing in horizontal drilling in the Mississippian Lime formation.",
      contact: {
        name: "David Martinez",
        title: "Senior Geophysicist",
        phone: "(316) 555-0234"
      },
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
    },
    {
      id: `fallback-${Date.now()}-2`,
      companyName: "Sunflower Energy Partners",
      website: "https://sunflowerenergypartners.com",
      industry: "Oil & Gas Development",
      location: "Dodge City, KS",
      description: "Private equity backed oil and gas development company focused on Kansas unconventional plays.",
      contact: {
        name: "Jennifer Wilson",
        title: "Chief Operating Officer",
        phone: "(620) 555-0567"
      },
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
    },
    {
      id: `fallback-${Date.now()}-3`,
      companyName: "Wheat State Drilling Co",
      website: "https://wheatstatedrilling.com",
      industry: "Oil & Gas Services",
      location: "Liberal, KS",
      description: "Full-service drilling contractor specializing in horizontal wells in the Hugoton Gas Field.",
      contact: {
        name: "Mark Anderson",
        title: "Drilling Manager",
        phone: "(620) 555-0890"
      },
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
    }
  ];

  return state === 'Oklahoma' ? oklahomaMockData : kansasMockData;
}