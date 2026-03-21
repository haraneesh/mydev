
/**
 * Compares two semantic version strings.
 * Returns:
 * - 1 if v1 > v2
 * - -1 if v1 < v2
 * - 0 if v1 === v2
 * 
 * @param {string} v1 - First version string (e.g., "1.0.0")
 * @param {string} v2 - Second version string (e.g., "1.0.1")
 * @returns {number} Comparison result
 */
export const compareVersions = (v1, v2) => {
  if (!v1 || !v2) return 0;
  
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length);
  
  for (let i = 0; i < maxLength; i++) {
    const p1 = v1Parts[i] || 0;
    const p2 = v2Parts[i] || 0;
    
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
};

/**
 * Checks if the current version is outdated compared to the minimum required version.
 * 
 * @param {string} currentVersion - The current app version
 * @param {string} minVersion - The minimum required version
 * @returns {boolean} True if current version is less than min version
 */
export const isVersionOutdated = (currentVersion, minVersion) => {
  return compareVersions(currentVersion, minVersion) < 0;
};
