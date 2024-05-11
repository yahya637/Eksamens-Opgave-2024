document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayMeals();
});

const MealStorage = {
    meals: [],
    mealCounter: 0
};


// Using an async function to handle asynchronous operations like API fecth,
// This ensures program responsiveness and efficient task management.
// The parameter foodId and sortKeys is used to fetch nutritional data for a speific food item and sort keys
async function fetchNutritionalContent(foodId, sortKeys) {
    let nutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };
    for (let i = 0; i < sortKeys.length; i++) {
        let sortKey = sortKeys[i] 
        const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodId}/BySortKey/${sortKey}`;

        // Using a try-catch block to handle errors
        try { 
            const response = await fetch(apiUrl, { 

                method: 'GET',
                headers: {
                    'accept': 'text/plain',
                    'X-API-Key': '168917'
                }
            });
            if (!response.ok) { 
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            let value = parseFloat(data[0]?.resVal.replace(',', '.')) || 0; 
            if (sortKey === '1030') nutrition.energy += value;
            if (sortKey === '1110') nutrition.protein += value;
            if (sortKey === '1310') nutrition.fat += value;
            if (sortKey === '1240') nutrition.fiber += value;

        } catch (error) {
            console.error(`Error fetching nutritional content for sortKey ${sortKey}:`, error);
        }
    }
    return nutrition;
}

// Another function; this one to search for ingredients based on a query string
// query is the search term and the parameter for the function
async function searchIngredients(query) {
    const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${query}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'accept': 'text/plain',
                'X-API-Key': '168917' 
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json(); 
    } catch (error) {
        console.error('Error fetching ingredients:', error);
    }
}

//For requirement D, I need to add functionality that shows all the food items and their nutritional content, so i need to fetch the data from the API
// Therefor i use another fetch fuction, this ones gets all the food items, but only the food name, food id. 
async function fetchAllFoodItems() {
    const apiUrl = 'https://nutrimonapi.azurewebsites.net/api/FoodItems';
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'accept': 'text/plain',
                'X-API-Key': '168917'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const foodItems = await response.json();
        return foodItems;
    } catch (error) {
        console.error('Error fetching all food items:', error);
        return [];
    }
}
// Krav a
// Now that i have the API's i need to add functionality to the add Meal button
// Declare the variables for the addmMealbuttns  and the addMealForm
const MealButton = document.getElementById('addMealButton');
const MealForm = document.getElementById('addMealForm');

function showAndHideForm() {    
    if (MealForm.style.display === 'none') {     
        MealForm.style.display = 'block';     
    } else {
        MealForm.style.display = 'none';
    }
    document.getElementById('mealNameInput').value = '';
    document.getElementById('ingredientInput').value = '';
    document.getElementById('ingredientWeightInput').value = '';
    document.getElementById('ingredientDropdown').innerHTML = ''; 
    totalNutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };
}
MealButton.addEventListener('click', showAndHideForm);
const ingredientInput = document.getElementById('ingredientInput');

async function searchIngredientFieldInput() {
    const query = ingredientInput.value.trim();     
    if (query.length > 2) {
        const ingredients = await searchIngredients(query);
        updateIngredientDropdown(ingredients);
    }
}

ingredientInput.addEventListener('input', searchIngredientFieldInput);

// Now i need to define the function that will update the dropdown
// Declare the variable for the ingredientDropdown
const ingredientDropdown = document.getElementById('ingredientDropdown');
//Function to update the dropdown menu with search results, although here we have the ingredients as a parameter

function updateIngredientDropdown(IngredientsInDropdown) { 
    ingredientDropdown.innerHTML = '';
    IngredientsInDropdown.forEach(ingredient => { 
        const ingredientsOption = document.createElement('option'); 
        ingredientsOption.value = ingredient.foodID; 
        ingredientsOption.textContent = ingredient.foodName; 
        ingredientDropdown.appendChild(ingredientsOption); 
    });
    ingredientDropdown.style.display = IngredientsInDropdown.length > 0 ? 'block' : 'none'; 
}
// Krav B
// Now i need to add functionality to the addIngredientButton, so that the user can add an ingredient to the meal
// Declare the variable for the addIngredientButton
async function addSelectedIngredient() { 
    const dropdownIngredient = document.getElementById('ingredientDropdown');
    const weightInput = document.getElementById('ingredientWeightInput'); 
    const selectedIngredientId = dropdownIngredient.options[dropdownIngredient.selectedIndex].value; 
    const selectedIngredientValue = dropdownIngredient.options[dropdownIngredient.selectedIndex].text;
    const weight = weightInput.value; 
    const selectedIngredientsList = document.getElementById('selectedIngredients');

    // Fetch nutritional data for the selected ingredient
    const sortKeys = ['1030', '1110', '1310', '1240']; 
    const nutritionData = await fetchNutritionalContent(selectedIngredientId, sortKeys); 

    // Update total nutrition for the meal
    function updateTotalNutrition() {
        totalNutrition.energy += nutritionData.energy * (weight / 100); 
        totalNutrition.protein += nutritionData.protein * (weight / 100);
        totalNutrition.fat += nutritionData.fat * (weight / 100);
        totalNutrition.fiber += nutritionData.fiber * (weight / 100);
    }
    updateTotalNutrition();

    // Additionally, i need to retrieve the nutritional data for the selected ingredient individually, not calculayed for the whole meal.
    // For instance, it should return the energy per 100g, protein per 100g, fat per 100g, and fiber per 100g, but specifically for the specifc ingredient and not the entire meal.
    // It also needs to be adjusted based on the weight of the ingredient
    const individualNutrition = {
        energy: nutritionData.energy * (weight / 100), 
        protein: nutritionData.protein * (weight / 100),
        fat: nutritionData.fat * (weight / 100),
        fiber: nutritionData.fiber * (weight / 100)
    };
   
    const listItem = document.createElement('li'); 
    listItem.textContent = `${selectedIngredientValue} - ${weight}g`; 

    // defining the ingredient object
    const ingredient = {
        foodID: selectedIngredientId,
        foodName: selectedIngredientValue,
        weight: weight,
        individualNutrition: individualNutrition, 
        combinedNutrition: totalNutrition, 
        nutritionInfoPer100g: nutritionData,
    };


    if (weight > 0) {
        const savedIngredients = JSON.parse(localStorage.getItem('selectedIngredients')) || [];
        savedIngredients.push(ingredient);
        localStorage.setItem('selectedIngredients', JSON.stringify(savedIngredients));
        selectedIngredientsList.appendChild(listItem);
        const totalNutritionList = document.getElementById('totalNutri-p');
        const nutritionSentence = `Energy: ${totalNutrition.energy.toFixed(2)} kcal,  
        - Protein: ${totalNutrition.protein.toFixed(2)} g, 
        - Fat: ${totalNutrition.fat.toFixed(2)} g, 
        - Fiber: ${totalNutrition.fiber.toFixed(2)} g`;
        totalNutritionList.textContent = nutritionSentence;

    } else { 
        alert("Please enter a weight greater than 0");
        return;
    }
    resetAddMealForm();
}

function resetAddMealForm() {
    const ingredientInput = document.getElementById('ingredientInput');
    const ingredientDropdown = document.getElementById('ingredientDropdown');
    const ingredientWeightInput = document.getElementById('ingredientWeightInput');
    // Reset the input fields and dropdown
    ingredientInput.value = '';
    ingredientDropdown.innerHTML = '';
    ingredientWeightInput.value = '';
}

// We now need to display the meal with the selected ingredients and in details div the total nutrition.
// The meal table inculde the meal number, meal name, the total kcal pr 100g,
// the date it was added, and some actions, which is delete and show details
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    document.getElementById('subBtn').addEventListener('click', function (event) {
        event.preventDefault();
        console.log('Button clicked');
        submitMeal();
    });
});

function submitMeal() {
        const selectedIngredients = JSON.parse(localStorage.getItem('selectedIngredients')) || [];
        let totalWeight = selectedIngredients.reduce((acc, ingredient) => acc + parseFloat(ingredient.weight), 0);
        let totalNutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };
    
        selectedIngredients.forEach(ingredient => {
            totalNutrition.energy += ingredient.individualNutrition.energy;
            totalNutrition.protein += ingredient.individualNutrition.protein;
            totalNutrition.fat += ingredient.individualNutrition.fat;
            totalNutrition.fiber += ingredient.individualNutrition.fiber;
        });
    
        let energyPer100g = totalWeight > 0 ? (totalNutrition.energy / totalWeight) * 100 : 0;
    
        MealStorage.mealCounter++;
    
        const meal = {
            mealName: document.getElementById('mealNameInput').value,
            totalKcal: energyPer100g.toFixed(2),
            date: new Date().toISOString().slice(0, 10),
            ingredients: selectedIngredients,
            totalMealWeight: totalWeight,
            totalNutrition: totalNutrition
        };
    
        MealStorage.meals.push(meal);
    
        localStorage.removeItem('selectedIngredients');
        document.getElementById('mealNameInput').value = '';
        document.getElementById('selectedIngredients').innerHTML = '<p id="selectedIngredients-p">Selected Ingredients:</p>';
        document.getElementById('totalNutri-p').innerHTML = '';
        showAndHideForm();


        displaySavedMeals();

    }

function sendData() {
        const savedMeals = MealStorage.meals;
        const userId = parseInt(sessionStorage.getItem('userId'), 10);
    
        if (savedMeals && savedMeals.length > 0 && userId) {
            let latestMeal = { ...savedMeals[savedMeals.length - 1], user_id: userId };
    
            fetch('http://localhost:3000/mealcreator/saveMeal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify([latestMeal])
            })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch(error => console.error('Error:', error));
        } else if (!userId) {
            console.log('User ID not found in sessionStorage');
        } else {
            console.log('No meals found');
        }
    }
    
    
async function fetchAndDisplayMeals() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('User ID not found');
        return;
    }

    try {
        const response = await fetch(`/mealcreator/${userId}`, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Failed to fetch meals: ' + response.statusText);
        }
        const meals = await response.json();
        displaySavedMeals(meals); 
    } catch (error) {
        console.error('There was oa problem fetching the meals:', error.message);
    }
}

function displaySavedMeals(meals) {
    const mealTable = document.querySelector('.meal-table');
    mealTable.innerHTML = '';

    meals.forEach((meal) => {
        let ingredients = meal.ingredients;
        if (typeof ingredients === 'string') {
            try {
                ingredients = JSON.parse(ingredients);
            } catch (error) {
                console.error('Failed to parse ingredients JSON for meal:', meal.MealName, error);
                ingredients = [];
            }
        }

        const mealEntry = document.createElement('div');
        mealEntry.className = 'meal-entry';
        mealEntry.innerHTML = `
            <div class="meal-name">${meal.MealName}</div>
            <div class="meal-calories">${meal.calcEnergy100g.toFixed(2)} Kcal</div>
            <div class="meal-fat">${meal.calcFat100g.toFixed(2)} g</div>
            <div class="meal-protein">${meal.calcProtein100g.toFixed(2)} g</div>
            <div class="meal-fiber">${meal.calcFiber100g.toFixed(2)} g</div>
            <div class="meal-weight">${meal.totalMealWeight} g</div>
            <div class="meal-ingredients-count">${ingredients.length}</div>
        `;
        const detailsButton = document.createElement('button');
        detailsButton.className = 'show-details-btn';
        detailsButton.innerHTML = '<span class="material-symbols-outlined">manage_search</span>';
        detailsButton.addEventListener('click', () => showMealDetails(meal.MealId));
        mealEntry.appendChild(detailsButton);

        mealTable.appendChild(mealEntry);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('subBtn');
    button.addEventListener('click', sendData);
});

async function showMealDetails(mealId) {
    const url = `/mealcreator/ingredients/${mealId}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch meal details: ${response.status} ${response.statusText}`);
        }

        const mealData = await response.json();
        console.log('Fetched meal data:', mealData);

        if (Array.isArray(mealData) && mealData.length > 0) {
            const mealInfo = mealData[0];
            if ('ingredients' in mealInfo && mealInfo.ingredients.trim() !== "") {
                try {
                    const ingredients = JSON.parse(mealInfo.ingredients.trim());
                    if (Array.isArray(ingredients) && ingredients.length > 0) {
                        displayMealDetails(ingredients, mealId, mealInfo.MealName);  
                    } else {
                        console.error('No ingredients found in the data');
                    }
                } catch (parseError) {
                    console.error('Error parsing ingredients:', parseError);
                }
            } else {
                console.error('No ingredients data available in the fetched data');
            }
        } else {
            console.error('Meal data is not in expected array format or is empty');
        }
    } catch (error) {
        console.error('Error fetching meal details:', error);
    }
}



function displayMealDetails(ingredients, mealId, mealName) {
    const detailsDiv = document.getElementById('details');
    const ingredientTable = detailsDiv.querySelector('.ingredient-table');

    // Find existing title or create a new one
    let titleDiv = detailsDiv.querySelector('h3');
    if (titleDiv) {
        // Update the title for the current meal
        titleDiv.textContent = `Meal Details for: ${mealName} (ID: ${mealId})`;
    } else {
        // Create and insert a new title if it doesn't exist
        titleDiv = document.createElement('h2');
        titleDiv.textContent = `Meal Details for: ${mealName} (ID: ${mealId})`;
        detailsDiv.insertBefore(titleDiv, ingredientTable);
    }

    // Clear the previous ingredients and display the new ones
    ingredientTable.innerHTML = '';
    ingredients.forEach(ingredient => {
        const ingredientDiv = document.createElement('div');
        ingredientDiv.innerHTML = `<span>${ingredient.foodName} - ${parseFloat(ingredient.weight).toFixed(2)}g</span>`;
        ingredientTable.appendChild(ingredientDiv);
    });

    detailsDiv.style.display = 'block';
}





// Add event listener to the close details button
document.getElementById('closeDetailsBtn').addEventListener('click', () => { 
    const detailsDiv = document.getElementById('details');
    detailsDiv.style.display = 'none'; // use .style.display (css) to hide the details div

    // If using the toggle approach, reset the "show details" button text for the currently shown details
    const currentMealButton = document.querySelector(`[data-meal-number="${detailsDiv.getAttribute('data-current-meal')}"]`);
    if (currentMealButton) { // .getAttribute('data-current-meal') is used to get the meal number of the currently shown details
        currentMealButton.textContent = 'Show Details'; // the meal number is used to find the button with the matching data attribute
    }
    detailsDiv.removeAttribute('data-current-meal'); 
});

//Krav D
// An Event listener for the showcaseIngredients button
document.getElementById('showcaseIngredientsButton').addEventListener('click', async () => {
    document.getElementById('ingredientsInfo').style.display = 'block'; 

    const foodItems = await fetchAllFoodItems(); 
    const container = document.getElementById('foodItemsContainer');
    container.innerHTML = ''; 

    // Fot loop to create a list item for each food item
    for (let i = 0; i < foodItems.length; i++) {
        const foodItem = foodItems[i];
        const listItem = document.createElement('li'); 
        listItem.textContent = foodItem.foodName;
        listItem.setAttribute('dataFoodID', foodItem.foodID);

        // When clicking a list item, fetch and display the nutritional content
        listItem.addEventListener('click', async (event) => {
            const foodId = event.currentTarget.getAttribute('dataFoodID');
            const nutrition = await fetchNutritionalContent(foodId, ['1030', '1110', '1310', '1240']);
            alert(`
                ${foodItem.foodName}
                Energy: ${nutrition.energy.toFixed(2)} kcal
                Protein: ${nutrition.protein.toFixed(2)} g
                Fat: ${nutrition.fat.toFixed(2)} g
                Fiber: ${nutrition.fiber.toFixed(2)} g
            `);
        });
        container.appendChild(listItem);
    }
});

// Close button event listener
document.getElementById('close-foodItemsContainer').addEventListener('click', () => {
    document.getElementById('ingredientsInfo').style.display = 'none'; 
});

// Function to fetch meals from the backend and update the UI
document.addEventListener('DOMContentLoaded', function () {
    fetchAndDisplayMeals();
    setInterval(fetchAndDisplayMeals, 10000); // Fetches meals every 10 seconds
}); 
 
document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('subBtn');
    button.addEventListener('click', sendData);});



    document.addEventListener('DOMContentLoaded', function() {
        const logoutButton = document.getElementById('logoutButton');
        logoutButton.addEventListener('click', function() {
            confirmLogout();
        });
    });
    
    function confirmLogout() {
        if (confirm('Are you sure you want to log out?')) {
            logoutUser();
        }
    }
    
    function logoutUser() {
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('username');
        window.location.href = '/NutriHome.html';
    }



