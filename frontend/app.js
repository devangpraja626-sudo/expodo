"use strict";

/* =========================================================
   EXPO GO — SIMPLE PROFILE MVP
   Frontend only
   LocalStorage profile system
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const authModal = document.getElementById("authModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModal = document.getElementById("closeModal");

const loginBtn = document.getElementById("loginBtn");
const joinBtn = document.getElementById("joinBtn");

const employeeBtn = document.getElementById("employeeBtn");
const employerBtn = document.getElementById("employerBtn");
const bottomJoinBtn = document.getElementById("bottomJoinBtn");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const authForm = document.getElementById("authForm");

const fullNameInput =
  document.getElementById("fullName");

const profileHeadlineInput =
  document.getElementById("profileHeadline");

const authStatus =
  document.getElementById("authStatus");

const roleOptions =
  document.querySelectorAll(".role-option");


/* =========================================================
   STORAGE
========================================================= */

const PROFILE_STORAGE_KEY =
  "expoGoProfile";


/* =========================================================
   STATE
========================================================= */

let selectedRole = "employee";


/* =========================================================
   OPEN PROFILE MODAL
========================================================= */

function openProfile(role = "employee") {

  selectedRole = role;

  authModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  authStatus.textContent = "";

  updateAuthUI();

  setTimeout(() => {

    if (fullNameInput) {
      fullNameInput.focus();
    }

  }, 200);

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeAuth() {

  authModal.classList.add("hidden");

  document.body.style.overflow = "";

  authStatus.textContent = "";

}


/* =========================================================
   UPDATE MODAL UI
========================================================= */

function updateAuthUI() {

  if (selectedRole === "employee") {

    authTitle.textContent =
      "Create your profile";

    authSubtitle.textContent =
      "Tell us who you are and what you do.";

  } else {

    authTitle.textContent =
      "Create your hiring profile";

    authSubtitle.textContent =
      "Tell us who you are and what you are hiring for.";

  }


  roleOptions.forEach(option => {

    option.classList.toggle(
      "active",
      option.dataset.role === selectedRole
    );

  });


  if (profileHeadlineInput) {

    if (selectedRole === "employee") {

      profileHeadlineInput.placeholder =
        "e.g. Software Engineer";

    } else {

      profileHeadlineInput.placeholder =
        "e.g. Founder / Hiring Manager";

    }

  }

}


/* =========================================================
   ROLE SELECTION
========================================================= */

roleOptions.forEach(option => {

  option.addEventListener("click", () => {

    selectedRole =
      option.dataset.role;

    updateAuthUI();

  });

});


/* =========================================================
   NAVIGATION BUTTONS
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

if (loginBtn) {

  loginBtn.addEventListener("click", () => {

    const existingProfile =
      getSavedProfile();

    if (existingProfile) {

      showProfile(existingProfile);

    } else {

      openProfile("employee");

    }

  });

}


/* =========================================================
   CLOSE EVENTS
========================================================= */

if (closeModal) {

  closeModal.addEventListener(
    "click",
    closeAuth
  );

}


if (modalBackdrop) {

  modalBackdrop.addEventListener(
    "click",
    closeAuth
  );

}


document.addEventListener("keydown", event => {

  if (
    event.key === "Escape" &&
    authModal &&
    !authModal.classList.contains("hidden")
  ) {

    closeAuth();

  }

});


/* =========================================================
   CREATE PROFILE
========================================================= */

authForm.addEventListener("submit", event => {

  event.preventDefault();


  const name =
    fullNameInput.value.trim();

  const headline =
    profileHeadlineInput.value.trim();


  if (!name) {

    showStatus(
      "Please enter your name."
    );

    fullNameInput.focus();

    return;

  }


  if (!headline) {

    showStatus(
      "Please tell us what you do."
    );

    profileHeadlineInput.focus();

    return;

  }


  const profile = {

    id:
      "expo_" +
      Date.now(),

    name,

    headline,

    role:
      selectedRole,

    createdAt:
      new Date().toISOString()

  };


  saveProfile(profile);

  showProfile(profile);

});


/* =========================================================
   SAVE PROFILE
========================================================= */

function saveProfile(profile) {

  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );

}


/* =========================================================
   GET PROFILE
========================================================= */

function getSavedProfile() {

  try {

    const saved =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      );

    if (!saved) {
      return null;
    }

    return JSON.parse(saved);

  } catch (error) {

    console.error(
      "Unable to load Expo Go profile:",
      error
    );

    return null;

  }

}


/* =========================================================
   SHOW PROFILE PREVIEW
========================================================= */

function showProfile(profile) {

  const roleLabel =
    profile.role === "employer"
      ? "EMPLOYER"
      : "EMPLOYEE";


  const roleText =
    profile.role === "employer"
      ? "Hiring profile"
      : "Professional profile";


  authTitle.textContent =
    "Your Expo Go profile";


  authSubtitle.textContent =
    "Your profile has been created.";


  roleOptions.forEach(option => {

    option.style.display = "none";

  });


  authForm.innerHTML = `

    <div class="profile-preview">

      <div class="profile-preview-avatar">
        ${escapeHtml(
          profile.name.charAt(0).toUpperCase()
        )}
      </div>

      <div class="profile-preview-info">

        <div class="profile-preview-role">
          ${roleLabel}
        </div>

        <h3>
          ${escapeHtml(profile.name)}
        </h3>

        <p>
          ${escapeHtml(profile.headline)}
        </p>

        <span>
          ${roleText}
        </span>

      </div>

    </div>


    <button
      type="button"
      class="primary-btn auth-submit"
      id="continueProfileBtn"
    >
      Continue
      <span>→</span>
    </button>

  `;


  authStatus.textContent =
    "Profile created successfully.";


  const continueButton =
    document.getElementById(
      "continueProfileBtn"
    );


  if (continueButton) {

    continueButton.addEventListener(
      "click",
      () => {

        /* Go to the real profile dashboard */

        window.location.href =
          "profile.html";

      }
    );

  }

}


/* =========================================================
   STATUS MESSAGE
========================================================= */

function showStatus(message) {

  authStatus.textContent =
    message;

}


/* =========================================================
   BASIC HTML ESCAPE
========================================================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   OPTIONAL VISUAL PARALLAX
========================================================= */

const matchVisual =
  document.querySelector(".match-visual");


if (
  matchVisual &&
  window.innerWidth > 900
) {

  document.addEventListener(
    "mousemove",
    event => {

      const x =
        (
          event.clientX /
          window.innerWidth -
          0.5
        ) * 10;

      const y =
        (
          event.clientY /
          window.innerHeight -
          0.5
        ) * 10;


      matchVisual.style.transform =
        `translate(${x}px, ${y}px)`;

    }
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

updateAuthUI();