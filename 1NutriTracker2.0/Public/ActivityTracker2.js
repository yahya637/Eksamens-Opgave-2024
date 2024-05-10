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
            throw new Error('Failed to fetch: ' + response.statusText);
        }
        const activities = await response.json();
        populateDropdown(activities);
        fetchUserActivities(); // Fetch and display the user's existing activities after populating the dropdown
    } catch (error) {
        console.error('There was a problem fetching the activities:', error);
        document.getElementById('activity-select').innerHTML = '<option>Error loading activities</option>';
    }
}

// We also need to display the alredy registered activities in the <ul> list
// Therefor we need to fetch the activities from the server and display them in the list


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

function handleActivitySubmission() {
    const duration = parseInt(document.getElementById('duration').value, 10);
    const activitySelect = document.getElementById('activity-select');
    const activityId = activitySelect.value;
    const activityName = activitySelect.options[activitySelect.selectedIndex].text;
    const kcalPerHour = parseInt(activitySelect.options[activitySelect.selectedIndex].getAttribute('data-kcal'), 10);

    const caloriesBurned = (kcalPerHour / 60) * duration;

    // Store the activity data including the calculated end time
    storeActivityData({
        user_id: sessionStorage.getItem('userId'),
        activity_id: activityId,
        activity_name: activityName,
        KcalBurned: caloriesBurned.toFixed(2),
        DurationMinutes: duration,
    });

    alert('Meal saved and displayed successfully')

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
        console.log('User tried to create an activty:', data);
        fetchUserActivities(); // Fetch and display the updated list of user activities
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

// Lastly i need to display the activities in the <ul> list
// Therefor i need to fetch the activities from the server and display them in the list

function fetchUserActivities() {
    let user_id = sessionStorage.getItem('userId');
    if (!user_id) {
        console.error('No user ID found in sessionStorage.');
        return;
    }

    fetch(`/activities/${user_id}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(activities => {
        console.log('User Activities fetched successfully:');
        displayUserActivities(activities); 
    })
    .catch(error => {
        console.error('There was a problem fetching user activities:', error);
    });
}


function displayUserActivities(activities) {
    const activitiesList = document.getElementById('selected-activities-list');
    activitiesList.innerHTML = '';

    activities.forEach(activity => {
        // Check if activity_name is not null or undefined
        if (activity.activity_name) {
            const activityNameWithoutKcal = activity.activity_name.replace(/\(\d+ kcal\/h\)/, '').trim(); // Remove kcal/h from activity name
            const listItem = document.createElement('li');
            listItem.classList.add('activity-item');
            listItem.innerHTML = `
                <span class="activity-name">${activityNameWithoutKcal}</span> - 
                Duration: <span class="activity-duration">${activity.DurationMinutes} minutes</span>, 
                Calories Burned: <span class="activity-calories">${parseFloat(activity.KcalBurned).toFixed(2)} kcal/h</span>
            `;
            activitiesList.appendChild(listItem);
        } else {
            // Handle the case where activity_name is null or undefined
            // You may want to log this case or display a placeholder
            console.log('Activity name is null for activity:', activity);
        }
    });
}

// Extra functionality:

const showActivityTrackerButton = document.getElementById('registerButton');
const activityTrackerForm = document.getElementById('activity-form');
const showBMRButton = document.getElementById('calculateBMR_Button');
const BMRForm = document.getElementById('bmr-form');

function toggleForm(formToShow, formToHide) {
    if (formToShow.style.display === 'none') {
        formToShow.style.display = 'block';
    } else {
        formToShow.style.display = 'none';
    }
    formToHide.style.display = 'none'; // Always hide the other form
}

showActivityTrackerButton.addEventListener('click', function() {
    toggleForm(activityTrackerForm, BMRForm);
    // Reset the 'chose an activity' dropdown after hiding the form
    document.getElementById('activity-select').selectedIndex = 0;
    document.getElementById('duration').value = '';
});

showBMRButton.addEventListener('click', function() {
    toggleForm(BMRForm, activityTrackerForm);
   
});


// Toggle button to show/hide the list of selected activities
document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('toggleActivitiesListButton');
    var activitiesList = document.getElementById('selected-activities-list');
    
    toggleButton.addEventListener('click', function() {
        if (activitiesList.style.display === 'block') {
            activitiesList.style.display = 'none';
            toggleButton.textContent = 'Show Activities';
        } else {
            activitiesList.style.display = 'block';
            toggleButton.textContent = 'Hide Activities';
        }
    });
});


// Krav 4.B - BMR Calculation

// Function to calculate BMR for given inputs
function calculateBMR(sex, age, weight) {
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

    let bmrMJ = factor * weight + base; 
    let bmrKcal = bmrMJ * 239; 
    

    return {
        bmrMJ: bmrMJ.toFixed(2),
        bmrKcal: bmrKcal.toFixed(2)
    };
}
function displayBmrAndPost() {
    document.addEventListener('DOMContentLoaded', function() {
        // Add event listener to the Calculate BMR button
        document.getElementById('calc-bmr').addEventListener('click', function() {
            // Hide any previous success messages to avoid clutter and confusion
            hideMessage('success-message');

            // Get input values from the form
            let age = parseInt(document.getElementById('age').value, 10);
            let weight = parseFloat(document.getElementById('weightOutputId').textContent);
            let sex = document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : null;

            // Check if all the inputs are filled
            if (age && weight && sex) {
                // Calculate BMR
                let bmrResults = calculateBMR(sex, age, weight);
                // Update the BMR result on the page to show both MJ/day and kcal/day
                document.getElementById('bmr-result').textContent = `${bmrResults.bmrMJ}  MJ/day   and   ${bmrResults.bmrKcal} Kcal/day`;
            } else {
                alert('Please fill in all the fields.');
            }
        });

        // Add event listener to the Store BMR button
        document.getElementById('store-bmr').addEventListener('click', function() {
            // Get input values from the form
            let age = parseInt(document.getElementById('age').value, 10);
            let weight = parseFloat(document.getElementById('weightOutputId').textContent);
            let sex = document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : null;

            // Check if all the inputs are filled
            if (age && weight && sex) {
                // Calculate BMR
                let bmrResults = calculateBMR(sex, age, weight);
                // Get the user ID from localStorage
                let userId = sessionStorage.getItem('userId');
                // Send BMR data to the server
                const bmrData = {
                    user_id: userId,
                    bmr_mj: bmrResults.bmrMJ,
                    bmr_kcal: bmrResults.bmrKcal,
                    calculation_date: new Date().toISOString() 
                };
                storeBMRData(bmrData)
                    .then(response => {
                        showMessage('BMR calculated and saved successfully.', 'success-message');
                    })
                    .catch(error => {
                        console.error('Failed to store BMR data:', error);
                    });
            } else {
                alert('Please fill in all the fields.');
            }
        });
    });
}

function showMessage(message, elementId) {
    const successMessage = document.getElementById(elementId);
    successMessage.textContent = message;
    successMessage.style.display = 'block';
}

function hideMessage(elementId) {
    const successMessage = document.getElementById(elementId);
    successMessage.style.display = 'none';
}

// Call the function to initialize the BMR calculator
displayBmrAndPost();



// I need to save the calculated BMR, with the User_id in the database

async function storeBMRData(data) {
    return fetch('/activities/bmr', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); 
        } else {
            throw new Error('Failed to save BMR data'); 
        }
    });
}

// GET all User calculated BMR, so the user can see the BMR history

async function fetchUserBMR() {
    let user_id = sessionStorage.getItem('userId');
    if (!user_id) {
        console.error('No user ID found in sessionStorage.');
        return;
    }

    fetch(`/activities/bmr/${user_id}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(bmrData => {
        console.log('User BMR data fetched successfully:', bmrData);
        displayUserBMR(bmrData); 
    })
    .catch(error => {
        console.error('There was a problem fetching user BMR data:', error);
    });
}


function displayUserBMR(bmrData) {
    const bmrHistoryElement = document.getElementById('bmr-history');
    
    // Clear any existing content in the bmr-history div
    bmrHistoryElement.innerHTML = '';

    if (bmrData && bmrData.length > 0) {
        // Create an unordered list element
        const ul = document.createElement('ul');
        
        // Iterate over each BMR data point
        bmrData.forEach(data => {
            // Create a new list item element for each BMR data point
            const li = document.createElement('li');
            
            // Remove the time part from the calculation_date string
            const datePart = data.calculation_date.replace(/T.*$/, '');

            // Set the content of the list item element
            li.textContent = `${data.bmr_mj} MJ/day, ${data.bmr_kcal} Kcal/day, Date: ${datePart}`;
            
            // Append the list item element to the unordered list
            ul.appendChild(li);
        });

        // Append the unordered list to the bmr-history div
        bmrHistoryElement.appendChild(ul);
    } else {
        // If no BMR data found, display a message
        bmrHistoryElement.textContent = 'No BMR data available for this user.';
    }

    // Display the bmr-history div
    bmrHistoryElement.style.display = 'block';
}


function toggleBMRHistory() {
    const bmrHistoryElement = document.getElementById('bmr-history');
    const toggleButton = document.getElementById('show-bmr-history'); // Get the button element

    if (bmrHistoryElement.style.display === 'none') {
        bmrHistoryElement.style.display = 'block';
        toggleButton.innerText = 'Hide BMR History'; // Change button text to 'Hide'
        fetchUserBMR(); // Call fetchUserBMR after showing the BMR history
    } else {
        bmrHistoryElement.style.display = 'none';
        toggleButton.innerText = 'Show BMR History'; // Change button text to 'Show'
    }
}

// Add event listener to the show/hide button
document.getElementById('show-bmr-history').addEventListener('click', toggleBMRHistory);




// Logout functionality

document.addEventListener('DOMContentLoaded', function() {
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function() {
        confirmLogout();
    });
});

function confirmLogout() {
    // Display confirmation dialog
    if (confirm('Are you sure you want to log out?')) {
        logoutUser();
    }
}

function logoutUser() {
    // Clear specific sessionStorage item
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('username');

    // Optionally clear all session storage
    // sessionStorage.clear();

    // Redirect to login page
    window.location.href = '/NutriHome.html';
}


//ekstra fis
document.addEventListener('DOMContentLoaded', function() {
    const infoButton = document.querySelector('.info-button');
    const infoText = document.querySelector('.auto-filled-info');

    infoButton.addEventListener('click', function() {
        if (infoText.style.display === 'none') {
            infoText.style.display = 'block';
        } else {
            infoText.style.display = 'none';
        }
    });
});
