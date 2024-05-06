function displayMealDetails() {
    const meals = JSON.parse(sessionStorage.getItem('meals')) || [];
    console.log('Retrieved meals:', meals);
    
    let totalMeals = 0;
    let totalWaterIntake = 0;
    let totalKcal = 0;

    const tableBody = document.getElementById('mealDetailsTable').querySelector('tbody');
    tableBody.innerHTML = '';

    meals.forEach((meal, index) => {
        console.log(`Processing meal ${index + 1}:`, meal);

        totalMeals++;
        const waterIntake = isNaN(parseFloat(meal.water)) ? 0 : parseFloat(meal.water);

        if (isNaN(waterIntake)) {
            console.error('Invalid water data for meal', index + 1, ':', meal.water);
        }

        const consumedEnergy = isNaN(parseFloat(meal.consumedEnergy)) ? 0 : parseFloat(meal.consumedEnergy);
        const consumedWeight = isNaN(parseFloat(meal.totalMealWeight)) ? 0 : parseFloat(meal.totalMealWeight);

        if (isNaN(consumedEnergy) || isNaN(consumedWeight)) {
            console.error('Invalid energy or weight data for meal', index + 1, ':', meal.consumedEnergy, meal.totalMealWeight);
        }

        const calculatedEnergy = consumedEnergy * (consumedWeight / 100);

        if (isNaN(calculatedEnergy)) {
            console.error('Calculation error for meal', index + 1);
        }

        totalWaterIntake += waterIntake;
        totalKcal += calculatedEnergy;

        let mealTime = 'Unknown Time';
        if (meal.timeAdded) {
            mealTime = meal.timeAdded;
        } else {
            console.error('Time added missing for meal', index + 1);
        }

        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${mealTime}</td>
            <td>1 Meal</td>
            <td>${waterIntake.toFixed(2)} ml</td>
            <td>${calculatedEnergy.toFixed(2)} kcal</td>
        `;
    });

    const totalRow = tableBody.insertRow();
    totalRow.innerHTML = `
        <td>Total</td>
        <td>${totalMeals} Meals</td>
        <td>${totalWaterIntake.toFixed(2)} ml</td>
        <td>${totalKcal.toFixed(2)} kcal</td>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    displayMealDetails();
});

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
        console.log('Fetched meals:', meals);
        displaySavedMeals(meals); // Now pass the fetched meals directly to the display function
    } catch (error) {
        console.error('There was oa problem fetching the meals:', error.message);
    }
}
fetchAndDisplayMeals();





