import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SEED_DATA = [
  // Sam
  { industry_name: "Advertising, Marketing and PR", owner: "Sam" },
  { industry_name: "Aerospace", owner: "Sam" },
  { industry_name: "Care", owner: "Sam" },
  { industry_name: "Childcare, Nurseries, and Youth Groups", owner: "Sam" },
  { industry_name: "Dental Practices", owner: "Sam" },
  { industry_name: "Engineering", owner: "Sam" },
  { industry_name: "Events", owner: "Sam" },
  { industry_name: "Fostering", owner: "Sam" },
  { industry_name: "Manufacturing", owner: "Sam" },
  { industry_name: "Medical and Health", owner: "Sam" },
  { industry_name: "Printing", owner: "Sam" },
  { industry_name: "Signage", owner: "Sam" },
  { industry_name: "Social Work", owner: "Sam" },
  { industry_name: "Technology", owner: "Sam" },
  // Claire
  { industry_name: "Agency", owner: "Claire" },
  { industry_name: "Architects", owner: "Claire" },
  { industry_name: "Drivers", owner: "Claire" },
  { industry_name: "Education and Training", owner: "Claire" },
  { industry_name: "Energy", owner: "Claire" },
  { industry_name: "Environmental Services", owner: "Claire" },
  { industry_name: "Financial Services", owner: "Claire" },
  { industry_name: "HR", owner: "Claire" },
  { industry_name: "Legal", owner: "Claire" },
  { industry_name: "Local Authority", owner: "Claire" },
  { industry_name: "Locksmiths", owner: "Claire" },
  { industry_name: "Oil and Gas", owner: "Claire" },
  { industry_name: "Private Tutoring", owner: "Claire" },
  { industry_name: "Recruitment", owner: "Claire" },
  { industry_name: "Security", owner: "Claire" },
  { industry_name: "Solicitors", owner: "Claire" },
  { industry_name: "Transport and Logistics", owner: "Claire" },
  { industry_name: "Utilities", owner: "Claire" },
  // Sandra
  { industry_name: "Automotive", owner: "Sandra" },
  { industry_name: "Caterers", owner: "Sandra" },
  { industry_name: "Charitable", owner: "Sandra" },
  { industry_name: "Cleaning", owner: "Sandra" },
  { industry_name: "Clubs", owner: "Sandra" },
  { industry_name: "Construction", owner: "Sandra" },
  { industry_name: "Contractors", owner: "Sandra" },
  { industry_name: "Entertainment, Theatre, and Arts", owner: "Sandra" },
  { industry_name: "Facilities Management", owner: "Sandra" },
  { industry_name: "Foundations", owner: "Sandra" },
  { industry_name: "Heating, Ventilation and Air Conditioning", owner: "Sandra" },
  { industry_name: "Hospitality", owner: "Sandra" },
  { industry_name: "Hotels", owner: "Sandra" },
  { industry_name: "Housing", owner: "Sandra" },
  { industry_name: "Landlords", owner: "Sandra" },
  { industry_name: "Real Estate", owner: "Sandra" },
  { industry_name: "Religion and Faith", owner: "Sandra" },
  { industry_name: "Removals (Domestic and Industrial)", owner: "Sandra" },
  { industry_name: "Retail and Wholesale Trade", owner: "Sandra" },
  { industry_name: "Services", owner: "Sandra" },
  { industry_name: "Sign Language", owner: "Sandra" },
  { industry_name: "Sports and Leisure", owner: "Sandra" },
  { industry_name: "Tourism & Travel", owner: "Sandra" },
  { industry_name: "Trusts", owner: "Sandra" },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch existing records to avoid duplicates
    const existing = await base44.asServiceRole.entities.IndustryAssignment.list('', 500);
    const existingNames = new Set((existing || []).map(r => r.industry_name?.toLowerCase()));

    const toCreate = SEED_DATA.filter(d => !existingNames.has(d.industry_name.toLowerCase()));

    let created = 0;
    for (const item of toCreate) {
      await base44.asServiceRole.entities.IndustryAssignment.create({ ...item, status: 'Active' });
      created++;
    }

    return Response.json({ success: true, created, skipped: SEED_DATA.length - created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});