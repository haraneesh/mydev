// @ts-check

/**
 * Safely converts any value to string with a default fallback
 * @param {any} value - The value to convert (can be any type)
 * @param {string} [defaultValue=''] - Default value if conversion fails
 * @returns {string} The converted string or default value
 */
function toString(value, defaultValue = '') {
  // Handle null/undefined case first
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // Handle string case
  if (typeof value === 'string') {
    return value;
  }
  
  // Handle number case
  if (typeof value === 'number') {
    return String(value);
  }
  
  // Handle boolean case
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  // Handle object case with toString method
  if (value && typeof value.toString === 'function') {
    try {
      return value.toString();
    } catch (e) {
      console.warn('Error converting object to string:', e);
      return defaultValue;
    }
  }
  
  // Fallback to default value for any other case
  return defaultValue;
}

export { toString };
