// Populates the meal table with meal data.
function populateMealTable(meals) {
    // Access the table body within the meal tracker table.
    const tableBody = document.getElementById('mealTrackerTable').querySelector('tbody');
    // Clear existing rows in the table body.
    tableBody.innerHTML = '';

    // Iterate over each meal to create and append table rows.
    meals.forEach((meal, index) => {
        // Calculate and cache total nutrients for the meal if not already done.
        if (!meal.calculatedTotals) {
            meal.calculatedTotals = calculateNutrients(meal, meal.weight || 100);
        }

        // Default water intake to 0 if not specified.
        const waterIntake = meal.water !== undefined ? meal.water : 0;

        // Create a new table row element.
        const row = document.createElement('tr');
        // Populate the row with meal data, including dynamic inputs for weight and date, and a delete button.
        row.innerHTML = `
            <td>${meal.type || 'Not given'}</td>
            <td>
                <input type="text" value="${meal.weight || 100}" min="0" onchange="updateMealWeight(${index}, this.value)">
                g - ${meal.calculatedTotals.energy.toFixed(2)} Kcal
            </td>
            <td>
                <input type="text" value="${meal.dateAdded || ''}" onchange="updateMealDate(${index}, this.value)">
            </td>
            <td>${meal.location ? `${meal.location.latitude.toFixed(2)}, ${meal.location.longitude.toFixed(2)}` : 'Not available'}</td>
            <td>${meal.calculatedTotals.protein.toFixed(2)} g</td>
            <td>${meal.calculatedTotals.fat.toFixed(2)} g</td>
            <td>${meal.calculatedTotals.fibers.toFixed(2)} g</td>
            <td>
            <input type="text" pattern="[0-9]*" inputmode="numeric" value="${waterIntake}" 
            onchange="updateWaterIntake(${index}, this.value)" placeholder="L water">
                    
            </td>
            <td><button class="delete-btn" onclick="deleteMeal(${index})">Delete</button></td>
        `;
        // Append the newly created row to the table body.
        tableBody.appendChild(row);
    });
}

// Event listener to populate the meal table on document load.
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve meals from local storage or initialize an empty array if none exist.
    const meals = JSON.parse(localStorage.getItem('meals')) || [];

    // Populate the meal table if it exists in the DOM.
    if (document.getElementById('mealTrackerTable')) {
        populateMealTable(meals);
    }
});

// Updates the water intake for a meal and refreshes the meal table.
function updateWaterIntake(index, newWaterIntake) {
    // Retrieve meals from local storage or initialize an empty array if none exist.
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        // Parse the new water intake to a float and update the meal.
        newWaterIntake = parseFloat(newWaterIntake);
        meals[index].water = newWaterIntake;

        // Persist the updated meals array to local storage and refresh the table.
        localStorage.setItem('meals', JSON.stringify(meals));
        populateMealTable(meals);
    }
}

// Event listener to initialize water values for meals on document load.
document.addEventListener('DOMContentLoaded', () => {
    // Retrieve meals from local storage or initialize an empty array if none exist.
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.forEach(meal => {
        // Ensure each meal has a water value, defaulting to 0 if undefined.
        if (meal.water === undefined) {
            meal.water = 0;
        }
    });
    // Populate the meal table with the initialized meals.
    populateMealTable(meals);
});

// Calculates and returns the nutrient totals based on meal data and weight.
function calculateNutrients(meal, weight) {
    // Ensure a valid weight, defaulting to 100g.
    weight = weight > 0 ? weight : 100;

    // Calculate nutrient totals based on the meal's totals and the specified weight.
    return {
        energy: (meal.totals.Energy * weight) / 100,
        protein: (meal.totals.Protein * weight) / 100,
        fat: (meal.totals.Fat * weight) / 100,
        fibers: (meal.totals.Fibers * weight) / 100
    };
}

// Updates the weight for a meal, recalculates nutrients, and refreshes the meal table.
function updateMealWeight(index, newWeight) {
    // Retrieve meals from local storage or initialize an empty array if none exist.
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        // Parse the new weight to a float and update the meal.
        newWeight = parseFloat(newWeight);
        meals[index].weight = newWeight;

        // Recalculate nutrient totals for the updated weight and refresh the table.
        meals[index].calculatedTotals = calculateNutrients(meals[index], newWeight);
        localStorage.setItem('meals', JSON.stringify(meals));
        populateMealTable(meals);
    }
}

// Updates the date for a meal and refreshes the meal table.
function updateMealDate(index, newDate) {
    // Retrieve meals from local storage or initialize an empty array if none exist.
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        // Update the meal's date.
        meals[index].dateAdded = newDate;
        // Persist the updated meals array to local storage and refresh the table.
        localStorage.setItem('meals', JSON.stringify(meals));
        populateMealTable(meals);
    }
}

// Deletes a meal from the list and refreshes the meal table.
function deleteMeal(index) {
    // Retrieve meals from local storage or initialize an empty array if none exist.
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        // Remove the specified meal from the array.
        meals.splice(index, 1);

        // Persist the updated meals array to local storage and refresh the table.
        localStorage.setItem('meals', JSON.stringify(meals));
        populateMealTable(meals);
    }
}


