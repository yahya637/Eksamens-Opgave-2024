document.addEventListener('DOMContentLoaded', function() {
    fetchAlldata();
    
 });
 
 
// Funtion to fetch all data from the databases
async function fetchAlldata() {
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



function processDataHourly(data) {
    // Initial hourly summary structure
    const hourlySummary = Array.from({ length: 24 }, (_, index) => ({
        time: `${index}:00 - ${index + 1}:00`,
        consumedEnergy: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        calorieSurplusDeficit: 0,
        totalMeals: 0
    }));

    // Processing consumed food data
    data.consumedData.forEach(entry => {
        const hour = new Date(entry.TimeAdded).getHours();
        hourlySummary[hour].consumedEnergy += (entry.ConsumedEnergy || 0);
        hourlySummary[hour].totalMeals += 1;
    });

    // Calculating hourly BMR
    const dailyBMR = data.bmrData.length > 0 ? data.bmrData[0].BmrKcal : 0; // Safely access BMR data
    const hourlyBMR = dailyBMR / 24;

    // Processing activity data
    data.activitiesData.forEach(entry => {
        const hour = new Date(entry.TimeAdded).getHours();
        hourlySummary[hour].caloriesBurned += (entry.TotalKcalBurned || 0);
    });

    // Adding hourly BMR to the calories burned in each hour
    hourlySummary.forEach(entry => {
        entry.caloriesBurned += hourlyBMR;
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    // Processing water intake data
    data.waterIntakeData.forEach(entry => {
        const hour = new Date(entry.TimeAdded).getHours();
        hourlySummary[hour].waterIntake += (entry.WaterAmount || 0);
    });

    return hourlySummary;
}

