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
    console.log('Data received:', data);  // Log the data to check its structure

    // Initialize the hourly summary structure
    const hourlySummary = Array.from({ length: 24 }, (_, index) => ({
        time: `${index}:00 - ${index + 1}:00`,
        consumedEnergy: 0,
        caloriesBurned: 0,
        waterIntake: 0,
        calorieSurplusDeficit: 0,
        totalMeals: 0
    }));

    // Helper function to extract hour from a time string
    function extractHour(timeString) {
        const date = new Date(timeString);
        return date.getHours();
    }

    // Process consumed food data
    if (data.consumedData) {
        data.consumedData.forEach(entry => {
            const hour = extractHour(entry.TimeAdded);
            hourlySummary[hour].consumedEnergy += entry.ConsumedEnergy || 0;
            hourlySummary[hour].totalMeals += 1;
        });
    }

    // Calculate hourly BMR
    const dailyBMR = data.bmrData?.length > 0 ? data.bmrData[0].BmrKcal : 0;
    const hourlyBMR = dailyBMR / 24;

    // Process activity data
    if (data.activitiesData) {
        data.activitiesData.forEach(entry => {
            const hour = extractHour(entry.TimeAdded);
            hourlySummary[hour].caloriesBurned += entry.TotalKcalBurned || 0;
        });
    }

    // Add hourly BMR to the calories burned in each hour
    hourlySummary.forEach(entry => {
        entry.caloriesBurned += hourlyBMR;
        entry.calorieSurplusDeficit = entry.consumedEnergy - entry.caloriesBurned;
    });

    // Process water intake data
    if (data.waterIntakeData) {
        data.waterIntakeData.forEach(entry => {
            if (entry.TimeAdded) {
                const hour = extractHour(entry.TimeAdded);
                hourlySummary[hour].waterIntake += entry.WaterAmount || 0;
            } else {
                console.error("Missing TimeAdded for water intake entry:", entry);
            }
        });
    } else {
        console.error("Water intake data is missing.");
    }

    return hourlySummary;
}

