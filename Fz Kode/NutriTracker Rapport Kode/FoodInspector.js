// Funktion til at hente og formatere sort keys for et fødevareID
async function fetchSortKeys(foodID) {
    const sortKeys = ['1030', '1110', '1310', '1240', '1210', '1610', '1620'];
    const sortKeyData = [];

    for (const sortKey of sortKeys) {
        try {
            // Anmodning til API'en for at hente specifikke fødevareoplysninger baseret på fødevareID og sortKey
            const response = await fetch(`https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`, {
                headers: {
                    'X-API-KEY': '169890' // Angiv API-nøgle i anmodningen
                }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                // Hvis der returneres data, formater og tilføj den til sortKeyData-arrayet
                sortKeyData.push({ [data[0].parameterName]: data[0].resVal });
            }
        } catch (error) {
            console.error(`Fejl ved hentning af data for fødevareID: ${foodID} og sortKey: ${sortKey}`, error);
        }
    }
    return sortKeyData; 
}

// Funktion til at formatere sort keys som en streng og få nøgle værdier
function formatSortKeys(sortKeys) {
    return sortKeys.map(item => {
        const key = Object.keys(item)[0]; // Få nøgle værdie (fx. Kcal)
        const value = item[key]; 
        return `${key}: ${value}`; 
    }).join(', '); // Sammenføj alle formaterede sort keys med komma som separator
}

// Funktion til at vise detaljer om en fødevare baseret på fødevareID
async function displayFoodDetails(foodID) {
    const detailsContainer = document.getElementById('foodDetails'); // Hent reference til HTML-containeren til fødevaredetaljer

    const sortKeys = await fetchSortKeys(foodID); 
    let detailsHTML = `<div class="product-info">
    <h2>Produkt ID: ${foodID}</h2>`
    ;
    sortKeys.forEach(detail => {
        const key = Object.keys(detail)[0]; // Få nøglen for hver sort key
        const value = detail[key]; 
        detailsHTML += `<p><strong>${key}:</strong> ${value}</p>`; // Opret HTML for hver sort key og dens værdi
    });

    detailsHTML += `</div>`; // 
    detailsContainer.innerHTML = detailsHTML; // Opdater HTML-indholdet med fødevaredetaljerne
}

// Funktion til at vise fødevareelementer i en dropdown-liste
async function displayFoodItems() {
    const foodItemsList = document.getElementById('foodItemsList'); 
    try {
        // Anmodning til API'en for at hente en liste over fødevareelementer
        const response = await fetch('https://nutrimonapi.azurewebsites.net/api/FoodItems', {
            headers: {
                'X-API-KEY': '169890' 
            }
        });
        const foodItemsData = await response.json(); // Konverter API svar til JSON format

        foodItemsData.forEach(foodItem => {
            // Opret en valgmulighed for hver fødevare i dropdown listen

            const option = document.createElement('option');
            option.value = foodItem.foodName; 
            option.dataset.foodId = foodItem.foodID; 
            foodItemsList.appendChild(option); 
        });
    } catch (error) {
        console.error('Fejl ved hentning af fødevaredata:', error);
    }
}

// DOM listener, der kører, når DOM er indlæst
document.addEventListener('DOMContentLoaded', () => {
    displayFoodItems(); // Vis fødevareelementer i dropdown-listen, når DOM er indlæst
    const foodInput = document.getElementById('foodInput'); // Hent reference til inputfeltet til fødevaren
    foodInput.addEventListener('input', async (event) => {
        const dataList = document.getElementById('foodItemsList'); // reference til dropdown-listen
        const selectedOption = Array.from(dataList.options).find(option => option.value === event.target.value);
        // Find valgt valgmulighed baseret på inputfeltets værdi

        if (selectedOption) {
            displayFoodDetails(selectedOption.dataset.foodId); // Vis fødevaredetaljer baseret på fødevareID fra den valgte valgmulighed
        }
    });
});

