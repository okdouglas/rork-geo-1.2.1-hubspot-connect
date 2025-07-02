import { PermitData } from '@/types/lead';

interface PermitSearchParams {
  workflowId?: string;
  state?: 'Oklahoma' | 'Kansas';
  operator?: string;
  county?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Cache for permit data
const permitCache = new Map<string, { data: PermitData[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchPermitData(params: PermitSearchParams): Promise<PermitData[]> {
  const cacheKey = JSON.stringify(params);
  const cached = permitCache.get(cacheKey);
  
  // Check cache first
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    // For demo purposes, we'll generate mock permit data
    // In a real implementation, this would call actual state APIs
    const permits = await generateMockPermitData(params);
    
    // Cache the results
    permitCache.set(cacheKey, {
      data: permits,
      timestamp: Date.now()
    });
    
    return permits;
  } catch (error) {
    console.error('Error fetching permit data:', error);
    throw new Error('Failed to fetch permit data');
  }
}

async function generateMockPermitData(params: PermitSearchParams): Promise<PermitData[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const mockPermits: PermitData[] = [
    {
      id: 'permit-001',
      permitNumber: 'OK-2025-001234',
      operatorName: 'Sooner State Energy LLC',
      location: {
        county: 'Canadian',
        state: 'Oklahoma',
        section: '12',
        township: '13N',
        range: '7W'
      },
      status: 'Approved',
      filingDate: '2025-06-15',
      wellType: 'Horizontal',
      formation: 'Woodford Shale',
      depth: 12500,
      apiNumber: '35-017-12345'
    },
    {
      id: 'permit-002',
      permitNumber: 'KS-2025-005678',
      operatorName: 'Prairie Wind Resources Inc',
      location: {
        county: 'Barber',
        state: 'Kansas',
        section: '22',
        township: '32S',
        range: '11W'
      },
      status: 'Filed',
      filingDate: '2025-06-20',
      wellType: 'Horizontal',
      formation: 'Mississippian Lime',
      depth: 8200,
      apiNumber: '15-007-98765'
    },
    {
      id: 'permit-003',
      permitNumber: 'OK-2025-002468',
      operatorName: 'Redrock Petroleum Corp',
      location: {
        county: 'Kingfisher',
        state: 'Oklahoma',
        section: '8',
        township: '15N',
        range: '8W'
      },
      status: 'Drilling',
      filingDate: '2025-06-10',
      wellType: 'Horizontal',
      formation: 'Meramec Formation',
      depth: 11800,
      apiNumber: '35-073-54321'
    },
    {
      id: 'permit-004',
      permitNumber: 'KS-2025-007890',
      operatorName: 'Sunflower Energy Partners LLC',
      location: {
        county: 'Gove',
        state: 'Kansas',
        section: '14',
        township: '14S',
        range: '28W'
      },
      status: 'Approved',
      filingDate: '2025-06-25',
      wellType: 'Directional',
      formation: 'Niobrara Formation',
      depth: 9500,
      apiNumber: '15-063-11111'
    },
    {
      id: 'permit-005',
      permitNumber: 'OK-2025-003579',
      operatorName: 'Cherokee Nation Energy',
      location: {
        county: 'Osage',
        state: 'Oklahoma',
        section: '30',
        township: '25N',
        range: '10E'
      },
      status: 'Completed',
      filingDate: '2025-05-28',
      wellType: 'Vertical',
      formation: 'Osage/Hunton',
      depth: 6800,
      apiNumber: '35-113-22222'
    }
  ];

  // Filter based on parameters
  let filteredPermits = mockPermits;
  
  if (params.state) {
    filteredPermits = filteredPermits.filter(p => p.location.state === params.state);
  }
  
  if (params.operator) {
    filteredPermits = filteredPermits.filter(p => 
      p.operatorName.toLowerCase().includes(params.operator!.toLowerCase())
    );
  }
  
  if (params.county) {
    filteredPermits = filteredPermits.filter(p => 
      p.location.county.toLowerCase().includes(params.county!.toLowerCase())
    );
  }
  
  if (params.dateRange) {
    const startDate = new Date(params.dateRange.start);
    const endDate = new Date(params.dateRange.end);
    
    filteredPermits = filteredPermits.filter(p => {
      const permitDate = new Date(p.filingDate);
      return permitDate >= startDate && permitDate <= endDate;
    });
  }
  
  return filteredPermits;
}

export async function fetchOklahomaPermits(params: Omit<PermitSearchParams, 'state'>): Promise<PermitData[]> {
  // In a real implementation, this would call the Oklahoma Corporation Commission API
  return fetchPermitData({ ...params, state: 'Oklahoma' });
}

export async function fetchKansasPermits(params: Omit<PermitSearchParams, 'state'>): Promise<PermitData[]> {
  // In a real implementation, this would call the Kansas Corporation Commission API
  return fetchPermitData({ ...params, state: 'Kansas' });
}