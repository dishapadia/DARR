document.addEventListener('DOMContentLoaded', () => {
    const workInput = document.getElementById('work-duration');
    const breakInput = document.getElementById('break-duration');
    const longBreakInput = document.getElementById('long-break-duration');
    const startButton = document.getElementById('start-pomodoro');
    const stopButton = document.getElementById('stop-pomodoro');
    const resumeButton = document.getElementById('resume-pomodoro');
    const sessionMessage = document.getElementById('session-message');
    const timerDisplay = document.getElementById('timer-display');
    const analyticsButton = document.getElementById('analytics-button');

    const storedData = localStorage.getItem("studyGuideData");
    if (!storedData) {
      studyGuideBox.value = 'No data found. Please go back and fill in the form.';
      return;
    }
    
    // Parse the retrieved data
    const { tasks, time, blockSites } = JSON.parse(storedData);


    let timerInterval = null;
    let remainingSeconds = 0;
    let currentMode = "work"; // "work" or "break"
    let workDurationValue = 25;
    let breakDurationValue = 5;

    // Format seconds as mm:ss
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    // Generic timer function
    function startTimer(durationInMinutes) {
        remainingSeconds = durationInMinutes * 60;
        timerDisplay.textContent = formatTime(remainingSeconds);
        timerInterval = setInterval(() => {
            remainingSeconds--;
            timerDisplay.textContent = formatTime(remainingSeconds);
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                handleTimerCompletion();
            }
        }, 1000);
    }

    // Handle timer completion and switch between work and break modes
    function handleTimerCompletion() {
        if (currentMode === "work") {
            // Work session completed; start break session automatically.
            sessionMessage.textContent = "Work session complete! Enjoy your break.";
            currentMode = "break";
            // Change Stop button text to "End Rest"
            stopButton.textContent = "End Rest";
            startTimer(breakDurationValue);
        } else if (currentMode === "break") {
            // Break session finished; reset the session.
            sessionMessage.textContent = "Break session complete! Session reset.";
            timerDisplay.textContent = "00:00";
            stopButton.style.display = "none";
            resumeButton.style.display = "none";
            startButton.style.display = "block";
            currentMode = "work";  // reset mode for a new session
        }
    }

    // Resume timer from paused state
    function resumeTimer() {
        timerInterval = setInterval(() => {
            remainingSeconds--;
            timerDisplay.textContent = formatTime(remainingSeconds);
            if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                handleTimerCompletion();
            }
        }, 1000);
    }

    // Start Pomodoro: start work timer; do not show alert.
    startButton.addEventListener('click', () => {
        workDurationValue = parseInt(workInput.value) || 25;
        breakDurationValue = parseInt(breakInput.value) || 5;
        currentMode = "work";
        sessionMessage.textContent = "Pomodoro started";
        startTimer(workDurationValue);

        // Toggle button visibility
        startButton.style.display = "none";
        stopButton.style.display = "block";
        resumeButton.style.display = "none";
        // Ensure Stop button shows correct text for work mode initially
        stopButton.textContent = "Stop Pomodoro";
    });

    // Stop button event: different behavior based on mode.
    stopButton.addEventListener('click', () => {
        if (currentMode === "work") {
            // Pause work timer.
            clearInterval(timerInterval);
            timerInterval = null;
            sessionMessage.textContent = "Pomodoro paused";
            timerDisplay.textContent = "Paused: " + formatTime(remainingSeconds);
            stopButton.style.display = "none";
            resumeButton.style.display = "block";
        } else if (currentMode === "break") {
            // "End Rest" clicked: reset session completely.
            clearInterval(timerInterval);
            timerInterval = null;
            remainingSeconds = 0;
            timerDisplay.textContent = "00:00";
            sessionMessage.textContent = "Rest ended. Session reset.";
            stopButton.style.display = "none";
            resumeButton.style.display = "none";
            startButton.style.display = "block";
            currentMode = "work";
        }
    });

    // Resume button: resume from paused state.
    resumeButton.addEventListener('click', () => {
        if (!timerInterval && remainingSeconds > 0) {
            resumeTimer();
            sessionMessage.textContent = "Pomodoro resumed";
            resumeButton.style.display = "none";
            stopButton.style.display = "block";
        }
    });

    // Back button: navigate back to the main popup.
    analyticsButton.addEventListener('click', async () => {
        await generateAnalyticsFromBackend(tasks, blockSites, time);
        window.location.href = chrome.runtime.getURL("analytics.html");
        // try {
        //     await generateAnalyticsFromBackend(tasks, blockSites, time);
        //     window.location.href = chrome.runtime.getURL("analytics.html");
        // }
        // catch (error) {
        // studyPlanResult.textContent = "Error: " + error.message;
        // }
    });

    // Function to send data to backend and get the study guide response
// Function to send data to backend and get the study guide (analytics) response
async function generateAnalyticsFromBackend(tasks, blockSites, time) {
    // Transform the blockSites array into a map/object with initial timer values (e.g., 0 seconds)
    let websiteTimes = {};
    blockSites.forEach(site => {
        websiteTimes[site] = 0;
    });

    // Prepare the data to send to the backend, converting study time (hours) to seconds
    const data = {
        websites: websiteTimes,
        study_time: parseInt(time * 3600)
    };

    try {
        // Send the POST request to the backend with correct JSON input
        const response = await fetch("http://localhost:8080/getSuggestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Failed to generate analysis");
        }

        // Parse the response
        const res = await response.json();

        // Store the analysis data in localStorage (or use it as needed)
        localStorage.setItem("analysis", JSON.stringify(res));
    } catch (error) {
        console.error("Error generating analytics:", error.message);
    }
}


});

  