// Funktionen genererer en rapport baseret på måltiderne gemt i localStorage.
function generateNutritionReport() {
    const meals = JSON.parse(localStorage.getItem('meals')) || [];
    const report = {};

    meals.forEach(meal => {
        const date = meal.dateAdded;

        if (!report[date]) {
            report[date] = {
                mealsCount: 0,
                totalEnergy: 0,
                totalProtein: 0,
                totalFat: 0,
                totalFibers: 0,
                totalWater: 0

            };
        }

        // Sørger for at calculatedTotals er defineret
        if (!meal.calculatedTotals) {
            meal.calculatedTotals = calculateNutrients(meal, meal.weight || 100);
        }

        report[date].mealsCount += 1;
        report[date].totalEnergy += meal.calculatedTotals.energy;
        report[date].totalProtein += meal.calculatedTotals.protein;
        report[date].totalFat += meal.calculatedTotals.fat;
        report[date].totalFibers += meal.calculatedTotals.fibers;
        report[date].totalWater += meal.water || 0; 

    });

    updateReportView(report);
}

// Funktionen opdaterer HTML-visningen med rapporten
function updateReportView(report) {
    const reportContainer = document.getElementById('nutritionReport'); 
    reportContainer.innerHTML = ''; // Tøm eksisterende indhold

    // Opret en tabelrække for hver dato i rapporten
    Object.keys(report).forEach(date => {
        const dateReport = report[date];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${date}</td>
            <td>${dateReport.mealsCount} Meals</td>
            <td>${dateReport.totalEnergy.toFixed(2)} Kcal</td>
            <td>${dateReport.totalProtein.toFixed(2)}g</td>
            <td>${dateReport.totalFat.toFixed(2)}g</td>
            <td>${dateReport.totalFibers.toFixed(2)}g</td>
            <td>${dateReport.totalWater.toFixed(2)} L Water</td> 

        `;
        reportContainer.appendChild(row);
    });
}



// Funktionen opdaterer måltidsvægten og genindlæser tabellen
function updateMealWeight() {
    // Hent måltider fra localStorage
    const meals = JSON.parse(localStorage.getItem('meals')) || [];

    // Gemmer opdateringerne i localStorage
    localStorage.setItem('meals', JSON.stringify(meals));

    
    populateMealTable(meals); 

    // Regenerer Nutrition Report
    generateNutritionReport();
}



generateNutritionReport();


