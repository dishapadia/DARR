// Listener for messages from the background script
importScripts("background.js")
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "showNotification") {
      chrome.notifications.create("", { // Add empty string as first argument
          type: "basic",
          iconUrl: "icon.png", // Ensure "icon.png" is inside your extension directory
          title: message.title,
          message: message.message,
          priority: 2
      }, () => console.log("Notification created successfully")); // Add callback
  }
});
  