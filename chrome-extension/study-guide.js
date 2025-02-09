// study-guide.js
document.addEventListener('DOMContentLoaded', async () => {
    // Elements to display passed data
    const displayTasks = document.getElementById('display-tasks');
    const displayDeadline = document.getElementById('display-deadline');
    const displaySites = document.getElementById('display-sites');
    const studyGuideBox = document.getElementById('study-guide-box');
    const backButton = document.getElementById('back-button');
    const studyPlan = localStorage.getItem("studyPlan");
  
    // Retrieve stored data from the first page
    const storedData = localStorage.getItem("studyGuideData");
    if (!storedData) {
      studyGuideBox.value = 'No data found. Please go back and fill in the form.';
      return;
    }
    
    // Parse the retrieved data
    const { tasks, time, blockSites } = JSON.parse(storedData);
  
    // Display the passed data
    displayTasks.textContent = tasks.join(', ');
    displayDeadline.textContent = time;
    displaySites.textContent = blockSites.join(', ');

    studyGuideBox.value = studyPlan ? studyPlan : "No study plan found. Please generate one first.";
  
    // Back button: navigate back to the main popup page
    backButton.addEventListener('click', () => {
      window.location.href = chrome.runtime.getURL("popup.html");
    });
  });
  