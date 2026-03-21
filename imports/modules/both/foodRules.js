const FoodRules = {
  allium: { name: 'allium', displayName: 'Allium' },
  greens: { name: 'greens', displayName: 'Greens' },
  cruciferous: { name: 'cruciferous', displayName: 'Cruciferous' },
  omega3: { name: 'omega3', displayName: 'Omega3' },
};

FoodRules.names = Object.keys(FoodRules).map(cat => FoodRules[cat].name);
FoodRules.displayNames = Object.keys(FoodRules).map(cat => FoodRules[cat].displayName);


export default FoodRules;

