const API_BASE_URL = "https://expodo.onrender.com";
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

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent =
      value || "Not added yet";
  }
}

function setValue(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.value = value || "";
  }
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

  const employerLocation =
    document.getElementById(
      "profileLocationEmployer"
    );

  if (employerLocation) {
    employerLocation.textContent =
      profile.location ||
      "Not added yet";
  }

  updateRoleSections();
  updateAvatar();
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
}

/* =========================================================
   AVATAR
========================================================= */

function updateAvatar() {
  const avatar =
    document.getElementById(
      "profileAvatar"
    );

  if (!avatar) return;

  avatar.textContent =
    profile.name
      ? profile.name
          .charAt(0)
          .toUpperCase()
      : "E";
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
    "completionFields",
    `${completed} of ${total} sections completed`
  );

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
   MATCHING
========================================================= */

async function loadMatches() {
  const grid =
    document.getElementById(
      "matchesGrid"
    );

  const empty =
    document.getElementById(
      "matchesEmpty"
    );

  const status =
    document.getElementById(
      "matchesStatus"
    );

  const title =
    document.getElementById(
      "matchesTitle"
    );

  const subtitle =
    document.getElementById(
      "matchesSubtitle"
    );

  if (!grid) return;

  if (title) {
    title.textContent =
      profile.role === "employee"
        ? "Employers matched in your domain"
        : "Profiles matched in your domain";
  }

  if (subtitle) {
    subtitle.textContent =
      profile.role === "employee"
        ? "Relevant employers based on your profile."
        : "Relevant professionals based on your hiring needs.";
  }

  if (status) {
    status.textContent =
      "Finding matches...";
  }

  if (empty) {
    empty.style.display = "";
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profile)
      }
    );

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        "Matching failed."
      );
    }

    renderMatches(
      result.matches || []
    );

    if (status) {
      status.textContent =
        `${result.count || 0} matches`;
    }

  } catch (error) {
    console.error(
      "Matching error:",
      error
    );

    if (status) {
      status.textContent =
        "Matching unavailable";
    }

    if (empty) {
      empty.style.display = "";

      empty.innerHTML = `
        <div class="matches-empty-icon">✦</div>
        <h3>Matches are coming together</h3>
        <p>
          Complete your profile and make sure the
          Expo Go backend is online to discover matches.
        </p>
      `;
    }
  }
}

/* =========================================================
   RENDER MATCHES
========================================================= */

function renderMatches(matches) {
  const grid =
    document.getElementById(
      "matchesGrid"
    );

  const empty =
    document.getElementById(
      "matchesEmpty"
    );

  if (!grid) return;

  if (!matches.length) {
    if (empty) {
      empty.style.display = "";
      empty.innerHTML = `
        <div class="matches-empty-icon">✦</div>
        <h3>No strong matches yet</h3>
        <p>
          Add more skills, experience, location,
          position and work preferences to improve
          your matching results.
        </p>
      `;
    }

    return;
  }

  if (empty) {
    empty.style.display = "none";
  }

  grid
    .querySelectorAll(
      ".match-result-card"
    )
    .forEach(card => card.remove());

  matches.forEach(match => {
    const candidate =
      normalizeProfile(
        match.profile || {}
      );

    const card =
      document.createElement("article");

    card.className =
      "match-result-card";

    const initial =
      candidate.name
        ? candidate.name
            .charAt(0)
            .toUpperCase()
        : "?";

    const title =
      candidate.role === "employer"
        ? candidate.hiringPosition ||
          candidate.headline ||
          "Hiring opportunity"
        : candidate.desiredPosition ||
          candidate.headline ||
          "Professional";

    const company =
      candidate.role === "employer"
        ? candidate.company
        : candidate.name;

    const skills =
      candidate.role === "employer"
        ? candidate.requiredSkills
        : candidate.skills;

    const skillText =
      skills.length
        ? skills.slice(0, 4).join(" · ")
        : "Skills not added";

    const matchedText =
      match.matchedOn?.length
        ? match.matchedOn.join(" · ")
        : "Profile compatibility";

    card.innerHTML = `
      <div class="match-card-top">

        <div class="match-avatar">
          ${initial}
        </div>

        <div class="match-card-identity">

          <span class="match-role">
            ${
              candidate.role === "employer"
                ? "Employer"
                : "Employee"
            }
          </span>

          <h3>
            ${escapeHtml(company || candidate.name)}
          </h3>

          <p>
            ${escapeHtml(title)}
          </p>

        </div>

        <div class="match-score">
          <strong>
            ${Number(match.matchScore) || 0}%
          </strong>

          <span>
            match
          </span>
        </div>

      </div>

      <div class="match-card-details">

        <div class="match-detail">
          <span>Skills</span>
          <strong>
            ${escapeHtml(skillText)}
          </strong>
        </div>

        <div class="match-detail">
          <span>Location</span>
          <strong>
            ${escapeHtml(
              candidate.location ||
              "Flexible"
            )}
          </strong>
        </div>

      </div>

      <div class="match-card-footer">

        <span>
          Matched on ${escapeHtml(matchedText)}
        </span>

      </div>
    `;

    grid.appendChild(card);
  });
}

/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

  document
    .getElementById("editModal")
    ?.classList.add("active");

  document.body.classList.add(
    "modal-open"
  );
}

function closeEditModal() {
  document
    .getElementById("editModal")
    ?.classList.remove("active");

  document.body.classList.remove(
    "modal-open"
  );
}

/* =========================================================
   SAVE PROFILE
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

  saveLocalProfile();

  const button =
    document.getElementById(
      "saveProfileBtn"
    );

  const status =
    document.getElementById(
      "editStatus"
    );

  if (button) {
    button.disabled = true;
    button.textContent =
      "Saving...";
  }

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/profiles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(profile)
        }
      );

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        "Unable to save profile."
      );
    }

    profile =
      normalizeProfile({
        ...profile,
        ...result.profile
      });

    saveLocalProfile();

    renderProfile();

    if (status) {
      status.textContent =
        "Profile saved successfully.";
      status.className =
        "edit-status success";
    }

    await loadMatches();

    setTimeout(
      closeEditModal,
      500
    );

  } catch (error) {
    console.error(
      "Profile save error:",
      error
    );

    saveLocalProfile();

    renderProfile();

    if (status) {
      status.textContent =
        "Saved locally. Server sync unavailable.";
      status.className =
        "edit-status error";
    }

  } finally {
    if (button) {
      button.disabled = false;
      button.textContent =
        "Save profile";
    }
  }
}

/* =========================================================
   BUTTONS
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
   HOME
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

async function initialize() {
  if (!loadProfile()) {
    return;
  }

  renderProfile();

  await loadMatches();
}

initialize();