/**
 * Parse date from DD/MM/YYYY, DD/MM/YY, or ISO format
 */
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') return new Date(dateStr);
  
  // ISO format (YYYY-MM-DD or ISO datetime)
  if (dateStr.includes('T') || (dateStr.includes('-') && dateStr.split('-')[0].length === 4)) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;
  }
  
  // DD/MM/YYYY or DD/MM/YY format
  const slashParts = dateStr.trim().split('/');
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0]);
    const month = parseInt(slashParts[1]);
    let year = parseInt(slashParts[2]);
    
    // Handle 2-digit year
    if (year < 100) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
};

/**
 * Calculate query age in days from date_received to today
 * @param {string|Date} dateReceived - The date the query was received
 * @returns {number|null} - Days old, or null if invalid
 */
export const calculateQueryAge = (dateReceived) => {
  if (!dateReceived) return null;
  
  try {
    const received = parseDate(dateReceived);
    if (!received) return null;
    
    const today = new Date();
    const diffMs = today - received;
    const age = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Don't return negative ages
    if (age < 0) return null;
    
    return age;
  } catch (e) {
    return null;
  }
};

/**
 * Format query age for display
 * @param {number|null} age - Days old
 * @returns {string}
 */
export const formatQueryAge = (age) => {
  if (age === null || age === undefined) return 'Invalid date';
  if (age === 0) return '0 days';
  if (age === 1) return '1 day';
  return `${age} days`;
};

/**
 * Get color for query age
 * @param {number|null} age - Days old
 * @returns {string} - Hex color
 */
export const getAgeColor = (age) => {
  if (age === null) return '#999999'; // Gray for invalid
  if (age <= 3) return '#10b981'; // green
  if (age <= 7) return '#f59e0b'; // amber
  return '#ef4444'; // red
};

/**
 * Check if a date is valid and not in the future
 * @param {string|Date} dateStr - Date to validate
 * @returns {boolean}
 */
export const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    if (date > new Date()) return false; // Don't allow future dates
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Format date for display as DD/MM/YYYY
 * @param {string|Date} dateStr - Date to format
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = parseDate(dateStr);
    if (!date) return '-';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

/**
 * Format datetime for display as DD/MM/YYYY HH:MM BST/GMT in Europe/London timezone
 * Handles BST (British Summer Time) and GMT automatically
 * @param {string|Date} dateStr - Datetime to format
 * @returns {string}
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const date = parseDate(dateStr) || new Date(dateStr);
    if (!date || isNaN(date.getTime())) return '-';
    
    // Format date and time using Europe/London timezone (handles BST/GMT automatically)
    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London'
    });
    
    const formatted = dateFormatter.format(date);
    // Intl returns DD/MM/YYYY, HH:MM - rearrange to DD/MM/YYYY HH:MM
    const parts = formatted.split(', ');
    const dateTime = parts.join(' ');
    
    // Determine if BST or GMT based on the date
    const timeZoneName = date.toLocaleString('en-GB', { timeZone: 'Europe/London', timeZoneName: 'short' });
    const tzMatch = timeZoneName.match(/\b(BST|GMT)\b/);
    const tz = tzMatch ? tzMatch[1] : 'GMT';
    
    return `${dateTime} ${tz}`;
  } catch {
    return '-';
  }
};