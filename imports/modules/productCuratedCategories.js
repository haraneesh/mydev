export function toggleCuratedCategory(curatedCategories = [], categoryName) {
  const currentCategories = Array.isArray(curatedCategories)
    ? curatedCategories
    : [];

  if (currentCategories.includes(categoryName)) {
    return currentCategories.filter((category) => category !== categoryName);
  }

  return [...currentCategories, categoryName];
}
