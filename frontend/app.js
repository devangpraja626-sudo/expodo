/* =========================================================
   EXPO GO
   FRONTEND CONTROLLER
   MVP V1
========================================================= */

"use strict";

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

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const authForm = document.getElementById("authForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");
const resetPassword = document.getElementById("resetPassword");

const authStatus = document.getElementById("authStatus");

const roleOptions =
  document.querySelectorAll(".role-option");


/* =========================================================
   APP STATE
========================================================= */

let selectedRole = "employee";
let authMode = "signup";


/* =========================================================
   OPEN AUTH MODAL
========================================================= */

function openAuth(mode = "signup", role = "employee") {

  authMode = mode;
  selectedRole = role;

  authModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";

  updateAuthUI();

  setTimeout(() => {
    emailInput.focus();
  }, 250);
}


/* =========================================================
   CLOSE AUTH MODAL
========================================================= */

function closeAuth() {

  authModal.classList.add("hidden");

  document.body.style.overflow = "";

  authStatus.textContent = "";

  authForm.reset();

  passwordInput.type = "password";

  togglePassword.textContent = "Show";
}


/* =========================================================
   UPDATE AUTH INTERFACE
========================================================= */

function updateAuthUI() {

  if (authMode === "login") {

    authTitle.textContent = "Welcome back";

    authSubtitle.textContent =
      "Continue where you left off.";

  } else {

    if (selectedRole === "employee") {

      authTitle.textContent =
        "Create your profile";

      authSubtitle.textContent =
        "Start building your professional profile.";

    } else {

      authTitle.textContent =
        "Create your hiring account";

      authSubtitle.textContent =
        "Find the people your business needs.";

    }
  }

  roleOptions.forEach(option => {

    option.classList.toggle(
      "active",
      option.dataset.role === selectedRole
    );

  });
}


/* =========================================================
   ROLE SELECTION
========================================================= */

roleOptions.forEach(option => {

  option.addEventListener("click", () => {

    selectedRole = option.dataset.role;

    updateAuthUI();

  });

});


/* =========================================================
   NAVIGATION BUTTONS
========================================================= */

loginBtn.addEventListener("click", () => {

  openAuth("login", selectedRole);

});


joinBtn.addEventListener("click", () => {

  openAuth("signup", "employee");

});


/* =========================================================
   HERO BUTTONS
========================================================= */

employeeBtn.addEventListener("click", () => {

  openAuth("signup", "employee");

});


employerBtn.addEventListener("click", () => {

  openAuth("signup", "employer");

});


/* =========================================================
   CLOSE EVENTS
========================================================= */

closeModal.addEventListener("click", closeAuth);

modalBackdrop.addEventListener("click", closeAuth);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener("keydown", event => {

  if (
    event.key === "Escape" &&
    !authModal.classList.contains("hidden")
  ) {

    closeAuth();

  }

});


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

togglePassword.addEventListener("click", () => {

  const passwordIsHidden =
    passwordInput.type === "password";

  passwordInput.type =
    passwordIsHidden
      ? "text"
      : "password";

  togglePassword.textContent =
    passwordIsHidden
      ? "Hide"
      : "Show";

});


/* =========================================================
   AUTH FORM
========================================================= */

authForm.addEventListener("submit", event => {

  event.preventDefault();

  const email =
    emailInput.value.trim();

  const password =
    passwordInput.value;

  /* Basic frontend validation */

  if (!email || !password) {

    showStatus(
      "Please complete the fields."
    );

    return;
  }

  if (password.length < 6) {

    showStatus(
      "Password must contain at least 6 characters."
    );

    return;
  }

  /*
    Authentication will be connected
    to the backend in the next stage.
  */

  if (authMode === "login") {

    showStatus(
      "Login system ready to connect."
    );

  } else {

    showStatus(
      "Account system ready to connect."
    );

  }

});


/* =========================================================
   RESET PASSWORD
========================================================= */

resetPassword.addEventListener("click", () => {

  const email =
    emailInput.value.trim();

  if (!email) {

    showStatus(
      "Enter your email first."
    );

    emailInput.focus();

    return;
  }

  /*
    Secure password-reset flow will be
    connected when authentication is added.
  */

  showStatus(
    "Password reset system ready to connect."
  );

});


/* =========================================================
   STATUS MESSAGE
========================================================= */

function showStatus(message) {

  authStatus.textContent = message;

}


/* =========================================================
   MOUSE PARALLAX
========================================================= */

const matchVisual =
  document.querySelector(".match-visual");

if (matchVisual && window.innerWidth > 900) {

  document.addEventListener("mousemove", event => {

    const x =
      (event.clientX / window.innerWidth - 0.5) * 10;

    const y =
      (event.clientY / window.innerHeight - 0.5) * 10;

    matchVisual.style.transform =
      `translate(${x}px, ${y}px)`;

  });

}


/* =========================================================
   INITIALIZE
========================================================= */

updateAuthUI();