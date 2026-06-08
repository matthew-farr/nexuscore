// Main template rendering function - supports both {{placeholder}} and {placeholder} formats
export function renderTemplate(htmlTemplate, quoteData, isPreview = false) {
  if (!htmlTemplate) return getDefaultTemplate(quoteData);

  let html = htmlTemplate;

  // Build placeholder map
  const placeholders = buildPlaceholderMap(quoteData);

  // Replace all global placeholders (both {{key}} and {key} formats)
  for (const [key, value] of Object.entries(placeholders)) {
    // Replace {{key}} format
    html = html.replace(new RegExp(`{{${key}}}`, "gi"), value);
    // Replace {key} format
    html = html.replace(new RegExp(`{${key}}`, "gi"), value);
  }

  // Process products_table / {products_table}
  html = processProductsTable(html, quoteData);

  // Validate no unreplaced placeholders remain
  const unreplaced = findUnreplacedPlaceholders(html);
  if (unreplaced.length > 0 && isPreview) {
    console.warn("Template contains unreplaced placeholders:", unreplaced);
  }

  // Clean up any remaining visible placeholders for client export
  if (!isPreview) {
    html = html.replace(/{{[\w._]+}}/g, "");
    html = html.replace(/{[\w._]+}/g, "");
  }

  return html;
}

// Process template (legacy function name for backward compatibility)
export function processTemplate(htmlTemplate, data) {
  return renderTemplate(htmlTemplate, data, false);
}

// Build complete placeholder map with fallbacks
function buildPlaceholderMap(data) {
  return {
    customer_name: data.customerName || "—",
    client_name: data.customerName || "—",
    company_name: data.customerName || "—",
    issued_date: data.issuedDate || new Date().toLocaleDateString("en-GB"),
    quote_date: data.issuedDate || new Date().toLocaleDateString("en-GB"),
    valid_until: data.validUntil || "—",
    prepared_by: data.preparedBy || "—",
    account_manager_name: data.preparedBy || "—",
    account_manager_email: data.accountManagerEmail || "—",
    account_manager_phone: data.accountManagerPhone || "—",
    quote_reference: data.quoteReference || "—",
    subtotal: formatCurrency(data.totalEx || 0),
    total_ex_vat: formatCurrency(data.totalEx || 0),
    vat: formatCurrency(data.totalVat || 0),
    total_vat: formatCurrency(data.totalVat || 0),
    total: formatCurrency(data.totalInc || 0),
    total_inc_vat: formatCurrency(data.totalInc || 0),
    customer_notes: data.customerNotes || "—",
    internal_notes: data.internalNotes || "—",
    checks_direct_benefits: data.checksDirectBenefits || "—",
    theme_mode: data.theme_mode || "theme-light",
  };
}

// Generate products table from line items
function processProductsTable(html, data) {
  const hasProducts = data.lineItems && data.lineItems.length > 0;

  let productsHtml;
  if (hasProducts) {
    const rows = data.lineItems.map(line => {
      return `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${line.service || "—"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${line.description || "—"}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">£${(line.serviceFee || 0).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;"><strong>£${(line.servicePrice || 0).toFixed(2)}</strong></td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: left;">${line.notes || "—"}</td>
      </tr>`;
    }).join("\n");

    productsHtml = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #8b5cf6; color: white;">
          <th style="padding: 10px; text-align: left; font-size: 12px;">Service</th>
          <th style="padding: 10px; text-align: left; font-size: 12px;">Description</th>
          <th style="padding: 10px; text-align: right; font-size: 12px;">Service Fee</th>
          <th style="padding: 10px; text-align: right; font-size: 12px;">Price</th>
          <th style="padding: 10px; text-align: left; font-size: 12px;">Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
  } else {
    productsHtml = `<div style="padding: 20px; background: #f5f5f5; border-radius: 8px; text-align: center; color: #999; font-size: 13px;">
      No products have been added to this price list yet.
    </div>`;
  }

  // Replace both formats
  html = html.replace(/{{products_table}}/gi, productsHtml);
  html = html.replace(/{products_table}/gi, productsHtml);

  return html;
}

// Find any unreplaced placeholders for validation
function findUnreplacedPlaceholders(html) {
  const doubleMatch = html.match(/{{[\w._]+}}/g) || [];
  const singleMatch = html.match(/{[\w._]+}/g) || [];
  return [...new Set([...doubleMatch, ...singleMatch])];
}

// Format currency
function formatCurrency(num) {
  return `£${(isFinite(Number(num)) ? Number(num) : 0).toFixed(2)}`;
}

// Fallback built-in template
export function getDefaultTemplate(data) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Price List</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #8b5cf6; margin-bottom: 20px; }
    .info { margin-bottom: 30px; font-size: 13px; }
    .info p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #8b5cf6; color: white; padding: 10px; text-align: left; font-size: 12px; }
    td { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; }
    tr:nth-child(even) { background: #f9f9f9; }
    .total { font-weight: bold; font-size: 14px; color: #8b5cf6; margin-top: 20px; }
    .footer { margin-top: 40px; font-size: 10px; color: #999; }
  </style>
</head>
<body>
  <h1>PRICE LIST</h1>
  <div class="info">
    <p><strong>Customer:</strong> {{customer_name}}</p>
    <p><strong>Issued:</strong> {{issued_date}}</p>
    ${data.validUntil ? '<p><strong>Valid Until:</strong> {{valid_until}}</p>' : ""}
    <p><strong>Prepared By:</strong> {{prepared_by}}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Product / Check</th>
        <th style="text-align: right;">Price ex VAT</th>
        <th style="text-align: right;">Total Payable</th>
      </tr>
    </thead>
    <tbody>
      <!-- BEGIN_PRICE_LINES -->
      <tr>
        <td>{{line.product_name}}</td>
        <td style="text-align: right;">{{line.price_ex_vat}}</td>
        <td style="text-align: right;">{{line.price_inc_vat}}</td>
      </tr>
      <!-- END_PRICE_LINES -->
    </tbody>
  </table>
  <div class="total">Total: {{total_inc_vat}}</div>
  <div class="footer">
    <p>All prices are based on the selected checks and current pricing at the time of issue. Final requirements may vary depending on eligibility and check type. Please contact us for any questions.</p>
  </div>
</body>
</html>`;
}