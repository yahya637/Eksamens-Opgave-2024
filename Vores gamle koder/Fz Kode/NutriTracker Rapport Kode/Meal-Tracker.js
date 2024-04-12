// Event listener, der kører, når DOM er indlæst
document.addEventListener('DOMContentLoaded', () => {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    // Tjekker om 'mealTrackerTable' eksisterer før populateMealTable kaldes
    if (document.getElementById('mealTrackerTable')) {
        populateMealTable(meals);
    }
});

// Funktion til at fylde måltidstabel med data

function populateMealTable(meals) {
    const tableBody = document.getElementById('mealTrackerTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Ryd tidligere indhold

    meals.forEach((meal, index) => {
        // Beregning af næringsindhold for hvert måltid baseret på den aktuelle vægt
        if (!meal.calculatedTotals) {
            meal.calculatedTotals = calculateNutrients(meal, meal.weight || 100);
        }
        
        // Tjekker vand indtaget, ellers sættet det til 0.
        const waterIntake = meal.water !== undefined ? meal.water : 0; 

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meal.type || 'Not given'}</td>
            <td>
                <input type="text" value="${meal.weight || 100}" min="0" onchange="updateMealWeight(${index}, this.value)">
                g - ${meal.calculatedTotals.energy.toFixed(2)} Kcal
            </td>
            <td>
                <input type="text" value="${meal.dateAdded || ''}" onchange="updateMealDate(${index}, this.value)">
            </td>
            <td>${meal.calculatedTotals.protein.toFixed(2)} g</td>
            <td>${meal.calculatedTotals.fat.toFixed(2)} g</td>
            <td>${meal.calculatedTotals.fibers.toFixed(2)} g</td>
            <td>
            <input type="text" pattern="[0-9]*" inputmode="numeric" value="${meal.water || 0}" 
            onchange="updateWaterIntake(${index}, this.value)" placeholder="L water">
                    
            </td>
            <td><button class="delete-btn" onclick="deleteMeal(${index})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Opdaterer vand indtaget 
function updateWaterIntake(index, newWaterIntake) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        newWaterIntake = parseFloat(newWaterIntake); // Sikre at det er et tal
        meals[index].water = newWaterIntake; // Opdater måltidets vandindtag

        // Gemmer opdateringerne i localStorage.
        localStorage.setItem('meals', JSON.stringify(meals));
        populateMealTable(meals); // Opdater tabellen
    }
}


// Funktion til at beregne næringsindhold baseret på vægt
function calculateNutrients(meal, weight) {
    // Sikrer at vægten er et tal og større end 0.
    weight = weight > 0 ? weight : 100; // Hvis vægten ikke er et positivt tal, brug 100g som standardværdi.

    // Beregn næringsindhold baseret på den nye vægt.
    return {
        energy: (meal.totals.Energy * weight) / 100,
        protein: (meal.totals.Protein * weight) / 100,
        fat: (meal.totals.Fat * weight) / 100,
        fibers: (meal.totals.Fibers * weight) / 100
    };
}


// Funktion til at opdatere måltidsvægt
function updateMealWeight(index, newWeight) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        newWeight = parseFloat(newWeight); // Konverterer input til et flydende punktnummer.

        meals[index].weight = newWeight;

        // Beregn de nye næringsværdier baseret på den nye vægt
        meals[index].calculatedTotals = calculateNutrients(meals[index], newWeight);

        // Gemmer opdateringerne i localStorage.
        localStorage.setItem('meals', JSON.stringify(meals));
        populateMealTable(meals); // Genindlæser tabellen for at vise de nye værdier.
    }
}


// Funktion til at opdatere måltidsdato
function updateMealDate(index, newDate) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        meals[index].dateAdded = newDate; // Opdaterer datoen for det valgte måltid.
        localStorage.setItem('meals', JSON.stringify(meals)); // Gemmer den opdaterede måltidsliste i localStorage.
        populateMealTable(meals); // Genindlæser tabellen for at vise de opdaterede datoer.
    }
}

// Funktion til at slette et måltid
function deleteMeal(index) {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    if (meals[index]) {
        // Fjern måltidet fra arrayet.
        meals.splice(index, 1);

        // Opdater localStorage med det nye array af måltider.
        localStorage.setItem('meals', JSON.stringify(meals));

        // Genindlæs tabellen for at vise de opdaterede måltider.
        populateMealTable(meals);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    meals.forEach(meal => {
        if (meal.water === undefined) {
            meal.water = 0; // Sikre at alle måltider har en 'water' id
        }
    });
    populateMealTable(meals);

});