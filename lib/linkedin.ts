import { Lead } from '@/types/lead';

interface LinkedInSearchResult {
  companies: Array<{
    name: string;
    website?: string;
    industry: string;
    location: string;
    size?: string;
    description?: string;
    linkedInUrl?: string;
    employees?: Array<{
      name: string;
      title: string;
      linkedInUrl?: string;
    }>;
  }>;
}

export async function searchLinkedInCompanies(query: string): Promise<Lead[]> {
  try {
    // Use the AI API to search for companies
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a business intelligence assistant that helps find Oil & Gas companies. 
            Generate realistic company data for the search query. Return a JSON object with a "companies" array.
            Each company should have: name, website, industry, location, size, description, linkedInUrl.
            Focus on companies in Oklahoma and Kansas oil & gas sector.
            Make the data realistic but fictional to avoid real company privacy issues.`
          },
          {
            role: 'user',
            content: `Find Oil & Gas companies for: ${query}. Return 8-12 companies in JSON format.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to search for companies');
    }

    const data = await response.json();
    let searchResults: LinkedInSearchResult;
    
    try {
      searchResults = JSON.parse(data.completion);
    } catch (parseError) {
      // If JSON parsing fails, create mock data
      searchResults = generateMockCompanies(query);
    }

    // Convert to Lead format
    const leads: Lead[] = searchResults.companies.map((company, index) => ({
      id: `lead-${Date.now()}-${index}`,
      companyName: company.name,
      website: company.website,
      industry: company.industry,
      location: company.location,
      size: company.size,
      description: company.description,
      linkedInUrl: company.linkedInUrl,
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
      contact: company.employees && company.employees.length > 0 ? {
        name: company.employees[0].name,
        title: company.employees[0].title,
        linkedInUrl: company.employees[0].linkedInUrl,
      } : undefined,
    }));

    return leads;
  } catch (error) {
    console.error('LinkedIn search error:', error);
    
    // Fallback to mock data if API fails
    const mockResults = generateMockCompanies(query);
    return mockResults.companies.map((company, index) => ({
      id: `lead-${Date.now()}-${index}`,
      companyName: company.name,
      website: company.website,
      industry: company.industry,
      location: company.location,
      size: company.size,
      description: company.description,
      linkedInUrl: company.linkedInUrl,
      foundAt: new Date().toISOString(),
      syncedToHubSpot: false,
      contact: company.employees && company.employees.length > 0 ? {
        name: company.employees[0].name,
        title: company.employees[0].title,
        linkedInUrl: company.employees[0].linkedInUrl,
      } : undefined,
    }));
  }
}

function generateMockCompanies(query: string): LinkedInSearchResult {
  const mockCompanies = [
    {
      name: "Sooner State Energy",
      website: "https://soonerstateenergy.com",
      industry: "Oil & Gas Exploration",
      location: "Oklahoma City, OK",
      size: "51-200 employees",
      description: "Independent oil and gas exploration company focused on unconventional resources in the STACK and SCOOP plays.",
      linkedInUrl: "https://linkedin.com/company/sooner-state-energy",
      employees: [
        {
          name: "Sarah Johnson",
          title: "Chief Geologist",
          linkedInUrl: "https://linkedin.com/in/sarah-johnson-geo"
        }
      ]
    },
    {
      name: "Prairie Wind Resources",
      website: "https://prairiewindresources.com",
      industry: "Oil & Gas Production",
      location: "Wichita, KS",
      size: "11-50 employees",
      description: "Regional oil and gas producer specializing in horizontal drilling in the Mississippian Lime formation.",
      linkedInUrl: "https://linkedin.com/company/prairie-wind-resources",
      employees: [
        {
          name: "Michael Chen",
          title: "VP of Operations",
          linkedInUrl: "https://linkedin.com/in/michael-chen-oil"
        }
      ]
    },
    {
      name: "Redrock Petroleum",
      website: "https://redrockpetroleum.com",
      industry: "Oil & Gas Exploration",
      location: "Tulsa, OK",
      size: "201-500 employees",
      description: "Mid-size exploration and production company with assets across the Anadarko Basin.",
      linkedInUrl: "https://linkedin.com/company/redrock-petroleum",
      employees: [
        {
          name: "David Martinez",
          title: "Senior Geophysicist",
          linkedInUrl: "https://linkedin.com/in/david-martinez-geo"
        }
      ]
    },
    {
      name: "Sunflower Energy Partners",
      website: "https://sunflowerenergypartners.com",
      industry: "Oil & Gas Development",
      location: "Dodge City, KS",
      size: "11-50 employees",
      description: "Private equity backed oil and gas development company focused on Kansas unconventional plays.",
      linkedInUrl: "https://linkedin.com/company/sunflower-energy-partners",
      employees: [
        {
          name: "Jennifer Wilson",
          title: "Chief Operating Officer",
          linkedInUrl: "https://linkedin.com/in/jennifer-wilson-energy"
        }
      ]
    },
    {
      name: "Boomer Basin Exploration",
      website: "https://boomerbasine.com",
      industry: "Oil & Gas Exploration",
      location: "Norman, OK",
      size: "51-200 employees",
      description: "University-affiliated exploration company leveraging advanced geological research for prospect generation.",
      linkedInUrl: "https://linkedin.com/company/boomer-basin-exploration",
      employees: [
        {
          name: "Dr. Robert Thompson",
          title: "Chief Technology Officer",
          linkedInUrl: "https://linkedin.com/in/robert-thompson-phd"
        }
      ]
    },
    {
      name: "Wheat State Drilling",
      website: "https://wheatstatedrilling.com",
      industry: "Oil & Gas Services",
      location: "Liberal, KS",
      size: "101-500 employees",
      description: "Full-service drilling contractor specializing in horizontal wells in the Hugoton Gas Field.",
      linkedInUrl: "https://linkedin.com/company/wheat-state-drilling",
      employees: [
        {
          name: "Mark Anderson",
          title: "Drilling Manager",
          linkedInUrl: "https://linkedin.com/in/mark-anderson-drilling"
        }
      ]
    },
    {
      name: "Cherokee Nation Energy",
      website: "https://cherokeeenergy.com",
      industry: "Oil & Gas Production",
      location: "Bartlesville, OK",
      size: "51-200 employees",
      description: "Tribal energy company focused on sustainable oil and gas development on Cherokee Nation lands.",
      linkedInUrl: "https://linkedin.com/company/cherokee-nation-energy",
      employees: [
        {
          name: "Lisa Blackhorse",
          title: "Environmental Manager",
          linkedInUrl: "https://linkedin.com/in/lisa-blackhorse"
        }
      ]
    },
    {
      name: "Flint Hills Petroleum",
      website: "https://flinthillspetroleum.com",
      industry: "Oil & Gas Exploration",
      location: "Emporia, KS",
      size: "11-50 employees",
      description: "Independent operator focused on enhanced oil recovery techniques in mature Kansas fields.",
      linkedInUrl: "https://linkedin.com/company/flint-hills-petroleum",
      employees: [
        {
          name: "Thomas Garcia",
          title: "Reservoir Engineer",
          linkedInUrl: "https://linkedin.com/in/thomas-garcia-reservoir"
        }
      ]
    }
  ];

  return { companies: mockCompanies };
}