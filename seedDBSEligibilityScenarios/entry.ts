import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCENARIOS = [
  {
    role_title: 'Teacher',
    sector: 'Education',
    summary: 'Teachers in schools are in regulated activity with children. The frequency test is typically met through regular teaching duties.',
    likely_check_level: "Enhanced DBS with Children's Barred List",
    workforce: 'Child Workforce',
    children_barred_list: 'Likely Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: false,
    status: 'Active',
    guidance_notes: 'Teaching in a school is a specified position. Enhanced DBS with children\'s barred list is the standard requirement for teachers.'
  },
  {
    role_title: 'Teaching Assistant',
    sector: 'Education',
    summary: 'Teaching assistants working regularly in schools are in regulated activity with children.',
    likely_check_level: "Enhanced DBS with Children's Barred List",
    workforce: 'Child Workforce',
    children_barred_list: 'Likely Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: false,
    status: 'Active',
    guidance_notes: 'Where the TA is working regularly, unsupervised with children in a school, regulated activity criteria are usually met.'
  },
  {
    role_title: 'School Volunteer',
    sector: 'Education',
    summary: 'Volunteers in schools may or may not be in regulated activity depending on frequency, supervision and activity.',
    likely_check_level: 'Enhanced DBS',
    workforce: 'Child Workforce',
    children_barred_list: 'May Be Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'Depends on frequency, supervision and activity. A one-off supervised volunteer may not meet regulated activity. Barred list check requires meeting the frequency test and being unsupervised. Escalate to Compliance if unsure.',
    key_questions: 'How often will the volunteer be in school?\nWill they be supervised at all times?\nWhat activities will they carry out?\nIs there a legal basis for the requested level of check?'
  },
  {
    role_title: 'Care Worker',
    sector: 'Care',
    summary: 'Care workers providing personal care to adults are carrying out regulated activity with adults.',
    likely_check_level: "Enhanced DBS with Adults' Barred List",
    workforce: 'Adult Workforce',
    children_barred_list: 'Not Usually Required',
    adults_barred_list: 'Likely Required',
    frequency_test_required: false,
    escalation_required: false,
    status: 'Active',
    guidance_notes: 'Personal care is a regulated activity with adults. The adults\' barred list check is linked to the activity, not just the setting.'
  },
  {
    role_title: 'Nurse',
    sector: 'Healthcare',
    summary: 'Nurses providing healthcare to adults are in regulated activity with adults. Where they also care for children, the children\'s barred list may apply.',
    likely_check_level: "Enhanced DBS with Adults' Barred List",
    workforce: 'Adult Workforce',
    children_barred_list: 'May Be Required',
    adults_barred_list: 'Likely Required',
    frequency_test_required: false,
    escalation_required: false,
    status: 'Active',
    guidance_notes: 'Healthcare is regulated activity with adults. If the nurse also works with children, the children\'s barred list may also apply — verify the actual patient group.'
  },
  {
    role_title: 'Dentist',
    sector: 'Dental',
    summary: 'Dentists providing dental care to adults are in regulated activity with adults. If they also treat children, children\'s barred list may apply.',
    likely_check_level: "Enhanced DBS with Adults' Barred List",
    workforce: 'Adult Workforce',
    children_barred_list: 'May Be Required',
    adults_barred_list: 'Likely Required',
    frequency_test_required: false,
    escalation_required: false,
    status: 'Active',
    guidance_notes: 'Dental care is healthcare and therefore regulated activity with adults. If children are also treated, confirm whether children\'s barred list is required.'
  },
  {
    role_title: 'Foster Carer',
    sector: 'Fostering',
    summary: 'Foster carers are in regulated activity with children.',
    likely_check_level: "Enhanced DBS with Children's Barred List",
    workforce: 'Child Workforce',
    children_barred_list: 'Likely Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: false,
    status: 'Active',
    guidance_notes: 'Fostering involves caring for children in the home setting. Enhanced DBS with children\'s barred list is required.'
  },
  {
    role_title: 'Private Tutor',
    sector: 'Education',
    summary: 'Private tutors may or may not be in regulated activity depending on whether the activity is regular, unsupervised and in a specified setting.',
    likely_check_level: 'Enhanced DBS',
    workforce: 'Child Workforce',
    children_barred_list: 'May Be Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'Depends on whether the tutoring is regular, unsupervised and whether the setting qualifies. If the frequency test is met and activity is unsupervised, children\'s barred list may apply. Escalate to Compliance if unsure.',
    key_questions: 'How often does tutoring take place?\nIs the tutor supervised?\nIs this in a school or specified setting?\nWhat is the nature of the tutoring activity?'
  },
  {
    role_title: 'Driver Transporting Children',
    sector: 'Transport',
    summary: 'Drivers who regularly transport children, such as school bus drivers or taxi drivers on school contracts, may be in regulated activity.',
    likely_check_level: 'Enhanced DBS',
    workforce: 'Child Workforce',
    children_barred_list: 'May Be Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'Driving children to or from a specified establishment is regulated activity where it is regular and unsupervised. Escalate to Compliance to confirm eligibility.',
    key_questions: 'Does the driver transport children to or from a school or specified establishment?\nHow often?\nIs the driver alone with children?\nIs this a contract specifically for transporting children?'
  },
  {
    role_title: 'Driver Transporting Adults Because of Age, Illness or Disability',
    sector: 'Transport / Care',
    summary: 'Drivers transporting adults because of age, illness or disability to or from places where they receive healthcare or personal care may be in regulated activity with adults.',
    likely_check_level: "Enhanced DBS with Adults' Barred List",
    workforce: 'Adult Workforce',
    children_barred_list: 'Not Usually Required',
    adults_barred_list: 'May Be Required',
    frequency_test_required: false,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'Conveying adults because of age, illness or disability is a form of regulated activity with adults. Whether barred list check is required depends on the specific activity and eligibility criteria. Escalate to Compliance.',
    key_questions: 'Is the driving specifically because of the adult\'s age, illness or disability?\nWhere are they being transported to or from?\nIs this regular?\nIs there a legal basis for the barred list check?'
  },
  {
    role_title: 'Charity Trustee',
    sector: 'Charity',
    summary: 'Whether a DBS check is appropriate for a charity trustee depends on the nature of the charity, the duties of the trustee and whether they have direct contact with vulnerable people.',
    likely_check_level: 'Escalate to Compliance',
    workforce: 'Other Workforce',
    children_barred_list: 'Not Enough Information',
    adults_barred_list: 'Not Enough Information',
    frequency_test_required: false,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'DBS eligibility for charity trustees is not automatic. It depends on the nature of the charity, the trustee\'s actual duties and whether they work with children or adults. Escalate to Compliance before submitting.',
    key_questions: 'What does the charity do?\nDo trustees have direct contact with vulnerable people?\nWhat are the actual duties of the trustee?\nIs there a legal basis for the requested check level?'
  },
  {
    role_title: 'Office Administrator With No Contact With Children or Adults',
    sector: 'Office',
    summary: 'An office administrator with no direct contact with children or adults at risk is unlikely to be eligible for an Enhanced or Standard DBS. A Basic DBS may be appropriate.',
    likely_check_level: 'Basic DBS',
    workforce: 'No Workforce',
    children_barred_list: 'Not Usually Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: false,
    escalation_required: false,
    status: 'Active',
    guidance_notes: 'Always confirm actual duties. If the administrator will have access to sensitive records, a Basic DBS may still be appropriate. Enhanced or Standard DBS requires a legal basis.'
  },
  {
    role_title: 'Cleaner in a School',
    sector: 'Education / Facilities',
    summary: 'A cleaner working in a school may have access to children but may not be in regulated activity depending on timing, supervision and frequency of contact.',
    likely_check_level: 'Enhanced DBS',
    workforce: 'Child Workforce',
    children_barred_list: 'Not Usually Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'Depends on setting, opportunity for contact, frequency and supervision. Cleaners who work when children are not present are generally not in regulated activity. Escalate to Compliance if unsure.',
    key_questions: 'Does the cleaner work when children are present?\nDo they have unsupervised access to children?\nHow often?\nWhat is the nature of any contact with children?'
  },
  {
    role_title: 'Contractor Working on School Site',
    sector: 'Contractors',
    summary: 'Contractors working on a school site may require an Enhanced DBS but the barred list is not usually required unless they are in regulated activity.',
    likely_check_level: 'Enhanced DBS',
    workforce: 'Child Workforce',
    children_barred_list: 'May Be Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'Enhanced DBS may be required if the contractor has opportunity for unsupervised contact with children. Barred list is not usually required unless the contractor is in regulated activity. Escalate to Compliance to confirm.',
    key_questions: 'Will the contractor work when children are present?\nWill they have unsupervised access to children?\nHow often and for how long?\nIs there a school policy requiring DBS?'
  },
  {
    role_title: 'Sports Coach Working With Children',
    sector: 'Sports and Leisure',
    summary: 'A sports coach regularly coaching children in an unsupervised setting may be in regulated activity, depending on frequency and whether the activity meets the regulated activity test.',
    likely_check_level: "Enhanced DBS with Children's Barred List",
    workforce: 'Child Workforce',
    children_barred_list: 'May Be Required',
    adults_barred_list: 'Not Usually Required',
    frequency_test_required: true,
    escalation_required: true,
    status: 'Active',
    guidance_notes: 'Sports coaching of children may be regulated activity where it is regular, unsupervised and involves teaching, training or instruction. Barred list eligibility depends on meeting the frequency test. Escalate to Compliance if unsure.',
    key_questions: 'How often is coaching carried out?\nIs the coach supervised?\nDoes the coaching involve teaching, training or instruction?\nIs the setting a school or specified establishment?'
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await base44.asServiceRole.entities.DBSEligibilityScenario.list();
    if (existing && existing.length > 0) {
      return Response.json({ message: `Scenarios already seeded (${existing.length} found). Clear first if you want to reseed.` });
    }

    const created = [];
    for (const scenario of SCENARIOS) {
      const rec = await base44.asServiceRole.entities.DBSEligibilityScenario.create({
        ...scenario,
        updated_by: user.email
      });
      created.push(rec.role_title);
    }

    return Response.json({ success: true, created: created.length, scenarios: created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});