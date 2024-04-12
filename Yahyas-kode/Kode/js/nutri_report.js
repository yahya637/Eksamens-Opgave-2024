// Defines a function to display meal details from local storage
function displayMealDetails() {
    // Retrieve 'meals' array from local storage, parse it into a JavaScript object, or default to an empty array if not found
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    // Initialize counters for total meals, total water intake, and total kcal
    let totalMeals = 0;
    let totalWaterIntake = 0;
    let totalKcal = 0;

    // Get the table body element where meal details will be inserted
    const tableBody = document.getElementById('mealDetailsTable').querySelector('tbody');
    // Clear any existing content in the table body to prepare for new data
    tableBody.innerHTML = '';

    // Iterate over each meal object in the meals array
    meals.forEach(meal => {
        // Increment total meals counter
        totalMeals++;
        // Parse water intake from the meal object, defaulting to 0 if undefined
        const waterIntake = parseFloat(meal.water) || 0;
        // Add the current meal's water intake to the total water intake
        totalWaterIntake += waterIntake;
        // Calculate the energy (kcal) for the current meal, defaulting to 0 if undefined and adjust for meal weight
        const calculatedEnergy = (parseFloat(meal.energy) || 0) * (meal.weight / 100);
        // Add the calculated energy to the total kcal
        totalKcal += calculatedEnergy;

        // Default meal time to 'Unknown Time' and update if a timestamp is present
        let mealTime = 'Unknown Time';
        if (meal.timestamp) {
            const date = new Date(meal.timestamp);
            mealTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Insert a new row into the table body for the current meal
        const row = tableBody.insertRow();
        // Set the inner HTML of the row to display meal time, a fixed string '1 Meal', water intake, and calculated energy
        row.innerHTML = `
            <td>${mealTime}</td>
            <td>1 Meal</td>
            <td>${waterIntake}</td>
            <td>${calculatedEnergy.toFixed(2)}</td>
        `;
    });

    // After iterating through all meals, insert a final row to display total values
    const totalRow = tableBody.insertRow();
    totalRow.innerHTML = `
        <td>Total</td>
        <td>${totalMeals} Meals</td>
        <td>${totalWaterIntake}ml</td>
        <td>${totalKcal.toFixed(2)}</td>
    `;
}

// Add an event listener for the DOMContentLoaded event to automatically display meal details once the document is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    displayMealDetails();
});
