import { create } from 'zustand';
import { companies } from '@/mocks/companies';
import { Company } from '@/types';

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
};

export const useCompanyStore = create<CompanyStore>((set) => ({
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
}));