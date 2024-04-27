// Now we have an API that returns a list of activities with their kcal/hour values /activities
// We need to create a form that allows users to add activities to a list and see the total kcal burned per hour based on their BMR
let activities = []; // Global array to store activities fetched from the API

async function getActivities() {
    try {
        const response = await fetch('/activities');
        if (!response.ok) {
            throw new Error('Failed to fetch activities: ' + response.statusText);
        }
        activities = await response.json(); // Assign fetched activities to the global variable
        populateDropdown(activities);
    } catch (error) {
        console.error('There was a problem fetching the activities:', error);
    }
}

function populateDropdown(activities) {
    const select = document.getElementById('activity-select');
    select.innerHTML = ''; // Clear existing options
    activities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.activity_id;
        option.textContent = `${activity.name} (${activity.kcalPerHour} kcal/h)`;
        select.appendChild(option);
    });
}


// Function to calculate BMR for given inputs
function calculateBMR(sex, age, weight, height) {
        // Convert height from cm to m for BMR calculation
    height /= 100;

let factor, base;
        if (sex === 'male') {
                if (age < 3) { factor = 0.249; base = -0.13; }
            else if (age < 10) { factor = 0.095; base = 2.11; }
            else if (age < 18) { factor = 0.074; base = 2.75; }
            else if (age < 30) { factor = 0.064; base = 2.84; }
            else if (age < 60) { factor = 0.0485; base = 3.67; }
            else if (age < 75) { factor = 0.0499; base = 2.93; }
            else { factor = 0.035; base = 3.43; }
    } else {
                if (age < 3) { factor = 0.244; base = -0.13; }
            else if (age < 10) { factor = 0.085; base = 2.03; }
            else if (age < 18) { factor = 0.056; base = 2.90; }
            else if (age < 30) { factor = 0.0615; base = 2.08; }
            else if (age < 60) { factor = 0.0364; base = 3.47; }
            else if (age < 75) { factor = 0.0386; base = 2.88; }
            else { factor = 0.0410; base = 2.61; }
    }

    // BMR formula: factor * weight + base
        return factor * weight + base;
}


let selectedActivities = []; // Global array for selected activities

function addActivityToList(activityName) {
    const activity = activities.find(a => a.name === activityName);
    if (activity && !selectedActivities.includes(activity)) {
        selectedActivities.push(activity);
        updateSelectedActivitiesForm();
    }
}

function removeActivityFromList(activityName) {
    const index = selectedActivities.findIndex(a => a.name === activityName);
    if (index > -1) {
        selectedActivities.splice(index, 1);
        updateSelectedActivitiesForm();
    }
}

function updateSelectedActivitiesForm() {
    const list = document.getElementById('selected-activities-list');
    list.innerHTML = '';
    selectedActivities.forEach(activity => {
        const listItem = document.createElement('li');
        const caloriesBurnedPerHour = calculateCaloriesBurnedPerHour(activity.kcalPerHour);
        listItem.textContent = `${activity.name} - ${caloriesBurnedPerHour.toFixed(2)} kcal burned/hour based on BMR`;
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-button';
        removeButton.onclick = () => removeActivityFromList(activity.name);
        listItem.appendChild(removeButton);
        list.appendChild(listItem);
    });
}




    
    function calculateCaloriesBurnedPerHour(activityKcalPerHour) {
        const sex = document.getElementById('sex').value;
    const age = parseInt(document.getElementById('age').value, 10);
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);

        const bmr = calculateBMR(sex, age, weight, height);
        const bmrKcalPerDay = bmr * 239; // Convert MJ/day to kcal/day (1 MJ/day = 239 kcal/day)
        const bmrKcalPerHour = bmrKcalPerDay / 24;

        return activityKcalPerHour * (bmrKcalPerHour / 2000); // Assuming 2000 kcal/day is standard
    }


    const showActivityTrackerButton = document.getElementById('registerButton');
    const activityTrackerForm = document.getElementById('activity-form');

    function showActivityTrackerForm() {
        if (activityTrackerForm.style.display === 'none') {
            activityTrackerForm.style.display = 'block';
        } else {
            activityTrackerForm.style.display = 'none';
        }
        // Reset the 'chose an activity' dropdown after hiding the form
        document.getElementById('activity-select').selectedIndex = 0;
    }
    showActivityTrackerButton.addEventListener('click', showActivityTrackerForm);


