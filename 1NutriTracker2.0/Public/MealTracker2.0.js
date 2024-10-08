document.getElementById('IntakeMealButton').addEventListener('click', async function () {
    const intakeIngredientForm = document.getElementById('IntakeIngredientForm');
    const waterForm = document.getElementById('water-form');
    const intakeMealForm = document.getElementById('IntakeMealForm');
    intakeIngredientForm.style.display = 'none';
    waterForm.style.display = 'none';
    intakeMealForm.style.display = intakeMealForm.style.display === 'none' ? 'block' : 'none';
    await fetchMealsFromDatabase();
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
        if (!meals || meals.length === 0) {
            console.error('No meals found or empty response.');
            document.getElementById('mealSelection').innerHTML = '<option>No meals available</option>';
            return;
        }

        populateDropdown(meals);
    } catch (error) {
        console.error('There was a problem fetching the meals:', error.message);
        document.getElementById('mealSelection').innerHTML = `<option>Error: ${error.message}</option>`;
    }
}


// This function populates the dropdown menu with meals
function populateDropdown(meals) {
    const selectionOfMeals = document.getElementById('mealSelection');
    selectionOfMeals.innerHTML = ''; 
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

const submitButton = document.getElementById('submitIntakeMeal');
if (submitButton) {
    console.log('Submit button clicked');
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
    const year = currentDate.getFullYear()
    // Calculate the consumed nutrients based on the selected meal's nutrients and consumed weight
    const consumedEnergy = ((mealNutrients.energy / selectedMealWeight) * weightConsumed).toFixed(2);
    const consumedProtein = ((mealNutrients.protein / selectedMealWeight) * weightConsumed).toFixed(2);
    const consumedFat = ((mealNutrients.fat / selectedMealWeight) * weightConsumed).toFixed(2);
    const consumedFiber = ((mealNutrients.fiber / selectedMealWeight) * weightConsumed).toFixed(2);

    console.log('Consumed Energy:', consumedEnergy);
    console.log('Consumed Protein:', consumedProtein);
    console.log('Consumed Fat:', consumedFat);
    console.log('Consumed Fiber:', consumedFiber);

    // Construct the intake details object
    return {
        mealId: selectedOption.getAttribute('data-id'),
        mealName: selectedOption.getAttribute('data-name'),
        consumedWeight: weightConsumed,
        consumedEnergy,
        consumedProtein,
        consumedFat,
        consumedFiber,
        dateAdded: `${year}/${month}/${day}`,
        timeAdded: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
        await fetchMealIntakes();
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
    intakeEntriesContainer.innerHTML = ''; 

    mealIntakes.forEach((intake) => {
        let formattedDate = 'N/A';
        let formattedTime = 'N/A'; 

        if (intake.dateAdded) {
            const dateParts = intake.dateAdded.split('T')[0].split('-');
            formattedDate = `${dateParts[1]}-${dateParts[2]}-${dateParts[0].slice(2)}`;
        }
        if (intake.timeAdded) {
            const timeParts = intake.timeAdded.split('T')[1].split('.')[0].split(':');
            formattedTime = timeParts.join(':');
        }

        const intakeEntry = document.createElement('div');
        intakeEntry.classList.add('intake-entry');
        intakeEntry.innerHTML = `
            <span>${intake.mealName}</span>
            <span>${intake.consumedWeight}g <br> ${intake.consumedEnergy} kcal</span>
            <span>${intake.consumedProtein}g <br> ${intake.consumedFat}g <br> ${intake.consumedFiber}g</span>
            <span>${formattedDate} <br> ${formattedTime}</span>  
            <span>${intake.location}</span>
            <div class="intake-buttons-container">
                <button class="delete-intake-btn" data-meal-number="${intake.consumed_Id}"><i class="gg-trash"></i></button>
                <button class="edit-intake-btn" onclick="openEditForm('${intake.consumed_Id}', '${intake.consumedWeight}', '${intake.timeAdded}')" data-meal-number="${intake.consumed_Id}"><i class="gg-pen"></i></button>
            </div>
        `;
        intakeEntriesContainer.appendChild(intakeEntry);
    });
}




// Krav b - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// I have to have the option to register the intake of a individual ingredient. To this i have another form that will be shown and hidden with the click of a button
// Same code as above, but with different ID's
// Event listener for IntakeMealButton


document.getElementById('IntakeIngredientButton').addEventListener('click', function () {
    const intakeMealForm = document.getElementById('IntakeMealForm');
    const intakeIngredientForm = document.getElementById('IntakeIngredientForm');
    const waterForm = document.getElementById('water-form');
    intakeMealForm.style.display = 'none';
    waterForm.style.display = 'none';
    intakeIngredientForm.style.display = intakeIngredientForm.style.display === 'none' ? 'block' : 'none';
});

async function fetchNutritionalContent(foodId, sortKeys) {
    let nutrition = { energy: 0, protein: 0, fat: 0, fiber: 0 };

    for (let i = 0; i < sortKeys.length; i++) {
        let sortKey = sortKeys[i];
        const apiUrl = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodId}/BySortKey/${sortKey}`;
        try {
            console.log(`Fetching data for sortKey: ${sortKey}`);
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'accept': 'text/plain',
                    'X-API-Key': '168917'
                }
            });
            console.log(`Response for sortKey ${sortKey}:`, response);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Data for sortKey ${sortKey}:`, data);
            let value = parseFloat(data[0]?.resVal.replace(',', '.')) || 0;
            if (sortKey === '1030') nutrition.energy += value;
            if (sortKey === '1110') nutrition.protein += value;
            if (sortKey === '1310') nutrition.fat += value;
            if (sortKey === '1240') nutrition.fiber += value;
        } catch (error) {
            console.error(`Error fetching nutritional content for sortKey ${sortKey}:`, error);
            throw error;
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
        throw error; 
    }
}

const ingredientInput = document.getElementById('ingredientInput');
const ingredientWeightInput = document.getElementById('ingredientWeightInput');
const ingredientDropdown = document.getElementById('ingredientDropdown');
const submitButton2 = document.getElementById('submitIngredientIntakeMeal');

ingredientInput.addEventListener('input', async function () {
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

submitButton2.addEventListener('click', function (event) {
    event.preventDefault();
    submitButton2.disabled = true; // Disable the button to prevent multiple submissions
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


    // Get the location first
    navigator.geolocation.getCurrentPosition(async function (position) {
        const longitude = position.coords.longitude.toFixed(3);
        const latitude = position.coords.latitude.toFixed(3); // 
        try {
            const nutrition = await fetchNutritionalContent(foodId, ['1030', '1110', '1310', '1240']);

            const energyIntake = (nutrition.energy / 100) * weightConsumed;
            const proteinIntake = (nutrition.protein / 100) * weightConsumed;
            const fatIntake = (nutrition.fat / 100) * weightConsumed;
            const fiberIntake = (nutrition.fiber / 100) * weightConsumed;

            const currentDate = new Date();
            const day = ('0' + currentDate.getDate()).slice(-2); 
            const month = ('0' + (currentDate.getMonth() + 1)).slice(-2); 
            const year = currentDate.getFullYear();

            const intakeIngredient = {
                ingredientCounter,
                foodName,
                consumedWeight: weightConsumed,
                consumedEnergy: energyIntake.toFixed(2),
                consumedProtein: proteinIntake.toFixed(2),
                consumedFat: fatIntake.toFixed(2),
                consumedFiber: fiberIntake.toFixed(2),
                dateAdded: `${year}/${month}/${day}`,
                timeAdded: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                location: `Latitude: ${latitude}, Longitude: ${longitude}`,

            };
            saveIngredientIntake(intakeIngredient);
        } catch (error) {
            console.error('Error processing ingredient form:', error);
        } finally {
            clearIngredientForm();
        }
    }, function (error) {
        alert('Unable to retrieve location. Please ensure location services are enabled and try again.');
        console.error('Geolocation error:', error);
    });
}

//Save the ingredient intake to the database -  same as the meal intake

function saveIngredientIntake(intakeIngredient) {
    const userId = parseInt(sessionStorage.getItem('userId'), 10);
    if (!userId) {
        console.error('User ID not found');
        return;
    }

    fetch(`/mealtracker1/${userId}/register/ingredient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intakeIngredient)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save ingredient intake: ' + response.statusText);
            }
            console.log('Ingredient intake saved successfully');
            fetchMealIntakes();

        })
        .catch(error => {
            console.error('There was a problem saving the ingredient intake:', error);
        });
}

function clearIngredientForm() {
    ingredientInput.value = '';
    ingredientWeightInput.value = '';
    ingredientDropdown.innerHTML = '';
    ingredientDropdown.style.display = 'none';
    document.getElementById('IntakeIngredientForm').style.display = 'none';
}


// Krav F 
// Delete intakes 

document.addEventListener('DOMContentLoaded', function () {
    const intakeEntriesContainer = document.querySelector('.intake-entries');

    intakeEntriesContainer.addEventListener('click', function (event) {
        if (event.target.closest('.delete-intake-btn')) {
            const deleteBtn = event.target.closest('.delete-intake-btn');
            const consumedId = deleteBtn.getAttribute('data-meal-number');
            console.log(`Delete button clicked for intake ID: ${consumedId}`);
            if (confirm('Are you sure you want to delete this intake?')) {
                deleteIntake(consumedId);
            }
        }

        if (event.target.closest('.edit-intake-btn')) {
            const editBtn = event.target.closest('.edit-intake-btn');
            const consumedId = editBtn.getAttribute('data-meal-number');
            console.log(`Edit button clicked for intake ID: ${consumedId}`);
        }
    });
});

function deleteIntake(consumedId) {
    const userId = sessionStorage.getItem('userId'); 
    fetch(`/mealtracker1/${userId}/intake/${consumedId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                console.log('Intake deleted successfully');
                document.querySelector(`button[data-meal-number="${consumedId}"]`).closest('.intake-entry').remove();
            } else {
                return response.json().then(data => {
                    throw new Error(data.error);
                });
            }
        })
        .catch(error => {
            console.error('Error deleting meal intake:', error);
            alert('Failed to delete intake: ' + error.message);
        });
}


// Edit intakes
function openEditForm(consumedId, name, time) {
    document.getElementById('editName').value = name;
    document.getElementById('editTime').value = time;
    const form = document.getElementById('editIntakeForm');
    form.dataset.consumedId = consumedId;
    document.getElementById('editModal').style.display = 'block';
}




function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

function submitEditForm(event) {
    event.preventDefault();

    const form = document.getElementById('editIntakeForm');
    const consumedId = form.dataset.consumedId;
    const updatedName = document.getElementById('editName').value;
    const inputTime = document.getElementById('editTime').value;

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(inputTime)) {
        alert('Invalid time format. Please enter time in HH:MM format (e.g., 20:00).');
        return;
    }
    const [hours, minutes] = inputTime.split(':').map(Number);

    // Create a new Date object with the current date and parsed hours and minutes
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);

    // Convert the selected time to ISO string with correct timezone offset
    const updatedTime = new Date(selectedTime.getTime() - (selectedTime.getTimezoneOffset() * 60000)).toISOString();

    const userId = sessionStorage.getItem('userId');

    const data = {
        foodName: updatedName,
        timeAdded: updatedTime
    };

    fetch(`/mealtracker1/${userId}/intake/${consumedId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update intake');
            }
            console.log('Intake updated successfully');
            closeModal();
            fetchMealIntakes();
        })
        .catch(error => {
            console.error('Error updating intake:', error);
            alert('Failed to update intake: ' + error.message);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function () {
        confirmLogout();
    });
});

function confirmLogout() {
    if (confirm('Are you sure you want to log out?')) {
        logoutUser();
    }
}

function logoutUser() {
    // Clear specific sessionStorage item
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    window.location.href = '/NutriHome.html';
}


// Track water intake 

// post water intake to the database
document.getElementById('addWater').addEventListener('click', addWaterIntake);

async function addWaterIntake() {
    const waterMl = document.getElementById('waterMl').value;
    const userId = sessionStorage.getItem('userId'); 

    if (!userId) {
        console.error('No user ID found in sessionStorage.');
        return;
    }

    try {
        const response = await fetch(`/mealtracker1/${userId}/water`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ waterAmount_ml: parseInt(waterMl) })
        });

        if (response.ok) {
            const result = await response.json();
            alert('Water intake added successfully');
            fetchWaterHistory(); 
        } else {
            throw new Error('Failed to add water intake');
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('confirmationMessage').style.display = 'block';
        document.getElementById('confirmationMessage').textContent = 'Failed to add water';
    }
}

async function fetchWaterHistory() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('No user ID found in sessionStorage.');
        return;
    }

    try {
        const response = await fetch(`/mealtracker1/${userId}/water`);
        if (response.ok) {
            const data = await response.json();
            displayWaterHistory(data);
        } else {
            throw new Error('Failed to fetch water history');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayWaterHistory(data) {
    const waterHistoryDiv = document.getElementById('water-history');
    waterHistoryDiv.innerHTML = ''; 

    if (data.length > 0) {
        const ul = document.createElement('ul');
        data.forEach(water => {
            const li = document.createElement('li');
            li.textContent = `${water.waterAmount_ml} ml on ${new Date(water.intake_date).toLocaleDateString()} at ${new Date(water.intake_time).toLocaleTimeString()}`;
            ul.appendChild(li);
        });
        waterHistoryDiv.appendChild(ul);
    } else {
        waterHistoryDiv.textContent = 'No water intake history available.';
    }
}
function toggleWaterHistory() {
    const waterHistoryElement = document.getElementById('water-history');
    const toggleButton = document.getElementById('show-water-history');

    if (!waterHistoryElement || !toggleButton) {
        console.error('One or more elements are missing.');
        return; 
    }

    if (waterHistoryElement.style.display === 'none') {
        waterHistoryElement.style.display = 'block';
        toggleButton.innerText = 'Hide Water Intakes'; 
        fetchWaterHistory();
    } else {
        waterHistoryElement.style.display = 'none';
        toggleButton.innerText = 'Show Water Intakes';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('show-water-history');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleWaterHistory);
    } else {
        console.error('Button with ID "show-water-history" was not found.');
    }
});

document.getElementById('waterButton').addEventListener('click', function () {
    const intakeMealForm = document.getElementById('IntakeMealForm');
    const intakeIngredientForm = document.getElementById('IntakeIngredientForm');
    const waterForm = document.getElementById('water-form');
    intakeMealForm.style.display = 'none';
    intakeIngredientForm.style.display = 'none';
    waterForm.style.display = waterForm.style.display === 'none' ? 'block' : 'none';
});

