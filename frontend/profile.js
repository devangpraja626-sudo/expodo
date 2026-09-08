/* =========================================================
   EXPO GO — PROFILE DASHBOARD
   Stage 2 — Extended Profile
========================================================= */

const PROFILE_STORAGE_KEY = "expoGoProfile";

const profileAvatar = document.getElementById("profileAvatar");
const profileRole = document.getElementById("profileRole");
const profileName = document.getElementById("profileName");
const profileHeadline = document.getElementById("profileHeadline");

const infoName = document.getElementById("infoName");
const infoHeadline = document.getElementById("infoHeadline");
const infoRole = document.getElementById("infoRole");
const infoSkills = document.getElementById("infoSkills");
const infoEducation = document.getElementById("infoEducation");
const infoExperience = document.getElementById("infoExperience");
const infoLocation = document.getElementById("infoLocation");

const completionNumber = document.getElementById("completionNumber");
const completionFill = document.getElementById("completionFill");
const completionText = document.getElementById("completionText");

const editProfileBtn = document.getElementById("editProfileBtn");
const completeProfileBtn = document.getElementById("completeProfileBtn");

const editModal = document.getElementById("editModal");
const editBackdrop = document.getElementById("editBackdrop");
const closeEdit = document.getElementById("closeEdit");

const editForm = document.getElementById("editForm");

const editName = document.getElementById("editName");
const editHeadline = document.getElementById("editHeadline");
const editSkills = document.getElementById("editSkills");
const editEducation = document.getElementById("editEducation");
const editExperience = document.getElementById("editExperience");
const editLocation = document.getElementById("editLocation");

const editStatus = document.getElementById("editStatus");


/* =========================================================
   LOAD PROFILE
========================================================= */

let profile = null;

try {
  profile = JSON.parse(
    localStorage.getItem(PROFILE_STORAGE_KEY)
  );
} catch (error) {
  profile = null;
}

if (!profile) {
  window.location.href = "index.html";
}


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function displayValue(value) {
  return value && String(value).trim()
    ? escapeHTML(value)
    : "Not added";
}


/* =========================================================
   PROFILE STRENGTH
========================================================= */

function calculateCompletion(data) {

  const fields = [
    data.name,
    data.headline,
    data.skills,
    data.education,
    data.experience,
    data.location
  ];

  const completed = fields.filter(
    field => field && String(field).trim()
  ).length;

  return Math.round((completed / fields.length) * 100);
}


function updateCompletion(data) {

  const percentage = calculateCompletion(data);

  completionNumber.textContent = `${percentage}%`;
  completionFill.style.width = `${percentage}%`;

  if (percentage >= 100) {
    completionText.textContent =
      "Your profile is complete and ready for matching.";
  } else if (percentage >= 80) {
    completionText.textContent =
      "Almost there. Add the remaining information.";
  } else if (percentage >= 60) {
    completionText.textContent =
      "Good start. A few more details will strengthen your profile.";
  } else {
    completionText.textContent =
      "Add more information to improve your profile.";
  }
}


/* =========================================================
   DISPLAY PROFILE
========================================================= */

function displayProfile(data) {

  const name = data.name || "Your Name";
  const headline = data.headline || "Your professional headline";

  const firstLetter =
    name.trim().charAt(0).toUpperCase() || "E";

  profileAvatar.textContent = firstLetter;

  profileRole.textContent =
    data.role === "employer"
      ? "EMPLOYER"
      : "EMPLOYEE";

  profileName.textContent = name;

  profileHeadline.textContent = headline;

  infoName.innerHTML = displayValue(data.name);
  infoHeadline.innerHTML = displayValue(data.headline);

  infoRole.innerHTML =
    data.role === "employer"
      ? "Employer"
      : "Employee";

  infoSkills.innerHTML = displayValue(data.skills);
  infoEducation.innerHTML = displayValue(data.education);
  infoExperience.innerHTML = displayValue(data.experience);
  infoLocation.innerHTML = displayValue(data.location);

  updateCompletion(data);
}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal() {

  editName.value = profile.name || "";
  editHeadline.value = profile.headline || "";
  editSkills.value = profile.skills || "";
  editEducation.value = profile.education || "";
  editExperience.value = profile.experience || "";
  editLocation.value = profile.location || "";

  editStatus.textContent = "";
  editStatus.className = "edit-status";

  editModal.classList.add("active");

  setTimeout(() => {
    editName.focus();
  }, 100);
}


/* =========================================================
   CLOSE EDIT MODAL
========================================================= */

function closeEditModal() {

  editModal.classList.remove("active");

  editStatus.textContent = "";
}


/* =========================================================
   EDIT BUTTONS
========================================================= */

editProfileBtn.addEventListener(
  "click",
  openEditModal
);

completeProfileBtn.addEventListener(
  "click",
  openEditModal
);

closeEdit.addEventListener(
  "click",
  closeEditModal
);

editBackdrop.addEventListener(
  "click",
  closeEditModal
);


/* =========================================================
   SAVE PROFILE
========================================================= */

editForm.addEventListener(
  "submit",
  function (event) {

    event.preventDefault();

    const name = editName.value.trim();
    const headline = editHeadline.value.trim();

    if (!name) {

      editStatus.textContent =
        "Please enter your name.";

      editStatus.className =
        "edit-status error";

      editName.focus();

      return;
    }

    if (!headline) {

      editStatus.textContent =
        "Please enter what you do.";

      editStatus.className =
        "edit-status error";

      editHeadline.focus();

      return;
    }


    profile = {
      ...profile,

      name,
      headline,

      skills: editSkills.value.trim(),
      education: editEducation.value.trim(),
      experience: editExperience.value.trim(),
      location: editLocation.value.trim(),

      updatedAt: new Date().toISOString()
    };


    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );


    displayProfile(profile);


    editStatus.textContent =
      "Profile saved successfully.";

    editStatus.className =
      "edit-status success";


    setTimeout(() => {
      closeEditModal();
    }, 700);

  }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      editModal.classList.contains("active")
    ) {
      closeEditModal();
    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

displayProfile(profile);