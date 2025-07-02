import { create } from 'zustand';
import { companies } from '@/mocks/companies';
import { Company } from '@/types';
import { PermitData } from '@/types/lead';

type CompanyStore = {
  companies: Company[];
  filteredCompanies: Company[];
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  filterCompanies: (criteria: {
    state?: 'Oklahoma' | 'Kansas' | 'Both' | 'All';
    status?: 'Active' | 'Dormant' | 'Reactivated' | 'All';
    formation?: string;
    size?: string;
  }) => void;
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  addCompaniesFromPermits: (permits: PermitData[]) => void;
  getCompanyByOperator: (operatorName: string) => Company | null;
};

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  companies: companies,
  filteredCompanies: companies,
  selectedCompany: null,
  setSelectedCompany: (company) => set({ selectedCompany: company }),
  filterCompanies: (criteria) => {
    set((state) => {
      let filtered = state.companies;
      
      if (criteria.state && criteria.state !== 'All') {
        filtered = filtered.filter(company => 
          company.state === criteria.state || company.state === 'Both'
        );
      }
      
      if (criteria.status && criteria.status !== 'All') {
        filtered = filtered.filter(company => company.status === criteria.status);
      }
      
      if (criteria.formation) {
        filtered = filtered.filter(company => 
          company.primaryFormation.toLowerCase().includes(criteria.formation!.toLowerCase())
        );
      }
      
      if (criteria.size) {
        filtered = filtered.filter(company => company.size === criteria.size);
      }
      
      return { filteredCompanies: filtered };
    });
  },
  addCompany: (company) => {
    set((state) => ({
      companies: [...state.companies, company],
      filteredCompanies: [...state.filteredCompanies, company]
    }));
  },
  updateCompany: (company) => {
    set((state) => ({
      companies: state.companies.map(c => c.id === company.id ? company : c),
      filteredCompanies: state.filteredCompanies.map(c => c.id === company.id ? company : c),
      selectedCompany: state.selectedCompany?.id === company.id ? company : state.selectedCompany
    }));
  },
  getCompanyByOperator: (operatorName) => {
    const state = get();
    return state.companies.find(company => 
      company.name.toLowerCase().includes(operatorName.toLowerCase()) ||
      operatorName.toLowerCase().includes(company.name.toLowerCase())
    ) || null;
  },
  addCompaniesFromPermits: (permits) => {
    const state = get();
    const newCompanies: Company[] = [];
    const existingCompanyNames = new Set(state.companies.map(c => c.name.toLowerCase()));
    
    // Group permits by operator
    const operatorPermits = new Map<string, PermitData[]>();
    permits.forEach(permit => {
      const operator = permit.operatorName;
      if (!operatorPermits.has(operator)) {
        operatorPermits.set(operator, []);
      }
      operatorPermits.get(operator)!.push(permit);
    });
    
    // Create companies from operators that don't exist
    operatorPermits.forEach((operatorPermitList, operatorName) => {
      if (!existingCompanyNames.has(operatorName.toLowerCase())) {
        const recentPermits = operatorPermitList.filter(p => {
          const permitDate = new Date(p.filingDate);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return permitDate >= sixMonthsAgo;
        });
        
        const lastPermit = operatorPermitList.sort((a, b) => 
          new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime()
        )[0];
        
        const formations = [...new Set(operatorPermitList.map(p => p.formation).filter(Boolean))];
        const states = [...new Set(operatorPermitList.map(p => p.location.state))];
        
        let companyState: 'Oklahoma' | 'Kansas' | 'Both';
        if (states.length > 1) {
          companyState = 'Both';
        } else {
          companyState = states[0] as 'Oklahoma' | 'Kansas';
        }
        
        // Determine activity level based on recent permits
        let activityLevel: 'High' | 'Medium' | 'Low';
        if (recentPermits.length >= 10) {
          activityLevel = 'High';
        } else if (recentPermits.length >= 3) {
          activityLevel = 'Medium';
        } else {
          activityLevel = 'Low';
        }
        
        // Determine company size based on permit count
        let size: string;
        if (operatorPermitList.length >= 50) {
          size = 'Large (500+ employees)';
        } else if (operatorPermitList.length >= 20) {
          size = 'Medium (100-500 employees)';
        } else {
          size = 'Small (10-100 employees)';
        }
        
        const newCompany: Company = {
          id: `permit-${operatorName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
          name: operatorName,
          size,
          primaryFormation: formations[0] || 'Unknown',
          recentPermitsCount: recentPermits.length,
          lastPermitDate: lastPermit.filingDate,
          drillingActivityLevel: activityLevel,
          geologicalStaffSize: Math.max(1, Math.floor(operatorPermitList.length / 10)),
          currentSoftwareStack: ['Unknown'],
          state: companyState,
          status: recentPermits.length > 0 ? 'Active' : 'Dormant'
        };
        
        newCompanies.push(newCompany);
        existingCompanyNames.add(operatorName.toLowerCase());
      }
    });
    
    if (newCompanies.length > 0) {
      set((state) => ({
        companies: [...state.companies, ...newCompanies],
        filteredCompanies: [...state.filteredCompanies, ...newCompanies]
      }));
    }
  },
}));