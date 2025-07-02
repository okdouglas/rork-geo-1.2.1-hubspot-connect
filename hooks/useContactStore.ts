import { create } from 'zustand';
import { contacts } from '@/mocks/contacts';
import { Contact } from '@/types';

type ContactStore = {
  contacts: Contact[];
  filteredContacts: Contact[];
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  filterContacts: (criteria: {
    companyId?: string;
    expertise?: string;
    title?: string;
  }) => void;
  getContactsByCompany: (companyId: string) => Contact[];
  addContact: (contact: Contact) => void;
  updateContact: (contact: Contact) => void;
};

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: contacts,
  filteredContacts: contacts,
  selectedContact: null,
  setSelectedContact: (contact) => set({ selectedContact: contact }),
  filterContacts: (criteria) => {
    set((state) => {
      let filtered = state.contacts;
      
      if (criteria.companyId) {
        filtered = filtered.filter(contact => contact.companyId === criteria.companyId);
      }
      
      if (criteria.expertise) {
        filtered = filtered.filter(contact => 
          contact.expertise.some(exp => 
            exp.toLowerCase().includes(criteria.expertise!.toLowerCase())
          )
        );
      }
      
      if (criteria.title) {
        filtered = filtered.filter(contact => 
          contact.title.toLowerCase().includes(criteria.title!.toLowerCase())
        );
      }
      
      return { filteredContacts: filtered };
    });
  },
  getContactsByCompany: (companyId) => {
    return get().contacts.filter(contact => contact.companyId === companyId);
  },
  addContact: (contact) => {
    set((state) => ({
      contacts: [...state.contacts, contact],
      filteredContacts: [...state.filteredContacts, contact]
    }));
  },
  updateContact: (contact) => {
    set((state) => ({
      contacts: state.contacts.map(c => c.id === contact.id ? contact : c),
      filteredContacts: state.filteredContacts.map(c => c.id === contact.id ? contact : c),
      selectedContact: state.selectedContact?.id === contact.id ? contact : state.selectedContact
    }));
  },
}));