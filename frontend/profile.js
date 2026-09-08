/* =========================================================
   EXPO GO — PROFILE DASHBOARD
   Stage 3 — Role-Specific Profiles
========================================================= */

const PROFILE_STORAGE_KEY = "expoGoProfile";


/* =========================================================
   ELEMENTS
========================================================= */

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
const infoWorkPreference = document.getElementById("infoWorkPreference");
const infoCompany = document.getElementById("infoCompany");
const infoWorkType = document.getElementById("infoWorkType");

const headlineLabel = document.getElementById("headlineLabel");
const skillsLabel = document.getElementById("skillsLabel");
const experienceLabel = document.getElementById("experienceLabel");
const locationLabel = document.getElementById("locationLabel");

const educationInfo = document.getElementById("educationInfo");
const workPreferenceInfo = document.getElementById("workPreferenceInfo");
const companyInfo = document.getElementById("companyInfo");
const workTypeInfo = document.getElementById("workTypeInfo");

const completionNumber = document.getElementById("completionNumber");
const completionFill = document.getElementById("completionFill");
const completionText = document.getElementById("completionText");

const editProfileBtn = document.getElementById("editProfileBtn");
const completeProfileBtn = document.getElementById("completeProfileBtn");

const editModal = document.getElementById("editModal");
const editBackdrop = document.getElementById("editBackdrop");
const closeEdit = document.getElementById("closeEdit");

const editForm = document.getElementById("editForm");
const editStatus = document.getElementById("editStatus");

const editName = document.getElementById("editName");

const editHeadline = document.getElementById("editHeadline");
const editSkills = document.getElementById("editSkills");
const editEducation = document.getElementById("editEducation");
const editExperience = document.getElementById("editExperience");
const editDesiredPosition = document.getElementById("editDesiredPosition");
const editLocation = document.getElementById("editLocation");
const editWorkPreference = document.getElementById("editWorkPreference");

const editCompany = document.getElementById("editCompany");
const editHiringPosition = document.getElementById("editHiringPosition");
const editRequiredSkills = document.getElementById("editRequiredSkills");
const editRequiredExperience = document.getElementById("editRequiredExperience");
const editEmployerLocation = document.getElementById("editEmployerLocation");
const editWorkType = document.getElementById("editWorkType");

const editorType = document.getElementById("editorType");
const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");


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


function isEmployer() {

  return profile.role === "employer";
}


/* =========================================================
   ROLE-SPECIFIC EDITOR
========================================================= */

function updateEditorForRole() {

  const employer = isEmployer();

  document.querySelectorAll(".employee-field")
    .forEach(field => {
      field.style.display = employer ? "none" : "";
    });

  document.querySelectorAll(".employer-field")
    .forEach(field => {
      field.style.display = employer ? "" : "none";
    });


  if (employer) {

    editorType.textContent = "EMPLOYER";

    editorTitle.textContent =
      "Build your hiring profile.";

    editorSubtitle.textContent =
      "Tell Expo Go what kind of people your company needs.";

  } else {

    editorType.textContent = "EMPLOYEE";

    editorTitle.textContent =
      "Build your profile.";

    editorSubtitle.textContent =
      "Tell Expo Go what kind of opportunity you're looking for.";
  }
}


/* =========================================================
   PROFILE STRENGTH
========================================================= */

function calculateCompletion(data) {

  let fields = [];

  if (data.role === "employer") {

    fields = [
      data.name,
      data.company,
      data.hiringPosition,
      data.requiredSkills,
      data.requiredExperience,
      data.location,
      data.workType
    ];

  } else {

    fields = [
      data.name,
      data.headline,
      data.skills,
      data.education,
      data.experience,
      data.desiredPosition,
      data.location,
      data.workPreference
    ];
  }


  const completed = fields.filter(
    field => field && String(field).trim()
  ).length;


  return Math.round(
    (completed / fields.length) * 100
  );
}


function updateCompletion(data) {

  const percentage =
    calculateCompletion(data);

  completionNumber.textContent =
    `${percentage}%`;

  completionFill.style.width =
    `${percentage}%`;


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

  const employer =
    data.role === "employer";


  const name =
    data.name || "Your Name";


  const headline =
    employer
      ? (data.hiringPosition || "Hiring profile")
      : (data.headline || "Your professional headline");


  const firstLetter =
    name.trim().charAt(0).toUpperCase() || "E";


  profileAvatar.textContent =
    firstLetter;


  profileRole.textContent =
    employer
      ? "EMPLOYER"
      : "EMPLOYEE";


  profileName.textContent =
    employer
      ? (data.company || name)
      : name;


  profileHeadline.textContent =
    headline;


  infoName.innerHTML =
    displayValue(data.name);


  infoRole.innerHTML =
    employer
      ? "Employer"
      : "Employee";


  if (employer) {

    headlineLabel.textContent =
      "HIRING POSITION";

    skillsLabel.textContent =
      "REQUIRED SKILLS";

    experienceLabel.textContent =
      "EXPERIENCE REQUIRED";

    locationLabel.textContent =
      "LOCATION";


    infoHeadline.innerHTML =
      displayValue(data.hiringPosition);

    infoSkills.innerHTML =
      displayValue(data.requiredSkills);

    infoExperience.innerHTML =
      displayValue(data.requiredExperience);

    infoLocation.innerHTML =
      displayValue(data.location);

    infoCompany.innerHTML =
      displayValue(data.company);

    infoWorkType.innerHTML =
      displayValue(data.workType);


    educationInfo.style.display =
      "none";

    workPreferenceInfo.style.display =
      "none";

    companyInfo.style.display =
      "";

    workTypeInfo.style.display =
      "";

  } else {

    headlineLabel.textContent =
      "HEADLINE";

    skillsLabel.textContent =
      "SKILLS";

    experienceLabel.textContent =
      "EXPERIENCE";

    locationLabel.textContent =
      "LOCATION";


    infoHeadline.innerHTML =
      displayValue(data.headline);

    infoSkills.innerHTML =
      displayValue(data.skills);

    infoEducation.innerHTML =
      displayValue(data.education);

    infoExperience.innerHTML =
      displayValue(data.experience);

    infoLocation.innerHTML =
      displayValue(data.location);

    infoWorkPreference.innerHTML =
      displayValue(data.workPreference);


    educationInfo.style.display =
      "";

    workPreferenceInfo.style.display =
      "";

    companyInfo.style.display =
      "none";

    workTypeInfo.style.display =
      "none";
  }


  updateCompletion(data);
}


/* =========================================================
   OPEN EDIT MODAL
========================================================= */

function openEditModal() {

  editName.value =
    profile.name || "";


  /* EMPLOYEE */

  editHeadline.value =
    profile.headline || "";

  editSkills.value =
    profile.skills || "";

  editEducation.value =
    profile.education || "";

  editExperience.value =
    profile.experience || "";

  editDesiredPosition.value =
    profile.desiredPosition || "";

  editLocation.value =
    profile.location || "";

  editWorkPreference.value =
    profile.workPreference || "";


  /* EMPLOYER */

  editCompany.value =
    profile.company || "";

  editHiringPosition.value =
    profile.hiringPosition || "";

  editRequiredSkills.value =
    profile.requiredSkills || "";

  editRequiredExperience.value =
    profile.requiredExperience || "";

  editEmployerLocation.value =
    profile.location || "";

  editWorkType.value =
    profile.workType || "";


  updateEditorForRole();


  editStatus.textContent = "";

  editStatus.className =
    "edit-status";


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
   BUTTONS
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
  function(event) {

    event.preventDefault();


    const name =
      editName.value.trim();


    if (!name) {

      editStatus.textContent =
        "Please enter your name.";

      editStatus.className =
        "edit-status error";

      editName.focus();

      return;
    }


    /* =========================================
       EMPLOYER
    ========================================= */

    if (isEmployer()) {

      const company =
        editCompany.value.trim();

      const hiringPosition =
        editHiringPosition.value.trim();


      if (!company) {

        editStatus.textContent =
          "Please enter your company or organization.";

        editStatus.className =
          "edit-status error";

        editCompany.focus();

        return;
      }


      if (!hiringPosition) {

        editStatus.textContent =
          "Please enter the position you're hiring for.";

        editStatus.className =
          "edit-status error";

        editHiringPosition.focus();

        return;
      }


      profile = {

        ...profile,

        name,

        company,

        hiringPosition,

        requiredSkills:
          editRequiredSkills.value.trim(),

        requiredExperience:
          editRequiredExperience.value.trim(),

        location:
          editEmployerLocation.value.trim(),

        workType:
          editWorkType.value.trim(),

        updatedAt:
          new Date().toISOString()
      };


    /* =========================================
       EMPLOYEE
    ========================================= */

    } else {

      const headline =
        editHeadline.value.trim();


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

        skills:
          editSkills.value.trim(),

        education:
          editEducation.value.trim(),

        experience:
          editExperience.value.trim(),

        desiredPosition:
          editDesiredPosition.value.trim(),

        location:
          editLocation.value.trim(),

        workPreference:
          editWorkPreference.value.trim(),

        updatedAt:
          new Date().toISOString()
      };
    }


    /* =========================================
       SAVE
    ========================================= */

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
  function(event) {

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