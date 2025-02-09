document.addEventListener('DOMContentLoaded', async () => {
    // Elements to display passed data
    const newSessionButton = document.getElementById('new-session-button');
    const analysisBox = document.getElementById('analysis-guide-box');

    let studyPlan = localStorage.getItem("studyPlan");
    let analysis = localStorage.getItem("analysis");

    // If the study plan isn't found, display a fallback message.
    if (!studyPlan) {
    document.getElementById("plan-summary").textContent =
        "No study plan found. Please generate one first.";
    document.getElementById("full-plan-box").textContent =
        "No study plan found. Please generate one first.";
    return;
    }

    if (!analysis) {
        document.getElementById("plan-summary").textContent = "analysis issue";
        return;
        }
    analysisBox.textContent = analysis

    // In case the stored study plan contains literal "\n" escapes instead of actual newlines,
    // replace them. (If your backend already fixed this, this line may not be needed.)
    studyPlan = studyPlan.replace(/\\n/g, "\n");

    // Split the study plan into lines.
    const lines = studyPlan.split("\n").filter(line => line.trim() !== "");
    const totalLines = lines.length;

    // For this example, we'll assume that tasks are indicated by lines that start with a number followed by a period
    // or a bullet point (like '-' or '*'). Adjust the regex as needed.
    const taskLines = lines.filter(line => /^\d+\./.test(line) || /^[-*]/.test(line));
    const totalTasks = taskLines.length;

    // Update the overview section.
    const planSummary = document.getElementById("plan-summary");
    planSummary.textContent = `Your study plan contains ${totalTasks} tasks over ${totalLines} lines.`;

    // Update the detailed analysis.
    const analysisDetails = document.getElementById("analysis-details");
    const details = [
    `Total number of lines: ${totalLines}`,
    `Estimated number of tasks: ${totalTasks}`,
    // Add more detailed analysis items here as needed.
    ];
    details.forEach(detail => {
    const li = document.createElement("li");
    li.textContent = detail;
    analysisDetails.appendChild(li);
    });

    // Display the full study plan in a styled div.
    const fullPlanBox = document.getElementById("full-plan-box");
    fullPlanBox.textContent = studyPlan;

    newSessionButtonButton.addEventListener("click", function() {
        // For Chrome extension: use chrome.runtime.getURL if navigating to an internal page.
        window.location.href = chrome.runtime.getURL("popup.html");
        // Or, if not in an extension, simply use: window.history.back();
      });
});
