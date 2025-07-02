import { Workflow } from "@/types";

export const workflows: Workflow[] = [
  {
    id: "wf-001",
    name: "New Permit Alert",
    trigger: "New drilling permit filed",
    steps: [
      {
        id: "step-001",
        order: 1,
        type: "Research",
        description: "Research geological team at company",
        daysFromTrigger: 0,
        isCompleted: false
      },
      {
        id: "step-002",
        order: 2,
        type: "Email",
        description: "Send personalized email referencing permit",
        daysFromTrigger: 1,
        templateId: "temp-001",
        isCompleted: false
      },
      {
        id: "step-003",
        order: 3,
        type: "Call",
        description: "Follow-up call with key decision maker",
        daysFromTrigger: 7,
        isCompleted: false
      }
    ],
    isActive: true,
    targetCompanyTypes: ["All"],
    targetFormations: ["All"]
  },
  {
    id: "wf-002",
    name: "Geo Professional Discovery",
    trigger: "New geological professional identified",
    steps: [
      {
        id: "step-004",
        order: 1,
        type: "Research",
        description: "Research recent technical work/publications",
        daysFromTrigger: 0,
        isCompleted: false
      },
      {
        id: "step-005",
        order: 2,
        type: "Email",
        description: "Send personalized introduction email",
        daysFromTrigger: 2,
        templateId: "temp-002",
        isCompleted: false
      },
      {
        id: "step-006",
        order: 3,
        type: "Task",
        description: "Connect on LinkedIn",
        daysFromTrigger: 3,
        isCompleted: false
      },
      {
        id: "step-007",
        order: 4,
        type: "Call",
        description: "Follow-up call to discuss software needs",
        daysFromTrigger: 10,
        isCompleted: false
      }
    ],
    isActive: true,
    targetCompanyTypes: ["All"],
    targetFormations: ["All"]
  },
  {
    id: "wf-003",
    name: "Dormant Operator Reactivation",
    trigger: "First permit after 6+ months inactivity",
    steps: [
      {
        id: "step-008",
        order: 1,
        type: "Research",
        description: "Research changes in geological staff",
        daysFromTrigger: 0,
        isCompleted: false
      },
      {
        id: "step-009",
        order: 2,
        type: "Email",
        description: "Send welcome back to drilling message",
        daysFromTrigger: 1,
        templateId: "temp-003",
        isCompleted: false
      },
      {
        id: "step-010",
        order: 3,
        type: "Task",
        description: "Prepare software trial/demo offer",
        daysFromTrigger: 3,
        isCompleted: false
      },
      {
        id: "step-011",
        order: 4,
        type: "Call",
        description: "Call to discuss new exploration focus",
        daysFromTrigger: 5,
        isCompleted: false
      }
    ],
    isActive: true,
    targetCompanyTypes: ["Reactivated"],
    targetFormations: ["All"]
  }
];