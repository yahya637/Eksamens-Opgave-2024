// Define async function to fetch sort keys for a given foodID.
async function getSortKeys(foodID) {
  // Predefined sort keys to query.
  const sortKeys = ['1030', '1110', '1310', '1240'];
  const sortKeyData = {};

  // Iterate over each sort key to fetch and process data.
  for (const sortKey of sortKeys) {
    try {
      // Fetch data from the API for the given foodID and sortKey.
      const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`, {
        headers: {
          'X-API-KEY': '168824' // API key for authorization.
        }
      });
      const data = await response.json(); // Parse JSON response.

      // Check if data is valid and has at least one item.
      if (data && data.length > 0) {
        // Parse the result value to a float and handle NaN by assigning 0.
        const resVal = parseFloat(data[0].resVal);
        sortKeyData[data[0].parameterName] = isNaN(resVal) ? 0 : resVal;
      }
    } catch (error) {
      // Log error to console if fetching or processing data fails.
      console.error(`Error fetching data for foodID: ${foodID} and sortKey: ${sortKey}`, error);
    }
  }
  return sortKeyData; // Return the collected sort key data.
}

// Function to format sort keys into a string representation.
function formatSortKeys(sortKeys) {
  return sortKeys.map(item => `${Object.keys(item)[0]}: ${item[Object.keys(item)[0]]}`).join(', ');
}

// Async function to display food details in a specified container.
async function displayFoodDetails(foodID) {
  const detailsContainer = document.getElementById('foodDetails'); // Get the container for displaying food details.
  const sortKeys = await getSortKeys(foodID); // Fetch sort key data for the given foodID.
  let detailsHTML = `<div class="product-info">
    <h2>Product ID: ${foodID}</h2>`; // Start building the HTML content.

  // Append each sort key detail to the HTML content.
  Object.entries(sortKeys).forEach(([key, value]) => {
    detailsHTML += `<p><strong>${key}:</strong> ${value}</p>`;
  });
  detailsHTML += `</div>`;
  detailsContainer.innerHTML = detailsHTML; // Set the HTML content to the details container.
}

// Async function to display a list of food items in a dropdown.
async function displayDropdown() {
  const foodItemsList = document.getElementById('foodItemsList'); // Get the dropdown list element.
  if (!foodItemsList) {
    console.error('foodItemsList element not found');
    return;
  }
  try {
    // Fetch list of food items from the API.
    const response = await fetch('https://nutrimonapi.azurewebsites.net/api/FoodItems', {
      headers: {
        'X-API-KEY': '168824' // API key for authorization.
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const foodItemsData = await response.json(); // Parse JSON response.

    // Create an option element for each food item and append it to the dropdown.
    foodItemsData.forEach(foodItem => {
      const option = document.createElement('option');
      option.value = foodItem.foodName;
      option.dataset.foodId = foodItem.foodID;
      foodItemsList.appendChild(option);
    });
  } catch (error) {
    // Log error to console if fetching food items fails.
    console.error('Error reading food data:', error);
  }
}

// Function to create a new meal entry.
function createMeal(mealType, name = 'Unknown meal', source = 'Unknown source') {
  // Check if geolocation is supported by the browser.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords; // Destructure latitude and longitude from position.

      // Create a new meal object with the provided details and location.
      const newMeal = {
        id: meals.length + 1,
        name,
        source,
        type: mealType,
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
        timesEaten: 0,
        location: { latitude, longitude },
        timestamp: new Date().getTime()
      };

      meals.push(newMeal); // Add the new meal to the meals array.
      localStorage.setItem('meals', JSON.stringify(meals)); // Update local storage with the new meals array.
      updateMealsList(); // Update the meals list display.
    }, (error) => {
      // Log error to console if geolocation fails.
      console.error("Error obtaining geolocation:", error);
    });
  } else {
    // Log to console if geolocation is not supported by the browser.
    console.log("Geolocation is not supported by this browser.");
  }
}

// Initialize an empty array for meals or load from local storage.
let meals = JSON.parse(localStorage.getItem('meals')) || [];

// Event listener for creating a new meal entry.
document.getElementById('createMealBtn').addEventListener('click', () => {
  const mealType = prompt('Select a Meal name');
  if (mealType && mealType.trim() !== '') {
    createMeal(mealType); // Create a new meal entry with the specified meal type.
  }
});

// Async function to fetch details of a specific food item by its ID.
async function fetchFoodDetails(foodID) {
  try {
    // Fetch food details from the API for the given foodID.
    const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodItems/${foodID}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': '168824', // API key for authorization.
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const foodDetails = await response.json(); // Parse JSON response.
    return foodDetails; // Return the food details.
  } catch (error) {
    // Log error to console if fetching food details fails.
    console.error('Error fetching food details:', error);
    return null;
  }
}

// Event listener for document ready to initialize application.
document.addEventListener('DOMContentLoaded', () => {
  displayDropdown(); // Display the list of food items.

  // Event listener for changes in the food input.
  const foodInput = document.getElementById('foodInput');
  foodInput.addEventListener('change', async (event) => {
    const dataList = document.getElementById('foodItemsList');
    const selectedOption = Array.from(dataList.options).find(option => option.value === event.target.value);
    if (selectedOption) {
      addIngredientToMeal(selectedOption.dataset.foodId); // Add selected ingredient to the current meal.
    }
  });
});

// Async function to add an ingredient to the current meal.
async function addIngredientToMeal(foodID) {
  // Create a standard meal entry if no meals exist.
  if (meals.length === 0) {
    createMeal('Standard meal');
  }
  const currentMeal = meals[meals.length - 1]; // Get the current (last) meal.
  const ingredientData = await getSortKeys(foodID); // Fetch sort key data for the ingredient.
  const foodDetails = await fetchFoodDetails(foodID); // Fetch food details for the ingredient.

  // Create an object with the ingredient's details and nutritional information.
  const ingredientDetails = {
    name: foodDetails.foodName,
    foodID,
    kcal: ingredientData['Energy (kcal)'] || 0,
    protein: ingredientData['Protein'] || 0,
    fat: ingredientData['Fat'] || 0,
    fibers: ingredientData['Dietary fibre'] || 0,
  };

  // Update the current meal's weight and energy based on the ingredient.
  currentMeal.weight += 100; // Assume a default weight of 100g for the ingredient.
  currentMeal.energy += ingredientDetails.kcal; // Add the ingredient's kcal to the meal's energy.

  // Add the ingredient to the current meal's ingredients list.
  currentMeal.ingredients.push(ingredientDetails);
  calculateMealTotals(currentMeal); // Recalculate the meal's total nutritional values.
  localStorage.setItem('meals', JSON.stringify(meals)); // Update local storage with the new meals array.
  updateMealsList(); // Update the meals list display.
}

// Event listener for adding an ingredient to the current meal.
document.getElementById('addIngredientBtn').addEventListener('click', () => {
  const foodInput = document.getElementById('foodInput');
  const foodID = foodInput.getAttribute('data-food-id');
  if (foodID) {
    addIngredientToMeal(foodID); // Add the ingredient with the specified foodID to the current meal.
  }
});

// Function to calculate the total nutritional values for a meal.
function calculateMealTotals(meal) {
  // Initialize totals to 0.
  meal.totals = {
    Energy: 0,
    Protein: 0,
    Fat: 0,
    Fibers: 0
  };

  // Sum up the nutritional values of each ingredient in the meal.
  meal.ingredients.forEach(ingredient => {
    meal.totals.Energy += ingredient.kcal;
    meal.totals.Protein += ingredient.protein;
    meal.totals.Fat += ingredient.fat;
    meal.totals.Fibers += ingredient.fibers;
  });

  // Calculate kcal per 100g for the meal based on the total energy and number of ingredients.
  meal.kcalPer100g = (meal.totals.Energy / meal.ingredients.length).toFixed(2);
}

// Function to update the meals list display.
function updateMealsList() {
  const mealsList = document.getElementById('mealsList'); // Get the meals list element.
  mealsList.innerHTML = ''; // Clear the current list.

  // Iterate over each meal and create HTML content to display its details.
  meals.forEach(meal => {
    if (!meal || typeof meal !== 'object' || typeof meal.type !== 'string') {
      return; // Skip invalid meal entries.
    }
    const mealLi = document.createElement('li');
    mealLi.className = 'meal-entry';
    mealLi.setAttribute('data-meal-id', meal.id); // Set a data attribute for the meal ID.
    let mealHTML = `
      <div class="meal-info">
        <span>${meal.type} #${meal.id}</span>
        <span>Energy: ${meal.totals ? meal.totals.Energy.toFixed(2) : 0} kcal</span>
        <span>Protein: ${meal.totals ? meal.totals.Protein.toFixed(2) : 0} g</span>
        <span>Fat: ${meal.totals ? meal.totals.Fat.toFixed(2) : 0} g</span>
        <span>Fibers: ${meal.totals ? meal.totals.Fibers.toFixed(2) : 0} g</span>
        <span>Added on: ${meal.dateAdded}</span>
        <span>${meal.ingredients.length} Ingredients:</span>
      </div>
      <ul class="ingredient-list">`;

    // Append each ingredient's details to the HTML content.
    meal.ingredients.forEach((ingredient, index) => {
      mealHTML += `<li>
          Ingredient #${index + 1}:
          Calories: ${ingredient.kcal}, 
          Protein: ${ingredient.protein}g, 
          Fat: ${ingredient.fat}g, 
          Fibers: ${ingredient.fibers}g
          <button class="showIngredientBtn" data-index="${index}" data-meal-id="${meal.id}">Show Details</button>
        </li>`;
    });

    mealHTML += `</ul>
      <div class="meal-actions">
        <button class="deleteMealBtn" data-meal-id="${meal.id}">Delete</button>
      </div>`;

    mealLi.innerHTML = mealHTML; // Set the HTML content for the meal list item.
    mealsList.appendChild(mealLi); // Append the meal list item to the meals list.
  });
}

// Event listener for document ready to load stored meals and update display.
document.addEventListener('DOMContentLoaded', () => {
  const storedMeals = localStorage.getItem('meals');
  if (storedMeals) {
    meals = JSON.parse(storedMeals);
    updateMealsList(); // Update the meals list display with stored meals.
  }
});

// Event listener for click events that show ingredient details.
document.addEventListener('click', function (event) {
  if (event.target.classList.contains('showIngredientBtn')) {
    const mealId = event.target.getAttribute('data-meal-id');
    const index = parseInt(event.target.getAttribute('data-index'), 10);
    const meal = meals.find(meal => meal.id.toString() === mealId); // Find the meal by ID.
    const ingredient = meal.ingredients[index]; // Get the specified ingredient.
    const modalContent = document.getElementById('ingredientDetails');
    modalContent.innerHTML = `Ingredient #${index + 1}: <strong>${ingredient.name}</strong><br>
                              Calories: ${ingredient.kcal}, Protein: ${ingredient.protein}g, 
                              Fat: ${ingredient.fat}g, Fibers: ${ingredient.fibers}g`;
    document.getElementById('ingredientModal').style.display = 'block'; // Display the modal with ingredient details.
  }
});

// Event listener for closing the modal.
const closeModal = document.getElementsByClassName("close")[0];
closeModal.onclick = function () {
  document.getElementById('ingredientModal').style.display = "none"; // Hide the modal.
}

// Function to delete a meal by its ID.
function deleteMeal(mealId) {
  let meals = JSON.parse(localStorage.getItem('meals')) || []; // Load meals from local storage or initialize an empty array.
  const mealIdAsString = String(mealId);
  meals = meals.filter(meal => meal && typeof meal === 'object' && String(meal.id) !== mealIdAsString); // Remove the specified meal from the array.
  localStorage.setItem('meals', JSON.stringify(meals)); // Update local storage with the modified meals array.
  const mealElement = document.querySelector(`.meal-entry[data-meal-id="${mealIdAsString}"]`);
  if (mealElement) mealElement.remove(); // Remove the meal's HTML element from the display.
}

// Event listener for click events on delete meal buttons.
document.getElementById('mealsList').addEventListener('click', function (event) {
  if (event.target.classList.contains('deleteMealBtn')) {
    const mealId = event.target.getAttribute('data-meal-id');
    deleteMeal(mealId); // Call deleteMeal function with the meal ID.
  }
});

