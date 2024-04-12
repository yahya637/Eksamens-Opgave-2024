// Henter ernæringsdata baseret på sort keys og et specifikt fødevare-ID.
async function fetchSortKeys(foodID) {
  const sortKeys = ['1030', '1110', '1310', '1240'];
  const sortKeyData = {};

  // Itererer gennem sort keys og henter data for hver.
  for (const sortKey of sortKeys) {
      try {
          // anmodning til en specifik API-endepunkt med foodID og sortKey.
          const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`, {
              headers: {
                  'X-API-KEY': '169890'
              }
          });
          // svaret som JSON.
          const data = await response.json();

          // Tjekker om data blev hentet og gemmer den relevante værdi.
          if (data && data.length > 0) {
              let resVal = data[0].resVal
              sortKeyData[data[0].parameterName] = parseFloat(resVal);
          }
      } catch (error) {
          
          console.error(`Fejl ved indhentning af data for foodID: ${foodID} og sortKey: ${sortKey}`, error);
      }
  }
  return sortKeyData;
}

// Konverterer sort keys og deres værdier til en strengrepræsentation.
function formatSortKeys(sortKeys) {
  return sortKeys.map(item => {
      const key = Object.keys(item)[0];
      const value = item[key];
      return `${key}: ${value}`;
  }).join(', ');
}

// Viser detaljer for en fødevare baseret på det givne foodID.
async function displayFoodDetails(foodID) {
  
  const detailsContainer = document.getElementById('foodDetails');

  // Henter og venter på sort keys data.
  const sortKeys = await fetchSortKeys(foodID);
  let detailsHTML = `<div class="product-info">
  <h2>Produkt ID: ${foodID}</h2>`;

  // Bygger HTML strengen baseret på hentet data.
  sortKeys.forEach(detail => {
      const key = Object.keys(detail)[0];
      const value = detail[key];
      detailsHTML += `<p><strong>${key}:</strong> ${value}</p>`;
  });

  detailsHTML += `</div>`;
  // Indsætter den opbyggede HTML i containeren.
  detailsContainer.innerHTML = detailsHTML;
}

// Henter og viser en liste af fødevareelementer fra en ekstern kilde.
async function displayFoodItems() {
  
  const foodItemsList = document.getElementById('foodItemsList');
  try {
      // anmodning til API for at hente fødevaredata
      const response = await fetch('https://nutrimonapi.azurewebsites.net/api/FoodItems', {
          headers: {
              'X-API-KEY': '169890'
          }
      });
      // Parser svaret som JSON.
      const foodItemsData = await response.json();

      // Tilføjer hvert fødevareelement som en option i dropdown-listen.
      foodItemsData.forEach(foodItem => {
          const option = document.createElement('option');
          option.value = foodItem.foodName;
          option.dataset.foodId = foodItem.foodID;
          foodItemsList.appendChild(option);
      });
  } catch (error) {
      
      console.error('Mistake when reading food data:', error);
  }
}

// Sletter et måltid baseret på et givet måltids-ID.
function deleteMeal(mealId) {
  
  meals = meals.filter(meal => meal.id !== mealId);
  // Opdaterer localStorage med det nye måltidsarray.
  localStorage.setItem('meals', JSON.stringify(meals));
 
  updateMealsList();
}

// Initialiserer måltider fra localStorage ved start.
let meals = JSON.parse(localStorage.getItem('meals')) || [];

// Opretter en ny måltidsindgang i systemet.
function createMealEntry(mealType, name, source) {
  const newMeal = {
      id: meals.length + 1,
      name: name || 'Unknown meal',
      source: source || 'Unknown source',
      type: mealType || 'Casual Meal',
      weight: 0,
      energy: 0,
      dateAdded: new Date().toLocaleDateString(),
      ingredients: [],
      totals: {
          Energy: 0,
          Protein: 0,
          Fat: 0,
          Fibers: 0
      },
      water: 0,
      timesEaten: 0
  };

  // Tilføjer det nye måltid til måltidslisten og opdaterer localStorage.
  meals.push(newMeal); // Tilføj det nye måltid til listen over måltider
  localStorage.setItem('meals', JSON.stringify(meals)); // Opdater localStorage
  updateMealsList(); // Opdater visningen af måltidslisten
}

// Tilføjer en ingrediens til det senest oprettede måltid.
async function addIngredientToMeal(foodID) {
  // Opretter et standardmåltid, hvis der ikke findes nogen måltider.
  if (meals.length === 0) {
      createMealEntry('Standard meal');
  }
  const currentMeal = meals[meals.length - 1];
  // Henter ernæringsdata for ingrediensen.
  const ingredientData = await fetchSortKeys(foodID);

  const ingredientDetails = {
      foodID: foodID,
      kcal: ingredientData['Energy (kcal)'] || 0,
      protein: ingredientData['Protein'] || 0,
      fat: ingredientData['Fat'] || 0,
      fibers: ingredientData['Dietary fibre'] || 0,
  };

  // Opdaterer måltidets samlede vægt og ernæringsdata med 100 gram som startværdi
  currentMeal.weight += 100; 
  currentMeal.energy += ingredientDetails.kcal;

  // Tilføjer ingrediensen til måltidets ingrediensliste og genberegner totaller.
  currentMeal.ingredients.push(ingredientDetails);
  calculateMealTotals(currentMeal);
  // Gemmer den opdaterede måltidsliste i localStorage.
  localStorage.setItem('meals', JSON.stringify(meals));
  updateMealsList();
}

// Beregner den samlede ernæringsværdi for et måltid baseret på dets ingredienser.
function calculateMealTotals(meal) {
  // Nulstiller måltidets samlede ernæringsværdier.
  meal.totals = {
      Energy: 0,
      Protein: 0,
      Fat: 0,
      Fibers: 0
  };

  // Beregner nye totaller ved at summere værdierne for hver ingrediens.
  meal.ingredients.forEach(ingredient => {
      meal.totals.Energy += ingredient.kcal;
      meal.totals.Protein += ingredient.protein;
      meal.totals.Fat += ingredient.fat;
      meal.totals.Fibers += ingredient.fibers;
  });

  // Beregner den samlede energi pr. 100g af måltidet.
  meal.kcalPer100g = (meal.totals.Energy / meal.ingredients.length).toFixed(2);
}

// Opdaterer den visuelle repræsentation af måltidslisten.
function updateMealsList() {
  
  const mealsList = document.getElementById('mealsList');
  mealsList.innerHTML = ''; // Rydder eksisterende indhold.

  // Opretter og tilføjer hvert måltid som et nyt listeelement.
  meals.forEach(meal => {
      const mealLi = document.createElement('li');
      mealLi.className = 'meal-entry';
      mealLi.innerHTML = `
      <div class="meal-info">
        <span>${meal.type} #${meal.id}</span>
        <span>Energy: ${meal.totals.Energy.toFixed(2)} kcal</span>
        <span>Protein: ${meal.totals.Protein.toFixed(2)} g</span>
        <span>Fat: ${meal.totals.Fat.toFixed(2)} g</span>
        <span>Fibers: ${meal.totals.Fibers.toFixed(2)} g</span>
        <span>Addedd on: ${meal.dateAdded}</span>
        <span>${meal.ingredients.length} Ingredienser</span>
      </div>
      <div class="meal-actions">
        <button class="deleteMealBtn" data-meal-id="${meal.id}">Delete</button>
      </div>
    `;
      mealsList.appendChild(mealLi);
  });

  // Tilføjer Eventlisterners til sletknapper for hvert måltid
  document.querySelectorAll('.deleteMealBtn').forEach(button => {
      button.addEventListener('click', function() {
          deleteMeal(parseInt(this.dataset.mealId, 10));
      });
  });
}

// Tilføjer Eventlisterners for at oprette et nyt måltid når brugeren trykker på knappen
document.getElementById('createMealBtn').addEventListener('click', () => {
  const mealType = prompt('Select a Meal name');
  if (mealType && mealType.trim() !== '') {
      createMealEntry(mealType);
  }
});

// Opsætter Eventlisterners og initialiserer applikationen ved indlæsning af dokumentet
document.addEventListener('DOMContentLoaded', () => {
  displayFoodItems();
  
  const foodInput = document.getElementById('foodInput');
  foodInput.addEventListener('change', async (event) => {
      const dataList = document.getElementById('foodItemsList');
      const selectedOption = Array.from(dataList.options).find(option => option.value === event.target.value);
      if (selectedOption) {
          addIngredientToMeal(selectedOption.dataset.foodId);
      }
  });
});

// Tilføjer Eventlisterners til "Tilføj Ingrediens" knappen.
document.getElementById('addIngredientBtn').addEventListener('click', () => {
  // Henter det valgte fødevare-ID fra inputfeltet.
  const foodInput = document.getElementById('foodInput');
  const foodID = foodInput.getAttribute('data-food-id');
  if (foodID) {
      addIngredientToMeal(foodID);
  }
});

// Indlæser og viser måltider fra localStorage når dokumentet er klar.
document.addEventListener('DOMContentLoaded', () => {
  
  const storedMeals = localStorage.getItem('meals');
  if (storedMeals) {
      meals = JSON.parse(storedMeals);
      // Opdaterer måltidslisten med gemte måltider.
      updateMealsList();
  }
})
