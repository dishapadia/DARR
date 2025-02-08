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

// Function to send a message to the service worker to create a notification
async function showNotification(title, message) {
  try {
      // Get all active service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length === 0) {
          console.warn("No active service worker found. Reloading extension may be needed.");
          return;
      }

      chrome.runtime.sendMessage({ type: "showNotification", title, message });
  } catch (error) {
      console.error("Error sending notification message:", error);
  }
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

// Reset timer when a distracting tab is closed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (currentDomain) {
    console.log(`Tab closed: Resetting time for ${currentDomain}`);
    delete distractionTimes[currentDomain];

    // Persist the reset times to storage
    chrome.storage.local.set({ distractionTimes });
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
