/* =========================================================
   EXPO GO — FRONTEND CONTROLLER
   Prototype V1
   LocalStorage based
   ========================================================= */

const PROFILE_STORAGE_KEY = "expoGoProfile";

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const authModal = document.getElementById("authModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModal = document.getElementById("closeModal");

const loginBtn = document.getElementById("loginBtn");
const joinBtn = document.getElementById("joinBtn");
const employeeBtn = document.getElementById("employeeBtn");
const employerBtn = document.getElementById("employerBtn");
const bottomJoinBtn = document.getElementById("bottomJoinBtn");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");
const mobileHowLink = document.getElementById("mobileHowLink");
const mobileLoginBtn = document.getElementById("mobileLoginBtn");
const mobileJoinBtn = document.getElementById("mobileJoinBtn");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const authForm = document.getElementById("authForm");
const fullName = document.getElementById("fullName");
const profileHeadline = document.getElementById("profileHeadline");
const authStatus = document.getElementById("authStatus");

const roleOptions = document.querySelectorAll(".role-option");

const profilePreview = document.querySelector(".profile-preview");
const profilePreviewAvatar = document.querySelector(".profile-preview-avatar");
const profilePreviewRole = document.querySelector(".profile-preview-role");
const profilePreviewInfo = document.querySelector(".profile-preview-info");

const continueProfileBtn = document.getElementById("continueProfileBtn");

let selectedRole = "employee";


/* =========================================================
   PROFILE HELPERS
   ========================================================= */

function createEmptyProfile() {
  return {
    id: null,

    name: "",
    role: "employee",
    headline: "",

    /* Employee fields */
    skills: [],
    education: "",
    experience: "",
    desiredPosition: "",
    location: "",
    workPreference: "",
    about: "",

    /* Employer fields */
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

    id: profile.id || base.id,
    name: profile.name || "",
    role: profile.role === "employer" ? "employer" : "employee",
    headline: profile.headline || "",

    skills: Array.isArray(profile.skills)
      ? profile.skills
      : [],

    requiredSkills: Array.isArray(profile.requiredSkills)
      ? profile.requiredSkills
      : [],

    education: profile.education || "",
    experience: profile.experience || "",
    desiredPosition: profile.desiredPosition || "",
    location: profile.location || "",
    workPreference: profile.workPreference || "",
    about: profile.about || "",

    company: profile.company || "",
    hiringPosition: profile.hiringPosition || "",
    experienceRequired: profile.experienceRequired || "",
    workType: profile.workType || "",

    createdAt: profile.createdAt || null,
    updatedAt: profile.updatedAt || null
  };
}


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function getSavedProfile() {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return normalizeProfile(parsed);
  } catch (error) {
    console.error("Expo Go: unable to read saved profile.", error);
    return null;
  }
}


function saveProfile(profile) {
  try {
    const normalized = normalizeProfile(profile);

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(normalized)
    );

    return true;
  } catch (error) {
    console.error("Expo Go: unable to save profile.", error);

    if (authStatus) {
      authStatus.textContent =
        "Unable to save your profile on this device.";
      authStatus.className = "auth-status error";
    }

    return false;
  }
}


/* =========================================================
   SMALL UTILITIES
   ========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function getInitial(name) {
  const cleanName = String(name || "").trim();

  return cleanName
    ? cleanName.charAt(0).toUpperCase()
    : "E";
}


function closeMobileMenu() {
  if (!mobileNav) return;

  mobileNav.classList.remove("active");

  if (mobileMenuBtn) {
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  }
}


function scrollToHowItWorks() {
  const section =
    document.getElementById("how-it-works") ||
    document.querySelector(".how-it-works") ||
    document.querySelector("#howItWorks");

  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}


/* =========================================================
   MODAL STATE
   ========================================================= */

function clearAuthStatus() {
  if (!authStatus) return;

  authStatus.textContent = "";
  authStatus.className = "auth-status";
}


function resetCreateView() {
  if (authForm) {
    authForm.style.display = "";
    authForm.reset();
  }

  roleOptions.forEach((option) => {
    option.style.display = "";
  });

  if (profilePreview) {
    profilePreview.style.display = "none";
  }

  if (continueProfileBtn) {
    continueProfileBtn.style.display = "none";
  }

  clearAuthStatus();
}


function openProfile(role = "employee") {
  selectedRole =
    role === "employer"
      ? "employer"
      : "employee";

  resetCreateView();

  if (authModal) {
    authModal.classList.add("active");
    authModal.setAttribute("aria-hidden", "false");
  }

  updateAuthUI();

  setTimeout(() => {
    if (fullName) {
      fullName.focus();
    }
  }, 150);
}


function closeAuth() {
  if (!authModal) return;

  authModal.classList.remove("active");
  authModal.setAttribute("aria-hidden", "true");
}


/* =========================================================
   ROLE / MODAL UI
   ========================================================= */

function updateAuthUI() {
  if (!authTitle || !authSubtitle || !profileHeadline) {
    return;
  }

  if (selectedRole === "employer") {
    authTitle.textContent =
      "Let's build your hiring profile.";

    authSubtitle.textContent =
      "Tell Expo Go what you're hiring for. You can complete the rest next.";

    profileHeadline.placeholder =
      "e.g. Hiring Frontend Developer";
  } else {
    authTitle.textContent =
      "Let's build your profile.";

    authSubtitle.textContent =
      "Start with the basics. You can complete your profile next.";

    profileHeadline.placeholder =
      "e.g. Frontend Developer";
  }

  roleOptions.forEach((option) => {
    const isActive =
      option.dataset.role === selectedRole;

    option.classList.toggle("active", isActive);
  });
}


/* =========================================================
   PROFILE PREVIEW
   ========================================================= */

function showProfile(profile) {
  const normalized = normalizeProfile(profile);

  if (!authForm || !profilePreview || !continueProfileBtn) {
    return;
  }

  authForm.style.display = "none";

  roleOptions.forEach((option) => {
    option.style.display = "none";
  });

  profilePreview.style.display = "flex";
  continueProfileBtn.style.display = "flex";

  const initial = getInitial(normalized.name);

  if (profilePreviewAvatar) {
    profilePreviewAvatar.textContent = initial;
  }

  if (profilePreviewRole) {
    profilePreviewRole.textContent =
      normalized.role === "employer"
        ? "EMPLOYER"
        : "EMPLOYEE";
  }

  if (profilePreviewInfo) {
    const secondaryText =
      normalized.role === "employer"
        ? (
            normalized.company ||
            normalized.headline ||
            "Hiring profile"
          )
        : (
            normalized.headline ||
            "Professional profile"
          );

    profilePreviewInfo.innerHTML = `
      <strong>${escapeHTML(normalized.name)}</strong>
      <small>${escapeHTML(secondaryText)}</small>
    `;
  }
}


/* =========================================================
   ROLE SELECTION
   ========================================================= */

roleOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedRole =
      option.dataset.role === "employer"
        ? "employer"
        : "employee";

    updateAuthUI();
  });
});


/* =========================================================
   OPEN PROFILE ACTIONS
   ========================================================= */

if (joinBtn) {
  joinBtn.addEventListener("click", () => {
    openProfile("employee");
  });
}


if (employeeBtn) {
  employeeBtn.addEventListener("click", () => {
    openProfile("employee");
  });
}


if (employerBtn) {
  employerBtn.addEventListener("click", () => {
    openProfile("employer");
  });
}


if (bottomJoinBtn) {
  bottomJoinBtn.addEventListener("click", () => {
    openProfile("employee");
  });
}


/* =========================================================
   LOGIN / EXISTING PROFILE
   ========================================================= */

function handleLogin() {
  const existingProfile = getSavedProfile();

  if (existingProfile) {
    selectedRole = existingProfile.role;

    if (authModal) {
      authModal.classList.add("active");
      authModal.setAttribute("aria-hidden", "false");
    }

    showProfile(existingProfile);
  } else {
    openProfile("employee");
  }
}


if (loginBtn) {
  loginBtn.addEventListener("click", handleLogin);
}


if (mobileLoginBtn) {
  mobileLoginBtn.addEventListener("click", () => {
    closeMobileMenu();
    handleLogin();
  });
}


/* =========================================================
   PROFILE CREATION
   ========================================================= */

if (authForm) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name =
      fullName
        ? fullName.value.trim()
        : "";

    const headline =
      profileHeadline
        ? profileHeadline.value.trim()
        : "";

    clearAuthStatus();

    if (!name || !headline) {
      if (authStatus) {
        authStatus.textContent =
          "Please complete both fields.";

        authStatus.className =
          "auth-status error";
      }

      return;
    }

    const existingProfile = getSavedProfile();

    const profile = normalizeProfile({
      ...(existingProfile || {}),

      id:
        existingProfile?.id ||
        `expo_${Date.now()}`,

      name,
      headline,

      role: selectedRole,

      createdAt:
        existingProfile?.createdAt ||
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    });

    const saved = saveProfile(profile);

    if (!saved) {
      return;
    }

    if (authStatus) {
      authStatus.textContent =
        "Profile created successfully.";

      authStatus.className =
        "auth-status success";
    }

    showProfile(profile);
  });
}


/* =========================================================
   CONTINUE TO PROFILE
   ========================================================= */

if (continueProfileBtn) {
  continueProfileBtn.addEventListener("click", () => {
    const profile = getSavedProfile();

    if (!profile) {
      openProfile("employee");
      return;
    }

    window.location.href = "profile.html";
  });
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

if (closeModal) {
  closeModal.addEventListener("click", closeAuth);
}


if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeAuth);
}


document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAuth();
    closeMobileMenu();
  }
});


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", () => {
    if (!mobileNav) return;

    const isOpen =
      mobileNav.classList.toggle("active");

    mobileMenuBtn.setAttribute(
      "aria-expanded",
      String(isOpen)
    );
  });
}


if (mobileHowLink) {
  mobileHowLink.addEventListener("click", () => {
    closeMobileMenu();
    scrollToHowItWorks();
  });
}


if (mobileJoinBtn) {
  mobileJoinBtn.addEventListener("click", () => {
    closeMobileMenu();
    openProfile("employee");
  });
}


/* =========================================================
   DESKTOP HOW IT WORKS
   ========================================================= */

const howLink = document.querySelector(
  'a[href="#how-it-works"], a[href="#howItWorks"]'
);

if (howLink) {
  howLink.addEventListener("click", (event) => {
    const target = document.querySelector(
      "#how-it-works, #howItWorks, .how-it-works"
    );

    if (target) {
      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
}


/* =========================================================
   MATCH VISUAL — DESKTOP MICRO INTERACTION
   ========================================================= */

const matchVisual =
  document.querySelector(".match-visual");

if (
  matchVisual &&
  window.matchMedia("(pointer:fine)").matches
) {
  matchVisual.addEventListener(
    "mousemove",
    (event) => {
      const rect =
        matchVisual.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) /
          rect.width -
        0.5;

      const y =
        (event.clientY - rect.top) /
          rect.height -
        0.5;

      matchVisual.style.transform =
        `rotateY(${x * 3}deg) rotateX(${y * -3}deg)`;
    }
  );

  matchVisual.addEventListener(
    "mouseleave",
    () => {
      matchVisual.style.transform = "";
    }
  );
}


/* =========================================================
   INITIAL STATE
   ========================================================= */

if (authModal) {
  authModal.setAttribute("aria-hidden", "true");
}

updateAuthUI();

console.log("Expo Go frontend controller loaded.");