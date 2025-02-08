// background.js

// Listen for tab updates (fires when the tab is updated, e.g., a new URL is loaded)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab has finished loading and has a valid http/https URL
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
      console.log("Navigated to:", tab.url);
  
      // Send the URL to your backend for classification
      fetch('http://localhost:8080/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: tab.url })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          // Log the classification result
          console.log(`Classified ${data.url} as: ${data.classification}`);
          // Optionally, you can use chrome.notifications or other UI elements
          // to alert the user if the site is distracting.
        })
        .catch(error => {
          console.error("Error classifying website:", error);
        });
    }
  });
  