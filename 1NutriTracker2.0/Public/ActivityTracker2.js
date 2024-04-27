// To populate the activity-select dropdown
// The activities are stored in the database and fetched from the server. 
// The activities are then populated in the dropdown in the client-side code.

// To populate the activity-select dropdown
// Fetches activities from the server and populates them in the dropdown.

console.log('Activity Tracker script loaded');

async function getActivities() {
    try {
        const response = await fetch('/activities', { method: 'GET' });
        if (!response.ok) {
            throw new Error('Failed to fetch activities: ' + response.statusText);
        }
        const activities = await response.json();
        populateDropdown(activities);
    } catch (error) {
        console.error('There was a problem fetching the activities:', error);
        document.getElementById('activity-select').innerHTML = '<option>Error loading activities</option>';
    }
}


function populateDropdown(activities) {
    const select = document.getElementById('activity-select');
    select.innerHTML = ''; // Clear existing options
    activities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.activity_id;
        option.textContent = `${activity.name} (${activity.kcalPerHour} kcal/h)`;
        option.setAttribute('data-kcal', activity.kcalPerHour); // Set kcalPerHour as a data attribute
        select.appendChild(option);
    });
}


// Call getActivities when the page loads
getActivities();

/*
// Function to fetch the user information from the server
function fetchUserInfo() {
    let userId = localStorage.getItem("userId");
    console.log("Fetching info for user ID:", userId); // Debug: Log the user ID being fetched

    if (!userId) {
        console.error("No user ID found in localStorage.");
        return; // Exit the function if no user ID is found
    }

    fetch(`/users/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        // Then populate the form with the user data
        .then(data => {
            console.log("Data received:", data); // Debug: Log the received data
            document.getElementById("sex").value = data.gender === "man" ? "male" : "female";
            document.getElementById("age").value = calculateAge(data.birthdate);
            document.getElementById("weight").value = data.weight;
        })
        .catch(error => console.error('Error fetching user data:', error));
}

function calculateAge(birthdate) {
    let birthDate = new Date(birthdate);
    let today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    let monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate < birthDate.getDate())) {
        age--;
    }
    console.log("Calculated age:", age); 
    return age;
}


// Call the function when the page is loaded
document.addEventListener('DOMContentLoaded', fetchUserInfo);*/

function handleActivitySubmission() {
    const duration = parseInt(document.getElementById('duration').value, 10);
    const activitySelect = document.getElementById('activity-select');
    const activityId = activitySelect.value;
    const activityName = activitySelect.options[activitySelect.selectedIndex].text;
    const kcalPerHour = parseInt(activitySelect.options[activitySelect.selectedIndex].getAttribute('data-kcal'), 10);

    const caloriesBurned = (kcalPerHour / 60) * duration;
  
    storeActivityData({
        user_id: localStorage.getItem('userId'),
        activity_id: activityId,
        activity_name: activityName,
        total_kcal_burned: caloriesBurned,
        duration: duration,
    });
}
document.getElementById('add-activity').addEventListener('click', handleActivitySubmission);

function storeActivityData(data) {
    fetch('/activities', { // Adjust URL as needed based on your API endpoint setup
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Handle success, update UI or notify user as necessary
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        // Handle error, update UI or notify user as necessary
    });
}


// Krav 4.B - BMR Calculation



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
