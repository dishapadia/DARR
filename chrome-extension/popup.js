document.getElementById("start-study").addEventListener("click", () => {
  let task = document.getElementById("task").value;
  let time = parseInt(document.getElementById("time").value);
  let blockSites = document.getElementById("block-sites").value.split(",").map(site => site.trim());

  if (!task || !time || blockSites.length === 0) {
    alert("Please fill in all fields.");
    return;
  }

  chrome.storage.sync.set({ task, time, blockSites }, () => {
    alert("Study session started!");
  });
});
