export const DISCLAIMER = "This tool is a guide only. DBS eligibility depends on the actual duties, activity, setting, frequency, supervision and legal eligibility criteria. Do not rely on job title alone. If unsure, refer to DBS guidance or escalate to Compliance before submitting an application.";

export const GUIDANCE_LINKS = [
  { label: "DBS eligibility guidance", url: "https://www.gov.uk/guidance/dbs-check-eligible-positions-guidance" },
  { label: "Enhanced DBS eligibility guidance", url: "https://www.gov.uk/guidance/dbs-check-eligible-positions-guidance#enhanced-dbs-checks" },
  { label: "Regulated activity with children", url: "https://www.gov.uk/government/publications/dbs-regulated-activity-with-children--2" },
  { label: "Regulated activity with adults", url: "https://www.gov.uk/government/publications/regulated-activity-with-vulnerable-adults" },
];

export const CHECK_LEVEL_COLOURS = {
  "Basic DBS": "text-blue-400 bg-blue-400/10 border-blue-400/30",
  "Standard DBS": "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  "Enhanced DBS": "text-purple-400 bg-purple-400/10 border-purple-400/30",
  "Enhanced DBS with Children's Barred List": "text-pink-400 bg-pink-400/10 border-pink-400/30",
  "Enhanced DBS with Adults' Barred List": "text-orange-400 bg-orange-400/10 border-orange-400/30",
  "Enhanced DBS with Children's and Adults' Barred Lists": "text-red-400 bg-red-400/10 border-red-400/30",
  "Not enough information": "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  "Escalate to Compliance": "text-red-400 bg-red-400/10 border-red-400/30",
};

export const BARRED_LIST_COLOURS = {
  "Likely Required": "text-red-400",
  "May Be Required": "text-yellow-400",
  "Not Usually Required": "text-green-400",
  "Not Enough Information": "text-gray-400",
  "Escalate to Compliance": "text-red-400",
};

export const FREQUENCY_TEST_TEXT = "For children's regulated activity, frequency is an important test. Regular activity is commonly understood as once a week or more, 4 or more days in a 30-day period, or overnight in some circumstances. Always assess the actual duties, setting and supervision.";

export const ADULT_BARRED_LIST_CRITERIA = `The adults' barred list is linked to regulated activity with adults and may apply where the person is carrying out specific regulated activities such as:

• Healthcare
• Personal care
• Social work
• Assistance with cash, bills or shopping because of age, illness or disability
• Assistance in the conduct of a person's own affairs
• Conveying adults because of age, illness or disability to or from places where they receive healthcare, personal care or social work

Adult barred list eligibility is based on the activity being carried out, not simply the setting or job title.`;

export const DEFAULT_KEY_QUESTIONS = [
  "What duties will the person actually carry out?",
  "Will they work with children, adults, or both?",
  "Is the activity regular?",
  "Is the activity supervised?",
  "Are they providing personal care, healthcare, social work, or relevant assistance?",
  "Are they transporting adults because of age, illness or disability?",
  "Is this paid or voluntary?",
  "Is there a legal basis for the requested level of check?",
];

export const SECTORS = [
  "Education", "Care", "Healthcare", "Dental", "Fostering", "Transport",
  "Transport / Care", "Charity", "Office", "Education / Facilities",
  "Contractors", "Sports and Leisure", "Social Work", "Other"
];