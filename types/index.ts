export interface Company {
  id: string;
  name: string;
  size: string;
  primaryFormation: string;
  recentPermitsCount: number;
  lastPermitDate: string;
  drillingActivityLevel: 'High' | 'Medium' | 'Low';
  geologicalStaffSize: number;
  currentSoftwareStack: string[];
  state: 'Oklahoma' | 'Kansas' | 'Both';
  status: 'Active' | 'Dormant' | 'Reactivated';
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  yearsExperience?: number;
  education?: string;
  expertise: string[];
  recentPublications?: string[];
  mutualConnections?: string[];
  linkedInUrl?: string;
  lastContactDate?: string;
}

export interface Permit {
  id: string;
  companyId: string;
  formationTarget: string;
  county: string;
  state: 'Oklahoma' | 'Kansas';
  filingDate: string;
  location: {
    section: string;
    township: string;
    range: string;
  };
  status: 'Filed' | 'Approved' | 'Drilling' | 'Completed';
  type: 'Horizontal' | 'Vertical' | 'Directional';
}

export interface Workflow {
  id: string;
  name: string;
  trigger: string;
  steps: WorkflowStep[];
  isActive: boolean;
  targetCompanyTypes: string[];
  targetFormations: string[];
}

export interface WorkflowStep {
  id: string;
  order: number;
  type: 'Email' | 'Task' | 'Note' | 'Call' | 'Research';
  description: string;
  daysFromTrigger: number;
  templateId?: string;
  isCompleted: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: string;
  variables: string[];
}

export interface DashboardStats {
  totalProspects: number;
  newPermits: number;
  activeWorkflows: number;
  meetingsScheduled: number;
  responseRate: number;
}