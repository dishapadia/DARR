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
    const time = document.getElementById("end-time").value;
    const blockSites = Array.from(blockList.querySelectorAll(".block-input"))
      .map(input => input.value.trim())
      .filter(site => site);

    // Validate that all required fields are filled
    if (!tasks.length || !time || !blockSites.length) {
      alert("Please fill in all fields.");
      return;
    }

    // Send data to the backend to generate the study guide
    generateStudyGuideFromBackend(tasks, blockSites, time);
  });

  // Function to send data to backend and get the study guide response
  function generateStudyGuideFromBackend(tasks, blockSites, time) {
    // Replace with the actual endpoint of your backend API
    const apiEndpoint = "https://your-backend-url.com/generate-study-guide";

    // Prepare the data to send to the backend
    const data = {
      tasks: tasks,
      websitesToBlock: blockSites,
      timeToFinish: time,
    };

    // Send a POST request to the backend with the user data
    fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())  // Assuming the backend sends back a JSON response
    .then(responseData => {
      // Assuming the backend returns a "studyGuide" object with the necessary info
      if (responseData.studyGuide) {
        displayStudyGuide(responseData.studyGuide);
      } else {
        alert("Failed to generate study guide. Please try again.");
      }
    })
    .catch(error => {
      console.error("Error generating study guide:", error);
      alert("There was an error generating the study guide.");
    });
  }

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
