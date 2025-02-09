// Save session data from the popup inputs
function saveSessionData() {
  // Gather tasks, distracting websites, and end time
  const taskInputs = document.querySelectorAll(".task-input");
  const tasks = Array.from(taskInputs).map(input => input.value.trim()).filter(v => v !== "");
  
  const blockInputs = document.querySelectorAll(".block-input");
  const blockSites = Array.from(blockInputs).map(input => input.value.trim()).filter(v => v !== "");
  
  const endTime = document.getElementById("end-time").value;

  // Create an object to hold the session data
  const sessionData = {
    tasks: tasks,
    blockSites: blockSites,
    time: endTime  // store the time as entered (or convert if needed)
  };

  // Save sessionData to localStorage (or use chrome.storage.local for asynchronous storage)
  localStorage.setItem("studyGuideData", JSON.stringify(sessionData));
  console.log("Session data saved:", sessionData);
}

// Restore session data into the popup inputs (if available)
function restoreSessionData() {
  const savedData = localStorage.getItem("studyGuideData");
  if (savedData) {
    const { tasks, blockSites, time } = JSON.parse(savedData);
    
    // Populate tasks (if applicable)
    const taskList = document.getElementById("task-list");
    if (tasks && tasks.length > 0) {
      taskList.innerHTML = "";
      tasks.forEach((task, index) => {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "task-input";
        input.placeholder = `Task ${index + 1}`;
        input.value = task;
        taskList.appendChild(input);
      });
    }
  
    // Populate block sites (if applicable)
    const blockList = document.getElementById("block-list");
    if (blockSites && blockSites.length > 0) {
      blockList.innerHTML = "";
      blockSites.forEach((site, index) => {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "block-input";
        input.placeholder = `Website ${index + 1}`;
        input.value = site;
        blockList.appendChild(input);
      });
    }
  
    // Set end time if provided
    if (time) {
      document.getElementById("end-time").value = time;
    }
  }
}

window.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "hidden") {
    // Save the current page URL – for example, if you’re on pomodoro.html, save that.
    chrome.storage.local.set({ lastPage: window.location.pathname });
  }
});

// Listen for the visibilitychange event; when the popup is hidden, save the session data.
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === "hidden") {
    saveSessionData();
  }
});

// Also listen for the unload event as a fallback (though it may not always fire)
window.addEventListener("unload", saveSessionData);



// Main initialization on DOMContentLoaded
document.addEventListener("DOMContentLoaded", function() {
  // Restore any saved session data on load
  restoreSessionData();

  // Add event listener for adding new tasks
  document.querySelector(".add-task").addEventListener("click", function() {
    const taskList = document.getElementById("task-list");
    const newTaskInput = document.createElement("input");
    newTaskInput.type = "text";
    newTaskInput.classList.add("task-input");
    newTaskInput.placeholder = `New Task ${taskList.children.length + 1}`;
    taskList.appendChild(newTaskInput);
  });

  // Add event listener for adding new websites
  document.querySelector(".add-website").addEventListener("click", function() {
    const blockList = document.getElementById("block-list");
    const newWebsiteInput = document.createElement("input");
    newWebsiteInput.type = "text";
    newWebsiteInput.classList.add("block-input");
    newWebsiteInput.placeholder = `New Website ${blockList.children.length + 1}`;
    blockList.appendChild(newWebsiteInput);
  });

  // Handle the generate study guide action
  document.getElementById("generate-study-guide").addEventListener("click", async function() {
    const taskList = document.getElementById("task-list");
    const blockList = document.getElementById("block-list");
    
    const tasks = Array.from(taskList.querySelectorAll(".task-input"))
      .map(input => input.value.trim())
      .filter(task => task);
    const time = document.getElementById('end-time').value;
  
    const blockSites = Array.from(blockList.querySelectorAll(".block-input"))
      .map(input => input.value.trim())
      .filter(site => site);
  
    if (!tasks.length || !time || !blockSites.length) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      localStorage.removeItem("studyGuideData");
    } catch (error) {
      console.error("Error removing studyGuideData from localStorage:", error);
    }
  
    // Store the basic user data
    localStorage.setItem("studyGuideData", JSON.stringify({ tasks, time, blockSites }));
  
    // Wait for the backend response before navigating
    await generateStudyGuideFromBackend(tasks, blockSites, time);
  
    // Navigate to the new page AFTER study plan is stored
    window.location.href = chrome.runtime.getURL("study-guide.html");
  });
  
  // Function to send data to backend and get the study guide response
  async function generateStudyGuideFromBackend(tasks, blockSites, time) {
    const data = { tasks: tasks, time: parseInt(time) };
  
    try {
      // Send the POST request to the backend
      const response = await fetch("http://localhost:8080/studyplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error("Failed to generate study plan");
      }
  
      // Parse the response
      const res = await response.json();
      console.log(res);
      localStorage.setItem("studyPlan", JSON.stringify(res));
  
    } catch (error) {
      document.getElementById("study-plan-result").textContent = "Error: " + error.message;
    }
  }
});
