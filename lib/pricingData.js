// ============================================================
// Checks Direct — Cost Master pricing data
// Supplier Cost ex VAT | Supplier VAT Rate (decimal) | inc VAT
// ============================================================

export const PRODUCTS = [
  { name: "Adult First Check",                          costEx: 6.00,  vatRate: 0 },
  { name: "Basic DBS Check",                            costEx: 18.00, vatRate: 0 },
  { name: "BS7858",                                     costEx: 0.00,  vatRate: 0.20 },
  { name: "Credas ID Check",                            costEx: 1.20,  vatRate: 0.20 },
  { name: "DBS Status Check",                           costEx: 0.00,  vatRate: 0.20 },
  { name: "Digital ID S/E",                             costEx: 1.50,  vatRate: 0.20 },
  { name: "DVLA Check",                                 costEx: 5.00,  vatRate: 0.20 },
  { name: "Employee Credit Check",                      costEx: 4.50,  vatRate: 0.20 },
  { name: "Enhanced DBS Check",                         costEx: 38.00, vatRate: 0 },
  { name: "Overseas Police Check",                      costEx: 0,     vatRate: 0.20, isOverseas: true },
  { name: "Prohibited from Teaching Check",             costEx: 0.00,  vatRate: 0 },
  { name: "Right to Work Check",                        costEx: 1.45,  vatRate: 0.20 },
  { name: "Route 2",                                    costEx: 0.00,  vatRate: 0.20 },
  { name: "Section 128 Check",                          costEx: 0.00,  vatRate: 0 },
  { name: "Standard DBS Check",                         costEx: 18.00, vatRate: 0 },
  { name: "Standard UK AML",                            costEx: 2.50,  vatRate: 0.20 },
  { name: "Training",                                   costEx: 0.00,  vatRate: 0.20 },
  { name: "Volunteer DBS Check (Enhanced)",             costEx: 0.00,  vatRate: 0 },
  { name: "Single Employment Reference – No Gap",       costEx: 0.00,  vatRate: 0.20 },
  { name: "2 Year Employment Reference – No Gap",       costEx: 0.00,  vatRate: 0.20 },
  { name: "2 Year Employment Reference – With Gap",     costEx: 0.00,  vatRate: 0.20 },
  { name: "3 Year Employment Reference – No Gap",       costEx: 0.00,  vatRate: 0.20 },
  { name: "3 Year Employment Reference – With Gap",     costEx: 0.00,  vatRate: 0.20 },
  { name: "5 Year Employment Reference – No Gap",       costEx: 0.00,  vatRate: 0.20 },
  { name: "5 Year Employment Reference – With Gap",     costEx: 0.00,  vatRate: 0.20 },
  { name: "6 Year Employment Reference – No Gap",       costEx: 0.00,  vatRate: 0.20 },
  { name: "6 Year Employment Reference – With Gap",     costEx: 0.00,  vatRate: 0.20 },
  { name: "BPSS",                                       costEx: 0.00,  vatRate: 0.20 },
];

// ============================================================
// Overseas Police Check pricing
// Keys: "financial_integrity" | "criminal_history" | "directorship"
// Values: supplier cost ex VAT (£). 0 = Not available
// ============================================================

export const OVERSEAS_PRICING = [
  { country: "Australia",      financial_integrity: 45.00, criminal_history: 42.00, directorship: 55.00 },
  { country: "Canada",         financial_integrity: 50.00, criminal_history: 48.00, directorship: 60.00 },
  { country: "France",         financial_integrity: 38.00, criminal_history: 35.00, directorship: 45.00 },
  { country: "Germany",        financial_integrity: 38.00, criminal_history: 35.00, directorship: 45.00 },
  { country: "Ghana",          financial_integrity: 55.00, criminal_history: 50.00, directorship: 0 },
  { country: "India",          financial_integrity: 40.00, criminal_history: 38.00, directorship: 50.00 },
  { country: "Ireland",        financial_integrity: 32.00, criminal_history: 30.00, directorship: 40.00 },
  { country: "Jamaica",        financial_integrity: 60.00, criminal_history: 55.00, directorship: 0 },
  { country: "Kenya",          financial_integrity: 55.00, criminal_history: 50.00, directorship: 0 },
  { country: "Netherlands",    financial_integrity: 36.00, criminal_history: 34.00, directorship: 44.00 },
  { country: "New Zealand",    financial_integrity: 45.00, criminal_history: 42.00, directorship: 55.00 },
  { country: "Nigeria",        financial_integrity: 60.00, criminal_history: 55.00, directorship: 0 },
  { country: "Pakistan",       financial_integrity: 45.00, criminal_history: 42.00, directorship: 0 },
  { country: "Philippines",    financial_integrity: 50.00, criminal_history: 45.00, directorship: 0 },
  { country: "Poland",         financial_integrity: 35.00, criminal_history: 32.00, directorship: 42.00 },
  { country: "Portugal",       financial_integrity: 36.00, criminal_history: 34.00, directorship: 44.00 },
  { country: "Romania",        financial_integrity: 35.00, criminal_history: 32.00, directorship: 0 },
  { country: "South Africa",   financial_integrity: 50.00, criminal_history: 45.00, directorship: 60.00 },
  { country: "Spain",          financial_integrity: 36.00, criminal_history: 34.00, directorship: 44.00 },
  { country: "United States",  financial_integrity: 48.00, criminal_history: 45.00, directorship: 58.00 },
  { country: "Zimbabwe",       financial_integrity: 65.00, criminal_history: 60.00, directorship: 0 },
];

export const OVERSEAS_CHECK_TYPES = [
  { key: "financial_integrity", label: "Financial Integrity" },
  { key: "criminal_history",    label: "Criminal History" },
  { key: "directorship",        label: "Directorship" },
];

// Helper
export function getOverseasCost(country, checkTypeKey) {
  const row = OVERSEAS_PRICING.find(r => r.country === country);
  if (!row) return null;
  const val = row[checkTypeKey];
  if (!val || val === 0) return null;
  return val;
}