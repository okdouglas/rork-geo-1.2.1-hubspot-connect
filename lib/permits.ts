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
  weekOf?: string;
}

// Cache for permit data
const permitCache = new Map<string, { data: PermitData[]; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for real data

export async function fetchPermitData(params: PermitSearchParams): Promise<PermitData[]> {
  const cacheKey = JSON.stringify(params);
  const cached = permitCache.get(cacheKey);
  
  // Check cache first
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    let permits: PermitData[] = [];
    
    if (params.state === 'Oklahoma' || !params.state) {
      const oklahomaPermits = await fetchOklahomaPermits(params);
      permits = permits.concat(oklahomaPermits);
    }
    
    if (params.state === 'Kansas' || !params.state) {
      const kansasPermits = await fetchKansasPermits(params);
      permits = permits.concat(kansasPermits);
    }
    
    // Filter by date range (past 6 months by default)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const startDate = params.dateRange?.start ? new Date(params.dateRange.start) : sixMonthsAgo;
    const endDate = params.dateRange?.end ? new Date(params.dateRange.end) : new Date();
    
    permits = permits.filter(permit => {
      const permitDate = new Date(permit.filingDate);
      return permitDate >= startDate && permitDate <= endDate;
    });
    
    // Filter by week if specified
    if (params.weekOf) {
      const weekStart = new Date(params.weekOf);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      permits = permits.filter(permit => {
        const permitDate = new Date(permit.filingDate);
        return permitDate >= weekStart && permitDate < weekEnd;
      });
    }
    
    // Apply other filters
    if (params.operator) {
      permits = permits.filter(p => 
        p.operatorName.toLowerCase().includes(params.operator!.toLowerCase())
      );
    }
    
    if (params.county) {
      permits = permits.filter(p => 
        p.location.county.toLowerCase().includes(params.county!.toLowerCase())
      );
    }
    
    // Sort newest to oldest
    permits.sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime());
    
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

export async function fetchOklahomaPermits(params: Omit<PermitSearchParams, 'state'>): Promise<PermitData[]> {
  try {
    // First try to fetch CSV data from Oklahoma Corporation Commission
    const csvUrl = 'https://ogwellbore.occ.ok.gov/api/permits/export';
    
    try {
      const response = await fetch(csvUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv,application/csv',
          'User-Agent': 'GeoProspector/1.0'
        }
      });
      
      if (response.ok) {
        const csvText = await response.text();
        return parseOklahomaCSV(csvText);
      }
    } catch (csvError) {
      console.log('CSV fetch failed, trying API endpoint');
    }
    
    // Fallback to API endpoint
    const apiUrl = 'https://ogwellbore.occ.ok.gov/api/permits';
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GeoProspector/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Oklahoma API error: ${response.status}`);
    }
    
    const data = await response.json();
    return parseOklahomaAPIData(data);
    
  } catch (error) {
    console.error('Oklahoma permits fetch failed:', error);
    // Return empty array instead of throwing to allow Kansas data to still load
    return [];
  }
}

export async function fetchKansasPermits(params: Omit<PermitSearchParams, 'state'>): Promise<PermitData[]> {
  try {
    // Try Kansas Geological Survey API
    const apiUrl = 'https://www.kgs.ku.edu/Magellan/api/permits';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GeoProspector/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return parseKansasAPIData(data);
      }
    } catch (apiError) {
      console.log('Kansas API failed, trying CSV endpoint');
    }
    
    // Fallback to CSV endpoint
    const csvUrl = 'https://www.kgs.ku.edu/Magellan/data/permits.csv';
    const response = await fetch(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv,application/csv',
        'User-Agent': 'GeoProspector/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Kansas CSV error: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseKansasCSV(csvText);
    
  } catch (error) {
    console.error('Kansas permits fetch failed:', error);
    // Return empty array instead of throwing to allow Oklahoma data to still load
    return [];
  }
}

function parseOklahomaCSV(csvText: string): PermitData[] {
  const lines = csvText.split('\n');
  const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''));
  
  if (!headers || lines.length < 2) {
    return [];
  }
  
  const permits: PermitData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;
    
    try {
      const permit: PermitData = {
        id: `ok-${values[headers.indexOf('API_NUMBER')] || i}`,
        permitNumber: values[headers.indexOf('PERMIT_NUMBER')] || '',
        operatorName: values[headers.indexOf('OPERATOR_NAME')] || '',
        location: {
          county: values[headers.indexOf('COUNTY')] || '',
          state: 'Oklahoma',
          section: values[headers.indexOf('SECTION')] || '',
          township: values[headers.indexOf('TOWNSHIP')] || '',
          range: values[headers.indexOf('RANGE')] || ''
        },
        status: values[headers.indexOf('STATUS')] || 'Filed',
        filingDate: formatDate(values[headers.indexOf('FILING_DATE')] || ''),
        wellType: values[headers.indexOf('WELL_TYPE')] || 'Horizontal',
        formation: values[headers.indexOf('FORMATION')] || '',
        depth: parseInt(values[headers.indexOf('DEPTH')] || '0') || undefined,
        apiNumber: values[headers.indexOf('API_NUMBER')] || ''
      };
      
      if (permit.operatorName && permit.location.county) {
        permits.push(permit);
      }
    } catch (error) {
      console.error('Error parsing Oklahoma permit row:', error);
    }
  }
  
  return permits;
}

function parseKansasCSV(csvText: string): PermitData[] {
  const lines = csvText.split('\n');
  const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''));
  
  if (!headers || lines.length < 2) {
    return [];
  }
  
  const permits: PermitData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    if (values.length < headers.length) continue;
    
    try {
      const permit: PermitData = {
        id: `ks-${values[headers.indexOf('API_NUMBER')] || i}`,
        permitNumber: values[headers.indexOf('PERMIT_NUMBER')] || '',
        operatorName: values[headers.indexOf('OPERATOR_NAME')] || '',
        location: {
          county: values[headers.indexOf('COUNTY')] || '',
          state: 'Kansas',
          section: values[headers.indexOf('SECTION')] || '',
          township: values[headers.indexOf('TOWNSHIP')] || '',
          range: values[headers.indexOf('RANGE')] || ''
        },
        status: values[headers.indexOf('STATUS')] || 'Filed',
        filingDate: formatDate(values[headers.indexOf('FILING_DATE')] || ''),
        wellType: values[headers.indexOf('WELL_TYPE')] || 'Horizontal',
        formation: values[headers.indexOf('FORMATION')] || '',
        depth: parseInt(values[headers.indexOf('DEPTH')] || '0') || undefined,
        apiNumber: values[headers.indexOf('API_NUMBER')] || ''
      };
      
      if (permit.operatorName && permit.location.county) {
        permits.push(permit);
      }
    } catch (error) {
      console.error('Error parsing Kansas permit row:', error);
    }
  }
  
  return permits;
}

function parseOklahomaAPIData(data: any): PermitData[] {
  if (!data || !Array.isArray(data.permits)) {
    return [];
  }
  
  return data.permits.map((permit: any, index: number) => ({
    id: `ok-api-${permit.api_number || index}`,
    permitNumber: permit.permit_number || '',
    operatorName: permit.operator_name || '',
    location: {
      county: permit.county || '',
      state: 'Oklahoma',
      section: permit.section || '',
      township: permit.township || '',
      range: permit.range || ''
    },
    status: permit.status || 'Filed',
    filingDate: formatDate(permit.filing_date || ''),
    wellType: permit.well_type || 'Horizontal',
    formation: permit.formation || '',
    depth: permit.depth || undefined,
    apiNumber: permit.api_number || ''
  })).filter((permit: PermitData) => permit.operatorName && permit.location.county);
}

function parseKansasAPIData(data: any): PermitData[] {
  if (!data || !Array.isArray(data.permits)) {
    return [];
  }
  
  return data.permits.map((permit: any, index: number) => ({
    id: `ks-api-${permit.api_number || index}`,
    permitNumber: permit.permit_number || '',
    operatorName: permit.operator_name || '',
    location: {
      county: permit.county || '',
      state: 'Kansas',
      section: permit.section || '',
      township: permit.township || '',
      range: permit.range || ''
    },
    status: permit.status || 'Filed',
    filingDate: formatDate(permit.filing_date || ''),
    wellType: permit.well_type || 'Horizontal',
    formation: permit.formation || '',
    depth: permit.depth || undefined,
    apiNumber: permit.api_number || ''
  })).filter((permit: PermitData) => permit.operatorName && permit.location.county);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(val => val.replace(/^"|"$/g, ''));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  
  // Handle various date formats
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  
  return date.toISOString().split('T')[0];
}

export function getPermitUrl(permit: PermitData): string {
  if (permit.location.state === 'Oklahoma' && permit.apiNumber) {
    return `https://ogwellbore.occ.ok.gov/WellBrowse.aspx?APINumber=${permit.apiNumber}`;
  } else if (permit.location.state === 'Kansas' && permit.apiNumber) {
    return `https://www.kgs.ku.edu/Magellan/Qualified/index.html?api=${permit.apiNumber}`;
  }
  return '';
}

export function getWeekRanges(monthsBack: number = 6): Array<{ label: string; value: string }> {
  const weeks: Array<{ label: string; value: string }> = [];
  const now = new Date();
  
  for (let i = 0; i < monthsBack * 4; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    weeks.push({
      label: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      value: weekStart.toISOString().split('T')[0]
    });
  }
  
  return weeks;
}