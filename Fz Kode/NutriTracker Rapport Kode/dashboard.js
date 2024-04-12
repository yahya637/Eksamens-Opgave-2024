// Lyt efter begivenheden DOMContentLoaded for at sikre, at siden er fuldt indlæst, før vi udfører noget
document.addEventListener('DOMContentLoaded', () => {
  updateDashboard(); 
});

// Funktion til at opdatere dashboard med måltidsinformation for i dag
function updateDashboard() {
  const today = new Date().toLocaleDateString('da-DK'); // Få dagens dato i (f.eks. 'DD-MM-YYYY')
  const meals = JSON.parse(localStorage.getItem('meals')) || []; // Hent måltider fra localStorage 
  
  let mealCount = 0; 
  let totalKcal = 0; 
  let totalProtein = 0; 
  let totalWater = 0;

  // Gennemgå hvert måltid i localStorage og opdater variablerne, hvis måltidet blev tilføjet i dag
  meals.forEach(meal => {
      if (meal.dateAdded === today) {
          mealCount += 1; 
          totalKcal += meal.calculatedTotals.energy; 
          totalProtein += meal.calculatedTotals.protein; 
          totalWater += meal.water || 0; 

      }
  });

  // Opdater HTML-elementer med oplysninger om måltider i dag
  document.getElementById('mealsToday').textContent = mealCount; 
  document.getElementById('energyToday').textContent = `${totalKcal.toFixed(2)} kcal`;  
  document.getElementById('proteinToday').textContent = `${totalProtein.toFixed(2)}g`; 
  document.getElementById('waterToday').textContent = `${totalWater.toFixed(2)}L`; 

}
