document.addEventListener('DOMContentLoaded', () => {
    const workInput = document.getElementById('work-duration');
    const breakInput = document.getElementById('break-duration');
    const longBreakInput = document.getElementById('long-break-duration');
    const startButton = document.getElementById('start-pomodoro');
    const stopButton = document.getElementById('stop-pomodoro');
    const resumeButton = document.getElementById('resume-pomodoro');
    const sessionMessage = document.getElementById('session-message');
    const timerDisplay = document.getElementById('timer-display');
    const backButton = document.getElementById('back-button');

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
    backButton.addEventListener('click', () => {
        window.location.href = chrome.runtime.getURL("popup.html");
    });
});
