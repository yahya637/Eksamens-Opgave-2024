// Using an async function to handle asynchronous operations like API fecth,
// This ensures program responsiveness and efficient task management.
// The parameter foodId and sortKeys is used to fetch nutritional data for a speific food item and sort keys
async function fetchNutritionalContent(foodId, sortKeys) {
    let nutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };

    // Using a for loop to fetch nutritional data for each sort key
    for (let i = 0; i < sortKeys.length; i++) { 
        let sortKey = sortKeys[i] // Get the current sort key
        const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodId}/BySortKey/${sortKey}`;
       
       // Using a try-catch block to handle errors
        try { // Try fetching nutritional data for the current sort key
            const response = await fetch(apiUrl, { // await will here wait for the fetch to complete before moving on

                method: 'GET',
                headers: {
                    'accept': 'text/plain',
                    'X-API-Key': '168917' 
                }
            });
            // If the response is not ok, throw an error
            if (!response.ok) { // ! means not
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the response as JSON
            const data = await response.json();
            // Assuming the first element in the array contains the desired data.
            let value = parseFloat(data[0]?.resVal.replace(',', '.')) || 0; // Replace ',' with '.' for parseFloat if needed

            // Add the nutritional value to the total nutrition based on the sort key
            if (sortKey === '1030') nutrition.energy += value;
            if (sortKey === '1110') nutrition.protein += value;
            if (sortKey === '1310') nutrition.fat += value;
            if (sortKey === '1240') nutrition.fiber += value;
            
          // If an error occurs, log it to the console, with the respective sort key
        } catch (error) {
            console.error(`Error fetching nutritional content for sortKey ${sortKey}:`, error);
            // .error() is used to log an error message to the console
        }
    }
    // always remeber the return statement
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
                'X-API-Key': '168917' // API key for authentication
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json(); // Return the search results in a JSON format
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

// Here i want to define the functtion that will be called when the addMealButton is clicked
function showAndHideForm() {     // In the HTML file, the form is hidden by default, 
    // therefor when the button is clicked, the form will be displayed
    if (MealForm.style.display === 'none') {     // in this case, an if statement will be used, beacuse when the form is displayed,
        MealForm.style.display = 'block';     // clicking again should hide the form
    } else {
        MealForm.style.display = 'none';
    }
    // The input should be cleared when the form is hidden
    document.getElementById('mealNameInput').value = ''; // Using .value to clear the input field
    document.getElementById('ingredientInput').value = '';
    document.getElementById('ingredientWeightInput').value = ''; 
    document.getElementById('ingredientDropdown').innerHTML = ''; //.innerHTML to clear the dropdown

    // The total nutrition should be reset when the form is hidden
    totalNutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };
}

// Add event listener to the add meal button
// 
MealButton.addEventListener('click', showAndHideForm); 
// When the button is clicked, the showAndHideForm function will be calleds
// Now the Add meal form is visible, i need to add functionality to the search field and dropdown
// Search field for ingredients, i also need to add the dropdown where the API will get implemented

// Like before i need to declare the variable for the ingredientInput and add an event listener
const ingredientInput = document.getElementById('ingredientInput');

// defining an async function to hanlde the ingredientInput
async function searchIngredientFieldInput () {
    // Defining variable query, which is the value of the input field
    const query = ingredientInput.value.trim();     //!!!! HUSK AT FINDE LØSNING OM CASE SENSETIVE
    // The .trim() method makes sure there are no spaces at the beginning or end of a text
    // Here an if statement is used to make sure the query is more than 2 characters
    if (query.length > 2) {
        // await is used to wait for the searchIngredients (API) fucntion function to complete
        const ingredients = await searchIngredients(query);
        // Now the other fuction (below) will be called to update the dropdown
        updateIngredientDropdown(ingredients);  
    }
}
// After the async function is defined, i need to add an event listener to the ingredientInput
ingredientInput.addEventListener('input', searchIngredientFieldInput); 


// Now i need to define the function that will update the dropdown
// Declare the variable for the ingredientDropdown
const ingredientDropdown = document.getElementById('ingredientDropdown');
//Function to update the dropdown menu with search results, although here we have the ingredients as a parameter
function updateIngredientDropdown(IngredientsInDropdown) { // IngredientsInDropdown is expected to be an array
    // Here i can manipulate the dropdown to be empty using .innerHTML
    ingredientDropdown.innerHTML = ''; 
    // Looping through each ingredient in the IngredientsInDropdown array
    IngredientsInDropdown.forEach(ingredient => { // using a .forEach for a simple loop to iterate through the array
        const ingredientsOption = document.createElement('option'); // This creates a new <option> element
        ingredientsOption.value = ingredient.foodID; // Setting the value of the option to the ingredients foodID
        ingredientsOption.textContent = ingredient.foodName; // Setting the display txt to the ingredients foodName
        ingredientDropdown.appendChild(ingredientsOption); // Adding the newly created <option> to the dropdown
    }); 

    // Conditional display of the dropdown based on the presence of ingredients
    // If there are ingredients (array length > 0), display the dropdown, otherwise hide it
    ingredientDropdown.style.display = IngredientsInDropdown.length > 0 ? 'block' : 'none'; // here i use a conditonal operator
    // This is a shorter way of writing an if-else statement
}
// Krav B
// Now i need to add functionality to the addIngredientButton, so that the user can add an ingredient to the meal
// Declare the variable for the addIngredientButton
async function addSelectedIngredient() { // Using async to handle the fetchNutritionalContent function
    // Declare the variables for the dropdownIngredient, weightInput etc.
    const dropdownIngredient = document.getElementById('ingredientDropdown');
    const weightInput = document.getElementById('ingredientWeightInput'); // So whatever the user types in the input field, it will be stored in the weightInput variable
    const selectedIngredientId = dropdownIngredient.options[dropdownIngredient.selectedIndex].value; // This takes the foodID of the selected ingredient
    const selectedIngredientValue = dropdownIngredient.options[dropdownIngredient.selectedIndex].text;// This takes the foodName of the selected ingredient
    const weight = weightInput.value;  // This takes the value of the weightInput,
    const selectedIngredientsList = document.getElementById('selectedIngredients');

    // Fetch nutritional data for the selected ingredient
    const sortKeys = ['1030', '1110', '1310', '1240']; // The sort keys to be used for fetching nutritional data
    const nutritionData = await fetchNutritionalContent(selectedIngredientId, sortKeys); // with the new varaible nutritionData and sortKeys
    // as parameters we call the fetchNutritionalContent function
    
    // Update total nutrition for the meal
    function updateTotalNutrition() {
        //This calculates the total nutrition for the meal, it takes the weight of the ingredient into account
        totalNutrition.energy += nutritionData.energy * (weight / 100); // Adjust based on weight
        totalNutrition.protein += nutritionData.protein * (weight / 100); 
        totalNutrition.fat += nutritionData.fat * (weight / 100); 
        totalNutrition.fiber += nutritionData.fiber * (weight / 100);
    }
    updateTotalNutrition();

    // Additionally, i need to retrieve the nutritional data for the selected ingredient individually, not calculayed for the whole meal.
    // For instance, it should return the energy per 100g, protein per 100g, fat per 100g, and fiber per 100g, but specifically for the specifc ingredient and not the entire meal.
    // It also needs to be adjusted based on the weight of the ingredient
    const individualNutrition = {
        energy: nutritionData.energy * (weight / 100), // Same as the total nutrition, but not added to the total nutrition
        protein: nutritionData.protein * (weight / 100),
        fat: nutritionData.fat * (weight / 100),
        fiber: nutritionData.fiber * (weight / 100)
    };
     
    // Create the list item with the ingredient name and weight, this will be added to the selectedIngredients list
    const listItem = document.createElement('li'); // .createElement creates a new <li> element
    listItem.textContent = `${selectedIngredientValue} - ${weight}g`; // Setting the text content of the list item

    // defining the ingredient object
    const ingredient = {
        foodID: selectedIngredientId,
        foodName: selectedIngredientValue,
        weight: weight,
        individualNutrition: individualNutrition, // Based on the weight of the ingredient
        combinedNutrition: totalNutrition, // This shows the total nutrition for the meal dependning on the added ingredients
        nutritionInfoPer100g: nutritionData // This shows the nutritional content per 100g
    };

      // Husk en if statement til at tjekke der vægt er større end 0
      if (weight > 0) {   

        // Retrieve existing ingredients from localStorage
        const savedIngredients = JSON.parse(localStorage.getItem('selectedIngredients')) || [];
        // Add the new ingredient to the existing list
        savedIngredients.push(ingredient);
        // Save the updatd list back to localStorage
        localStorage.setItem('selectedIngredients', JSON.stringify(savedIngredients));

        // Add the button and list item to the list
        selectedIngredientsList.appendChild(listItem);

        // In the end we want to display the total nutrition for the meal before submitting the form
        // Declare the variable for the totalNutritionList
        const totalNutritionList = document.getElementById('totalNutri-p');
        const nutritionSentence = `Energy: ${totalNutrition.energy.toFixed(2)} kcal,  
        - Protein: ${totalNutrition.protein.toFixed(2)} g, 
        - Fat: ${totalNutrition.fat.toFixed(2)} g, 
        - Fiber: ${totalNutrition.fiber.toFixed(2)} g`;
        
        
        // Add the list items to the list
        totalNutritionList.textContent = nutritionSentence;

        // call the resetAddMealForm function
            
    }else { // If the weight is less than or equal to 0, alert the user
        alert("Please enter a weight greater than 0");
        return;
    } 
    // Call the resetAddMealForm function, this makes it easier for the user to add a new ingredient
    resetAddMealForm();
}

function resetAddMealForm() {
    // Declare the variables for the ingredientInput, ingredientWeightInput and ingredientDropdown
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
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    document.getElementById('subBtn').addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Button clicked');
        submitMeal();
    });
});
// This function will be called when the submit button is clicked
function submitMeal() {
    // Retrieve the selected ingredients from localStorage 
    const selectedIngredients = JSON.parse(localStorage.getItem('selectedIngredients')) || [];

    // Calculates the total weight by summing up the weight property of each ingredient in selectedIngredients, starting from `0`.
    let totalWeight = selectedIngredients.reduce((accumulator, ingredient) => accumulator + parseFloat(ingredient.weight), 0);
    let totalNutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };

    // Using a forEach loop to calculate the total nutrition for the meal
    selectedIngredients.forEach(ingredient => {
        // totalNutrition (definded above) gets added to the individualNutrition of each ingredient
        totalNutrition.energy += ingredient.individualNutrition.energy;
        totalNutrition.protein += ingredient.individualNutrition.protein;
        totalNutrition.fat += ingredient.individualNutrition.fat;
        totalNutrition.fiber += ingredient.individualNutrition.fiber;
        // This sums up the total nutrition for the meal
        });
    
    // to meet the design suggestions, I chose to also calculate the total kcal per 100 grams and not just the total nutritional content
    let energyPer100g = totalWeight > 0 ? (totalNutrition.energy / totalWeight) * 100 : 0; // I used a conditional operator to simplify the code
    // The total kcal per 100g is calculated by dividing the total energy by the total weight, and then multiplying by 100

    // The design suggests that the meal should have a number, so i will use a counter to count the number of meals
    let counter = localStorage.getItem('mealCounter') || 0; // This will also be saved in the local storage
    counter++; //counts every time a new meal is added 

    // Finally, meal object is created and saved to localStorage
    const meal = {
        mealNumber: counter,
        mealName: document.getElementById('mealNameInput').value,
        totalKcal: energyPer100g.toFixed(2), // .toFixed(2) is used to round the number to 2 decimal places
        date: new Date().toISOString().slice(0,10), //.toLocaleDateString() is used to get the current date in string
        ingredients: selectedIngredients,
        // Added this after starting MealTracker - I need the total weight for the meal
        totalMealWeight: totalWeight, // I alredy calculated the total weight above to calculate the totalKCal
        totalNutrition: totalNutrition 
    };


    // Here the meal object is saved to the local storage
    const savedMeals = JSON.parse(localStorage.getItem('meals')) || []; // savedMeals is an array of meal objects
    savedMeals.push(meal); // Add the new meal to the existing list
    localStorage.setItem('meals', JSON.stringify(savedMeals)); 
    localStorage.setItem('mealCounter', counter.toString()); 

    // When submitting the meal, clear the selected ingredients
    localStorage.removeItem('selectedIngredients');
    // Also clear the mealName, selectedIngreidents and the total nutrition
    document.getElementById('mealNameInput').value = '';
    // Clear only the dynamically added ingredients, keep the "Selected Ingredients:" paragraph
    document.getElementById('selectedIngredients').innerHTML = '<p id="selectedIngredients-p">Selected Ingredients:</p>';
    document.getElementById('totalNutri-p').innerHTML = '';

    // Call the displayMeal function to update the meal table
    displaySavedMeals();
}

// Now its time to display the meals in the meal table
// The way i wll approach this matter is by creating a function that will display the meals in the meal table
// here i need to focus on visualizing the meal object to the HTML document
 function displaySavedMeals() { 
    // Make sure to retrieve the saved meals from localStorage
    const savedMeals = JSON.parse(localStorage.getItem('meals')) || [];
    // Declare the variable for the meal-Table( HTML element)
    const mealTable = document.querySelector('.meal-table');

    // Clear the table before adding the updated list of meals
    mealTable.innerHTML = ''; // .innerHTML is used to clear the table
    
    // Iterate through each saved meal and create a new meal entry
    savedMeals.forEach(meal => {
        const mealEntry = document.createElement('div');
        mealEntry.className = 'meal-entry';
        
        // Here i use innerHTML to visualize the meal object to the HTML document
        mealEntry.innerHTML = ` 
            <span>${meal.mealNumber}</span>
            <span>${meal.mealName}</span>
            <span>${meal.totalKcal} kcal</span>
            <span>${meal.date}</span>
            <span>${meal.ingredients.length}</span>
            <span>
                <button class="show-details-btn" title="Show details" data-meal-number="${meal.mealNumber}"><i class="gg-more-vertical-o"></i></button>
            </span>
            `;                  // data-meal-number is used to store the meal number as a data attribute - <i> is used to add an icon to the button
    
            // Append the new meal entry to the meal table
            mealTable.appendChild(mealEntry);

            // Add event listener to the show details button
            mealEntry.querySelector('.show-details-btn').addEventListener('click', function(event) {
            const mealNumber = event.target.getAttribute('data-meal-number');
            showMealDetails(mealNumber);

            // close the form
            MealForm.style.display = 'none';
        
});         
      
});
}
// Call the displaySavedMeals function to display the meals in the meal table even when the page is reloaded
document.addEventListener('DOMContentLoaded', function() {
    displaySavedMeals();
});

// krav C
// Now i need to add functionality to the show details button, so that the user can see the ingredients and the total nutrition for the meal
function showMealDetails(mealNumber) { // The meal number is passed as a parameter
    const savedMeals = JSON.parse(localStorage.getItem('meals')) || []; //
    const meal = savedMeals.find(m => m.mealNumber.toString() === mealNumber); // Find the meal with the matching meal number
    // .find() is used to find the first element in the array that satisfies the condition

    const detailsDiv = document.getElementById('details'); // Get the details div 
    const ingredientTable = detailsDiv.querySelector('.ingredient-table');  // then put the ingredient table in the details div

    const existingEntries = ingredientTable.querySelectorAll('div:not(.ingredient-header)'); // :not(.ingredient-header) is used to exclude the header
    existingEntries.forEach(entry => entry.remove()); // .forEach() is used to remove each existing entry

    // Populate ingredient table with ingredients of the selected meal
    meal.ingredients.forEach(ingredient => { 
        const ingredientDiv = document.createElement('div'); // create a new div for each ingredient
        ingredientDiv.innerHTML = `
            <span>${ingredient.foodName}</span>
            <span>${ingredient.weight}g</span>
        `;

        ingredientTable.appendChild(ingredientDiv); // append the new div to the ingredient table
    });
    // Update the title of the details div
    detailsDiv.querySelector('h3').textContent = `${meal.mealNumber}: ${meal.mealName} details`; // Take the meal.name and add "Details" to it

    // I also want to showcase the total nutrition for the meal in the details div
    // so the same way as in the form i will calculate the total nutrition for the meal
    let totalNutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };
    meal.ingredients.forEach(ingredient => {    
        totalNutrition.energy += ingredient.individualNutrition.energy;
        totalNutrition.protein += ingredient.individualNutrition.protein;
        totalNutrition.fat += ingredient.individualNutrition.fat;
        totalNutrition.fiber += ingredient.individualNutrition.fiber;
    });

    // also make a sentence to display the total nutrition for the meal
    const nutritionSentence = `Energy: ${totalNutrition.energy.toFixed(2)} kcal,  
    - Protein: ${totalNutrition.protein.toFixed(2)} g, 
    - Fat: ${totalNutrition.fat.toFixed(2)} g, 
    - Fiber: ${totalNutrition.fiber.toFixed(2)} g`;
    // lastly, add the sentence to the details div
    document.getElementById("totalNutritionSentence").textContent = nutritionSentence;

    


    // Show the details div
   if  (detailsDiv.style.display = 'none'){ // Use a if statement to show the details div, so if the details div is hidden, it will be shown and vice versa
         detailsDiv.style.display = 'block';
   } else {
       detailsDiv.style.display = 'none';}

}

// Add event listener to the close details button
document.getElementById('closeDetailsBtn').addEventListener('click', () => { // When the close details button is clicked, the details div will be hidden
    const detailsDiv = document.getElementById('details');
    detailsDiv.style.display = 'none'; // use .style.display (css) to hide the details div

    // If using the toggle approach, reset the "show details" button text for the currently shown details
    const currentMealButton = document.querySelector(`[data-meal-number="${detailsDiv.getAttribute('data-current-meal')}"]`);
    if (currentMealButton) { // .getAttribute('data-current-meal') is used to get the meal number of the currently shown details
        currentMealButton.textContent = 'Show Details'; // the meal number is used to find the button with the matching data attribute
    }
    detailsDiv.removeAttribute('data-current-meal'); // Remove the attribute indicating the currently shown meal
});
//Krav D

// An Event listener for the showcaseIngredients button
document.getElementById('showcaseIngredientsButton').addEventListener('click', async () => {
    document.getElementById('ingredientsInfo').style.display = 'block'; // show the ingredientsInfo div when after clicking the button

    const foodItems = await fetchAllFoodItems(); // Fetch all food items from the API
    const container = document.getElementById('foodItemsContainer');
    container.innerHTML = ''; // Clear the list

    // Fot loop to create a list item for each food item
    for (let i = 0; i < foodItems.length; i++) {
        const foodItem = foodItems[i];
        const listItem = document.createElement('li'); // create a new list item
        listItem.textContent = foodItem.foodName; // set the text content of the list item
        listItem.setAttribute('dataFoodID', foodItem.foodID);
    
        // When clicking a list item, fetch and display the nutritional content
        listItem.addEventListener('click', async (event) => {
            const foodId = event.currentTarget.getAttribute('dataFoodID');
            const nutrition = await fetchNutritionalContent(foodId, ['1030', '1110', '1310', '1240']);
            // Display the nutritional content in an alert
            alert(`
                ${foodItem.foodName}
                Energy: ${nutrition.energy.toFixed(2)} kcal
                Protein: ${nutrition.protein.toFixed(2)} g
                Fat: ${nutrition.fat.toFixed(2)} g
                Fiber: ${nutrition.fiber.toFixed(2)} g
            `);
        });
        // Append the list item to the container
        container.appendChild(listItem);
    }    
});

// Close button event listener
document.getElementById('close-foodItemsContainer').addEventListener('click', () => {
    document.getElementById('ingredientsInfo').style.display = 'none'; // hide the ingredientsInfo div when after clicking the button
});

// Function to send data
function sendData() {
    const savedMeals = JSON.parse(localStorage.getItem('meals'));
    const userId = localStorage.getItem('userId'); // Retrieve user_id from localStorage

    if (savedMeals && savedMeals.length > 0 && userId) {
        // Add user_id to each meal object
let latestMeal=savedMeals[savedMeals.length-1]
        // Send the latest meal data
        fetch('http://localhost:3000/mealcreator/saveMeal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([latestMeal]) // Now sending modified meals array
        })
        .then(response => response.json())
        .then(data => console.log('Success:', data))
        .catch(error => console.error('Error:', error));
    } else if (!userId) {
        console.log('User ID not found in localStorage');
    } else {
        console.log('No meals found in localStorage');
    }
}


  document.addEventListener('DOMContentLoaded', function () {
    const button = document.getElementById('subBtn');
    button.addEventListener('click', sendData);
 });
