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
