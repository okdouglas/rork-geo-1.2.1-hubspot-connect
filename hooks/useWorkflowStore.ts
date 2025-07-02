import { create } from 'zustand';
import { workflows } from '@/mocks/workflows';
import { Workflow, WorkflowStep } from '@/types';

type WorkflowStore = {
  workflows: Workflow[];
  filteredWorkflows: Workflow[];
  selectedWorkflow: Workflow | null;
  setSelectedWorkflow: (workflow: Workflow | null) => void;
  filterWorkflows: (criteria: {
    isActive?: boolean;
    targetFormation?: string;
    targetCompanyType?: string;
  }) => void;
  toggleWorkflowActive: (id: string) => void;
  updateWorkflowStep: (workflowId: string, step: WorkflowStep) => void;
  addWorkflow: (workflow: Workflow) => void;
};

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  workflows: workflows,
  filteredWorkflows: workflows,
  selectedWorkflow: null,
  setSelectedWorkflow: (workflow) => set({ selectedWorkflow: workflow }),
  filterWorkflows: (criteria) => {
    set((state) => {
      let filtered = state.workflows;
      
      if (criteria.isActive !== undefined) {
        filtered = filtered.filter(workflow => workflow.isActive === criteria.isActive);
      }
      
      if (criteria.targetFormation) {
        filtered = filtered.filter(workflow => 
          workflow.targetFormations.includes(criteria.targetFormation!) || 
          workflow.targetFormations.includes('All')
        );
      }
      
      if (criteria.targetCompanyType) {
        filtered = filtered.filter(workflow => 
          workflow.targetCompanyTypes.includes(criteria.targetCompanyType!) || 
          workflow.targetCompanyTypes.includes('All')
        );
      }
      
      return { filteredWorkflows: filtered };
    });
  },
  toggleWorkflowActive: (id) => {
    set((state) => ({
      workflows: state.workflows.map(wf => 
        wf.id === id ? { ...wf, isActive: !wf.isActive } : wf
      ),
      filteredWorkflows: state.filteredWorkflows.map(wf => 
        wf.id === id ? { ...wf, isActive: !wf.isActive } : wf
      ),
      selectedWorkflow: state.selectedWorkflow?.id === id ? 
        { ...state.selectedWorkflow, isActive: !state.selectedWorkflow.isActive } : 
        state.selectedWorkflow
    }));
  },
  updateWorkflowStep: (workflowId, updatedStep) => {
    set((state) => {
      const updatedWorkflows = state.workflows.map(workflow => {
        if (workflow.id === workflowId) {
          return {
            ...workflow,
            steps: workflow.steps.map(step => 
              step.id === updatedStep.id ? updatedStep : step
            )
          };
        }
        return workflow;
      });
      
      const updatedFilteredWorkflows = state.filteredWorkflows.map(workflow => {
        if (workflow.id === workflowId) {
          return {
            ...workflow,
            steps: workflow.steps.map(step => 
              step.id === updatedStep.id ? updatedStep : step
            )
          };
        }
        return workflow;
      });
      
      let updatedSelectedWorkflow = state.selectedWorkflow;
      if (state.selectedWorkflow?.id === workflowId) {
        updatedSelectedWorkflow = {
          ...state.selectedWorkflow,
          steps: state.selectedWorkflow.steps.map(step => 
            step.id === updatedStep.id ? updatedStep : step
          )
        };
      }
      
      return {
        workflows: updatedWorkflows,
        filteredWorkflows: updatedFilteredWorkflows,
        selectedWorkflow: updatedSelectedWorkflow
      };
    });
  },
  addWorkflow: (workflow) => {
    set((state) => ({
      workflows: [...state.workflows, workflow],
      filteredWorkflows: [...state.filteredWorkflows, workflow]
    }));
  },
}));