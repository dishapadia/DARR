document.addEventListener("DOMContentLoaded", function() {
  const taskList = document.getElementById("task-list");
  const blockList = document.getElementById("block-list");
  const studyGuide = document.getElementById("study-guide");
  const studyTasks = document.getElementById("study-tasks");
  const studyWebsites = document.getElementById("study-websites");
  const studyTime = document.getElementById("study-time");

  // Add event listener for adding new tasks
  document.querySelector(".add-task").addEventListener("click", function() {
    const newTaskInput = document.createElement("input");
    newTaskInput.type = "text";
    newTaskInput.classList.add("task-input");
    newTaskInput.placeholder = `New Task ${taskList.children.length + 1}`;
    taskList.appendChild(newTaskInput);
  });

  // Add event listener for adding new websites
  document.querySelector(".add-website").addEventListener("click", function() {
    const newWebsiteInput = document.createElement("input");
    newWebsiteInput.type = "text";
    newWebsiteInput.classList.add("block-input");
    newWebsiteInput.placeholder = `New Website ${blockList.children.length + 1}`;
    blockList.appendChild(newWebsiteInput);
  });

  // Handle the generate study guide action
  document.getElementById("generate-study-guide").addEventListener("click", function() {
    const tasks = Array.from(taskList.querySelectorAll(".task-input"))
      .map(input => input.value.trim())
      .filter(task => task);
    const time = document.getElementById('end-time').value;

    const blockSites = Array.from(blockList.querySelectorAll(".block-input"))
      .map(input => input.value.trim())
      .filter(site => site);

    // Validate that all required fields are filled
    if (!tasks.length || !time || !blockSites.length) {
      alert("Please fill in all fields.");
      return;
    }

    // Optionally, store the user data for the study guide
    localStorage.setItem("studyGuideData", JSON.stringify({ tasks, time, blockSites }));

    // Send data to the backend to generate the study guide
    try {
      generateStudyGuideFromBackend(tasks, blockSites, time);
      window.location.href = chrome.runtime.getURL("study-guide.html");
    }
    catch (error) {
      studyPlanResult.textContent = "Error: " + error.message;
    }
    
  });

  // Function to send data to backend and get the study guide response
  async function generateStudyGuideFromBackend(tasks, blockSites, time) {

    // Prepare the data to send to the backend
    const data = {
      tasks: tasks,
      // websitesToBlock: blockSites,
      time: parseInt(time),
    };

    try {
      // Send the POST request to the backend
      const response = await fetch("http://localhost:8080/studyplan", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          throw new Error("Failed to generate study plan");
      }

      // Parse the response
      const res = await response.json();

      // Display the study plan
      // studyPlanResult.textContent = res.plan;
      localStorage.setItem("studyPlan", JSON.stringify(res));

    } catch (error) {
        studyPlanResult.textContent = "Error: " + error.message;
    }
  };

  // Function to display the generated study guide
  function displayStudyGuide(studyGuideData) {
    // Clear previous study guide content
    studyTasks.innerHTML = "";
    studyWebsites.innerHTML = "";
    studyTime.innerHTML = "";

    // Add tasks to the study guide
    studyGuideData.tasks.forEach(task => {
      const li = document.createElement("li");
      li.textContent = task;
      studyTasks.appendChild(li);
    });

    // Add websites to block to the study guide
    studyGuideData.websitesToBlock.forEach(site => {
      const li = document.createElement("li");
      li.textContent = site;
      studyWebsites.appendChild(li);
    });

    // Add time to the study guide
    studyTime.textContent = studyGuideData.timeToFinish;

    // Show the study guide
    studyGuide.style.display = "block";
  }
});
