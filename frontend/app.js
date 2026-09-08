const API_BASE_URL = "https://expodo.onrender.com";
const PROFILE_STORAGE_KEY = "expoGoProfile";

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

function normalizeProfile(profile = {}) {
  return {
    id: profile.id || `expo_${Date.now()}`,

    name: profile.name || "",

    role: profile.role || "",

    headline: profile.headline || "",

    skills: normalizeArray(profile.skills),

    education: profile.education || "",

    experience: profile.experience || "",

    desiredPosition:
      profile.desiredPosition ||
      profile.desired_position ||
      "",

    location: profile.location || "",

    workPreference:
      profile.workPreference ||
      profile.work_preference ||
      "",

    about: profile.about || "",

    company: profile.company || "",

    hiringPosition:
      profile.hiringPosition ||
      profile.hiring_position ||
      "",

    requiredSkills: normalizeArray(
      profile.requiredSkills ||
      profile.required_skills
    ),

    experienceRequired:
      profile.experienceRequired ||
      profile.experience_required ||
      "",

    workType:
      profile.workType ||
      profile.work_type ||
      "",

    createdAt:
      profile.createdAt ||
      profile.created_at ||
      new Date().toISOString(),

    updatedAt:
      profile.updatedAt ||
      profile.updated_at ||
      new Date().toISOString()
  };
}

function getStoredProfile() {
  try {
    const saved =
      localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!saved) {
      return null;
    }

    return normalizeProfile(
      JSON.parse(saved)
    );

  } catch (error) {

    console.error(
      "Unable to read stored profile:",
      error
    );

    return null;
  }
}

function saveLocalProfile(profile) {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(
      normalizeProfile(profile)
    )
  );
}

/* =========================================================
   BACKEND
========================================================= */

async function saveProfileToBackend(profile) {

  const normalized =
    normalizeProfile(profile);

  const response = await fetch(
    `${API_BASE_URL}/api/profiles`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(normalized)
    }
  );

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (
    !response.ok ||
    !result?.success
  ) {
    throw new Error(
      result?.message ||
      "Unable to save profile."
    );
  }

  return result.profile;
}

/* =========================================================
   ELEMENTS
========================================================= */

const authModal =
  document.getElementById("authModal");

const authForm =
  document.getElementById("authForm");

const authStatus =
  document.getElementById("authStatus");

const employeeBtn =
  document.getElementById("employeeBtn");

const employerBtn =
  document.getElementById("employerBtn");

const createProfileBtn =
  document.getElementById(
    "createProfileBtn"
  );

const continueProfileBtn =
  document.getElementById(
    "continueProfileBtn"
  );

const fullNameInput =
  document.getElementById("fullName");

const profileHeadlineInput =
  document.getElementById(
    "profileHeadline"
  );

const profilePreviewName =
  document.getElementById(
    "profilePreviewName"
  );

const profilePreviewHeadline =
  document.getElementById(
    "profilePreviewHeadline"
  );

const roleOptions =
  document.querySelectorAll(
    ".role-option"
  );

const bottomJoinBtn =
  document.getElementById(
    "bottomJoinBtn"
  );

const mobileMenuBtn =
  document.getElementById(
    "mobileMenuBtn"
  );

const mobileNav =
  document.getElementById(
    "mobileNav"
  );

const mobileHowLink =
  document.getElementById(
    "mobileHowLink"
  );

const mobileLoginBtn =
  document.getElementById(
    "mobileLoginBtn"
  );

const mobileJoinBtn =
  document.getElementById(
    "mobileJoinBtn"
  );

const closeModalBtn =
  document.getElementById(
    "closeModal"
  );

const modalBackdrop =
  document.getElementById(
    "modalBackdrop"
  );

/* =========================================================
   STATE
========================================================= */

let selectedRole = null;
let profileCreationInProgress = false;

/* =========================================================
   MODAL
========================================================= */

function openCreateModal(role = null) {

  if (!authModal) {
    return;
  }

  resetCreateView();

  authModal.classList.add("active");

  authModal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "modal-open"
  );

  if (role) {
    selectRole(role);
  }

  setTimeout(() => {
    fullNameInput?.focus();
  }, 150);
}

function closeCreateModal() {

  if (!authModal) {
    return;
  }

  authModal.classList.remove(
    "active"
  );

  authModal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "modal-open"
  );
}

function resetCreateView() {

  selectedRole = null;

  profileCreationInProgress = false;

  if (fullNameInput) {
    fullNameInput.value = "";
  }

  if (profileHeadlineInput) {
    profileHeadlineInput.value = "";
  }

  if (authStatus) {
    authStatus.textContent = "";
    authStatus.className =
      "auth-status";
  }

  roleOptions.forEach(option => {

    option.classList.remove(
      "selected",
      "active"
    );

  });

  if (createProfileBtn) {
    createProfileBtn.disabled = false;
  }

  if (continueProfileBtn) {
    continueProfileBtn.disabled = false;
  }

  updatePreview();
}

/* =========================================================
   ROLE SELECTION
========================================================= */

function selectRole(role) {

  if (
    !["employee", "employer"]
      .includes(role)
  ) {
    return;
  }

  selectedRole = role;

  roleOptions.forEach(option => {

    const active =
      option.dataset.role === role;

    option.classList.toggle(
      "selected",
      active
    );

    option.classList.toggle(
      "active",
      active
    );

  });

  updatePreview();
}

roleOptions.forEach(option => {

  option.addEventListener(
    "click",
    event => {

      event.preventDefault();

      selectRole(
        option.dataset.role
      );

    }
  );

});

/* =========================================================
   PREVIEW
========================================================= */

function updatePreview() {

  const name =
    fullNameInput?.value.trim() ||
    "Your name";

  const headline =
    profileHeadlineInput?.value.trim() ||
    (
      selectedRole === "employer"
        ? "Your hiring profile"
        : "Your professional profile"
    );

  if (profilePreviewName) {
    profilePreviewName.textContent =
      name;
  }

  if (profilePreviewHeadline) {
    profilePreviewHeadline.textContent =
      headline;
  }
}

fullNameInput?.addEventListener(
  "input",
  updatePreview
);

profileHeadlineInput?.addEventListener(
  "input",
  updatePreview
);

/* =========================================================
   CREATE PROFILE
========================================================= */

async function createProfile(event) {

  /*
    CRITICAL FIX:
    Stop ALL native browser form submission.

    This prevents:
    ?fullName=...
    from appearing in the URL.
  */

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (profileCreationInProgress) {
    return;
  }

  const name =
    fullNameInput?.value.trim() ||
    "";

  const headline =
    profileHeadlineInput?.value.trim() ||
    "";

  if (!selectedRole) {

    if (authStatus) {

      authStatus.textContent =
        "Please select Employee or Employer.";

      authStatus.className =
        "auth-status error";
    }

    return;
  }

  if (!name) {

    if (authStatus) {

      authStatus.textContent =
        "Please enter your name.";

      authStatus.className =
        "auth-status error";
    }

    fullNameInput?.focus();

    return;
  }

  if (!headline) {

    if (authStatus) {

      authStatus.textContent =
        "Please enter what you do.";

      authStatus.className =
        "auth-status error";
    }

    profileHeadlineInput?.focus();

    return;
  }

  profileCreationInProgress = true;

  const existingProfile =
    getStoredProfile();

  const profile =
    normalizeProfile({

      ...(existingProfile || {}),

      id:
        existingProfile?.id ||
        `expo_${Date.now()}`,

      name,

      role: selectedRole,

      headline,

      createdAt:
        existingProfile?.createdAt ||
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()

    });

  if (createProfileBtn) {
    createProfileBtn.disabled = true;
  }

  if (continueProfileBtn) {
    continueProfileBtn.disabled = true;
  }

  if (authStatus) {

    authStatus.textContent =
      "Creating your Expo Go profile...";

    authStatus.className =
      "auth-status";
  }

  /*
    SAVE LOCALLY FIRST
  */

  saveLocalProfile(profile);

  try {

    /*
      SAVE TO RENDER / SUPABASE
    */

    const savedProfile =
      await saveProfileToBackend(
        profile
      );

    /*
      NORMALIZE BACKEND RESPONSE
    */

    const frontendProfile =
      normalizeProfile({

        ...profile,

        id:
          savedProfile?.id ||
          profile.id,

        name:
          savedProfile?.name ||
          profile.name,

        role:
          savedProfile?.role ||
          profile.role,

        headline:
          savedProfile?.headline ||
          profile.headline,

        skills:
          savedProfile?.skills ||
          profile.skills,

        education:
          savedProfile?.education ||
          profile.education,

        experience:
          savedProfile?.experience ||
          profile.experience,

        desiredPosition:
          savedProfile?.desired_position ||
          profile.desiredPosition,

        location:
          savedProfile?.location ||
          profile.location,

        workPreference:
          savedProfile?.work_preference ||
          profile.workPreference,

        about:
          savedProfile?.about ||
          profile.about,

        company:
          savedProfile?.company ||
          profile.company,

        hiringPosition:
          savedProfile?.hiring_position ||
          profile.hiringPosition,

        requiredSkills:
          savedProfile?.required_skills ||
          profile.requiredSkills,

        experienceRequired:
          savedProfile?.experience_required ||
          profile.experienceRequired,

        workType:
          savedProfile?.work_type ||
          profile.workType,

        createdAt:
          savedProfile?.created_at ||
          profile.createdAt,

        updatedAt:
          savedProfile?.updated_at ||
          profile.updatedAt

      });

    saveLocalProfile(
      frontendProfile
    );

    if (authStatus) {

      authStatus.textContent =
        "Profile created successfully.";

      authStatus.className =
        "auth-status success";
    }

    /*
      DIRECT PROFILE PAGE

      IMPORTANT:
      No query parameters.
      No form submission.
    */

    setTimeout(() => {

      window.location.href =
        "/profile.html";

    }, 250);

  } catch (error) {

    console.error(
      "Backend profile save failed:",
      error
    );

    /*
      LOCAL PROFILE IS ALREADY SAVED.
      Allow the user to continue anyway.
    */

    saveLocalProfile(profile);

    if (authStatus) {

      authStatus.textContent =
        "Profile saved. Opening your profile...";

      authStatus.className =
        "auth-status success";
    }

    setTimeout(() => {

      window.location.href =
        "/profile.html";

    }, 500);
  }
}

/* =========================================================
   IMPORTANT FORM PROTECTION
========================================================= */

/*
  Catch the form's submit event directly.

  This is the main protection against:
  /?fullName=...
*/

authForm?.addEventListener(
  "submit",
  createProfile
);

/*
  Also connect the Create My Profile button
  directly.
*/

createProfileBtn?.addEventListener(
  "click",
  createProfile
);

/*
  Keep the Continue button working too.
*/

continueProfileBtn?.addEventListener(
  "click",
  createProfile
);

/* =========================================================
   MAIN BUTTONS
========================================================= */

employeeBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    openCreateModal("employee");

  }
);

employerBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    openCreateModal("employer");

  }
);

bottomJoinBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    openCreateModal();

  }
);

/* =========================================================
   LOGIN
========================================================= */

function handleLogin() {

  const existingProfile =
    getStoredProfile();

  if (existingProfile) {

    window.location.href =
      "/profile.html";

    return;
  }

  openCreateModal();
}

const loginBtn =
  document.getElementById(
    "loginBtn"
  );

loginBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    handleLogin();

  }
);

mobileLoginBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    closeMobileMenu();

    handleLogin();

  }
);

/* =========================================================
   MOBILE MENU
========================================================= */

function closeMobileMenu() {

  if (!mobileNav) {
    return;
  }

  mobileNav.classList.remove(
    "active"
  );

  mobileMenuBtn?.classList.remove(
    "active"
  );
}

mobileMenuBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    mobileNav?.classList.toggle(
      "active"
    );

    mobileMenuBtn.classList.toggle(
      "active"
    );

  }
);

mobileHowLink?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    closeMobileMenu();

    document
      .getElementById(
        "how-it-works"
      )
      ?.scrollIntoView({
        behavior: "smooth"
      });

  }
);

mobileJoinBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    closeMobileMenu();

    openCreateModal();

  }
);

/* =========================================================
   MODAL CLOSE
========================================================= */

closeModalBtn?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    closeCreateModal();

  }
);

modalBackdrop?.addEventListener(
  "click",
  event => {

    event.preventDefault();

    closeCreateModal();

  }
);

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closeCreateModal();

      closeMobileMenu();

    }

  }
);

/* =========================================================
   GENERIC MODAL CLOSE BUTTONS
========================================================= */

document
  .querySelectorAll(
    "[data-close-modal]"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();

        closeCreateModal();

      }
    );

  });

/* =========================================================
   SMOOTH SCROLL
========================================================= */

document
  .querySelectorAll(
    'a[href^="#"]'
  )
  .forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const targetId =
          link.getAttribute(
            "href"
          );

        if (
          !targetId ||
          targetId === "#"
        ) {
          return;
        }

        const target =
          document.querySelector(
            targetId
          );

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        closeMobileMenu();

      }
    );

  });

/* =========================================================
   MATCH VISUAL
========================================================= */

const matchVisual =
  document.querySelector(
    ".match-visual"
  );

if (matchVisual) {

  matchVisual.addEventListener(
    "mouseenter",
    () => {

      matchVisual.classList.add(
        "is-active"
      );

    }
  );

  matchVisual.addEventListener(
    "mouseleave",
    () => {

      matchVisual.classList.remove(
        "is-active"
      );

    }
  );

}

/* =========================================================
   INITIAL PREVIEW
========================================================= */

updatePreview();