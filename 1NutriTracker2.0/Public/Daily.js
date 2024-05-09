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

    // Processing consumed energy data
    data.consumedData.forEach(entry => {
        const date = new Date(entry.TimeAdded);
        const hour = date.getUTCHours(); // Using UTC hour to avoid timezone issues
        const minutes = date.getUTCMinutes(); // Logging minutes to diagnose rounding issues
        console.log(`Meal time: ${date.toISOString()}, Hour: ${hour}, Minutes: ${minutes}`);
        hourlySummary[hour].consumedEnergy += (entry.ConsumedEnergy || 0);
        hourlySummary[hour].totalMeals += 1;
    });

    // Calculating daily Basal Metabolic Rate (BMR)
    const dailyBMR = data.bmrData[0].BmrKcal;
    const hourlyBMR = dailyBMR / 24;

    // Processing activities data
    data.activitiesData.forEach(entry => {
        const date = new Date(entry.TimeAdded);
        const hour = date.getUTCHours(); // Using UTC hour to avoid timezone issues
        console.log(`Activity time: ${date.toISOString()}, Hour: ${hour}`);
        hourlySummary[hour].caloriesBurned += (entry.TotalKcalBurned + hourlyBMR);
    });

    // Calculating calorie surplus or deficit
    hourlySummary.forEach(entry => {
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    return hourlySummary;
}

