const form = document.getElementById("studyPlanForm");
    const studyPlanResult = document.getElementById("studyPlanResult");

    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        // Get form values
        const studyTimePerDay = document.getElementById("studyTimePerDay").value;
        const subjects = document.getElementById("subjects").value.split(',').map(subject => subject.trim());
        const studyTime = document.getElementById("studyTime").value;

        // Create the user input object
        const userInput = {
            study_time_per_day: parseInt(studyTimePerDay),
            subjects: subjects,
            preferences: {
                study_time: studyTime
            }
        };

        try {
            // Send the POST request to the backend
            const response = await fetch("/study-plan", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userInput)
            });

            if (!response.ok) {
                throw new Error("Failed to generate study plan");
            }

            // Parse the response
            const data = await response.json();

            // Display the study plan
            studyPlanResult.textContent = data.plan;
        } catch (error) {
            studyPlanResult.textContent = "Error: " + error.message;
        }
    });