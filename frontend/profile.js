/* =========================================================
   EXPO GO — PROFILE DASHBOARD CONTROLLER
   Prototype V1
   LocalStorage based
   ========================================================= */

const PROFILE_STORAGE_KEY = "expoGoProfile";

/* =========================================================
   DOM ELEMENTS
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
const infoDesiredPosition = document.getElementById("infoDesiredPosition");
const infoLocation = document.getElementById("infoLocation");
const infoWorkPreference = document.getElementById("infoWorkPreference");

const infoCompany = document.getElementById("infoCompany");
const infoHiringPosition = document.getElementById("infoHiringPosition");
const infoRequiredSkills = document.getElementById("infoRequiredSkills");
const infoExperienceRequired = document.getElementById("infoExperienceRequired");
const infoEmployerLocation = document.getElementById("infoEmployerLocation");
const infoWorkType = document.getElementById("infoWorkType");

const infoAbout = document.getElementById("infoAbout");

const employeeSection = document.getElementById("employeeSection");
const employerSection = document.getElementById("employerSection");

const completionNumber = document.getElementById("completionNumber");
const completionFill = document.getElementById("completionFill");
const completionText = document.getElementById("completionText");
const completionFields = document.getElementById("completionFields");

const nextStepTitle = document.getElementById("nextStepTitle");
const nextStepText = document.getElementById("nextStepText");
const completeProfileBtn = document.getElementById("completeProfileBtn");

const matchingStatus = document.getElementById("matchingStatus");

const editProfileBtn = document.getElementById("editProfileBtn");

const editModal = document.getElementById("editModal");
const editBackdrop = document.getElementById("editBackdrop");
const closeEdit = document.getElementById("closeEdit");

const editForm = document.getElementById("editForm");

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
const editExperienceRequired = document.getElementById("editExperienceRequired");
const editEmployerLocation = document.getElementById("editEmployerLocation");
const editWorkType = document.getElementById("editWorkType");

const editAbout = document.getElementById("editAbout");
const editStatus = document.getElementById("editStatus");

const employeeEditFields =
  document.getElementById("employeeEditFields");

const employerEditFields =
  document.getElementById("employerEditFields");


/* =========================================================
   PROFILE DATA
   ========================================================= */

function createEmptyProfile() {
  return {
    id: null,

    name: "",
    role: "employee",
    headline: "",

    skills: [],
    education: "",
    experience: "",
    desiredPosition: "",
    location: "",
    workPreference: "",
    about: "",

    company: "",
    hiringPosition: "",
    requiredSkills: [],
    experienceRequired: "",
    workType: "",

    createdAt: null,
    updatedAt: null
  };
}


function normalizeProfile(profile) {
  const base = createEmptyProfile();

  if (!profile || typeof profile !== "object") {
    return base;
  }

  return {
    ...base,
    ...profile,

    id: profile.id || null,

    name: String(profile.name || "").trim(),

    role:
      profile.role === "employer"
        ? "employer"
        : "employee",

    headline:
      String(profile.headline || "").trim(),

    skills: Array.isArray(profile.skills)
      ? profile.skills
      : [],

    education:
      String(profile.education || "").trim(),

    experience:
      String(profile.experience || "").trim(),

    desiredPosition:
      String(profile.desiredPosition || "").trim(),

    location:
      String(profile.location || "").trim(),

    workPreference:
      String(profile.workPreference || "").trim(),

    about:
      String(profile.about || "").trim(),

    company:
      String(profile.company || "").trim(),

    hiringPosition:
      String(profile.hiringPosition || "").trim(),

    requiredSkills: Array.isArray(profile.requiredSkills)
      ? profile.requiredSkills
      : [],

    experienceRequired:
      String(profile.experienceRequired || "").trim(),

    workType:
      String(profile.workType || "").trim(),

    createdAt:
      profile.createdAt || null,

    updatedAt:
      profile.updatedAt || null
  };
}


function getSavedProfile() {
  try {
    const stored =
      localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    return normalizeProfile(
      JSON.parse(stored)
    );
  } catch (error) {
    console.error(
      "Expo Go: failed to load profile.",
      error
    );

    return null;
  }
}


function saveProfile(profile) {
  const normalized =
    normalizeProfile(profile);

  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(normalized)
  );

  return normalized;
}


/* =========================================================
   HELPERS
   ========================================================= */

function getInitial(name) {
  const cleanName =
    String(name || "").trim();

  return cleanName
    ? cleanName.charAt(0).toUpperCase()
    : "E";
}


function displayValue(value) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "Not added";
  }

  return String(value).trim();
}


function displayList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return "Not added";
  }

  return list
    .map((item) => String(item).trim())
    .filter(Boolean)
    .join(", ");
}


function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (item, index, array) =>
        array.findIndex(
          (existing) =>
            existing.toLowerCase() === item.toLowerCase()
        ) === index
    );
}


function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   PROFILE COMPLETION
   ========================================================= */

function calculateCompletion(profile) {
  const fields =
    profile.role === "employer"
      ? [
          profile.name,
          profile.headline,
          profile.company,
          profile.hiringPosition,
          profile.requiredSkills.length > 0
            ? "added"
            : "",
          profile.experienceRequired,
          profile.location,
          profile.workType,
          profile.about
        ]
      : [
          profile.name,
          profile.headline,
          profile.skills.length > 0
            ? "added"
            : "",
          profile.education,
          profile.experience,
          profile.desiredPosition,
          profile.location,
          profile.workPreference,
          profile.about
        ];

  const completed =
    fields.filter(
      (field) =>
        String(field || "").trim() !== ""
    ).length;

  const total = fields.length;

  const percentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage
  };
}


/* =========================================================
   DISPLAY PROFILE
   ========================================================= */

function displayProfile(profile) {
  const normalized =
    normalizeProfile(profile);

  /* Identity */

  if (profileAvatar) {
    profileAvatar.textContent =
      getInitial(normalized.name);
  }

  if (profileRole) {
    profileRole.textContent =
      normalized.role === "employer"
        ? "EMPLOYER"
        : "EMPLOYEE";
  }

  if (profileName) {
    profileName.textContent =
      displayValue(normalized.name);
  }

  if (profileHeadline) {
    profileHeadline.textContent =
      displayValue(normalized.headline);
  }


  /* Basic */

  if (infoName) {
    infoName.textContent =
      displayValue(normalized.name);
  }

  if (infoHeadline) {
    infoHeadline.textContent =
      displayValue(normalized.headline);
  }

  if (infoRole) {
    infoRole.textContent =
      normalized.role === "employer"
        ? "Employer"
        : "Employee";
  }


  /* Employee */

  if (infoSkills) {
    infoSkills.textContent =
      displayList(normalized.skills);
  }

  if (infoEducation) {
    infoEducation.textContent =
      displayValue(normalized.education);
  }

  if (infoExperience) {
    infoExperience.textContent =
      displayValue(normalized.experience);
  }

  if (infoDesiredPosition) {
    infoDesiredPosition.textContent =
      displayValue(normalized.desiredPosition);
  }

  if (infoLocation) {
    infoLocation.textContent =
      displayValue(normalized.location);
  }

  if (infoWorkPreference) {
    infoWorkPreference.textContent =
      displayValue(normalized.workPreference);
  }


  /* Employer */

  if (infoCompany) {
    infoCompany.textContent =
      displayValue(normalized.company);
  }

  if (infoHiringPosition) {
    infoHiringPosition.textContent =
      displayValue(normalized.hiringPosition);
  }

  if (infoRequiredSkills) {
    infoRequiredSkills.textContent =
      displayList(normalized.requiredSkills);
  }

  if (infoExperienceRequired) {
    infoExperienceRequired.textContent =
      displayValue(
        normalized.experienceRequired
      );
  }

  if (infoEmployerLocation) {
    infoEmployerLocation.textContent =
      displayValue(normalized.location);
  }

  if (infoWorkType) {
    infoWorkType.textContent =
      displayValue(normalized.workType);
  }


  /* About */

  if (infoAbout) {
    if (normalized.about) {
      infoAbout.textContent =
        normalized.about;
    } else {
      infoAbout.textContent =
        normalized.role === "employer"
          ? "Tell potential candidates more about your company and hiring needs."
          : "Tell potential opportunities more about yourself.";
    }
  }


  /* Role sections */

  if (employeeSection) {
    employeeSection.style.display =
      normalized.role === "employee"
        ? ""
        : "none";
  }

  if (employerSection) {
    employerSection.style.display =
      normalized.role === "employer"
        ? ""
        : "none";
  }


  /* Completion */

  updateCompletion(normalized);
}


/* =========================================================
   COMPLETION UI
   ========================================================= */

function updateCompletion(profile) {
  const result =
    calculateCompletion(profile);

  if (completionNumber) {
    completionNumber.textContent =
      result.percentage;
  }

  if (completionFill) {
    completionFill.style.width =
      `${result.percentage}%`;
  }

  if (completionFields) {
    completionFields.textContent =
      `${result.completed} / ${result.total}`;
  }


  let statusText =
    "Getting started";

  if (result.percentage >= 100) {
    statusText = "Profile complete";
  } else if (result.percentage >= 75) {
    statusText = "Almost there";
  } else if (result.percentage >= 50) {
    statusText = "Looking good";
  } else if (result.percentage >= 25) {
    statusText = "Keep going";
  }

  if (completionText) {
    completionText.textContent =
      statusText;
  }


  if (nextStepTitle && nextStepText) {
    if (result.percentage >= 100) {
      nextStepTitle.textContent =
        "You're ready.";

      nextStepText.textContent =
        "Your profile is complete and ready for Expo Go matching.";
    } else {
      nextStepTitle.textContent =
        "Complete your profile.";

      nextStepText.textContent =
        profile.role === "employer"
          ? "Add your company and hiring details so Expo Go can understand the opportunity."
          : "Add your professional information so Expo Go can understand what you're looking for.";
    }
  }


  if (completeProfileBtn) {
    completeProfileBtn.innerHTML =
      result.percentage >= 100
        ? `Edit profile <span>↗</span>`
        : `Complete profile <span>↗</span>`;
  }


  if (matchingStatus) {
    if (result.percentage >= 75) {
      matchingStatus.textContent =
        "Ready for matching";
    } else {
      matchingStatus.textContent =
        "Profile data required";
    }
  }
}


/* =========================================================
   EDIT MODAL
   ========================================================= */

function clearEditStatus() {
  if (!editStatus) return;

  editStatus.textContent = "";
  editStatus.className = "edit-status";
}


function openEditModal() {
  const profile =
    getSavedProfile();

  if (!profile) {
    window.location.href =
      "index.html";

    return;
  }

  clearEditStatus();

  /* Basic */

  if (editName) {
    editName.value =
      profile.name;
  }

  if (editHeadline) {
    editHeadline.value =
      profile.headline;
  }


  /* Employee */

  if (editSkills) {
    editSkills.value =
      profile.skills.join(", ");
  }

  if (editEducation) {
    editEducation.value =
      profile.education;
  }

  if (editExperience) {
    editExperience.value =
      profile.experience;
  }

  if (editDesiredPosition) {
    editDesiredPosition.value =
      profile.desiredPosition;
  }

  if (editLocation) {
    editLocation.value =
      profile.location;
  }

  if (editWorkPreference) {
    editWorkPreference.value =
      profile.workPreference;
  }


  /* Employer */

  if (editCompany) {
    editCompany.value =
      profile.company;
  }

  if (editHiringPosition) {
    editHiringPosition.value =
      profile.hiringPosition;
  }

  if (editRequiredSkills) {
    editRequiredSkills.value =
      profile.requiredSkills.join(", ");
  }

  if (editExperienceRequired) {
    editExperienceRequired.value =
      profile.experienceRequired;
  }

  if (editEmployerLocation) {
    editEmployerLocation.value =
      profile.location;
  }

  if (editWorkType) {
    editWorkType.value =
      profile.workType;
  }


  /* About */

  if (editAbout) {
    editAbout.value =
      profile.about;
  }


  /* Role-specific edit fields */

  if (employeeEditFields) {
    employeeEditFields.style.display =
      profile.role === "employee"
        ? ""
        : "none";
  }

  if (employerEditFields) {
    employerEditFields.style.display =
      profile.role === "employer"
        ? ""
        : "none";
  }


  if (editModal) {
    editModal.classList.add("active");
    editModal.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  setTimeout(() => {
    if (editName) {
      editName.focus();
    }
  }, 150);
}


function closeEditModal() {
  if (!editModal) return;

  editModal.classList.remove("active");

  editModal.setAttribute(
    "aria-hidden",
    "true"
  );
}


/* =========================================================
   SAVE EDITED PROFILE
   ========================================================= */

if (editForm) {
  editForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      const currentProfile =
        getSavedProfile();

      if (!currentProfile) {
        window.location.href =
          "index.html";

        return;
      }


      const name =
        editName
          ? editName.value.trim()
          : "";

      const headline =
        editHeadline
          ? editHeadline.value.trim()
          : "";


      if (!name || !headline) {
        if (editStatus) {
          editStatus.textContent =
            "Name and professional headline are required.";

          editStatus.className =
            "edit-status error";
        }

        return;
      }


      const updatedProfile =
        normalizeProfile({
          ...currentProfile,

          name,
          headline,

          /* Employee */

          skills:
            parseList(
              editSkills
                ? editSkills.value
                : ""
            ),

          education:
            editEducation
              ? editEducation.value.trim()
              : "",

          experience:
            editExperience
              ? editExperience.value.trim()
              : "",

          desiredPosition:
            editDesiredPosition
              ? editDesiredPosition.value.trim()
              : "",

          location:
            currentProfile.role === "employee"
              ? (
                  editLocation
                    ? editLocation.value.trim()
                    : ""
                )
              : (
                  editEmployerLocation
                    ? editEmployerLocation.value.trim()
                    : ""
                ),

          workPreference:
            editWorkPreference
              ? editWorkPreference.value
              : "",

          /* Employer */

          company:
            editCompany
              ? editCompany.value.trim()
              : "",

          hiringPosition:
            editHiringPosition
              ? editHiringPosition.value.trim()
              : "",

          requiredSkills:
            parseList(
              editRequiredSkills
                ? editRequiredSkills.value
                : ""
            ),

          experienceRequired:
            editExperienceRequired
              ? editExperienceRequired.value.trim()
              : "",

          workType:
            editWorkType
              ? editWorkType.value
              : "",

          about:
            editAbout
              ? editAbout.value.trim()
              : "",

          updatedAt:
            new Date().toISOString()
        });


      try {
        saveProfile(updatedProfile);

        displayProfile(updatedProfile);

        if (editStatus) {
          editStatus.textContent =
            "Profile updated successfully.";

          editStatus.className =
            "edit-status success";
        }

        setTimeout(() => {
          closeEditModal();
        }, 700);

      } catch (error) {
        console.error(
          "Expo Go: failed to save profile.",
          error
        );

        if (editStatus) {
          editStatus.textContent =
            "Unable to save your changes.";

          editStatus.className =
            "edit-status error";
        }
      }
    }
  );
}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

if (editProfileBtn) {
  editProfileBtn.addEventListener(
    "click",
    openEditModal
  );
}


if (completeProfileBtn) {
  completeProfileBtn.addEventListener(
    "click",
    openEditModal
  );
}


if (closeEdit) {
  closeEdit.addEventListener(
    "click",
    closeEditModal
  );
}


if (editBackdrop) {
  editBackdrop.addEventListener(
    "click",
    closeEditModal
  );
}


/* =========================================================
   KEYBOARD
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {
    if (event.key === "Escape") {
      closeEditModal();
    }
  }
);


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeProfilePage() {
  const profile =
    getSavedProfile();

  if (!profile || !profile.name) {
    window.location.href =
      "index.html";

    return;
  }

  /*
    Save normalized data so profiles created
    by the previous prototype version also work
    with the new profile system.
  */

  saveProfile(profile);

  displayProfile(profile);
}


initializeProfilePage();

console.log(
  "Expo Go profile dashboard loaded."
);