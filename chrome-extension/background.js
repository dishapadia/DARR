// background.js

// Global variables for tracking
let currentTimer = null;
let currentDomain = "";
// Object to hold cumulative time (in seconds) spent on each distracting domain.
let distractionTimes = {};
// Flag to indicate whether tracking is paused due to user inactivity.
let isPaused = false;

// Threshold for triggering a distraction alert (e.g., 15 minutes = 900 seconds).
const distractionThreshold = 10;

// Load stored distraction times from chrome.storage.local on startup.
chrome.storage.local.get(["distractionTimes"], (result) => {
  if (result.distractionTimes) {
    distractionTimes = result.distractionTimes;
    console.log("Loaded distractionTimes from storage:", distractionTimes);
  } else {
    distractionTimes = {};
  }
});

// Utility: Asynchronously checks if a URL is classified as "distracting" by calling your backend.
async function isDistracting(url) {
  try {
    const response = await fetch("http://localhost:8080/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url }),
    });

    if (!response.ok) {
      console.error("Classification endpoint error:", response.statusText);
      return false;
    }

    const data = await response.json();
    return data.classification === "distracting";
  } catch (error) {
    console.error("Error in isDistracting:", error);
    return false;
  }
}

// Function: Displays a Chrome notification with the given title and message.
function showNotification(title, message) {
  chrome.notifications.create("", {
    type: "basic",
    iconUrl: "icon.png", // Ensure you have an icon file in your extension directory.
    title: title,
    message: message,
    priority: 2
  }, (notificationId) => {
    console.log("Notification displayed with id:", notificationId);
  });
}

// Function: Triggers an alert when a distracting site has been used too long.
function triggerAlert(domain, timeSpent) {
  const message = `You've been on ${domain} for ${timeSpent} seconds. Consider taking a break!`;
  showNotification("Distraction Alert", message);
}

// Function: Starts a timer for a given domain and updates the cumulative time.
function startTimer(domain) {
  // Set the current active domain.
  currentDomain = domain;
  // Initialize the timer value for this domain if not already set.
  if (!distractionTimes[domain]) distractionTimes[domain] = 0;

  // Clear any existing timer.
  if (currentTimer) {
    clearInterval(currentTimer);
  }

  // Start an interval timer that increments the counter every second.
  currentTimer = setInterval(() => {
    distractionTimes[domain]++;
    console.log(`Time on ${domain}: ${distractionTimes[domain]} seconds`);

    // Persist the updated distraction times to chrome.storage.
    chrome.storage.local.set({ distractionTimes: distractionTimes }, () => {
      console.log("Updated distractionTimes in storage");
    });

    // If the cumulative time reaches the threshold, trigger an alert.
    if (distractionTimes[domain] >= distractionThreshold) {
      console.log(`Threshold reached for ${domain}. Triggering alert.`);
      triggerAlert(domain, distractionTimes[domain]);
      clearInterval(currentTimer);
      currentTimer = null;
    }
  }, 1000);
}

// Function: Stops the current timer.
function stopTimer() {
  if (currentTimer) {
    clearInterval(currentTimer);
    currentTimer = null;
  }
  // We do not reset currentDomain so that if needed, it can be resumed.
}

// Function: Resume tracking for the active tab if it is distracting.
function resumeTrackingForActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    if (tabs.length > 0) {
      const tab = tabs[0];
      if (tab.url && tab.url.startsWith("http")) {
        const distracting = await isDistracting(tab.url);
        if (distracting) {
          const domain = new URL(tab.url).hostname;
          startTimer(domain);
        }
      }
    }
  });
}

// Listen for when a tab becomes active.
chrome.tabs.onActivated.addListener((activeInfo) => {
  stopTimer();
  if (!isPaused) {
    chrome.tabs.get(activeInfo.tabId, async (tab) => {
      if (tab.url && tab.url.startsWith("http")) {
        const distracting = await isDistracting(tab.url);
        if (distracting) {
          const domain = new URL(tab.url).hostname;
          startTimer(domain);
        }
      }
    });
  }
});

// Listen for tab updates (e.g., new URL loaded in active tab).
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url && tab.url.startsWith("http")) {
    stopTimer();
    if (!isPaused) {
      isDistracting(tab.url).then((distracting) => {
        if (distracting) {
          const domain = new URL(tab.url).hostname;
          startTimer(domain);
        }
      });
    }
  }
});

// Use chrome.idle to detect user inactivity (requires "idle" permission).
chrome.idle.setDetectionInterval(60); // Detect idle after 60 seconds.
chrome.idle.onStateChanged.addListener((state) => {
  console.log("User state changed:", state);
  if (state === "idle" || state === "locked") {
    // Pause tracking on inactivity.
    isPaused = true;
    console.log("User inactive, pausing timer.");
    stopTimer();
  } else if (state === "active") {
    // Resume tracking when user is active.
    isPaused = false;
    console.log("User active, resuming tracking.");
    resumeTrackingForActiveTab();
  }
});
