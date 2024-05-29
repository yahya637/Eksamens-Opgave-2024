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
    const hourlySummary = Array.from({ length: 24 }, (_, index) => ({
        time: `${index}:00 - ${(index + 1) % 24}:00`, 
        consumedEnergy: 0,
        caloriesBurned: 0,
        calorieSurplusDeficit: 0,
        totalMeals: 0
    }));

    const dailyBMR = data.bmrData[0].BmrKcal;
    const hourlyBMR = dailyBMR / 24;

    data.consumedData.forEach(entry => {
        const date = new Date(entry.TimeAdded);
        const hour = date.getUTCHours(); 
        hourlySummary[hour].consumedEnergy += (entry.ConsumedEnergy || 0);
        hourlySummary[hour].totalMeals += 1;
    });

    data.activitiesData.forEach(entry => {
        const date = new Date(entry.TimeAdded);
        const hour = date.getUTCHours();
        hourlySummary[hour].caloriesBurned += (entry.TotalKcalBurned + hourlyBMR);
    });

    hourlySummary.forEach(entry => {
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    return hourlySummary;
}


// Function to update the table with hourly data
function updateTableWithHourlyData(hourlySummary) {
    const tableBody = document.getElementById('mealDetailsTable24').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';  

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

async function fetchAllDataAndDisplay() {
    const hourlySummary = await fetchAllData(); 
    if (hourlySummary) {
        updateTableWithHourlyData(hourlySummary); 
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

function parseConsumedDate(dateStr) {               // .split('-') splits the string into an array of strings
    const [day, month, year] = dateStr.split('-').map(Number); // then .map(Number) converts the strings to numbers
    return new Date(Date.UTC(year, month - 1, day));
}

function parseActivityDate(dateStr) {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

function processDataDaily(data) {
    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dailySummary = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(utcToday);
        date.setUTCDate(utcToday.getUTCDate() - index); 
        return {
            date: date.toISOString().substring(0, 10), 
            consumedEnergy: 0,
            caloriesBurned: 0,
            calorieSurplusDeficit: 0,
            totalMeals: 0
        };
    }).reverse(); // .reverse  array to start from today and go backwards

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

// function to fetch all data from the databases for the last 30 days
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
function updateTableWithDailyData(dailySummary) {
    const tableBody = document.getElementById('mealDetailsTableDaily').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';  // Clear existing table rows

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


async function fetchAllDataFor30DaysAndDisplay() {
    const dailySummary = await fetchAllData30Days(); 
    if (dailySummary) {
        updateTableWithDailyData(dailySummary);
    }
}

fetchAllDataFor30DaysAndDisplay();

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleView');
    const hourlyTable = document.getElementById('mealDetailsTable24');
    const dailyTable = document.getElementById('mealDetailsTableDaily');
    const viewTitle = document.getElementById('viewTitle'); 
    let isHourlyView = false; // Starts with Daily View

    // Initial states for Daily View
    dailyTable.style.display = ''; // Show daily table
    hourlyTable.style.display = 'none'; // Hide hourly table
    toggleButton.innerHTML = '<span class="material-symbols-outlined">schedule</span> Hourly View'; // Button shows Hourly View for next toggle
    toggleButton.style.backgroundColor = '#569bd5'; // Green background for Hourly View
    viewTitle.textContent = 'Daily Nutri'; // Update <h2> to Daily Nutri

    toggleButton.addEventListener('click', function () {
        if (isHourlyView) {
            // Switch to Daily View
            dailyTable.style.display = ''; 
            hourlyTable.style.display = 'none'; 
            toggleButton.innerHTML = '<span class="material-symbols-outlined">schedule</span> Hourly View'; 
            toggleButton.style.backgroundColor = '#569bd5'; 
            viewTitle.textContent = 'Daily Nutri';
        } else {
            // Switch back to Hourly View
            hourlyTable.style.display = ''; 
            dailyTable.style.display = 'none'; 
            toggleButton.innerHTML = '<span class="material-symbols-outlined">calendar_month</span> Daily View'; 
            toggleButton.style.backgroundColor = '#91c789'; 
            viewTitle.textContent = 'Hourly Nutri'; 
        }
        isHourlyView = !isHourlyView; // Toggle the state
    });
});


// logout functionality
document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function() {
        confirmLogout();
    });
});

function confirmLogout() {
    if (confirm('Are you sure you want to log out?')) {
        logoutUser();
    }
}

function logoutUser() {
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');
    window.location.href = '/NutriHome.html';
}