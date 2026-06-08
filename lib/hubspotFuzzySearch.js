/**
 * HubSpot Fuzzy Search — multi-token partial matching.
 * "cm tra" will find "CM Travel Test 1" because all tokens ["cm","tra"]
 * appear somewhere in the record's combined text fields.
 */

// Normalise: lowercase, strip punctuation, collapse spaces
function norm(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Normalise phone: strip spaces, dashes, brackets, plus signs
function normPhone(str) {
  if (!str) return "";
  return String(str).replace(/[\s\-\(\)\+\.]/g, "");
}

/**
 * Score a record against a query.
 * @param {string[]} fields  — text fields to search across
 * @param {string[]} phoneFields — phone fields for phone matching
 * @param {string}   query
 * @returns {number} 0 = no match, >0 = match (higher = better)
 */
function scoreRecord(fields, phoneFields, query) {
  const qNorm   = norm(query);
  const tokens  = qNorm.split(" ").filter(t => t.length > 0);
  const qPhone  = normPhone(query);

  if (tokens.length === 0) return 0;

  // Build a single combined string from all text fields
  const combined = fields.filter(Boolean).map(f => norm(String(f))).join(" ");

  // ALL tokens appear in combined text → strong match
  if (tokens.every(t => combined.includes(t))) {
    // Bonus: exact full match
    if (combined.includes(qNorm)) return 120;
    return 100;
  }

  // Phone number match
  if (qPhone.length >= 5) {
    const combinedPhone = phoneFields.filter(Boolean).map(normPhone).join("");
    if (combinedPhone.includes(qPhone)) return 90;
  }

  // Partial: at least half the tokens match
  const hitCount = tokens.filter(t => combined.includes(t)).length;
  if (hitCount >= Math.ceil(tokens.length / 2)) {
    return Math.round(60 * hitCount / tokens.length);
  }

  return 0;
}

export function fuzzySearchCompanies(companies, query) {
  if (!query || query.trim().length < 2) return companies; // return all if no filter

  const scored = companies.map(company => {
    const p = company.properties || {};
    const score = scoreRecord(
      [p.name, p.domain, p.city, p.industry, p.lifecyclestage, p.description],
      [p.phone],
      query
    );
    return { company, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.company);
}

export function fuzzySearchContacts(contacts, query) {
  if (!query || query.trim().length < 2) return contacts;

  const scored = contacts.map(contact => {
    const p = contact.properties || {};
    const fullName = [p.firstname, p.lastname].filter(Boolean).join(" ");
    const score = scoreRecord(
      [fullName, p.firstname, p.lastname, p.email, p.jobtitle, p.company],
      [p.phone, p.mobilephone],
      query
    );
    return { contact, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.contact);
}

export function fuzzySearchDeals(deals, query) {
  if (!query || query.trim().length < 2) return deals;

  const scored = deals.map(deal => {
    const p = deal.properties || {};
    const score = scoreRecord(
      [p.dealname, p.dealstage, p.pipeline, p.description, p.amount],
      [],
      query
    );
    return { deal, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.deal);
}