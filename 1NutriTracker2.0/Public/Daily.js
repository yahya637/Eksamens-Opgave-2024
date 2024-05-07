document.addEventListener('DOMContentLoaded', function() {
    displayMealDetails();
    fetchAlldata();
 });
 
 
 // basalforbrænding (BMR)
    const basalForbrænding = 1500; // basal forbrænding pr. dag i kalorier
    const maksimalPuls = 200 // formel: maksimal puls = 220 - alder
    // Forbrænding = (basalforbrænding delt med 24 + puls aktivitet i det tidsrum)
    // "Puls aktivitet" refererer til den procentdel af din maksimale puls, som du bruger under en given
    /* activity object {
        activityName: "Vaske gulv",
        caloriesBurned: 421.50,
        caloriesBurnedPerHour: 281
        addedDate: "28.4.2024",
        addedTime: "14.38"
    }
    */
 

    async function fetchAlldata() {
        // Get User ID from session storage
        const userId = sessionStorage.getItem('userId');
        console.log('User ID:', userId);
        try {
            const response = await fetch(`/daily1/userstats/${userId}`);
            const data = await response.json();
            console.log(data);
            return data;
        } catch (error) {
            console.error('Error fetching user statistics:', error);
            // Handle error
        }
    }

    fetchAlldata().then(data => {   
        console.log(data);
    });
    

 
 function displayMealDetails() {
    // Retrieving meal intakes from local storage
    const meals = JSON.parse(localStorage.getItem('mealIntakes')) || [];
    console.log('Retrieved meals:', meals);
    // activities performed data
    const activities = [
        {
            activityName: "Vaske gulv",
            caloriesBurned: 421.50,
            caloriesBurnedPerHour: 281,
            dateAdded: "29.4.2024",
            timeAdded: "14.38",
            pulseActivity: 150 // puls aktivitet = en vis procentdel af maksimal puls afhængig af sværhed af aktivitet
        }
    ]
 
 
    // variables counting total meals, water intake and energy
    let totalMeals = 0;
    let totalWaterIntake = 0;
    let totalKcal = 0;
    let totalKcalBurned = 0;
 
 
    // Variables to store hourly data
    const hourlyData = [];
    const currentTime = new Date();
 
 
    // Loop through each hour in the last 24 hours
    for (let i = 0; i < 24; i++) {
        const endTime = new Date(currentTime.getTime() - i * 60 * 60 * 1000); // End of current hour
        const startTime = new Date(endTime.getTime() - 60 * 60 * 1000); // Start of current hour (1 hour before endTime)
 
 
        // Filter meals that fall within the current hour
        const mealsWithinHour = meals.filter(meal => {
            const [day, month, year] = meal.dateAdded.split('.').map(Number); // Parse date components
            const [hours, minutes] = meal.timeAdded.split('.').map(Number); // Parse time components
           
            const mealDateTime = new Date(year, month - 1, day, hours, minutes); // Create Date object
           
            // Check if the meal's date and time falls within the current hour
            return mealDateTime >= startTime && mealDateTime < endTime;
        });
 
 
        // Calculate total water intake and consumed energy for meals within the hour
        let totalMealsThisHour = 0;
        let totalHourWaterIntake = 0;
        let totalHourConsumedEnergy = 0;
 
 
        mealsWithinHour.forEach(meal => {
            const waterIntake = isNaN(parseFloat(meal.consumedWater)) ? 0 : parseFloat(meal.consumedWater);
            const consumedEnergy = isNaN(parseFloat(meal.consumedEnergy)) ? 0 : parseFloat(meal.consumedEnergy);
 
 
            totalMealsThisHour++;
            totalHourWaterIntake += waterIntake;
            totalHourConsumedEnergy += consumedEnergy;
        });
        totalMeals += totalMealsThisHour;
        totalWaterIntake += totalHourWaterIntake;
        totalKcal += totalHourConsumedEnergy;
 
 
        // Filter activities that fall within the current hour. Requires "activities" data from local storage
        const activitiesWithinHour = activities.filter(activity => {
            const [day, month, year] = activity.dateAdded.split('.').map(Number); // Parse date components
            const [hours, minutes] = activity.timeAdded.split('.').map(Number); // Parse time components
           
            const activityDateTime = new Date(year, month - 1, day, hours, minutes); // Create Date object
           
            // Check if the activity's date and time falls within the current hour
            return activityDateTime >= startTime && activityDateTime < endTime;
        });
 
 
        TotalKcalBurnedThisHour = 0;
        activitiesWithinHour.forEach(activity => {
            const burnRate = basalForbrænding / 24 + activity.pulseActivity;
            TotalKcalBurnedThisHour += burnRate;
        })
        totalKcalBurned += TotalKcalBurnedThisHour;
 
 
        // Store hourly data
        hourlyData.push({
            hour: `${startTime.getHours()}:00 - ${endTime.getHours()}:00`,
            totalMealsThisHour: totalMealsThisHour,
            totalHourWaterIntake: totalHourWaterIntake,
            totalHourConsumedEnergy: totalHourConsumedEnergy,
            TotalKcalBurnedThisHour: TotalKcalBurnedThisHour,
            calorieBalance: totalHourConsumedEnergy - TotalKcalBurnedThisHour
        });
    }
 
 
    // Display hourly data in the table (starting from the earliest hour)
    const tableBody = document.getElementById('mealDetailsTable').querySelector('tbody');
    tableBody.innerHTML = '';
 
 
    // Iterate through hourlyData in correct order (from earliest hour to current hour)
    for (let j = hourlyData.length - 1; j >= 0; j--) {
        const data = hourlyData[j];
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.hour}</td>
            <td>${data.totalMealsThisHour} Meals</td>
            <td>${data.totalHourWaterIntake.toFixed(2)} ml</td>
            <td>${data.totalHourConsumedEnergy.toFixed(2)} kcal</td>
            <td>${data.TotalKcalBurnedThisHour.toFixed(2)} kcal</td>
            <td>${data.calorieBalance.toFixed(2)} kcal</td>
        `;
    }
 
 
    const totalRow = tableBody.insertRow();
    totalRow.innerHTML = `
        <td>Total</td>
        <td>${totalMeals} Meals</td>
        <td>${totalWaterIntake.toFixed(2)} ml</td>
        <td>${totalKcal.toFixed(2)} kcal</td>
        <td>${totalKcalBurned.toFixed(2)} kcal</td>
        <td>${(totalKcal-totalKcalBurned).toFixed(2)} kcal</td>
    `;
 }
 
 
 function displayMealDetails2() {
    const meals = JSON.parse(localStorage.getItem('mealIntakes')) || [];
    console.log('Retrieved meals:', meals);
 
 
    const activities = [
        {
            activityName: "Vaske gulv",
            caloriesBurned: 421.50,
            caloriesBurnedPerHour: 281,
            dateAdded: "29.4.2024", // Date format adjusted to "dd.mm.yyyy"
            timeAdded: "14.38",
            pulseActivity: 150
        }
    ];
 
 
    let totalMeals = 0;
    let totalWaterIntake = 0;
    let totalKcal = 0;
    let totalKcalBurned = 0;
 
 
    const dailyData = [];
    const currentTime = new Date();
 
 
    // Loop through each day in the last 30 days
    for (let i = 0; i < 30; i++) {
        const currentDate = new Date(currentTime.getTime() - i * 24 * 60 * 60 * 1000); // Subtract days
 
 
        const startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0); // Set start of the day (midnight)
       
        const endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999); // Set end of the day (just before midnight)
 
 
        const mealsWithinDay = meals.filter(meal => {
            const [day, month, year] = meal.dateAdded.split('.').map(Number); // Parse meal date components
            const mealDate = new Date(year, month - 1, day); // Create Date object from parsed components
            return mealDate >= startDate && mealDate <= endDate;
        });
 
 
        let totalMealsThisDay = 0;
        let totalDayWaterIntake = 0;
        let totalDayConsumedEnergy = 0;
 
 
        mealsWithinDay.forEach(meal => {
            const waterIntake = isNaN(parseFloat(meal.consumedWater)) ? 0 : parseFloat(meal.consumedWater);
            const consumedEnergy = isNaN(parseFloat(meal.consumedEnergy)) ? 0 : parseFloat(meal.consumedEnergy);
 
 
            totalMealsThisDay++;
            totalDayWaterIntake += waterIntake;
            totalDayConsumedEnergy += consumedEnergy;
        });
 
 
        totalMeals += totalMealsThisDay;
        totalWaterIntake += totalDayWaterIntake;
        totalKcal += totalDayConsumedEnergy;
 
 
        // Calculate activities within the day (similar to meals)
        let totalKcalBurnedThisDay = 0;
 
 
        const activitiesWithinDay = activities.filter(activity => {
            const [day, month, year] = activity.dateAdded.split('.').map(Number); // Parse activity date components
            const activityDate = new Date(year, month - 1, day); // Create Date object from parsed components
            return activityDate >= startDate && activityDate <= endDate;
        });
 
 
        activitiesWithinDay.forEach(activity => {
            const burnRate = (basalForbrænding / 24) + activity.pulseActivity; // Assuming basalForbrænding is defined
            totalKcalBurnedThisDay += burnRate;
        });
 
 
        totalKcalBurned += totalKcalBurnedThisDay;
 
 
        dailyData.push({
            day: currentDate.toLocaleDateString('en-GB'), // Format date as "dd.mm.yyyy"
            totalMealsThisDay: totalMealsThisDay,
            totalDayWaterIntake: totalDayWaterIntake,
            totalDayConsumedEnergy: totalDayConsumedEnergy,
            totalKcalBurnedThisDay: totalKcalBurnedThisDay,
            calorieBalance: totalDayConsumedEnergy - totalKcalBurnedThisDay
        });
    }
 
 
    const tableBody = document.getElementById('mealDetailsTable').querySelector('tbody');
    tableBody.innerHTML = '';
 
 
    for (let j = dailyData.length - 1; j >= 0; j--) {
        const data = dailyData[j];
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.day}</td>
            <td>${data.totalMealsThisDay} Meals</td>
            <td>${data.totalDayWaterIntake.toFixed(2)} ml</td>
            <td>${data.totalDayConsumedEnergy.toFixed(2)} kcal</td>
            <td>${data.totalKcalBurnedThisDay.toFixed(2)} kcal</td>
            <td>${data.calorieBalance.toFixed(2)} kcal</td>
        `;
    }
 
 
    const totalRow = tableBody.insertRow();
    totalRow.innerHTML = `
        <td>Total</td>
        <td>${totalMeals} Meals</td>
        <td>${totalWaterIntake.toFixed(2)} ml</td>
        <td>${totalKcal.toFixed(2)} kcal</td>
        <td>${totalKcalBurned.toFixed(2)} kcal</td>
        <td>${(totalKcal - totalKcalBurned).toFixed(2)} kcal</td>
    `;
 }

 
 // when hourly view button is pressed
 const hourlyViewBtn = document.getElementById("hourlyView");
 hourlyViewBtn.addEventListener("click", () => {
    displayMealDetails();
 })
 
 
 // when daily view button is pressed
 const dailyViewBtn = document.getElementById("dailyView");
 dailyViewBtn.addEventListener("click", () => {
    displayMealDetails2();
 })
 