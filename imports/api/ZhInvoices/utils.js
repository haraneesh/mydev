/**
 * Safely converts a value to string with a default
 * @param {any} value - The value to convert
 * @param {string} [defaultValue=''] - The default value if conversion fails
 * @returns {string} The converted string or default value
 */
export const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  return String(value);
};

/**
 * Safely converts a value to a number
 * @param {any} value - The value to convert
 * @param {number} [defaultValue=0] - The default value if conversion fails
 * @returns {number} The converted number or default value
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};
