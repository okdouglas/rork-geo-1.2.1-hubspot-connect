import { Company } from "@/types";

export const companies: Company[] = [
  {
    id: "comp-001",
    name: "Frontier Energy",
    size: "Medium",
    primaryFormation: "Woodford Shale",
    recentPermitsCount: 8,
    lastPermitDate: "2025-06-15",
    drillingActivityLevel: "High",
    geologicalStaffSize: 12,
    currentSoftwareStack: ["Petrel", "Geographix"],
    state: "Oklahoma",
    status: "Active"
  },
  {
    id: "comp-002",
    name: "Heartland Petroleum",
    size: "Small",
    primaryFormation: "Mississippian Lime",
    recentPermitsCount: 3,
    lastPermitDate: "2025-06-02",
    drillingActivityLevel: "Medium",
    geologicalStaffSize: 5,
    currentSoftwareStack: ["Petra"],
    state: "Kansas",
    status: "Active"
  },
  {
    id: "comp-003",
    name: "Bedrock Exploration",
    size: "Large",
    primaryFormation: "Meramec Formation",
    recentPermitsCount: 0,
    lastPermitDate: "2024-11-20",
    drillingActivityLevel: "Low",
    geologicalStaffSize: 18,
    currentSoftwareStack: ["Petrel", "Kingdom", "Paradigm"],
    state: "Oklahoma",
    status: "Dormant"
  },
  {
    id: "comp-004",
    name: "Prairie Basin Resources",
    size: "Medium",
    primaryFormation: "Niobrara Formation",
    recentPermitsCount: 5,
    lastPermitDate: "2025-06-28",
    drillingActivityLevel: "Medium",
    geologicalStaffSize: 8,
    currentSoftwareStack: ["Petra", "IHS Kingdom"],
    state: "Kansas",
    status: "Active"
  },
  {
    id: "comp-005",
    name: "Tallgrass Drilling",
    size: "Medium",
    primaryFormation: "Osage/Hunton",
    recentPermitsCount: 2,
    lastPermitDate: "2024-12-10",
    drillingActivityLevel: "Low",
    geologicalStaffSize: 6,
    currentSoftwareStack: ["Geographix"],
    state: "Both",
    status: "Dormant"
  },
  {
    id: "comp-006",
    name: "Red River Energy",
    size: "Small",
    primaryFormation: "Cherokee Group",
    recentPermitsCount: 4,
    lastPermitDate: "2025-06-10",
    drillingActivityLevel: "Medium",
    geologicalStaffSize: 4,
    currentSoftwareStack: ["Petra"],
    state: "Kansas",
    status: "Reactivated"
  }
];