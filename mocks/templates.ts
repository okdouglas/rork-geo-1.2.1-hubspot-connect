import { EmailTemplate } from "@/types";

export const templates: EmailTemplate[] = [
  {
    id: "temp-001",
    name: "New Permit Engagement",
    subject: "Re: Recent {{primaryFormation}} Permit Filing - {{companyName}}",
    body: "Hi {{contactName}},\n\nI noticed {{companyName}} just filed a permit for the {{primaryFormation}} in {{county}} County. Given your expertise in {{expertise}}, I thought you might be interested in how our software helped similar companies optimize their {{primaryFormation}} development.\n\n[Case study details here]\n\nWould you be open to a brief 15-minute call to discuss how our geological software could support your current {{primaryFormation}} program?\n\nBest regards,",
    type: "New Permit Engagement",
    variables: ["primaryFormation", "companyName", "contactName", "county", "expertise"]
  },
  {
    id: "temp-002",
    name: "Geo Professional Introduction",
    subject: "Fellow {{education}} Alum - Geological Software Solutions",
    body: "Hi {{contactName}},\n\nI came across your profile and was impressed by your work on {{expertise}}. As a fellow professional working with {{primaryFormation}} geology, I thought you'd appreciate seeing how our software is helping geologists tackle similar challenges.\n\n[Technical differentiator details]\n\nWould you be interested in a short demonstration focused specifically on your {{expertise}} work?\n\nBest regards,",
    type: "Geo Professional Introduction",
    variables: ["education", "contactName", "expertise", "primaryFormation"]
  },
  {
    id: "temp-003",
    name: "Reactivation Outreach",
    subject: "Welcome Back to Drilling - {{companyName}}",
    body: "Hi {{contactName}},\n\nGreat to see {{companyName}} back to active drilling with your recent {{primaryFormation}} permit. The geological landscape has evolved significantly over the past months, particularly in [relevant technological advancement].\n\nI'd love to share how our latest software capabilities might help accelerate your new drilling program.\n\nDo you have time for a quick call this week?\n\nBest regards,",
    type: "Reactivation Outreach",
    variables: ["contactName", "companyName", "primaryFormation"]
  },
  {
    id: "temp-004",
    name: "Competitive Displacement",
    subject: "Alternative to {{currentSoftware}} for {{primaryFormation}} Analysis",
    body: "Hi {{contactName}},\n\nI understand your team has been using {{currentSoftware}} for your geological workflows. Many of our clients who previously used that platform have found our solution offers several advantages for {{primaryFormation}} analysis:\n\n[Competitive advantages list]\n\nWould you be open to seeing a side-by-side comparison focused specifically on your {{primaryFormation}} development needs?\n\nBest regards,",
    type: "Competitive Displacement",
    variables: ["contactName", "currentSoftware", "primaryFormation"]
  }
];