const activities = [
    { name: "Almindelig gang", kcalPerHour: 215 },
    { name: "Gang ned af trapper", kcalPerHour: 414 },
    { name: "Gang op af trapper", kcalPerHour: 1079 },
    { name: "Slå græs med manuel græsslåmaskine", kcalPerHour: 281 },
    { name: "Lave mad og redde seng", kcalPerHour: 236 },
    { name: "Luge ukrudt", kcalPerHour: 362 },
    { name: "Rydde sne", kcalPerHour: 481 },
    { name: "Læse eller se TV", kcalPerHour: 74 },
    { name: "Stå oprejst", kcalPerHour: 89 },
    { name: "Cykling i roligt tempo", kcalPerHour: 310 },
    { name: "Tørre støv af", kcalPerHour: 163 },
    { name: "Vaske gulv", kcalPerHour: 281 },
    { name: "Pudse vinduer", kcalPerHour: 259 },
    { name: "Cardio", kcalPerHour: 814 },
    { name: "Hård styrketræning", kcalPerHour: 348 },
    { name: "Badminton", kcalPerHour: 318 },
    { name: "Volleyball", kcalPerHour: 318 },
    { name: "Bordtennis", kcalPerHour: 236 },
    { name: "Dans i højt tempo", kcalPerHour: 355 },
    { name: "Dans i moderat tempo", kcalPerHour: 259 },
    { name: "Fodbold", kcalPerHour: 510 },
    { name: "Rask gang", kcalPerHour: 384 },
    { name: "Golf", kcalPerHour: 244 },
    { name: "Håndbold", kcalPerHour: 466 },
    { name: "Squash", kcalPerHour: 466 },
    { name: "Jogging", kcalPerHour: 666 },
    { name: "Langrend", kcalPerHour: 405 },
    { name: "Løb i moderat tempo", kcalPerHour: 872 },
    { name: "Løb i hurtigt tempo", kcalPerHour: 1213 },
    { name: "Ridning", kcalPerHour: 414 },
    { name: "Skøjteløb", kcalPerHour: 273 },
    { name: "Svømning", kcalPerHour: 296 },
    { name: "Cykling i højt tempo", kcalPerHour: 658 },
    { name: "Bilreparation", kcalPerHour: 259 },
    { name: "Gravearbejde", kcalPerHour: 414 },
    { name: "Landbrugsarbejde", kcalPerHour: 236 },
    { name: "Let kontorarbejde", kcalPerHour: 185 },
    { name: "Male hus", kcalPerHour: 215 },
    { name: "Murerarbejde", kcalPerHour: 207 },
    { name: "Hugge og slæbe på brænde", kcalPerHour: 1168 },
];
        const selectedActivities = [];

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

        document.getElementById('add-activity').addEventListener('click', function() {
            // Retrieve BMR inputs and calculate BMR
            const sex = document.getElementById('sex').value;
            const age = parseInt(document.getElementById('age').value, 10);
            const weight = parseFloat(document.getElementById('weight').value);
            const height = parseFloat(document.getElementById('height').value);

            const bmr = calculateBMR(sex, age, weight, height);
            const kcalPerDay = bmr * 239; // Convert MJ/day to kcal/day (1 MJ/day = 239 kcal/day)
            
            // Rest of the event listener code...
            // When adding an activity, multiply its kcal/hour by the user's BMR to get the actual kcal/hour burned
        });

        function populateDropdown() {
            const select = document.getElementById('activity-select');
            activities.forEach(activity => {
                const option = document.createElement('option');
                option.value = activity.name;
                option.textContent = `${activity.name} (${activity.kcalPerHour} kcal/time)`;
                select.appendChild(option);
            });
        }

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
        list.innerHTML = ''; // Clear the list
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

    document.getElementById('add-activity').addEventListener('click', function() {
        const select = document.getElementById('activity-select');
        const selectedActivity = select.value;
        addActivityToList(selectedActivity);
        updateSelectedActivitiesForm();
    });

    populateDropdown();
