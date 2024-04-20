// Again  i have chosen to hide the Meal Intake form. So the first thing i need is to addEventListener to the button that will show and hide the form
// IntakeMealButton is the ID of the button that will show and hide the form

// With the click of the button the form will be shown and hidden
document.getElementById('IntakeMealButton').addEventListener('click', function() {
    const intakeMealFormVar = document.getElementById('IntakeMealForm');
    if (intakeMealFormVar.style.display === 'none') {
        intakeMealFormVar.style.display = 'block';
    } else { // THis way the button will act as a toggle button
        intakeMealFormVar.style.display = 'none';
    }
}
);
// Krav a 
// I have to get the meals from the local storage and display them in <select> element, so they can be selected
// I will write a function that will fetch the meals

function fetchMealsFromLocalStorage() {
    const meals = JSON.parse(localStorage.getItem('meals')); // .parse() method will convert the string to an array, .getItem() will get the meals from the local storage
    const selectionOfMeals = document.getElementById('mealSelection'); 
    // Iterate over each saved meal - .forEach() is a simple way to iterate over an array
    meals.forEach(meal => {
        // Create a new option element with .createElement()
        const option = document.createElement('option');
        // Use mealNumber as the option value for uniqueness
        option.value = meal.mealNumber;
        // Set the meal name as the option text and meal number
        option.textContent = `${meal.mealNumber}) ${meal.mealName} - ${meal.totalMealWeight}g`;
        // Append the option to the dropdown
        selectionOfMeals.appendChild(option);
    });
}
// I will call the function to fetch the meals from the local storage
fetchMealsFromLocalStorage();

// Now that i can select the meals from the local storage, i need ro collect the weight input from the user.
// That can be done by writing a function that will collect the weight input, and procces the rest of the form

function processMealForm() {
    // Get the selected meal number from the dropdown
    const selectedMealID = document.getElementById('mealSelection').value;
    
    // Get the weight input from the user and parse it as a number
    const weightInput = document.getElementById('mealWeight').value;
    const weightConsumed = parseFloat(weightInput);

    //Check if the weight input is a number and if it is greater than 0
    if (isNaN(weightConsumed) || weightConsumed <= 0) {
        console.error('Invalid weight consumed:', weightInput);
        return;
    }

    // Get the meal from local storage based on the selected meal number
    const createdMeals = JSON.parse(localStorage.getItem('meals'));
    if (!createdMeals) { // !createdMeals means "if createdMeals is false"
        console.error('No meals data found in local storage.');
        return;
    }

    // Find the meal with the selected meal number using .find() method
    const chosenMeal = createdMeals.find(meal => meal.mealNumber.toString() === selectedMealID);
    if (!chosenMeal) {
        console.error('Meal not found with ID:', selectedMealID);
        return;
    }
    // I will give it a number so it is easier to identify the intakes and later on delete them or edit them
    let intakeCounter = parseInt(localStorage.getItem('intakeCounter'), 10) || 0; // Parse the intakeCounter as an integer
    // increment the intakeCounter
    intakeCounter++;

    // Calculate the consumed proportion of each ingredient based on the consumed weight
    const consumedProportion = weightConsumed / chosenMeal.totalMealWeight; // This will be a number between 0 and 1, the proportion of the meal consumed. 
    let consumedEnergy = 0, consumedProtein = 0, consumedFat = 0, consumedFiber = 0;// Initialize consumed nutrients

    // .forEach() method to calculate the consumed nutrients
    chosenMeal.ingredients.forEach(ingredient => {
                        // Multiply the nutrient value per 100g by the consumed proportion and the consumed weight
        consumedEnergy += ingredient.nutritionInfoPer100g.energy * (ingredient.weight / 100) * consumedProportion;
        consumedProtein += ingredient.nutritionInfoPer100g.protein * (ingredient.weight / 100) * consumedProportion;
        consumedFat += ingredient.nutritionInfoPer100g.fat * (ingredient.weight / 100) * consumedProportion;
        consumedFiber += ingredient.nutritionInfoPer100g.fiber * (ingredient.weight / 100) * consumedProportion;
    });

    const date = new Date();
    const intakeDate = date.toLocaleDateString();
    const timeOptions = { hour12: false, hour: '2-digit', minute: '2-digit' };
    const intakeTime = date.toLocaleTimeString(undefined, timeOptions);

    // Save the intake to local storage - krav f - so we can use it later to delete or edit the intakes
    localStorage.setItem('intakeCounter', intakeCounter.toString());
    
    // Krav e 
    if ('geolocation' in navigator) { // fecth the location
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude.toFixed(3); // round the latitude and longitude to 3 decimal
            const longitude = position.coords.longitude.toFixed(3); // we roudn them to 3 decimal to make the location more in the html 
            const locationString = `Latitude: ${latitude}, Longitude: ${longitude}`; // Create a string with the location
            //  use the saveIntake function to save the intake with the location
            saveIntake({
                intakeNumber: intakeCounter,
                mealName: chosenMeal.mealName,
                consumedWeight: weightConsumed,
                consumedEnergy: consumedEnergy.toFixed(2),
                dateAdded: intakeDate, 
                timeAdded: intakeTime,
                nutrients: {
                    protein: consumedProtein.toFixed(1),
                    fat: consumedFat.toFixed(1),
                    fiber: consumedFiber.toFixed(1)
                },
                location: locationString
            });
            // error handling if the browser does not support geolocation
        }, error => {
            console.error('Error getting location:', error);
            saveIntakeWithDefaultLocation();
        });
    } else {
        console.error('Geolocation is not available');
        saveIntakeWithDefaultLocation();
    }
    
}
// the function that handle the default location
function saveIntakeWithDefaultLocation() {
    saveIntake({
        // your intake object with default location
        location: 'Location not available'
    });
}


// The function that will save the intake to the local storage
function saveIntake(intake) {
    const existingIntakes = JSON.parse(localStorage.getItem('mealIntakes')) || [];
    existingIntakes.push(intake);
    localStorage.setItem('mealIntakes', JSON.stringify(existingIntakes));
    displayMealIntakes();
    clearForm();
}
// Funtion to cleat the form after the intake is saved
function clearForm() {
    document.getElementById('mealSelection').value = ''; 
    document.getElementById('mealWeight').value = '';
    const intakeMealFormVar = document.getElementById('IntakeMealForm');
    intakeMealFormVar.style.display = 'none';
}

// Add an event listener to the submit button
document.getElementById('submitIntakeMeal').addEventListener('click', function(event) {
    event.preventDefault();
    processMealForm();
});


document.addEventListener('DOMContentLoaded', displayMealIntakes);

function displayMealIntakes() {
    const mealIntakes = JSON.parse(localStorage.getItem('mealIntakes')) || [];
    const intakeEntriesContainer = document.querySelector('.intake-entries');
    // clear the container before adding new entries
    intakeEntriesContainer.innerHTML = '';

    mealIntakes.forEach((intake) => {
        const intakeEntry = document.createElement('div');
        intakeEntry.classList.add('intake-entry');
        intakeEntry.innerHTML = `
            <span>${intake.mealName} </span> 
            <span>${intake.consumedWeight}g <br> ${intake.consumedEnergy} kcal</span>
            <span>${intake.nutrients.protein}g <br> ${intake.nutrients.fat}g <br> ${intake.nutrients.fiber}g</span>
            <span>${intake.dateAdded} <br> ${intake.timeAdded}</span>
            <span>${intake.location}</span>
            <div class="intake-buttons-container">
                <button class="delete-intake-btn" data-meal-number="${intake.intakeNumber}"><i class="gg-trash"></i></button>
                <button class="edit-intake-btn" data-meal-number="${intake.intakeNumber}"><i class="gg-pen"></i></button>
            </div>
        `;
        intakeEntriesContainer.appendChild(intakeEntry);
        
    });

}




// Krav b - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// I have to have the option to register the intake of a individual ingredient. To this i have another form that will be shown and hidden with the click of a button
// Same code as above, but with different ID's
document.getElementById('IntakeIngredientButton').addEventListener('click', function() {
    const intakeIngredientFormVar = document.getElementById('IntakeIngredientForm');
    intakeIngredientFormVar.style.display = intakeIngredientFormVar.style.display === 'none' ? 'block' : 'none';
});
async function fetchNutritionalContent(foodId, sortKeys) {
    let nutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };
    for (let i = 0; i < sortKeys.length; i++) {
        let sortKey = sortKeys[i];
        const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodId}/BySortKey/${sortKey}`;
        try {
            console.log(`Fetching data for sortKey: ${sortKey}`); // Log the sort key being processed
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'accept': 'text/plain', 'X-API-Key': '168917' }
            });
            console.log(`Response for sortKey ${sortKey}:`, response); // Log the response
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Data for sortKey ${sortKey}:`, data); // Log the data
            let value = parseFloat(data[0]?.resVal.replace(',', '.')) || 0;
            if (sortKey === '1030') nutrition.energy += value;
            if (sortKey === '1110') nutrition.protein += value;
            if (sortKey === '1310') nutrition.fat += value;
            if (sortKey === '1240') nutrition.fiber += value;
        } catch (error) {
            console.error(`Error fetching nutritional content for sortKey ${sortKey}:`, error);
            throw error; // Ensure this error is caught in the calling function
        }
    }
    return nutrition;
}

async function searchIngredients(query) {
    const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodItems/BySearch/${query}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'accept': 'text/plain', 'X-API-Key': '168917' }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        throw error; // Propagate the error
    }
}

const ingredientInput = document.getElementById('ingredientInput');
const ingredientWeightInput = document.getElementById('ingredientWeightInput');
const ingredientDropdown = document.getElementById('ingredientDropdown');
const submitButton = document.getElementById('submitIngredientIntakeMeal'); 

ingredientInput.addEventListener('input', async function() {
    const query = ingredientInput.value.trim();
    if (query.length > 2) {
        try {
            const ingredients = await searchIngredients(query);
            updateIngredientDropdown(ingredients);
        } catch (error) {
            alert('Failed to fetch ingredients. Please try again.');
        }
    }
});

function updateIngredientDropdown(ingredientsInDropdown) {
    ingredientDropdown.innerHTML = '';
    ingredientsInDropdown.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient.foodID;
        option.textContent = ingredient.foodName;
        ingredientDropdown.appendChild(option);
    });
    ingredientDropdown.style.display = ingredientsInDropdown.length > 0 ? 'block' : 'none';
}

submitButton.addEventListener('click', function(event) {
    event.preventDefault();
    submitButton.disabled = true; // Disable the button to prevent multiple submissions

    // Ensure processIngredientForm is an async function
    processIngredientForm().finally(() => {
        submitButton.disabled = false; // Re-enable the button after processing
    });
});


let ingredientCounter = parseInt(localStorage.getItem('ingredientCounter'), 10) || 0;

async function processIngredientForm() {
    const selectedOption = ingredientDropdown.options[ingredientDropdown.selectedIndex];
    const foodId = selectedOption.value;
    const foodName = selectedOption.text;
    const weightConsumed = parseFloat(ingredientWeightInput.value);


    if (!foodId || isNaN(weightConsumed) || weightConsumed <= 0) {
        alert('Please select an ingredient and enter a valid weight.');
        return;
    }

    //increment the ingredientCounter
    ingredientCounter++;
    localStorage.setItem('ingredientCounter', ingredientCounter.toString());

    // Get the location first
    navigator.geolocation.getCurrentPosition(async function(position) {
        const longitude = position.coords.longitude.toFixed(3); 
        const latitude = position.coords.latitude.toFixed(3); // 
        try {
            const nutrition = await fetchNutritionalContent(ingredientCounter, ['1030', '1110', '1310', '1240']);

            const energyIntake = (nutrition.energy / 100) * weightConsumed;
            const proteinIntake = (nutrition.protein / 100) * weightConsumed;
            const fatIntake = (nutrition.fat / 100) * weightConsumed;
            const fiberIntake = (nutrition.fiber / 100) * weightConsumed;

            const intakeIngredient = {
                ingredientCounter,
                foodName,
                consumedWeight: weightConsumed,
                consumedEnergy: energyIntake.toFixed(2),
                dateAdded: new Date().toLocaleDateString(),
                timeAdded: new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit' }),
                location: `Latitude: ${latitude}, Longitude: ${longitude}`,
                nutrients: {
                    protein: proteinIntake.toFixed(1),
                    fat: fatIntake.toFixed(1),
                    fiber: fiberIntake.toFixed(1)
                }
            };
            saveIngredientIntake(intakeIngredient);
        } catch (error) {
            console.error('Error processing ingredient form:', error);
        } finally {
            clearIngredientForm();
        }
    }, function(error) {
        alert('Unable to retrieve location. Please ensure location services are enabled and try again.');
        console.error('Geolocation error:', error);
    });
}


function saveIngredientIntake(intakeIngredient) {
    const existingIntakes = JSON.parse(localStorage.getItem('ingredientIntakes')) || [];
    existingIntakes.push(intakeIngredient);
    localStorage.setItem('ingredientIntakes', JSON.stringify(existingIntakes));
    displayIngredientIntakes();
}

function clearIngredientForm() {
    ingredientInput.value = '';
    ingredientWeightInput.value = '';
    ingredientDropdown.innerHTML = '';
    ingredientDropdown.style.display = 'none';
    document.getElementById('IntakeIngredientForm').style.display = 'none';
}

function displayIngredientIntakes() {
    // Fetch ingredient intakes from localStorage and parse them into a JavaScript array
    const ingredientIntakes = JSON.parse(localStorage.getItem('ingredientIntakes')) || [];
    
    const ingredientEntriesContainer = document.querySelector('.intake-entries2');
    if (!ingredientEntriesContainer) {
        console.error('Ingredient entries container not found');
        return;
    }
    ingredientEntriesContainer.innerHTML = ''; // Clear the container before adding new entries

    // Iterate over each intake and create DOM elements to display them
    ingredientIntakes.forEach(intake => {
        const intakeEntry = document.createElement('div');
        intakeEntry.classList.add('intake-entry2');
        intakeEntry.innerHTML = `
            <span>${intake.foodName}</span> 
            <span>${intake.consumedWeight}g <br> ${intake.consumedEnergy} kcal</span>
            <span>${intake.nutrients.protein}g <br> ${intake.nutrients.fat}g <br> ${intake.nutrients.fiber}g</span>
            <span>${intake.dateAdded} <br> ${intake.timeAdded}</span>
            <span>${intake.location || 'Not specified'}</span>
            <div class="intake-buttons-container">
                <button class="delete-intake-btn" data-ingredient-counter="${intake.ingredientCounter}"><i class="gg-trash"></i></button>
                <button class="edit-intake-btn" data-ingredient-counter="${intake.ingredientCounter}"><i class="gg-pen"></i></button>
            </div>

        `;
        ingredientEntriesContainer.appendChild(intakeEntry);
    });
}
displayIngredientIntakes(); 


// to display the intakes when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
    displayIngredientIntakes();
    event.preventDefault();

});
function deleteMealIntake(intakeNumber) {
    const mealIntakes = JSON.parse(localStorage.getItem('mealIntakes')) || [];
    const filteredIntakes = mealIntakes.filter(intake => intake.intakeNumber !== intakeNumber);

    localStorage.setItem('mealIntakes', JSON.stringify(filteredIntakes));
    displayMealIntakes();
}

document.addEventListener('DOMContentLoaded', function() {
    const intakeEntriesContainer = document.querySelector('.intake-entries');

    intakeEntriesContainer.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-intake-btn');
        if (deleteButton) {
            const mealNumber = parseInt(deleteButton.getAttribute('data-meal-number'), 10);
            deleteMealIntake(mealNumber);
        }
    });
});


// Krav f - it has to be possible to delete the intakes or edit them - intake.mealName
function deleteMealIntake(intakeNumber) {
    const mealIntakes = JSON.parse(localStorage.getItem('mealIntakes')) || [];
    // Ensure you're comparing the same data types; mealNumber should be an integer if stored as such
    const filteredIntakes = mealIntakes.filter(intake => intake.intakeNumber !== intakeNumber);

    localStorage.setItem('mealIntakes', JSON.stringify(filteredIntakes));
    displayMealIntakes(); // Refresh the displayed intakes
}
// add an event $listener to the delete button
document.addEventListener('DOMContentLoaded', function() {
    const intakeEntriesContainer = document.querySelector('.intake-entries');

    intakeEntriesContainer.addEventListener('click', function(event) {
        // Use .closest() to ensure we get the button element, even if the click was on a child element
        const deleteButton = event.target.closest('.delete-intake-btn');
        if (deleteButton) {
            // Now we're sure deleteButton is the button element, we can safely retrieve the meal number
            const mealNumber = parseInt(deleteButton.getAttribute('data-meal-number'), 10); // 10 is the radix, that means we get "normal" numbers
            deleteMealIntake(mealNumber);
        }
    });
});


// edit button -  to edit the weight of the intake
document.addEventListener('DOMContentLoaded', function() {
    const intakeEntriesContainer = document.querySelector('.intake-entries');

    intakeEntriesContainer.addEventListener('click', function(event) {
        const editButton = event.target.closest('.edit-intake-btn');
        if (editButton) {
            const mealNumber = parseInt(editButton.getAttribute('data-meal-number'), 10);
            editMealIntake(mealNumber);
        }
    });
});



 // delete for the ingredients
 // Krav f - same thing for the ingredients intake.
 
 function deleteIngredientIntake(ingredientCounter) {
    const ingredientIntakes = JSON.parse(localStorage.getItem('ingredientIntakes')) || [];
    const filteredIntakes = ingredientIntakes.filter(intake => intake.ingredientCounter !== ingredientCounter);
    localStorage.setItem('ingredientIntakes', JSON.stringify(filteredIntakes));
    displayIngredientIntakes(); 
}

document.addEventListener('DOMContentLoaded', function() {
    const intakeEntriesContainer = document.querySelector('.intake-entries2');
    intakeEntriesContainer.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.delete-intake-btn');
        if (deleteButton) {
            const ingredientCounter = parseInt(deleteButton.getAttribute('data-ingredient-counter'), 10);
            deleteIngredientIntake(ingredientCounter);
        }
    });
});




