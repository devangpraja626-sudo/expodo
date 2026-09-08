const API_BASE_URL = "https://expo-5ths.onrender.com";
const PROFILE_STORAGE_KEY = "expoGoProfile";

/* =========================================================
   HELPERS
   ========================================================= */

function getStoredProfile() {
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    return saved ? normalizeProfile(JSON.parse(saved)) : null;
  } catch (error) {
    console.error("Unable to read stored profile:", error);
    return null;
  }
}

function saveLocalProfile(profile) {
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(normalizeProfile(profile))
  );
}

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
    desiredPosition: profile.desiredPosition || "",
    location: profile.location || "",
    workPreference: profile.workPreference || "",
    about: profile.about || "",

    company: profile.company || "",
    hiringPosition: profile.hiringPosition || "",
    requiredSkills: normalizeArray(profile.requiredSkills),
    experienceRequired: profile.experienceRequired || "",
    workType: profile.workType || "",

    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: profile.updatedAt || new Date().toISOString()
  };
}

/* =========================================================
   SAVE PROFILE TO BACKEND
   ========================================================= */

async function saveProfileToBackend(profile) {
  const normalized = normalizeProfile(profile);

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

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || "Unable to save profile."
    );
  }

  return result.profile;
}

/* =========================================================
   ELEMENTS
   ========================================================= */

const authModal = document.getElementById("authModal");
const authStatus = document.getElementById("authStatus");

const employeeBtn = document.getElementById("employeeBtn");
const employerBtn = document.getElementById("employerBtn");

const continueProfileBtn =
  document.getElementById("continueProfileBtn");

const fullNameInput =
  document.getElementById("fullName");

const profileHeadlineInput =
  document.getElementById("profileHeadline");

const profilePreviewName =
  document.getElementById("profilePreviewName");

const profilePreviewHeadline =
  document.getElementById("profilePreviewHeadline");

const roleOptions =
  document.querySelectorAll(".role-option");

const bottomJoinBtn =
  document.getElementById("bottomJoinBtn");

const mobileMenuBtn =
  document.getElementById("mobileMenuBtn");

const mobileNav =
  document.getElementById("mobileNav");

const mobileHowLink =
  document.getElementById("mobileHowLink");

const mobileLoginBtn =
  document.getElementById("mobileLoginBtn");

const mobileJoinBtn =
  document.getElementById("mobileJoinBtn");

/* =========================================================
   STATE
   ========================================================= */

let selectedRole = null;

/* =========================================================
   MODAL
   ========================================================= */

function openCreateModal(role = null) {
  if (!authModal) return;

  resetCreateView();

  authModal.classList.add("active");
  document.body.classList.add("modal-open");

  if (role) {
    selectRole(role);
  }

  setTimeout(() => {
    if (fullNameInput) {
      fullNameInput.focus();
    }
  }, 150);
}

function closeCreateModal() {
  if (!authModal) return;

  authModal.classList.remove("active");
  document.body.classList.remove("modal-open");
}

function resetCreateView() {
  selectedRole = null;

  if (fullNameInput) {
    fullNameInput.value = "";
  }

  if (profileHeadlineInput) {
    profileHeadlineInput.value = "";
  }

  if (authStatus) {
    authStatus.textContent = "";
    authStatus.className = "";
  }

  roleOptions.forEach(option => {
    option.classList.remove("selected");
  });

  const createForm =
    document.querySelector(".create-form");

  const roleSelector =
    document.querySelector(".role-selector");

  const profilePreview =
    document.querySelector(".profile-preview");

  if (createForm) {
    createForm.style.display = "";
  }

  if (roleSelector) {
    roleSelector.style.display = "";
  }

  if (profilePreview) {
    profilePreview.style.display = "";
  }

  if (continueProfileBtn) {
    continueProfileBtn.style.display = "";
    continueProfileBtn.disabled = false;
  }
}

/* =========================================================
   ROLE
   ========================================================= */

function selectRole(role) {
  if (!["employee", "employer"].includes(role)) {
    return;
  }

  selectedRole = role;

  roleOptions.forEach(option => {
    option.classList.toggle(
      "selected",
      option.dataset.role === role
    );
  });

  updatePreview();
}

roleOptions.forEach(option => {
  option.addEventListener("click", () => {
    selectRole(option.dataset.role);
  });
});

/* =========================================================
   PREVIEW
   ========================================================= */

function updatePreview() {
  const name =
    fullNameInput?.value.trim() || "Your name";

  const headline =
    profileHeadlineInput?.value.trim() ||
    (
      selectedRole === "employer"
        ? "Your hiring profile"
        : "Your professional profile"
    );

  if (profilePreviewName) {
    profilePreviewName.textContent = name;
  }

  if (profilePreviewHeadline) {
    profilePreviewHeadline.textContent = headline;
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

async function createProfile() {
  const name =
    fullNameInput?.value.trim() || "";

  const headline =
    profileHeadlineInput?.value.trim() || "";

  if (!selectedRole) {
    if (authStatus) {
      authStatus.textContent =
        "Please select Employee or Employer.";
      authStatus.className = "error";
    }
    return;
  }

  if (!name) {
    if (authStatus) {
      authStatus.textContent =
        "Please enter your name.";
      authStatus.className = "error";
    }

    fullNameInput?.focus();
    return;
  }

  const existingProfile = getStoredProfile();

  const profile = normalizeProfile({
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

  if (continueProfileBtn) {
    continueProfileBtn.disabled = true;
  }

  if (authStatus) {
    authStatus.textContent =
      "Creating your Expo Go profile...";
    authStatus.className = "";
  }

  try {
    /*
      Save locally first.

      This means the profile page still works
      even if the backend is temporarily unavailable.
    */
    saveLocalProfile(profile);

    /*
      Then sync with Supabase through the backend.
    */
    const savedProfile =
      await saveProfileToBackend(profile);

    /*
      Convert Supabase field names back into
      the frontend format.
    */
    const frontendProfile =
      normalizeProfile({
        ...profile,

        id: savedProfile?.id || profile.id,
        name: savedProfile?.name || profile.name,
        role: savedProfile?.role || profile.role,
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

        updatedAt:
          savedProfile?.updated_at ||
          profile.updatedAt
      });

    saveLocalProfile(frontendProfile);

    if (authStatus) {
      authStatus.textContent =
        "Profile created successfully.";
      authStatus.className = "success";
    }

    setTimeout(() => {
      window.location.href = "profile.html";
    }, 350);

  } catch (error) {
    console.error(
      "Backend profile save failed:",
      error
    );

    /*
      Keep local profile so the prototype doesn't
      become unusable just because the API is down.
    */
    saveLocalProfile(profile);

    if (authStatus) {
      authStatus.textContent =
        "Profile saved locally. We couldn't sync with the server yet.";
      authStatus.className = "error";
    }

    setTimeout(() => {
      window.location.href = "profile.html";
    }, 900);
  }
}

continueProfileBtn?.addEventListener(
  "click",
  createProfile
);

/* =========================================================
   BUTTONS
   ========================================================= */

employeeBtn?.addEventListener("click", () => {
  openCreateModal("employee");
});

employerBtn?.addEventListener("click", () => {
  openCreateModal("employer");
});

bottomJoinBtn?.addEventListener("click", () => {
  openCreateModal();
});

/* =========================================================
   LOGIN
   ========================================================= */

function handleLogin() {
  const existingProfile = getStoredProfile();

  if (existingProfile) {
    window.location.href = "profile.html";
    return;
  }

  openCreateModal();
}

document
  .querySelectorAll(
    '[data-action="login"], .login-btn'
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      handleLogin
    );
  });

mobileLoginBtn?.addEventListener(
  "click",
  () => {
    closeMobileMenu();
    handleLogin();
  }
);

/* =========================================================
   MOBILE MENU
   ========================================================= */

function closeMobileMenu() {
  if (!mobileNav) return;

  mobileNav.classList.remove("active");

  if (mobileMenuBtn) {
    mobileMenuBtn.classList.remove("active");
  }
}

mobileMenuBtn?.addEventListener("click", () => {
  mobileNav?.classList.toggle("active");
  mobileMenuBtn.classList.toggle("active");
});

mobileHowLink?.addEventListener("click", () => {
  closeMobileMenu();

  document
    .getElementById("how-it-works")
    ?.scrollIntoView({
      behavior: "smooth"
    });
});

mobileJoinBtn?.addEventListener("click", () => {
  closeMobileMenu();
  openCreateModal();
});

/* =========================================================
   MODAL CLOSE
   ========================================================= */

authModal?.addEventListener("click", event => {
  if (event.target === authModal) {
    closeCreateModal();
  }
});

document
  .querySelectorAll(
    "[data-close-modal], .modal-close"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      closeCreateModal
    );
  });

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCreateModal();
    closeMobileMenu();
  }
});

/* =========================================================
   SMOOTH SCROLL
   ========================================================= */

document
  .querySelectorAll('a[href^="#"]')
  .forEach(link => {
    link.addEventListener("click", event => {
      const targetId =
        link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target =
        document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      closeMobileMenu();
    });
  });

/* =========================================================
   MATCH VISUAL MICRO-INTERACTION
   ========================================================= */

const matchVisual =
  document.querySelector(".match-visual");

if (matchVisual) {
  matchVisual.addEventListener(
    "mouseenter",
    () => {
      matchVisual.classList.add("is-active");
    }
  );

  matchVisual.addEventListener(
    "mouseleave",
    () => {
      matchVisual.classList.remove("is-active");
    }
  );
}

/* =========================================================
   INITIAL PREVIEW
   ========================================================= */

updatePreview();