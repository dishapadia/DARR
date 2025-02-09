document.addEventListener('DOMContentLoaded', async () => {
  const displayTasks = document.getElementById('display-tasks');
  const displayDeadline = document.getElementById('display-deadline');
  const displaySites = document.getElementById('display-sites');
  const studyGuideBox = document.getElementById('study-guide-box');
  const startSession = document.getElementById('start-session');

  // Retrieve stored data
  const storedData = localStorage.getItem("studyGuideData");
  if (!storedData) {
      studyGuideBox.textContent = 'No data found. Please go back and fill in the form.';

      return;
  }

  const { tasks, time, blockSites } = JSON.parse(storedData);
  displayTasks.textContent = tasks.length > 0 ? tasks.join(', ') : "No tasks entered.";
  displayDeadline.textContent = time ? `${time} hours` : "No deadline set.";
  displaySites.textContent = blockSites.length > 0 ? blockSites.join(', ') : "No websites entered.";

  // Retry fetching studyPlan if it’s not yet available
  let attempts = 0;
  const maxAttempts = 10; // Try for ~2 seconds
  function checkStudyPlan() {
      const studyPlanData = localStorage.getItem("studyPlan");
      if (studyPlanData) {
          const studyPlan = JSON.parse(studyPlanData);
          studyGuideBox.textContent = studyPlan.plan;
      } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStudyPlan, 200);
      } else {
          if (studyPlanData) {
            const studyPlan = JSON.parse(studyPlanData);
            studyGuideBox.textContent = studyPlan.plan; // ✅ Now correctly updates in study-guide.html
        } else {
            studyGuideBox.textContent = "No study plan found. Please generate one first.";
        }
      }
  }

  checkStudyPlan();

  // Back button event
  startSession.addEventListener('click', () => {
      window.location.href = chrome.runtime.getURL("pomodoro.html");
  });
});
