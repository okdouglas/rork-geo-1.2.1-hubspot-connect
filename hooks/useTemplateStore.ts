import { create } from 'zustand';
import { templates } from '@/mocks/templates';
import { EmailTemplate } from '@/types';

type TemplateStore = {
  templates: EmailTemplate[];
  filteredTemplates: EmailTemplate[];
  selectedTemplate: EmailTemplate | null;
  setSelectedTemplate: (template: EmailTemplate | null) => void;
  filterTemplates: (criteria: {
    type?: string;
    search?: string;
  }) => void;
  addTemplate: (template: EmailTemplate) => void;
  updateTemplate: (template: EmailTemplate) => void;
};

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: templates,
  filteredTemplates: templates,
  selectedTemplate: null,
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  filterTemplates: (criteria) => {
    set((state) => {
      let filtered = state.templates;
      
      if (criteria.type) {
        filtered = filtered.filter(template => template.type === criteria.type);
      }
      
      if (criteria.search) {
        const searchLower = criteria.search.toLowerCase();
        filtered = filtered.filter(template => 
          template.name.toLowerCase().includes(searchLower) || 
          template.subject.toLowerCase().includes(searchLower) || 
          template.body.toLowerCase().includes(searchLower)
        );
      }
      
      return { filteredTemplates: filtered };
    });
  },
  addTemplate: (template) => {
    set((state) => ({
      templates: [...state.templates, template],
      filteredTemplates: [...state.filteredTemplates, template]
    }));
  },
  updateTemplate: (template) => {
    set((state) => ({
      templates: state.templates.map(t => t.id === template.id ? template : t),
      filteredTemplates: state.filteredTemplates.map(t => t.id === template.id ? template : t),
      selectedTemplate: state.selectedTemplate?.id === template.id ? template : state.selectedTemplate
    }));
  },
}));