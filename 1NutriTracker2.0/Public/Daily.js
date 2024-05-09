  // Function to fetch all data from the databases
async function fetchAllData() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('No user ID found in session storage.');
        return;
    }
    console.log('User ID:', userId);

    try {
        const response = await fetch(`/daily/userstats/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const hourlySummary = processDataHourly(data);
        console.log('24 Hours data:', hourlySummary);
        return hourlySummary;
    } catch (error) {
        console.error('Error fetching user statistics:', error);
    }
}

fetchAllData();


function processDataHourly(data) {
    const currentHour = new Date().getHours(); // Get the current hour
    const hourlySummary = Array.from({ length: 24 }, (_, index) => {
        const hourIndex = (currentHour + index) % 24; // Calculate the hour index wrapping around 24
        return {
            time: `${hourIndex}:00 - ${(hourIndex + 1) % 24}:00`, // Handle wrapping around 24 for display
            consumedEnergy: 0,
            caloriesBurned: 0,
            calorieSurplusDeficit: 0,
            totalMeals: 0
        };
    });

    // Processing consumed energy data
    data.consumedData.forEach(entry => {
        const date = new Date(entry.TimeAdded);
        const hour = date.getUTCHours(); // Using UTC hour to avoid timezone issues
        hourlySummary.find(h => h.time.startsWith(`${hour}:00`)).consumedEnergy += (entry.ConsumedEnergy || 0);
        hourlySummary.find(h => h.time.startsWith(`${hour}:00`)).totalMeals += 1;
    });

    // Calculating daily Basal Metabolic Rate (BMR)
    const dailyBMR = data.bmrData[0].BmrKcal;
    const hourlyBMR = dailyBMR / 24;

    // Processing activities data
    data.activitiesData.forEach(entry => {
        const date = new Date(entry.TimeAdded);
        const hour = date.getUTCHours();
        hourlySummary.find(h => h.time.startsWith(`${hour}:00`)).caloriesBurned += (entry.TotalKcalBurned + hourlyBMR);
    });

    // Calculating calorie surplus or deficit
    hourlySummary.forEach(entry => {
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    return hourlySummary;
}

// Function to update the table with hourly data
function updateTableWithHourlyData(hourlySummary) {
    const tableBody = document.getElementById('mealDetailsTable24').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';  // Clear existing table rows

    hourlySummary.forEach(entry => {
        const row = tableBody.insertRow();
        const timeCell = row.insertCell(0);
        const mealsCell = row.insertCell(1);
        const consumedKcalCell = row.insertCell(2);
        const burnedKcalCell = row.insertCell(3);
        const surplusDeficitCell = row.insertCell(4);

        timeCell.textContent = entry.time;
        mealsCell.textContent = entry.totalMeals;
        consumedKcalCell.textContent = entry.consumedEnergy.toFixed(2);
        burnedKcalCell.textContent = entry.caloriesBurned.toFixed(2);
        surplusDeficitCell.textContent = entry.calorieSurplusDeficit.toFixed(2);
    });
}

// Example of integration with fetchAllData function
async function fetchAllDataAndDisplay() {
    const hourlySummary = await fetchAllData(); // Fetch data
    if (hourlySummary) {
        updateTableWithHourlyData(hourlySummary); // Update the table with fetched data
    }
}

fetchAllDataAndDisplay();


// Function to fetch all data from the databases for 30 days
async function fetchAllData30Days() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('No user ID found in session storage.');
        return;
    }
    console.log('User ID:', userId);

    try {
        const response = await fetch(`/daily/userstats/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const dailySummary = processDataDaily(data);
        console.log('30 Days data:', dailySummary);
        return dailySummary;
    } catch (error) {
        console.error('Error fetching user statistics:', error);
    }
}

fetchAllData30Days();


// Function to fetch all data from the databases for the last 30 days
// Helper function to ensure date string from database is converted to a correct JavaScript Date object
// Updated parseDate to handle MM-DD-YYYY format
// Parses dates for consumedData (MM-DD-YYYY)
function parseConsumedDate(dateStr) {
    const [month, day, year] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

// Parses dates for activitiesData (DD-MM-YYYY)
function parseActivityDate(dateStr) {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function processDataDaily(data) {
    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dailySummary = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(utcToday);
        date.setUTCDate(utcToday.getUTCDate() - index); // Dates for last 30 days
        return {
            date: date.toISOString().substring(0, 10), // Format as YYYY-MM-DD
            consumedEnergy: 0,
            caloriesBurned: 0,
            calorieSurplusDeficit: 0,
            totalMeals: 0
        };
    }).reverse(); // Reverse the array to start from today and go backwards

    // Process consumed data
    data.consumedData.forEach(entry => {
        const entryDate = parseConsumedDate(entry.DateAdded).toISOString().substring(0, 10);
        const summary = dailySummary.find(d => d.date === entryDate);
        if (summary) {
            summary.consumedEnergy += entry.ConsumedEnergy || 0;
            summary.totalMeals += 1;
        } else {
            console.error('No matching date found for consumed data:', entry.DateAdded);
        }
    });

    // Process activity data
    data.activitiesData.forEach(entry => {
        const entryDate = parseActivityDate(entry.DateAdded).toISOString().substring(0, 10);
        const summary = dailySummary.find(d => d.date === entryDate);
        if (summary) {
            summary.caloriesBurned += entry.TotalKcalBurned;
        } else {
            console.error('No matching date found for activity data:', entry.DateAdded);
        }
    });

    // Calculate calorie surplus/deficit
    dailySummary.forEach(entry => {
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    return dailySummary;
}


// Now we display the data on in the table




// Function to fetch all data from the databases for the last 30 days
async function fetchAllDataLast30Days() {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('No user ID found in session storage.');
        return;
    }
    console.log('User ID:', userId);

    try {
        const response = await fetch(`/daily/userstats/${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data fetched:', data);
        const dailySummary = processDataDaily(data);
        console.log('Last 30 Days data:', dailySummary);
        return dailySummary;
    } catch (error) {
        console.error('Error fetching user statistics:', error);
    }
}

fetchAllDataLast30Days();


// Function to update the table with daily data for the last 30 days
// Function to update the table with daily data for the last 30 days
function updateTableWithDailyData(dailySummary) {
    const tableBody = document.getElementById('mealDetailsTableDaily').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';  // Clear existing table rows

    // Ensure dailySummary is processed from most recent to oldest
    dailySummary.slice().reverse().forEach(entry => {
        const row = tableBody.insertRow(-1); // Add new row at the end of the table section
        const dateCell = row.insertCell(0);
        const mealsCell = row.insertCell(1);
        const consumedKcalCell = row.insertCell(2);
        const burnedKcalCell = row.insertCell(3);
        const surplusDeficitCell = row.insertCell(4);

        dateCell.textContent = entry.date;
        mealsCell.textContent = entry.totalMeals;
        consumedKcalCell.textContent = entry.consumedEnergy.toFixed(2);
        burnedKcalCell.textContent = entry.caloriesBurned.toFixed(2);
        surplusDeficitCell.textContent = entry.calorieSurplusDeficit.toFixed(2);
    });
}


// Example of integration with fetchAllData30Days function
async function fetchAllDataFor30DaysAndDisplay() {
    const dailySummary = await fetchAllData30Days(); // Fetch data
    if (dailySummary) {
        updateTableWithDailyData(dailySummary); // Update the table with fetched data
    }
}

fetchAllDataFor30DaysAndDisplay();

document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleView');
    const hourlyTable = document.getElementById('mealDetailsTable24');
    const dailyTable = document.getElementById('mealDetailsTableDaily');
    const viewTitle = document.getElementById('viewTitle'); // Reference to the <h2> element
    let isHourlyView = false; // Starts with Daily View

    // Initial states for Daily View
    dailyTable.style.display = ''; // Show daily table
    hourlyTable.style.display = 'none'; // Hide hourly table
    toggleButton.innerHTML = '<span class="material-symbols-outlined">schedule</span> Hourly View'; // Button shows Hourly View for next toggle
    toggleButton.style.backgroundColor = '#569bd5'; // Green background for Hourly View
    viewTitle.textContent = 'Daily Nutri'; // Update <h2> to Daily Nutri

    toggleButton.addEventListener('click', function() {
        if (isHourlyView) {
            // Switch to Daily View
            dailyTable.style.display = ''; // Show daily table
            hourlyTable.style.display = 'none'; // Hide hourly table
            toggleButton.innerHTML = '<span class="material-symbols-outlined">schedule</span> Hourly View'; // Button shows Hourly View for next toggle
            toggleButton.style.backgroundColor = '#569bd5'; // Green background for Hourly View
            viewTitle.textContent = 'Daily Nutri'; // Update <h2> to Daily Nutri
        } else {
            // Switch back to Hourly View
            hourlyTable.style.display = ''; // Show hourly table
            dailyTable.style.display = 'none'; // Hide daily table
            toggleButton.innerHTML = '<span class="material-symbols-outlined">calendar_month</span> Daily View'; // Button shows Daily View for next toggle
            toggleButton.style.backgroundColor = '#91c789'; // Blue background for Daily View
            viewTitle.textContent = 'Hourly Nutri'; // Update <h2> to Hourly Nutri
        }
        isHourlyView = !isHourlyView; // Toggle the state
    });
});
