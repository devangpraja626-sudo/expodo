const API_BASE_URL = "https://expo-5ths.onrender.com";
const PROFILE_STORAGE_KEY = "expoGoProfile";

let profile = null;

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value
      .map(item => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeProfile(data = {}) {
  return {
    id: data.id || "",
    name: data.name || "",
    role: data.role || "",
    headline: data.headline || "",

    skills: normalizeArray(data.skills),
    education: data.education || "",
    experience: data.experience || "",
    desiredPosition:
      data.desiredPosition ||
      data.desired_position ||
      "",
    location: data.location || "",
    workPreference:
      data.workPreference ||
      data.work_preference ||
      "",
    about: data.about || "",

    company: data.company || "",
    hiringPosition:
      data.hiringPosition ||
      data.hiring_position ||
      "",
    requiredSkills: normalizeArray(
      data.requiredSkills ||
      data.required_skills
    ),
    experienceRequired:
      data.experienceRequired ||
      data.experience_required ||
      "",
    workType:
      data.workType ||
      data.work_type ||
      "",

    createdAt:
      data.createdAt ||
      data.created_at ||
      new Date().toISOString(),

    updatedAt:
      data.updatedAt ||
      data.updated_at ||
      new Date().toISOString()
  };
}

function saveLocalProfile() {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );
}

/* =========================================================
   BACKEND SYNC
   ========================================================= */

async function syncProfile() {
  const response = await fetch(
    `${API_BASE_URL}/api/profiles`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(profile)
    }
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ||
      "Unable to synchronize profile."
    );
  }

  return result.profile;
}

/* =========================================================
   LOAD PROFILE
   ========================================================= */

function loadProfile() {
  try {
    const saved =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      );

    if (!saved) {
      window.location.href = "index.html";
      return false;
    }

    profile = normalizeProfile(
      JSON.parse(saved)
    );

    if (!profile.id || !profile.role) {
      window.location.href = "index.html";
      return false;
    }

    return true;

  } catch (error) {
    console.error(
      "Profile loading error:",
      error
    );

    window.location.href = "index.html";
    return false;
  }
}

/* =========================================================
   DOM HELPERS
   ========================================================= */

function setText(id, value) {
  const element =
    document.getElementById(id);

  if (element) {
    element.textContent =
      value || "Not added yet";
  }
}

function setValue(id, value) {
  const element =
    document.getElementById(id);

  if (element) {
    element.value = value || "";
  }
}

function show(id, visible) {
  const element =
    document.getElementById(id);

  if (element) {
    element.style.display =
      visible ? "" : "none";
  }
}

/* =========================================================
   PROFILE DISPLAY
   ========================================================= */

function renderProfile() {
  setText("profileName", profile.name);
  setText(
    "profileHeadline",
    profile.headline
  );

  setText(
    "profileRole",
    profile.role === "employer"
      ? "Employer"
      : "Employee"
  );

  setText(
    "profileSkills",
    profile.skills.length
      ? profile.skills.join(", ")
      : ""
  );

  setText(
    "profileEducation",
    profile.education
  );

  setText(
    "profileExperience",
    profile.experience
  );

  setText(
    "profileDesiredPosition",
    profile.desiredPosition
  );

  setText(
    "profileLocation",
    profile.location
  );

  setText(
    "profileWorkPreference",
    profile.workPreference
  );

  setText(
    "profileCompany",
    profile.company
  );

  setText(
    "profileHiringPosition",
    profile.hiringPosition
  );

  setText(
    "profileRequiredSkills",
    profile.requiredSkills.length
      ? profile.requiredSkills.join(", ")
      : ""
  );

  setText(
    "profileExperienceRequired",
    profile.experienceRequired
  );

  setText(
    "profileWorkType",
    profile.workType
  );

  setText(
    "profileAbout",
    profile.about
  );

  updateRoleSections();
  updateCompletion();
}

/* =========================================================
   ROLE SECTIONS
   ========================================================= */

function updateRoleSections() {
  const employee =
    profile.role === "employee";

  const employer =
    profile.role === "employer";

  document
    .querySelectorAll("[data-employee-only]")
    .forEach(element => {
      element.style.display =
        employee ? "" : "none";
    });

  document
    .querySelectorAll("[data-employer-only]")
    .forEach(element => {
      element.style.display =
        employer ? "" : "none";
    });

  setText(
    "profileRoleLabel",
    employee
      ? "Professional"
      : "Hiring"
  );
}

/* =========================================================
   COMPLETION
   ========================================================= */

function updateCompletion() {
  const fields =
    profile.role === "employee"
      ? [
          profile.name,
          profile.headline,
          profile.skills.length,
          profile.education,
          profile.experience,
          profile.desiredPosition,
          profile.location,
          profile.workPreference,
          profile.about
        ]
      : [
          profile.name,
          profile.headline,
          profile.company,
          profile.hiringPosition,
          profile.requiredSkills.length,
          profile.experienceRequired,
          profile.location,
          profile.workType,
          profile.about
        ];

  const completed =
    fields.filter(Boolean).length;

  const total = fields.length;

  const percentage =
    Math.round(
      (completed / total) * 100
    );

  setText(
    "completionNumber",
    `${percentage}%`
  );

  const fill =
    document.getElementById(
      "completionFill"
    );

  if (fill) {
    fill.style.width =
      `${percentage}%`;
  }

  setText(
    "completionText",
    percentage === 100
      ? "Your profile is complete."
      : "Complete your profile to improve matching."
  );

  setText(
    "matchingStatus",
    percentage === 100
      ? "Ready for matching"
      : "Complete your profile for stronger matches"
  );

  const fieldsElement =
    document.getElementById(
      "completionFields"
    );

  if (fieldsElement) {
    fieldsElement.textContent =
      `${completed} of ${total} sections completed`;
  }

  const nextTitle =
    document.getElementById(
      "nextStepTitle"
    );

  const nextText =
    document.getElementById(
      "nextStepText"
    );

  if (percentage === 100) {
    if (nextTitle) {
      nextTitle.textContent =
        "You're ready to match.";
    }

    if (nextText) {
      nextText.textContent =
        "Expo Go can now find relevant people and opportunities for you.";
    }
  } else {
    if (nextTitle) {
      nextTitle.textContent =
        "Complete your profile";
    }

    if (nextText) {
      nextText.textContent =
        "Add the missing details to improve your potential matches.";
    }
  }
}

/* =========================================================
   EDIT MODAL
   ========================================================= */

function openEditModal() {
  setValue(
    "editName",
    profile.name
  );

  setValue(
    "editHeadline",
    profile.headline
  );

  setValue(
    "editSkills",
    profile.skills.join(", ")
  );

  setValue(
    "editEducation",
    profile.education
  );

  setValue(
    "editExperience",
    profile.experience
  );

  setValue(
    "editDesiredPosition",
    profile.desiredPosition
  );

  setValue(
    "editLocation",
    profile.location
  );

  setValue(
    "editWorkPreference",
    profile.workPreference
  );

  setValue(
    "editCompany",
    profile.company
  );

  setValue(
    "editHiringPosition",
    profile.hiringPosition
  );

  setValue(
    "editRequiredSkills",
    profile.requiredSkills.join(", ")
  );

  setValue(
    "editExperienceRequired",
    profile.experienceRequired
  );

  setValue(
    "editEmployerLocation",
    profile.location
  );

  setValue(
    "editWorkType",
    profile.workType
  );

  setValue(
    "editAbout",
    profile.about
  );

  const modal =
    document.getElementById(
      "editModal"
    );

  modal?.classList.add("active");

  document.body.classList.add(
    "modal-open"
  );
}

function closeEditModal() {
  const modal =
    document.getElementById(
      "editModal"
    );

  modal?.classList.remove("active");

  document.body.classList.remove(
    "modal-open"
  );
}

/* =========================================================
   SAVE EDITS
   ========================================================= */

async function saveProfile() {
  profile.name =
    document
      .getElementById("editName")
      ?.value.trim() || "";

  profile.headline =
    document
      .getElementById("editHeadline")
      ?.value.trim() || "";

  profile.skills =
    normalizeArray(
      document
        .getElementById("editSkills")
        ?.value
    );

  profile.education =
    document
      .getElementById("editEducation")
      ?.value.trim() || "";

  profile.experience =
    document
      .getElementById("editExperience")
      ?.value.trim() || "";

  profile.desiredPosition =
    document
      .getElementById(
        "editDesiredPosition"
      )
      ?.value.trim() || "";

  profile.location =
    profile.role === "employer"
      ? document
          .getElementById(
            "editEmployerLocation"
          )
          ?.value.trim() || ""
      : document
          .getElementById(
            "editLocation"
          )
          ?.value.trim() || "";

  profile.workPreference =
    document
      .getElementById(
        "editWorkPreference"
      )
      ?.value.trim() || "";

  profile.company =
    document
      .getElementById("editCompany")
      ?.value.trim() || "";

  profile.hiringPosition =
    document
      .getElementById(
        "editHiringPosition"
      )
      ?.value.trim() || "";

  profile.requiredSkills =
    normalizeArray(
      document
        .getElementById(
          "editRequiredSkills"
        )
        ?.value
    );

  profile.experienceRequired =
    document
      .getElementById(
        "editExperienceRequired"
      )
      ?.value.trim() || "";

  profile.workType =
    document
      .getElementById("editWorkType")
      ?.value.trim() || "";

  profile.about =
    document
      .getElementById("editAbout")
      ?.value.trim() || "";

  profile.updatedAt =
    new Date().toISOString();

  const saveButton =
    document.querySelector(
      ".edit-save-btn"
    );

  const status =
    document.getElementById(
      "editStatus"
    );

  if (saveButton) {
    saveButton.disabled = true;
  }

  if (status) {
    status.textContent =
      "Saving profile...";
    status.className =
      "edit-status";
  }

  try {
    const saved =
      await syncProfile();

    profile = normalizeProfile({
      ...profile,

      id: saved?.id || profile.id,
      createdAt:
        saved?.created_at ||
        profile.createdAt,
      updatedAt:
        saved?.updated_at ||
        profile.updatedAt
    });

    saveLocalProfile();
    renderProfile();

    if (status) {
      status.textContent =
        "Profile saved successfully.";
      status.className =
        "edit-status success";
    }

    setTimeout(
      closeEditModal,
      500
    );

  } catch (error) {
    console.error(
      "Profile synchronization failed:",
      error
    );

    /*
      Local save remains available even
      if Render is temporarily unavailable.
    */
    saveLocalProfile();
    renderProfile();

    if (status) {
      status.textContent =
        "Saved locally. Server sync will retry later.";
      status.className =
        "edit-status error";
    }

  } finally {
    if (saveButton) {
      saveButton.disabled = false;
    }
  }
}

/* =========================================================
   BUTTON EVENTS
   ========================================================= */

document
  .querySelectorAll(
    ".profile-edit-btn, #editProfileBtn"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      openEditModal
    );
  });

document
  .querySelectorAll(
    ".edit-save-btn, #saveProfileBtn"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      saveProfile
    );
  });

document
  .querySelectorAll(
    "[data-close-edit], .edit-modal-close"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      closeEditModal
    );
  });

document
  .getElementById("editModal")
  ?.addEventListener(
    "click",
    event => {
      if (
        event.target.id ===
        "editModal"
      ) {
        closeEditModal();
      }
    }
  );

/* =========================================================
   HOME BUTTON
   ========================================================= */

document
  .querySelectorAll(
    ".profile-home-btn"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        window.location.href =
          "index.html";
      }
    );
  });

/* =========================================================
   NEXT STEP
   ========================================================= */

document
  .getElementById(
    "completeProfileBtn"
  )
  ?.addEventListener(
    "click",
    openEditModal
  );

/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {
    if (event.key === "Escape") {
      closeEditModal();
    }
  }
);

/* =========================================================
   INITIALIZE
   ========================================================= */

if (loadProfile()) {
  renderProfile();
}