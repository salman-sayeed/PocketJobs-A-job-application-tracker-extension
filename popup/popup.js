document.addEventListener("DOMContentLoaded", async () => {
  const urlInput = document.getElementById("job-url");
  const companyInput = document.getElementById("job-company");
  const positionInput = document.getElementById("job-position");
  const salaryInput = document.getElementById("job-salary");
  const addJobBtn = document.getElementById("add-job-btn");
  const clearAllBtn = document.getElementById("clear-all-btn");

  // Counter
  const appliedCountEl = document.getElementById("applied-count");
  const interviewCountEl = document.getElementById("interview-count");
  const rejectedCountEl = document.getElementById("rejected-count");

  let errorMessageEl = document.getElementById("error-message");
  let jobStatus = "Applied"; // Default status

  // update counters
  const updateCounters = () => {
    chrome.storage.local.get({ jobs: [] }, (result) => {
      const jobs = result.jobs;

      const appliedCount = jobs.filter(
        (job) => job.status === "Applied",
      ).length;
      const interviewCount = jobs.filter(
        (job) => job.status === "Interview" || job.status === "Interviews",
      ).length;
      const rejectedCount = jobs.filter(
        (job) => job.status === "Rejected",
      ).length;

      appliedCountEl.textContent = appliedCount;
      interviewCountEl.textContent = interviewCount;
      rejectedCountEl.textContent = rejectedCount;
    });
  };

  // display saved stats
  updateCounters();

  // auto URL fetching for job link
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab && tab.url) {
      urlInput.value = tab.url;
    } else {
      urlInput.placeholder = "Unable to fetch current job link.";
    }
  } catch (error) {
    console.error("Error fetching current tab URL:", error);
    urlInput.placeholder = "Error fetching current job link.";
  }

  // Add job button click handler
  addJobBtn.addEventListener("click", () => {
    // Validate inputs
    if (
      !companyInput.value.trim() ||
      !urlInput.value.trim() ||
      !positionInput.value.trim()
    ) {
      errorMessageEl.textContent = "Please fill out all the fields!";
      return;
    }

    // Timestamp
    const now = new Date();
    const currentDate = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
    const currentTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newJob = {
      id: Date.now(),
      date: currentDate,
      time: currentTime,
      url: urlInput.value.trim(),
      company: companyInput.value.trim(),
      position: positionInput.value.trim(),
      salary: salaryInput.value.trim(),
      status: jobStatus,
    };

    // Save to chrome local storage
    chrome.storage.local.get({ jobs: [] }, (result) => {
      const currentJobs = result.jobs;
      currentJobs.push(newJob);

      chrome.storage.local.set({ jobs: currentJobs }, () => {
        console.log("Job added successfully: ", newJob);

        // Clearfields
        companyInput.value = "";
        positionInput.value = "";
        salaryInput.value = "";

        // refresh stats instantly
        updateCounters();
      });
    });
  });

  // Clear All Click Handler
  clearAllBtn.addEventListener("click", () => {
    urlInput.value = "";
    companyInput.value = "";
    positionInput.value = "";
    salaryInput.value = "";
  });
});
