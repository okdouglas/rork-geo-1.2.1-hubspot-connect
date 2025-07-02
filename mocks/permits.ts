import { Permit } from "@/types";

export const permits: Permit[] = [
  {
    id: "perm-001",
    companyId: "comp-001",
    formationTarget: "Woodford Shale",
    county: "Canadian",
    state: "Oklahoma",
    filingDate: "2025-06-15",
    location: {
      section: "12",
      township: "13N",
      range: "7W"
    },
    status: "Approved",
    type: "Horizontal"
  },
  {
    id: "perm-002",
    companyId: "comp-001",
    formationTarget: "Woodford Shale",
    county: "Kingfisher",
    state: "Oklahoma",
    filingDate: "2025-06-10",
    location: {
      section: "8",
      township: "15N",
      range: "8W"
    },
    status: "Drilling",
    type: "Horizontal"
  },
  {
    id: "perm-003",
    companyId: "comp-002",
    formationTarget: "Mississippian Lime",
    county: "Barber",
    state: "Kansas",
    filingDate: "2025-06-02",
    location: {
      section: "22",
      township: "32S",
      range: "11W"
    },
    status: "Filed",
    type: "Horizontal"
  },
  {
    id: "perm-004",
    companyId: "comp-004",
    formationTarget: "Niobrara Formation",
    county: "Gove",
    state: "Kansas",
    filingDate: "2025-06-28",
    location: {
      section: "14",
      township: "14S",
      range: "28W"
    },
    status: "Filed",
    type: "Horizontal"
  },
  {
    id: "perm-005",
    companyId: "comp-004",
    formationTarget: "Niobrara Formation",
    county: "Logan",
    state: "Kansas",
    filingDate: "2025-06-20",
    location: {
      section: "30",
      township: "13S",
      range: "35W"
    },
    status: "Approved",
    type: "Directional"
  },
  {
    id: "perm-006",
    companyId: "comp-006",
    formationTarget: "Cherokee Group",
    county: "Labette",
    state: "Kansas",
    filingDate: "2025-06-10",
    location: {
      section: "16",
      township: "31S",
      range: "19E"
    },
    status: "Approved",
    type: "Vertical"
  }
];