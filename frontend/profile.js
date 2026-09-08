"use strict";

/* =========================================================
   EXPO GO — PROFILE DASHBOARD
   Frontend MVP
========================================================= */

const PROFILE_STORAGE_KEY = "expoGoProfile";


/* =========================================================
   ELEMENTS
========================================================= */

const profileAvatar =
  document.getElementById("profileAvatar");

const profileRole =
  document.getElementById("profileRole");

const profileName =
  document.getElementById("profileName");

const profileHeadline =
  document.getElementById("profileHeadline");

const infoName =
  document.getElementById("infoName");

const infoHeadline =
  document.getElementById("infoHeadline");

const infoRole =
  document.getElementById("infoRole");

const homeBtn =
  document.getElementById("homeBtn");

const editProfileBtn =
  document.getElementById("editProfileBtn");

const completeProfileBtn =
  document.getElementById("completeProfileBtn");

const editModal =
  document.getElementById("editModal");

const editBackdrop =
  document.getElementById("editBackdrop");

const closeEdit =
  document.getElementById("closeEdit");

const editForm =
  document.getElementById("editForm");

const editName =
  document.getElementById("editName");

const editHeadline =
  document.getElementById("editHeadline");

const editStatus =
  document.getElementById("editStatus");


/* =========================================================
   LOAD PROFILE
========================================================= */

function getProfile() {

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
      "Expo Go profile could not be loaded:",
      error
    );

    return null;

  }

}


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
   DISPLAY PROFILE
========================================================= */

function displayProfile(profile) {

  if (!profile) {

    window.location.href =
      "index.html";

    return;

  }


  const name =
    profile.name || "Your Name";

  const headline =
    profile.headline || "Your profession";

  const role =
    profile.role || "employee";


  const roleLabel =
    role === "employer"
      ? "EMPLOYER"
      : "EMPLOYEE";


  const roleText =
    role === "employer"
      ? "Employer"
      : "Employee";


  const initial =
    name.charAt(0).toUpperCase();


  profileAvatar.textContent =
    initial;

  profileName.textContent =
    name;

  profileHeadline.textContent =
    headline;

  profileRole.textContent =
    roleLabel;

  infoName.textContent =
    name;

  infoHeadline.textContent =
    headline;

  infoRole.textContent =
    roleText;

}


/* =========================================================
   EDIT PROFILE
========================================================= */

function openEditModal() {

  const profile =
    getProfile();

  if (!profile) {
    return;
  }


  editName.value =
    profile.name || "";

  editHeadline.value =
    profile.headline || "";

  editStatus.textContent = "";

  editModal.classList.remove("hidden");

  document.body.style.overflow =
    "hidden";


  setTimeout(() => {

    editName.focus();

  }, 150);

}


function closeEditModal() {

  editModal.classList.add("hidden");

  document.body.style.overflow =
    "";

}


/* =========================================================
   SAVE EDITED PROFILE
========================================================= */

editForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();


    const profile =
      getProfile();

    if (!profile) {
      return;
    }


    const name =
      editName.value.trim();

    const headline =
      editHeadline.value.trim();


    if (!name) {

      editStatus.textContent =
        "Please enter your name.";

      editName.focus();

      return;

    }


    if (!headline) {

      editStatus.textContent =
        "Please enter what you do.";

      editHeadline.focus();

      return;

    }


    profile.name =
      name;

    profile.headline =
      headline;


    saveProfile(profile);

    displayProfile(profile);


    editStatus.textContent =
      "Profile updated successfully.";


    setTimeout(() => {

      closeEditModal();

    }, 700);

  }
);


/* =========================================================
   NAVIGATION
========================================================= */

homeBtn.addEventListener(
  "click",
  () => {

    window.location.href =
      "index.html";

  }
);


/* =========================================================
   EDIT BUTTON
========================================================= */

editProfileBtn.addEventListener(
  "click",
  openEditModal
);


/* =========================================================
   COMPLETE PROFILE
========================================================= */

completeProfileBtn.addEventListener(
  "click",
  () => {

    openEditModal();

  }
);


/* =========================================================
   MODAL CLOSE
========================================================= */

closeEdit.addEventListener(
  "click",
  closeEditModal
);


editBackdrop.addEventListener(
  "click",
  closeEditModal
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      !editModal.classList.contains("hidden")
    ) {

      closeEditModal();

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

const existingProfile =
  getProfile();


if (!existingProfile) {

  window.location.href =
    "index.html";

} else {

  displayProfile(existingProfile);

}