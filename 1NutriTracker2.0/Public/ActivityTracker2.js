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
        fetchUserActivities(); 
    } catch (error) {
        console.error('There was a problem fetching the activities:', error);
        document.getElementById('activity-select').innerHTML = '<option>Error loading activities</option>';
    }
}

// We also need to display the alredy registered activities in the <ul> list
// Therefor we need to fetch the activities from the server and display them in the list
function populateDropdown(activities) {
    const select = document.getElementById('activity-select');
    select.innerHTML = ''; 
    activities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.activity_id;
        option.textContent = `${activity.name} (${activity.kcalPerHour} kcal/h)`;
        option.setAttribute('data-kcal', activity.kcalPerHour); 
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
    fetch('/activities', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('User tried to create an activty:', data);
        fetchUserActivities(); 
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

// Lastly i need to display the activities in the <ul> list
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
            const activityNameWithoutKcal = activity.activity_name.replace(/\(\d+ kcal\/h\)/, '').trim(); // . trim removes kcal/h from activity name
            const listItem = document.createElement('li');
            listItem.classList.add('activity-item');
            listItem.innerHTML = `
                <span class="activity-name">${activityNameWithoutKcal}</span> - 
                Duration: <span class="activity-duration">${activity.DurationMinutes} minutes</span>, 
                Calories Burned: <span class="activity-calories">${parseFloat(activity.KcalBurned).toFixed(2)} kcal/h</span>
            `;
            activitiesList.appendChild(listItem);
        } else {
            console.log('Activity name is null for activity:', activity);
        }
    });
}

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
    formToHide.style.display = 'none'; 
}

showActivityTrackerButton.addEventListener('click', function() {
    toggleForm(activityTrackerForm, BMRForm);
    // reset the 'chose an activity' dropdown after hiding the form
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
        document.getElementById('calc-bmr').addEventListener('click', function() {
            hideMessage('success-message');

            let age = parseInt(document.getElementById('age').value, 10);
            let weight = parseFloat(document.getElementById('weightOutputId').textContent);
            let sex = document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : null;

            if (age && weight && sex) {
                let bmrResults = calculateBMR(sex, age, weight);
                document.getElementById('bmr-result').textContent = `${bmrResults.bmrMJ}  MJ/day   and   ${bmrResults.bmrKcal} Kcal/day`;
            } else {
                alert('Please fill in all the fields.');
            }
        });

        document.getElementById('store-bmr').addEventListener('click', function() {
            let age = parseInt(document.getElementById('age').value, 10);
            let weight = parseFloat(document.getElementById('weightOutputId').textContent);
            let sex = document.querySelector('input[name="gender"]:checked') ? document.querySelector('input[name="gender"]:checked').value : null;

            
            if (age && weight && sex) {
                let bmrResults = calculateBMR(sex, age, weight);
                let userId = sessionStorage.getItem('userId');
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
// call the function
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
    
    bmrHistoryElement.innerHTML = '';

    if (bmrData && bmrData.length > 0) {
        const ul = document.createElement('ul');
        
        bmrData.forEach(data => {
            const li = document.createElement('li');
            
            const datePart = data.calculation_date.replace(/T.*$/, ''); // .replace removes the time part of the date

            li.textContent = `${data.bmr_mj} MJ/day, ${data.bmr_kcal} Kcal/day, Date: ${datePart}`;
            
            ul.appendChild(li);
        });

        bmrHistoryElement.appendChild(ul);
    } else {
        bmrHistoryElement.textContent = 'No BMR data available for this user.';
    }

    bmrHistoryElement.style.display = 'block';
}


function toggleBMRHistory() {
    const bmrHistoryElement = document.getElementById('bmr-history');
    const toggleButton = document.getElementById('show-bmr-history'); 

    if (bmrHistoryElement.style.display === 'none') {
        bmrHistoryElement.style.display = 'block';
        toggleButton.innerText = 'Hide BMR History'; 
        fetchUserBMR(); 
    } else {
        bmrHistoryElement.style.display = 'none';
        toggleButton.innerText = 'Show BMR History'; 
    }
}

document.getElementById('show-bmr-history').addEventListener('click', toggleBMRHistory);




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
    // Redirect to login page
    window.location.href = '/NutriHome.html';
}

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
