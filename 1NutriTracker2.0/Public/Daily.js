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
        time: `${index}:00 - ${index + 1}:00`,
        consumedEnergy: 0,
        caloriesBurned: 0,
        calorieSurplusDeficit: 0,
        totalMeals: 0
    }));

    data.consumedData.forEach(entry => {
        const hour = new Date(entry.TimeAdded).getHours(); // Local hour
        hourlySummary[hour].consumedEnergy += (entry.ConsumedEnergy || 0);
        hourlySummary[hour].totalMeals += 1;
    });

    const dailyBMR = data.bmrData[0].BmrKcal; // Check for undefined/null needed
    const hourlyBMR = dailyBMR / 24;

    data.activitiesData.forEach(entry => {
        const hour = new Date(entry.TimeAdded).getHours(); // Local hour
        hourlySummary[hour].caloriesBurned += (entry.TotalKcalBurned + hourlyBMR);
    });

    hourlySummary.forEach(entry => {
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    return hourlySummary;
}


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
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));  // Sørger for korrekt UTC dato
}

function processDataDaily(data) {
    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const dailySummary = Array.from({ length: 30 }, (_, index) => {
        const date = new Date(utcToday);
        date.setUTCDate(utcToday.getUTCDate() - index);
        return {
            date: date.toISOString().substring(0, 10), // Konverterer til "YYYY-MM-DD"
            consumedEnergy: 0,
            caloriesBurned: 0,
            calorieSurplusDeficit: 0,
            totalMeals: 0
        };
    });

    // Behandle indtaget data
    data.consumedData.forEach(entry => {
        const entryDate = parseDate(entry.DateAdded).toISOString().substring(0, 10);
        const summary = dailySummary.find(d => d.date === entryDate);
        if (summary) {
            summary.consumedEnergy += entry.ConsumedEnergy || 0;
            summary.totalMeals += 1;
        } else {
            console.log('No matching date found for consumed data:', entry);
        }
    });

    // Behandle aktivitetsdata
    data.activitiesData.forEach(entry => {
        const entryDate = parseDate(entry.DateAdded).toISOString().substring(0, 10);
        const summary = dailySummary.find(d => d.date === entryDate);
        if (summary) {
            summary.caloriesBurned += entry.TotalKcalBurned || 0;
        } else {
            console.log('No matching date found for activity data:', entry);
        }
    });

    // Juster BMR logik baseret på aktivitet og forbrug
    dailySummary.forEach(entry => {
        if (entry.caloriesBurned > 0 || entry.consumedEnergy > 0) {
            entry.caloriesBurned += data.bmrData.length ? data.bmrData[0].BmrKcal / 30 : 0;
        }
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    console.log('Final daily summary:', dailySummary);
    return dailySummary;
}


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
