import { Contact } from "@/types";

export const contacts: Contact[] = [
  {
    id: "cont-001",
    companyId: "comp-001",
    name: "Sarah Mitchell",
    title: "Chief Geologist",
    email: "s.mitchell@frontierenergy.com",
    phone: "405-555-1234",
    yearsExperience: 15,
    education: "University of Oklahoma",
    expertise: ["Woodford Shale", "Structural Modeling", "Sequence Stratigraphy"],
    recentPublications: ["Woodford Shale Deposition Patterns in the Anadarko Basin"],
    linkedInUrl: "linkedin.com/in/sarahmitchell",
    lastContactDate: "2025-06-20"
  },
  {
    id: "cont-002",
    companyId: "comp-001",
    name: "Mark Reynolds",
    title: "Exploration Manager",
    email: "m.reynolds@frontierenergy.com",
    phone: "405-555-2345",
    yearsExperience: 12,
    education: "Colorado School of Mines",
    expertise: ["Reservoir Characterization", "Woodford Shale"],
    lastContactDate: "2025-06-10"
  },
  {
    id: "cont-003",
    companyId: "comp-002",
    name: "Jennifer Lopez",
    title: "Senior Geologist",
    email: "j.lopez@heartlandpetroleum.com",
    phone: "316-555-3456",
    yearsExperience: 8,
    education: "Kansas State University",
    expertise: ["Mississippian Lime", "Fracture Analysis"],
    mutualConnections: ["Thomas Wilson", "Rebecca Clark"],
    lastContactDate: "2025-05-28"
  },
  {
    id: "cont-004",
    companyId: "comp-003",
    name: "David Park",
    title: "VP Geology",
    email: "d.park@bedrockexploration.com",
    phone: "405-555-4567",
    yearsExperience: 22,
    education: "University of Texas",
    expertise: ["Meramec Formation", "Production Optimization", "Sequence Stratigraphy"],
    recentPublications: ["Optimizing Multi-Zone Development in the STACK Play"],
    linkedInUrl: "linkedin.com/in/davidpark",
    lastContactDate: "2025-02-15"
  },
  {
    id: "cont-005",
    companyId: "comp-004",
    name: "Michael Chen",
    title: "Geophysicist",
    email: "m.chen@prairiebasin.com",
    phone: "785-555-5678",
    yearsExperience: 10,
    education: "Stanford University",
    expertise: ["Niobrara Formation", "Seismic Interpretation"],
    linkedInUrl: "linkedin.com/in/michaelchen",
    lastContactDate: "2025-06-25"
  },
  {
    id: "cont-006",
    companyId: "comp-005",
    name: "Laura Johnson",
    title: "Geological Technician",
    email: "l.johnson@tallgrassdrilling.com",
    phone: "918-555-6789",
    yearsExperience: 5,
    education: "Oklahoma State University",
    expertise: ["Well Log Analysis", "Data Management"],
    lastContactDate: "2025-01-10"
  },
  {
    id: "cont-007",
    companyId: "comp-006",
    name: "Robert Williams",
    title: "Senior Geologist",
    email: "r.williams@redriverenergy.com",
    phone: "316-555-7890",
    yearsExperience: 14,
    education: "University of Kansas",
    expertise: ["Cherokee Group", "Structural Geology"],
    mutualConnections: ["Jennifer Lopez"],
    lastContactDate: "2025-06-05"
  }
];