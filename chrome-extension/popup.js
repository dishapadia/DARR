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
  document.getElementById("generate-study-guide").addEventListener("click", async function() {
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
        const response = await fetch("http://localhost:8080/studyplan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to generate study plan");
        }

        const res = await response.json();
        console.log(res);
        localStorage.setItem("studyPlan", JSON.stringify(res));


    } catch (error) {
        document.getElementById("study-plan-result").textContent = "Error: " + error.message;
    }
}});