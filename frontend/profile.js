/* =========================================================
   EXPO GO — PROFILE CONTROLLER
   Supabase Auth + Render Backend + Persistent Profile
========================================================= */

const API_BASE_URL = "https://expodo.onrender.com";
const PROFILE_STORAGE_KEY = "expoGoProfile";

const SUPABASE_URL =
  "https://inhxlwsjlddhnpalbocl.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_g3o2x8l0tr3hHpqndi-wLg_zfYfFaXb";

let supabaseClient = null;
let profile = null;
let currentAuthUser = null;

/* =========================================================
   SUPABASE
========================================================= */

function initializeSupabase() {
  if (!window.supabase) {
    console.error(
      "Supabase library is not loaded."
    );
    return false;
  }

  try {
    supabaseClient =
      window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

    return true;

  } catch (error) {
    console.error(
      "Supabase initialization error:",
      error
    );

    return false;
  }
}

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
    id:
      data.id || "",

    authUserId:
      data.authUserId ||
      data.auth_user_id ||
      currentAuthUser?.id ||
      "",

    name:
      data.name || "",

    role:
      data.role || "",

    headline:
      data.headline || "",

    skills:
      normalizeArray(data.skills),

    education:
      data.education || "",

    experience:
      data.experience || "",

    desiredPosition:
      data.desiredPosition ||
      data.desired_position ||
      "",

    location:
      data.location || "",

    workPreference:
      data.workPreference ||
      data.work_preference ||
      "",

    about:
      data.about || "",

    company:
      data.company || "",

    hiringPosition:
      data.hiringPosition ||
      data.hiring_position ||
      "",

    requiredSkills:
      normalizeArray(
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
  if (!profile) return;

  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );
}

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

/* =========================================================
   AUTH
========================================================= */

async function getAuthenticatedUser() {
  if (!supabaseClient) {
    return null;
  }

  try {
    const {
      data,
      error
    } =
      await supabaseClient.auth.getUser();

    if (error) {
      console.error(
        "Auth user error:",
        error
      );

      return null;
    }

    return data?.user || null;

  } catch (error) {
    console.error(
      "Auth lookup error:",
      error
    );

    return null;
  }
}

/* =========================================================
   BACKEND PROFILE
========================================================= */

async function fetchServerProfile(userId) {
  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/profiles/me/${userId}`
      );

    let result = {};

    try {
      result = await response.json();
    } catch (_) {
      result = {};
    }

    if (
      response.ok &&
      result.success &&
      result.profile
    ) {
      return result.profile;
    }

    return null;

  } catch (error) {
    console.warn(
      "Backend profile lookup unavailable.",
      error
    );

    return null;
  }
}

/* =========================================================
   SYNC PROFILE TO BACKEND
========================================================= */

async function syncProfileToBackend() {
  if (!profile || !currentAuthUser) {
    return false;
  }

  const payload = {
    ...profile,

    id:
      profile.id ||
      currentAuthUser.id,

    authUserId:
      currentAuthUser.id,

    auth_user_id:
      currentAuthUser.id
  };

  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/profiles`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify(payload)
        }
      );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
        "Profile sync failed."
      );
    }

    if (result.profile) {
      profile =
        normalizeProfile({
          ...profile,
          ...result.profile,

          authUserId:
            currentAuthUser.id
        });

      saveLocalProfile();
    }

    return true;

  } catch (error) {
    console.error(
      "Profile sync error:",
      error
    );

    return false;
  }
}

/* =========================================================
   LOAD PROFILE
========================================================= */

async function loadProfile() {
  try {
    /*
      1. Get authenticated Supabase user.
    */

    currentAuthUser =
      await getAuthenticatedUser();

    /*
      A profile page should belong to
      an authenticated account.
    */

    if (!currentAuthUser) {
      console.warn(
        "No authenticated user."
      );

      window.location.href =
        "index.html";

      return false;
    }

    /*
      2. Read local profile.
    */

    let localProfile = null;

    const saved =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      );

    if (saved) {
      try {
        localProfile =
          normalizeProfile(
            JSON.parse(saved)
          );
      } catch (error) {
        console.warn(
          "Invalid local profile.",
          error
        );
      }
    }

    /*
      3. Backend is authoritative.
    */

    const serverProfile =
      await fetchServerProfile(
        currentAuthUser.id
      );

    if (serverProfile) {
      profile =
        normalizeProfile({
          ...serverProfile,

          authUserId:
            currentAuthUser.id
        });

      saveLocalProfile();

      return true;
    }

    /*
      4. Backend profile missing.
      Recover local profile.
    */

    if (
      localProfile &&
      localProfile.role
    ) {
      profile =
        normalizeProfile({
          ...localProfile,

          authUserId:
            currentAuthUser.id
        });

      saveLocalProfile();

      /*
        Recreate backend profile.
      */

      await syncProfileToBackend();

      return true;
    }

    /*
      5. No backend or local profile.
      Build a minimal profile from
      Supabase metadata.
    */

    const metadata =
      currentAuthUser.user_metadata ||
      {};

    const role =
      metadata.role || "";

    if (role) {
      profile =
        normalizeProfile({
          id:
            currentAuthUser.id,

          authUserId:
            currentAuthUser.id,

          name:
            metadata.name ||
            currentAuthUser.email ||
            "",

          role,

          headline:
            metadata.headline ||
            ""
        });

      saveLocalProfile();

      await syncProfileToBackend();

      return true;
    }

    /*
      Truly no profile information.
      Only now return home.
    */

    window.location.href =
      "index.html";

    return false;

  } catch (error) {
    console.error(
      "Profile loading error:",
      error
    );

    /*
      Last-resort local recovery.
      Never send an authenticated user
      into profile creation.
    */

    const saved =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      );

    if (saved && currentAuthUser) {
      try {
        profile =
          normalizeProfile(
            JSON.parse(saved)
          );

        profile.authUserId =
          currentAuthUser.id;

        saveLocalProfile();

        return !!profile.role;

      } catch (_) {}
    }

    window.location.href =
      "index.html";

    return false;
  }
}

/* =========================================================
   PROFILE DISPLAY
========================================================= */

function renderProfile() {
  setText(
    "profileName",
    profile.name
  );

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
    .querySelectorAll(
      "[data-employee-only]"
    )
    .forEach(element => {
      element.style.display =
        employee ? "" : "none";
    });

  document
    .querySelectorAll(
      "[data-employer-only]"
    )
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

  const total =
    fields.length;

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

  if (!grid || !profile) {
    return;
  }

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
    const response =
      await fetch(
        `${API_BASE_URL}/api/match`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify(profile)
        }
      );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
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
    empty.style.display =
      "none";
  }

  grid
    .querySelectorAll(
      ".match-result-card"
    )
    .forEach(card =>
      card.remove()
    );

  matches.forEach(match => {
    const candidate =
      normalizeProfile(
        match.profile || {}
      );

    const card =
      document.createElement(
        "article"
      );

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
        ? skills
            .slice(0, 4)
            .join(" · ")
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
            ${escapeHtml(
              company ||
              candidate.name
            )}
          </h3>

          <p>
            ${escapeHtml(title)}
          </p>

        </div>

        <div class="match-score">
          <strong>
            ${Number(
              match.matchScore
            ) || 0}%
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
            ${escapeHtml(
              skillText
            )}
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
          Matched on
          ${escapeHtml(
            matchedText
          )}
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
  if (!profile) return;

  setValue("editName", profile.name);
  setValue("editHeadline", profile.headline);
  setValue("editSkills", profile.skills.join(", "));
  setValue("editEducation", profile.education);
  setValue("editExperience", profile.experience);
  setValue(
    "editDesiredPosition",
    profile.desiredPosition
  );
  setValue("editLocation", profile.location);
  setValue(
    "editWorkPreference",
    profile.workPreference
  );
  setValue("editCompany", profile.company);
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
  setValue("editWorkType", profile.workType);
  setValue("editAbout", profile.about);

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
  if (!profile) return;

  currentAuthUser =
    await getAuthenticatedUser();

  if (!currentAuthUser) {
    const status =
      document.getElementById(
        "editStatus"
      );

    if (status) {
      status.textContent =
        "Your session has expired. Please log in again.";

      status.className =
        "edit-status error";
    }

    return;
  }

  profile.authUserId =
    currentAuthUser.id;

  profile.id =
    profile.id ||
    currentAuthUser.id;

  profile.name =
    document.getElementById(
      "editName"
    )?.value.trim() || "";

  profile.headline =
    document.getElementById(
      "editHeadline"
    )?.value.trim() || "";

  profile.skills =
    normalizeArray(
      document.getElementById(
        "editSkills"
      )?.value
    );

  profile.education =
    document.getElementById(
      "editEducation"
    )?.value.trim() || "";

  profile.experience =
    document.getElementById(
      "editExperience"
    )?.value.trim() || "";

  profile.desiredPosition =
    document.getElementById(
      "editDesiredPosition"
    )?.value.trim() || "";

  profile.location =
    profile.role === "employer"
      ? document.getElementById(
          "editEmployerLocation"
        )?.value.trim() || ""
      : document.getElementById(
          "editLocation"
        )?.value.trim() || "";

  profile.workPreference =
    document.getElementById(
      "editWorkPreference"
    )?.value.trim() || "";

  profile.company =
    document.getElementById(
      "editCompany"
    )?.value.trim() || "";

  profile.hiringPosition =
    document.getElementById(
      "editHiringPosition"
    )?.value.trim() || "";

  profile.requiredSkills =
    normalizeArray(
      document.getElementById(
        "editRequiredSkills"
      )?.value
    );

  profile.experienceRequired =
    document.getElementById(
      "editExperienceRequired"
    )?.value.trim() || "";

  profile.workType =
    document.getElementById(
      "editWorkType"
    )?.value.trim() || "";

  profile.about =
    document.getElementById(
      "editAbout"
    )?.value.trim() || "";

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
    const synced =
      await syncProfileToBackend();

    if (!synced) {
      throw new Error(
        "Server sync failed."
      );
    }

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

    /*
      Local profile remains saved.
    */

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
  initializeSupabase();

  const loaded =
    await loadProfile();

  if (!loaded) {
    return;
  }

  renderProfile();

  await loadMatches();

  console.log(
    "Expo Go profile is ready."
  );
}

initialize();

/* =========================================================
   CONNECTIONS SYSTEM
========================================================= */

let connections = [];
let connectionProfiles = {};


/* =========================================================
   LOAD CONNECTIONS
========================================================= */

async function loadConnections() {
  if (!supabaseClient || !currentAuthUser) {
    return;
  }

  const incomingContainer =
    document.getElementById("incomingConnections");

  const acceptedContainer =
    document.getElementById("acceptedConnections");

  if (!incomingContainer || !acceptedContainer) {
    return;
  }

  try {
    const userId = currentAuthUser.id;

    const { data, error } =
      await supabaseClient
        .from("connections")
        .select("*")
        .or(
          `requester_id.eq.${userId},recipient_id.eq.${userId}`
        )
        .order(
          "created_at",
          { ascending: false }
        );

    if (error) {
      throw error;
    }

    connections = data || [];

    await loadConnectionProfiles();

    renderConnections();

    /*
      Refresh match buttons so their state reflects
      the latest connection information.
    */

    await loadMatches();

  } catch (error) {
    console.error(
      "Connections loading error:",
      error
    );
  }
}


/* =========================================================
   LOAD PROFILES FOR CONNECTIONS
========================================================= */

async function loadConnectionProfiles() {
  connectionProfiles = {};

  const ids = new Set();

  connections.forEach(connection => {

    if (
      connection.requester_id &&
      connection.requester_id !== currentAuthUser.id
    ) {
      ids.add(connection.requester_id);
    }

    if (
      connection.recipient_id &&
      connection.recipient_id !== currentAuthUser.id
    ) {
      ids.add(connection.recipient_id);
    }

  });

  /*
    The connection table stores Supabase auth UUIDs.
    Our backend profile endpoint accepts authUserId.
  */

  for (const id of ids) {

    try {

      const response =
        await fetch(
          `${API_BASE_URL}/api/profiles/me/${id}`
        );

      if (!response.ok) {
        continue;
      }

      const result =
        await response.json();

      if (
        result.success &&
        result.profile
      ) {
        connectionProfiles[id] =
          normalizeProfile({
            ...result.profile,
            authUserId: id
          });
      }

    } catch (error) {

      console.warn(
        "Connection profile lookup failed:",
        id,
        error
      );

    }

  }
}


/* =========================================================
   GET OTHER USER
========================================================= */

function getConnectionOtherUser(connection) {

  if (!currentAuthUser) {
    return "";
  }

  return connection.requester_id === currentAuthUser.id
    ? connection.recipient_id
    : connection.requester_id;
}


/* =========================================================
   FIND CONNECTION WITH USER
========================================================= */

function getConnectionWithUser(userId) {

  return connections.find(
    connection =>
      (
        connection.requester_id === currentAuthUser.id &&
        connection.recipient_id === userId
      )
      ||
      (
        connection.requester_id === userId &&
        connection.recipient_id === currentAuthUser.id
      )
  ) || null;
}


/* =========================================================
   CONNECTION STATE
========================================================= */

function getConnectionState(userId) {

  const connection =
    getConnectionWithUser(userId);

  if (!connection) {
    return "none";
  }

  if (
    connection.status === "accepted"
  ) {
    return "accepted";
  }

  if (
    connection.status === "pending"
  ) {

    if (
      connection.requester_id ===
      currentAuthUser.id
    ) {
      return "sent";
    }

    return "incoming";
  }

  return "none";
}


/* =========================================================
   SEND CONNECTION REQUEST
========================================================= */

async function sendConnectionRequest(
  recipientId,
  button = null
) {

  if (
    !supabaseClient ||
    !currentAuthUser ||
    !recipientId
  ) {
    return;
  }

  if (
    recipientId === currentAuthUser.id
  ) {
    return;
  }

  const existing =
    getConnectionWithUser(
      recipientId
    );

  if (existing) {

    if (
      existing.status === "accepted"
    ) {
      return;
    }

    if (
      existing.status === "pending"
    ) {

      /*
        If the other person already requested us,
        do not create a reverse request.
      */

      if (
        existing.recipient_id ===
        currentAuthUser.id
      ) {

        await updateConnectionStatus(
          existing.id,
          "accepted"
        );

      }

      return;
    }

  }

  if (button) {
    button.disabled = true;
    button.textContent = "Sending...";
  }

  try {

    const { data, error } =
      await supabaseClient
        .from("connections")
        .insert({
          requester_id:
            currentAuthUser.id,

          recipient_id:
            recipientId,

          status:
            "pending"
        })
        .select()
        .single();

    if (error) {
      throw error;
    }

    connections.unshift(data);

    await loadConnectionProfiles();

    renderConnections();

    await loadMatches();

  } catch (error) {

    console.error(
      "Connection request error:",
      error
    );

    if (button) {
      button.disabled = false;
      button.textContent = "Connect";
    }

    alert(
      error.message ||
      "Unable to send connection request."
    );

  }
}


/* =========================================================
   ACCEPT / DECLINE
========================================================= */

async function updateConnectionStatus(
  connectionId,
  status
) {

  if (
    !supabaseClient ||
    !currentAuthUser
  ) {
    return;
  }

  try {

    const { data, error } =
      await supabaseClient
        .from("connections")
        .update({
          status
        })
        .eq(
          "id",
          connectionId
        )
        .eq(
          "recipient_id",
          currentAuthUser.id
        )
        .select()
        .single();

    if (error) {
      throw error;
    }

    const index =
      connections.findIndex(
        connection =>
          connection.id ===
          connectionId
      );

    if (index !== -1) {
      connections[index] = data;
    }

    await loadConnectionProfiles();

    renderConnections();

    await loadMatches();

  } catch (error) {

    console.error(
      "Connection status update error:",
      error
    );

    alert(
      error.message ||
      "Unable to update connection."
    );

  }
}


/* =========================================================
   RENDER CONNECTIONS
========================================================= */

function renderConnections() {

  const incomingContainer =
    document.getElementById(
      "incomingConnections"
    );

  const acceptedContainer =
    document.getElementById(
      "acceptedConnections"
    );

  if (
    !incomingContainer ||
    !acceptedContainer
  ) {
    return;
  }

  const incoming =
    connections.filter(
      connection =>
        connection.recipient_id ===
        currentAuthUser.id &&
        connection.status === "pending"
    );

  const accepted =
    connections.filter(
      connection =>
        connection.status === "accepted"
    );

  const countElement =
    document.getElementById(
      "connectionsCount"
    );

  const pendingElement =
    document.getElementById(
      "pendingCount"
    );

  if (countElement) {
    countElement.textContent =
      `${accepted.length} ${
        accepted.length === 1
          ? "connection"
          : "connections"
      }`;
  }

  if (pendingElement) {
    pendingElement.textContent =
      incoming.length;
  }

  /*
    Incoming
  */

  if (!incoming.length) {

    incomingContainer.innerHTML = `
      <div class="connections-empty">

        <div class="connections-empty-icon">
          ◎
        </div>

        <strong>
          No pending requests
        </strong>

        <p>
          New connection requests will appear here.
        </p>

      </div>
    `;

  } else {

    incomingContainer.innerHTML =
      incoming
        .map(connection =>
          renderIncomingConnection(
            connection
          )
        )
        .join("");

  }


  /*
    Accepted
  */

  if (!accepted.length) {

    acceptedContainer.innerHTML = `
      <div class="connections-empty">

        <div class="connections-empty-icon">
          ✦
        </div>

        <strong>
          Your network is empty
        </strong>

        <p>
          Connect with relevant people from your matches.
        </p>

      </div>
    `;

  } else {

    acceptedContainer.innerHTML =
      accepted
        .map(connection =>
          renderAcceptedConnection(
            connection
          )
        )
        .join("");

  }


  bindConnectionButtons();
}


/* =========================================================
   INCOMING CARD
========================================================= */

function renderIncomingConnection(
  connection
) {

  const userId =
    connection.requester_id;

  const person =
    connectionProfiles[userId] ||
    {};

  const name =
    person.name ||
    "Expo Go member";

  const role =
    person.role === "employer"
      ? "Employer"
      : "Employee";

  const headline =
    person.headline ||
    person.desiredPosition ||
    person.hiringPosition ||
    "Professional profile";

  const initial =
    name
      .charAt(0)
      .toUpperCase();

  return `
    <article
      class="connection-card"
    >

      <div class="connection-card-top">

        <div class="connection-avatar">
          ${escapeHtml(initial)}
        </div>

        <div class="connection-identity">

          <strong>
            ${escapeHtml(name)}
          </strong>

          <span>
            ${escapeHtml(role)} ·
            ${escapeHtml(headline)}
          </span>

        </div>

      </div>

      <div class="connection-actions">

        <button
          type="button"
          class="connection-btn connection-btn-primary"
          data-connection-action="accept"
          data-connection-id="${connection.id}"
        >
          Accept
        </button>

        <button
          type="button"
          class="connection-btn connection-btn-danger"
          data-connection-action="decline"
          data-connection-id="${connection.id}"
        >
          Decline
        </button>

      </div>

    </article>
  `;
}


/* =========================================================
   ACCEPTED CARD
========================================================= */

function renderAcceptedConnection(
  connection
) {

  const userId =
    getConnectionOtherUser(
      connection
    );

  const person =
    connectionProfiles[userId] ||
    {};

  const name =
    person.name ||
    "Expo Go member";

  const role =
    person.role === "employer"
      ? "Employer"
      : "Employee";

  const headline =
    person.headline ||
    person.desiredPosition ||
    person.hiringPosition ||
    "Professional profile";

  const initial =
    name
      .charAt(0)
      .toUpperCase();

  return `
    <article
      class="connection-card"
    >

      <div class="connection-card-top">

        <div class="connection-avatar">
          ${escapeHtml(initial)}
        </div>

        <div class="connection-identity">

          <strong>
            ${escapeHtml(name)}
          </strong>

          <span>
            ${escapeHtml(role)} ·
            ${escapeHtml(headline)}
          </span>

        </div>

      </div>

      <div class="connection-status">

        <span class="connection-status-dot"></span>

        Connected

      </div>

    </article>
  `;
}


/* =========================================================
   CONNECTION BUTTON EVENTS
========================================================= */

function bindConnectionButtons() {

  document
    .querySelectorAll(
      "[data-connection-action]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const action =
            button.dataset.connectionAction;

          const connectionId =
            button.dataset.connectionId;

          if (
            action === "accept"
          ) {

            button.disabled = true;
            button.textContent =
              "Accepting...";

            await updateConnectionStatus(
              connectionId,
              "accepted"
            );

          }

          if (
            action === "decline"
          ) {

            button.disabled = true;
            button.textContent =
              "Declining...";

            await updateConnectionStatus(
              connectionId,
              "declined"
            );

          }

        }
      );

    });
}


/* =========================================================
   MATCH CONNECTION BUTTON
========================================================= */

function getMatchAuthUserId(match) {

  const candidate =
    match?.profile || {};

  return (
    candidate.authUserId ||
    candidate.auth_user_id ||
    ""
  );
}


function createMatchConnectionButton(
  recipientId
) {

  const state =
    getConnectionState(
      recipientId
    );

  if (state === "accepted") {

    return `
      <button
        type="button"
        class="match-connection-action connected"
        disabled
      >
        Connected
      </button>
    `;
  }

  if (state === "sent") {

    return `
      <button
        type="button"
        class="match-connection-action pending"
        disabled
      >
        Request sent
      </button>
    `;
  }

  if (state === "incoming") {

    const connection =
      getConnectionWithUser(
        recipientId
      );

    return `
      <button
        type="button"
        class="match-connection-action respond"
        data-match-accept="${connection?.id || ""}"
      >
        Accept request
      </button>
    `;
  }

  return `
    <button
      type="button"
      class="match-connection-action"
      data-match-connect="${recipientId}"
    >
      Connect
    </button>
  `;
}


/* =========================================================
   MATCH CONNECTION EVENTS
========================================================= */

function bindMatchConnectionButtons() {

  document
    .querySelectorAll(
      "[data-match-connect]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const recipientId =
            button.dataset.matchConnect;

          await sendConnectionRequest(
            recipientId,
            button
          );

        }
      );

    });


  document
    .querySelectorAll(
      "[data-match-accept]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        async () => {

          const connectionId =
            button.dataset.matchAccept;

          button.disabled = true;
          button.textContent =
            "Accepting...";

          await updateConnectionStatus(
            connectionId,
            "accepted"
          );

        }
      );

    });

}


/* =========================================================
   REPLACE MATCH RENDERER CONNECTION ACTION
========================================================= */

const originalRenderMatches =
  renderMatches;

renderMatches = function(matches) {

  const grid =
    document.getElementById(
      "matchesGrid"
    );

  if (!grid) {
    return;
  }

  /*
    Use the original renderer first.
  */

  originalRenderMatches(matches);

  /*
    Add connection buttons to the cards.
  */

  const cards =
    grid.querySelectorAll(
      ".match-result-card"
    );

  matches.forEach(
    (match, index) => {

      const card =
        cards[index];

      if (!card) {
        return;
      }

      const recipientId =
        getMatchAuthUserId(
          match
        );

      if (!recipientId) {
        return;
      }

      /*
        Avoid adding duplicate buttons.
      */

      if (
        card.querySelector(
          ".match-connection-action"
        )
      ) {
        return;
      }

      card.insertAdjacentHTML(
        "beforeend",
        createMatchConnectionButton(
          recipientId
        )
      );

    }
  );

  bindMatchConnectionButtons();
};


/* =========================================================
   CONNECTIONS INITIALIZATION
========================================================= */

async function initializeConnections() {

  if (
    !supabaseClient ||
    !currentAuthUser
  ) {
    return;
  }

  await loadConnections();

  console.log(
    "Expo Go connections are ready."
  );
}


/*
  Start connections after the existing
  profile initialization has completed.
*/

setTimeout(
  initializeConnections,
  0
);