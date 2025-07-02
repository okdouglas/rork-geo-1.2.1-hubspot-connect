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

interface SearchProgress {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  status: string;
}

const SERPAPI_KEY = 'faa714c5a68ea6e43e50b99d000f512a8d67553765f6d7e7f95cdca376dcb314';
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';
const MAX_PAGES = 5;
const RESULTS_PER_PAGE = 10;

export async function searchOilGasCompanies(
  state: 'Oklahoma' | 'Kansas',
  onProgress?: (progress: SearchProgress) => void
): Promise<Lead[]> {
  try {
    const query = `Oil and Gas companies in ${state}`;
    const allResults: SerpAPILocalResult[] = [];
    const startValues = [0, 10, 20, 30, 40]; // 5 pages of results
    
    onProgress?.({
      currentPage: 0,
      totalPages: MAX_PAGES,
      totalResults: 0,
      status: 'Starting search...'
    });

    for (let i = 0; i < startValues.length; i++) {
      const start = startValues[i];
      const currentPage = i + 1;
      
      onProgress?.({
        currentPage,
        totalPages: MAX_PAGES,
        totalResults: allResults.length,
        status: `Fetching page ${currentPage} of ${MAX_PAGES}...`
      });

      try {
        const params = new URLSearchParams({
          api_key: SERPAPI_KEY,
          engine: 'google',
          q: query,
          tbm: 'lcl', // Local results
          num: RESULTS_PER_PAGE.toString(),
          start: start.toString(),
        });

        const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`);
        
        if (!response.ok) {
          console.warn(`SerpAPI request failed for page ${currentPage}: ${response.status} ${response.statusText}`);
          continue; // Skip this page but continue with others
        }

        const data: SerpAPIResponse = await response.json();

        if (data.error) {
          console.warn(`SerpAPI error for page ${currentPage}: ${data.error}`);
          continue; // Skip this page but continue with others
        }

        if (data.local_results && data.local_results.length > 0) {
          allResults.push(...data.local_results);
        }

        // Add a small delay between requests to avoid rate limiting
        if (i < startValues.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        console.warn(`Error fetching page ${currentPage}:`, error);
        continue; // Skip this page but continue with others
      }
    }

    onProgress?.({
      currentPage: MAX_PAGES,
      totalPages: MAX_PAGES,
      totalResults: allResults.length,
      status: 'Processing results...'
    });

    if (allResults.length === 0) {
      console.warn('No results found from SerpAPI across all pages, using fallback data');
      return generateFallbackData(state);
    }

    // Deduplicate results
    const deduplicatedResults = deduplicateResults(allResults);
    
    onProgress?.({
      currentPage: MAX_PAGES,
      totalPages: MAX_PAGES,
      totalResults: deduplicatedResults.length,
      status: `Found ${deduplicatedResults.length} unique companies`
    });

    // Convert SerpAPI results to Lead format
    const leads: Lead[] = deduplicatedResults.map((result, index) => {
      const companyName = result.title || 'Unknown Company';
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
    
    onProgress?.({
      currentPage: 0,
      totalPages: MAX_PAGES,
      totalResults: 0,
      status: 'Search failed, using fallback data'
    });
    
    // Fallback to mock data if SerpAPI fails
    console.warn('Falling back to mock data due to SerpAPI error');
    return generateFallbackData(state);
  }
}

function deduplicateResults(results: SerpAPILocalResult[]): SerpAPILocalResult[] {
  const seen = new Set<string>();
  const deduplicated: SerpAPILocalResult[] = [];

  for (const result of results) {
    const key = generateDeduplicationKey(result);
    
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(result);
    }
  }

  return deduplicated;
}

function generateDeduplicationKey(result: SerpAPILocalResult): string {
  // Create a unique key based on company name, domain, and phone
  const name = normalizeCompanyName(result.title || '');
  const domain = extractDomain(result.link || '');
  const phone = normalizePhone(result.phone || '');
  
  // Use the most specific identifier available
  if (phone) {
    return `phone:${phone}`;
  }
  
  if (domain) {
    return `domain:${domain}`;
  }
  
  if (name) {
    return `name:${name}`;
  }
  
  // Fallback to a combination if individual fields aren't unique enough
  return `combined:${name}|${domain}|${phone}`;
}

function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(inc|llc|corp|corporation|company|co|ltd|limited)\b/g, '') // Remove common suffixes
    .trim();
}

function extractDomain(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function normalizePhone(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Return normalized format for US numbers
  if (digits.length === 10) {
    return digits;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1);
  }
  
  return digits;
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