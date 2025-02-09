document.addEventListener('DOMContentLoaded', async () => {
  const displayTasks = document.getElementById('display-tasks');
  const displayDeadline = document.getElementById('display-deadline');
  const displaySites = document.getElementById('display-sites');
  const studyGuideBox = document.getElementById('study-guide-box');
  const backButton = document.getElementById('back-button');
  const startSessionButton = document.getElementById('start-session');

  // Retrieve stored data from the first page
  const storedData = localStorage.getItem("studyGuideData");
  if (!storedData) {
    studyGuideBox.value = 'No data found. Please go back and fill in the form.';
    return;
  }
  
  const { tasks, time, blockSites } = JSON.parse(storedData);

  displayTasks.textContent = tasks.join(', ');
  displayDeadline.textContent = time;
  displaySites.textContent = blockSites.join(', ');

  const studyPlan = localStorage.getItem("studyPlan");
  studyGuideBox.value = studyPlan ? studyPlan : "No study plan found. Please generate one first.";

  // Back button: navigate back to the main popup page
  backButton.addEventListener('click', () => {
    window.location.href = chrome.runtime.getURL("popup.html");
  });

  // Start Session button: navigate to the pomodoro page
  startSessionButton.addEventListener('click', () => {
    window.location.href = chrome.runtime.getURL("pomodoro.html");
  });
});
