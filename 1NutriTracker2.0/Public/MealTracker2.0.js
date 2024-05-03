document.getElementById('IntakeMealButton').addEventListener('click', async function() {
    const intakeMealForm = document.getElementById('IntakeMealForm');
    if (intakeMealForm.style.display === 'none' || intakeMealForm.style.display === '') {
        intakeMealForm.style.display = 'block';
        await fetchMealsFromDatabase(); // Fetch meals when the form is shown
        
    } else {
        intakeMealForm.style.display = 'none';
    }
});

async function fetchMealsFromDatabase() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('User ID not found');
        document.getElementById('mealSelection').innerHTML = '<option>Error loading meals: User not identified</option>';
        return;
    }

    try {
        const response = await fetch(`/mealtracker1/${userId}`, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Failed to fetch meals: ' + response.statusText);
        }

        const meals = await response.json();
        console.log('Meals fetched successfully') 
        populateDropdown(meals);
    } catch (error) {
        console.error('There was a problem fetching the meals:', error.message);
    }
}

// This function populates the dropdown menu with meals
function populateDropdown(meals) {
    const selectionOfMeals = document.getElementById('mealSelection');
    selectionOfMeals.innerHTML = '';  // Clear existing options
    meals.forEach(meal => {
        const option = document.createElement('option');
        option.value = meal.MealId;
        option.textContent = `${meal.MealName} - ${meal.totalMealWeight}g`;
        option.setAttribute('data-name', meal.MealName);
        option.setAttribute('data-id', meal.MealId);
        option.setAttribute('data-weight', meal.totalMealWeight);
        option.setAttribute('data-energy', meal.calcEnergy100g);
        option.setAttribute('data-protein', meal.calcProtein100g);
        option.setAttribute('data-fat', meal.calcFat100g);
        option.setAttribute('data-fiber', meal.calcFiber100g);
        selectionOfMeals.appendChild(option);
    });
}
// Immediately fetch meal intakes when the script loads, if possible
fetchMealIntakes();

// Set up button click event listeners directly
const submitButton = document.getElementById('submitIntakeMeal');
if (submitButton) {
    submitButton.addEventListener('click', processMealForm);
} else {
    console.error('Submit button not found');
}

function processMealForm() {
    const mealSelect = document.getElementById('mealSelection');
    const selectedOption = mealSelect.options[mealSelect.selectedIndex];
    const weightInput = document.getElementById('consumedMealWeight').value;
    if (!weightInput) {
        console.error('Please enter the consumed meal weight');
        return;
    }
    const weightConsumed = parseFloat(weightInput);
    const intakeDetails = calculateIntakeDetails(selectedOption, weightConsumed);
    logIntakeDetails(intakeDetails);
}

function logIntakeDetails(intakeDetails) {
    navigator.geolocation.getCurrentPosition(
        position => {
            intakeDetails.location = `Latitude: ${position.coords.latitude.toFixed(3)}, Longitude: ${position.coords.longitude.toFixed(3)}`;
            saveIntakeToDatabase(intakeDetails);
        },
        error => {
            console.error('Error getting location:', error);
            intakeDetails.location = 'Location not available';
            saveIntakeToDatabase(intakeDetails);
        }
    );
}
// This function calculates the nutritional details based on selected meal and consumed weight

function calculateIntakeDetails(selectedOption, weightConsumed) {
    const selectedMealWeight = parseFloat(selectedOption.getAttribute('data-weight'));
    const mealNutrients = {
        energy: parseFloat(selectedOption.getAttribute('data-energy')),
        protein: parseFloat(selectedOption.getAttribute('data-protein')),
        fat: parseFloat(selectedOption.getAttribute('data-fat')),
        fiber: parseFloat(selectedOption.getAttribute('data-fiber'))
    };

    const currentDate = new Date();
    const day = ('0' + currentDate.getDate()).slice(-2); // Ensure two digits for day
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); // Ensure two digits for month
    const year = currentDate.getFullYear().toString().slice(-2); // Take the last two digits of the year

    return {
        mealId: selectedOption.getAttribute('data-id'),
        mealName: selectedOption.getAttribute('data-name'),
        consumedWeight: weightConsumed,
        consumedEnergy: ((mealNutrients.energy / selectedMealWeight) * weightConsumed).toFixed(2),
        consumedProtein: ((mealNutrients.protein / selectedMealWeight) * weightConsumed).toFixed(2),
        consumedFat: ((mealNutrients.fat / selectedMealWeight) * weightConsumed).toFixed(2),
        consumedFiber: ((mealNutrients.fiber / selectedMealWeight) * weightConsumed).toFixed(2),
        dateAdded: `${day}/${month}/${year}`,
        timeAdded: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };
}


async function saveIntakeToDatabase(intakeDetails) {
    const userId = parseInt(sessionStorage.getItem('userId'), 10);
    if (!userId) {
        console.error('User ID not found');
        return;
    }

    try {
        const response = await fetch(`/mealtracker1/${userId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(intakeDetails)
        });

        if (!response.ok) {
            throw new Error('Failed to save intake: ' + response.statusText);
        }

        console.log('Intake saved successfully');
        fetchMealIntakes();  // Refresh the meal list
    } catch (error) {
        console.error('There was a problem saving the intake:', error.message);
    }
}



function fetchMealIntakes() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('User ID not found');
        return;
    }

    fetch(`/mealtracker1/${userId}/intake`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch meal intakes: ' + response.statusText);
        }
        return response.json();
    })
    .then(mealIntakes => {
        console.log('Meal intakes fetched successfully:', mealIntakes);
        displayMealIntakes(mealIntakes);
    })
    .catch(error => {
        console.error('There was a problem fetching the meal intakes:', error);
    });
}

function displayMealIntakes(mealIntakes) {
    const intakeEntriesContainer = document.querySelector('.intake-entries');
    intakeEntriesContainer.innerHTML = ''; // Clear the container before adding new entries

    mealIntakes.forEach((intake) => {
        // Extract and format date and time from the database values
        const dateParts = intake.dateAdded.split('T')[0].split('-'); // Split date by '-' and 'T'
        const formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0].slice(2)}`; // Format as DD-MM-YY

        const timeParts = intake.timeAdded.split('T')[1].split('.')[0].split(':'); // Extract time and split
        const formattedTime = timeParts.join(':'); // Join time parts to get HH:MM:SS

        const intakeEntry = document.createElement('div');
        intakeEntry.classList.add('intake-entry');
        intakeEntry.innerHTML = `
            <span>${intake.mealName}</span>
            <span>${intake.consumedWeight}g <br> ${intake.consumedEnergy} kcal</span>
            <span>${intake.consumedProtein}g <br> ${intake.consumedFat}g <br> ${intake.consumedFiber}g</span>
            <span>${formattedDate} ${formattedTime}</span>  
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
const submitButton2 = document.getElementById('submitIngredientIntakeMeal'); 

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

submitButton2.addEventListener('click', function(event) {
    event.preventDefault();
    submitButton2.disabled = true; // Disable the button to prevent multiple submissions

    // Ensure processIngredientForm is an async function
    processIngredientForm().finally(() => {
        submitButton2.disabled = false; // Re-enable the button after processing
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




