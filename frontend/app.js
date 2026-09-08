/* =========================================================
   EXPO GO — SHARED FRONTEND CONTROLLER
   Prototype V1
   Local Storage + Render Backend + Supabase
========================================================= */

const API_BASE_URL = "https://expodo.onrender.com";
const STORAGE_KEY = "expoGoPrototype";
const PROFILE_STORAGE_KEY = "expoGoProfile";

const DEFAULT_DATA = {
  userType: null,

  profile: {
    id: null,
    name: "",
    education: "",
    skills: [],
    experience: "",
    desiredPosition: "",
    location: "",
    workPreference: "",
    about: "",
    headline: "",

    company: "",
    hiringPosition: "",
    requiredSkills: [],
    experienceRequired: "",
    workType: ""
  }
};

let data = loadData();

/* =========================================================
   STORAGE
========================================================= */

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(DEFAULT_DATA);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(DEFAULT_DATA),
      ...parsed,
      profile: {
        ...structuredClone(DEFAULT_DATA.profile),
        ...(parsed.profile || {})
      }
    };
  } catch (error) {
    console.error("Storage loading error:", error);
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
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

function createProfileObject() {
  const profile = data.profile || {};

  return {
    id: profile.id,
    name: profile.name || "",
    role: data.userType || profile.role || "",

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

    requiredSkills: normalizeArray(
      profile.requiredSkills
    ),

    experienceRequired:
      profile.experienceRequired || "",

    workType:
      profile.workType || ""
  };
}

/* =========================================================
   AUTH / PROFILE MODAL
========================================================= */

const authModal =
  document.getElementById("authModal");

const authForm =
  document.getElementById("authForm");

const createProfileBtn =
  document.getElementById("createProfileBtn");

const continueProfileBtn =
  document.getElementById("continueProfileBtn");

const authStatus =
  document.getElementById("authStatus");

const fullNameInput =
  document.getElementById("fullName");

const profileHeadlineInput =
  document.getElementById("profileHeadline");

const roleOptions =
  document.querySelectorAll(
    ".role-option"
  );

/* =========================================================
   ROLE SELECTION
========================================================= */

roleOptions.forEach(option => {
  option.addEventListener("click", () => {
    roleOptions.forEach(item => {
      item.classList.remove("active");
      item.setAttribute(
        "aria-selected",
        "false"
      );
    });

    option.classList.add("active");
    option.setAttribute(
      "aria-selected",
      "true"
    );

    data.userType =
      option.dataset.role || null;

    saveData();

    if (authStatus) {
      authStatus.textContent = "";
    }
  });
});

/* =========================================================
   MODAL
========================================================= */

function openAuthModal(role = null) {
  if (role) {
    data.userType = role;
    saveData();

    roleOptions.forEach(option => {
      const active =
        option.dataset.role === role;

      option.classList.toggle(
        "active",
        active
      );

      option.setAttribute(
        "aria-selected",
        active ? "true" : "false"
      );
    });
  }

  authModal?.classList.add("active");

  document.body.classList.add(
    "modal-open"
  );

  setTimeout(() => {
    fullNameInput?.focus();
  }, 100);
}

function closeAuthModal() {
  authModal?.classList.remove("active");

  document.body.classList.remove(
    "modal-open"
  );

  if (authStatus) {
    authStatus.textContent = "";
  }
}

/* =========================================================
   PROFILE CREATION
========================================================= */

async function createProfile(event) {
  /*
    IMPORTANT:
    Prevent the browser's native form submission.
    Without this, the page can redirect to:
    index.html?fullName=...
  */

  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const name =
    fullNameInput?.value.trim() || "";

  const headline =
    profileHeadlineInput?.value.trim() || "";

  if (!data.userType) {
    if (authStatus) {
      authStatus.textContent =
        "Please select Employee or Employer.";
    }

    return;
  }

  if (!name) {
    if (authStatus) {
      authStatus.textContent =
        "Please enter your name.";
    }

    fullNameInput?.focus();

    return;
  }

  const role = data.userType;

  /*
    Generate a stable profile ID.

    This ID is also used by Supabase as the
    primary key in the profiles table.
  */

  const existingId =
    data.profile?.id;

  const profileId =
    existingId ||
    (
      crypto?.randomUUID
        ? crypto.randomUUID()
        : `expo_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 10)}`
    );

  data.profile = {
    ...data.profile,

    id: profileId,
    name,
    headline,
    role
  };

  data.userType = role;

  /*
    Save locally FIRST.
    This guarantees the user does not lose
    their profile if the network request fails.
  */

  saveData();

  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({
      ...data.profile,
      role
    })
  );

  if (createProfileBtn) {
    createProfileBtn.disabled = true;
    createProfileBtn.innerHTML =
      "Creating profile <span>...</span>";
  }

  if (authStatus) {
    authStatus.textContent =
      "Creating your profile...";
  }

  /* =======================================================
     SERVER SYNC
  ======================================================= */

  try {
    const payload = createProfileObject();

    console.log(
      "Expo Go profile sync payload:",
      payload
    );

    const response = await fetch(
      `${API_BASE_URL}/api/profiles`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    /*
      Read the response safely.
      This prevents a JSON parsing error from
      hiding the actual server response.
    */

    const rawResponse =
      await response.text();

    let result = {};

    try {
      result =
        rawResponse
          ? JSON.parse(rawResponse)
          : {};
    } catch {
      result = {
        success: false,
        message: rawResponse
      };
    }

    console.log(
      "Expo Go profile sync response:",
      response.status,
      result
    );

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
        result.error ||
        `Server returned ${response.status}.`
      );
    }

    /*
      Backend successfully saved the profile.
      Use the backend's returned profile if available.
    */

    if (result.profile) {
      data.profile = {
        ...data.profile,
        ...result.profile,

        /*
          Convert backend snake_case back
          into the frontend format.
        */

        desiredPosition:
          result.profile.desired_position ||
          data.profile.desiredPosition ||
          "",

        workPreference:
          result.profile.work_preference ||
          data.profile.workPreference ||
          "",

        hiringPosition:
          result.profile.hiring_position ||
          data.profile.hiringPosition ||
          "",

        requiredSkills:
          normalizeArray(
            result.profile.required_skills
          ),

        experienceRequired:
          result.profile.experience_required ||
          data.profile.experienceRequired ||
          "",

        workType:
          result.profile.work_type ||
          data.profile.workType ||
          ""
      };
    }

    saveData();

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        ...data.profile,
        role
      })
    );

    if (authStatus) {
      authStatus.textContent =
        "Profile created successfully.";
    }

    /*
      Small delay so the success state is visible.
    */

    setTimeout(() => {
      window.location.href =
        "profile.html";
    }, 250);

  } catch (error) {
    console.error(
      "Expo Go profile sync failed:",
      error
    );

    /*
      Local profile is already saved.
      Do NOT prevent the user from entering
      their dashboard.
    */

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        ...data.profile,
        role
      })
    );

    if (authStatus) {
      authStatus.textContent =
        "Saved locally. Server sync unavailable.";
    }

    /*
      IMPORTANT:
      We still allow the user to continue.
    */

    setTimeout(() => {
      window.location.href =
        "profile.html";
    }, 500);

  } finally {
    if (createProfileBtn) {
      createProfileBtn.disabled = false;

      createProfileBtn.innerHTML =
        'Create my profile <span>→</span>';
    }
  }
}

/* =========================================================
   FORM SUBMISSION
========================================================= */

/*
  This is the important fix.

  The form itself is intercepted, so pressing
  Enter or clicking the submit button cannot
  trigger the browser's native GET submission.
*/

authForm?.addEventListener(
  "submit",
  createProfile
);

createProfileBtn?.addEventListener(
  "click",
  createProfile
);

continueProfileBtn?.addEventListener(
  "click",
  createProfile
);

/* =========================================================
   CLOSE MODAL
========================================================= */

authModal?.addEventListener(
  "click",
  event => {
    if (
      event.target === authModal
    ) {
      closeAuthModal();
    }
  }
);

document
  .querySelectorAll(
    "[data-close-modal], .modal-close"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      closeAuthModal
    );
  });

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape"
    ) {
      closeAuthModal();
    }
  }
);

/* =========================================================
   HERO BUTTONS
========================================================= */

document
  .getElementById("employeeBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal("employee");
    }
  );

document
  .getElementById("employerBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal("employer");
    }
  );

document
  .getElementById("bottomJoinBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal();
    }
  );

/* =========================================================
   NAVIGATION
========================================================= */

document
  .querySelectorAll(
    'a[href="#how-it-works"], #mobileHowLink'
  )
  .forEach(link => {
    link.addEventListener(
      "click",
      event => {
        const section =
          document.getElementById(
            "how-it-works"
          );

        if (section) {
          event.preventDefault();

          section.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    );
  });

document
  .getElementById("loginBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal();
    }
  );

document
  .getElementById("mobileLoginBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal();
    }
  );

document
  .getElementById("mobileJoinBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal();
    }
  );

/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenuBtn =
  document.getElementById(
    "mobileMenuBtn"
  );

const mobileNav =
  document.getElementById(
    "mobileNav"
  );

mobileMenuBtn?.addEventListener(
  "click",
  () => {
    mobileNav?.classList.toggle(
      "active"
    );

    mobileMenuBtn.classList.toggle(
      "active"
    );
  }
);

/* =========================================================
   EXISTING PROFILE CHECK
========================================================= */

function checkExistingProfile() {
  const saved =
    localStorage.getItem(
      PROFILE_STORAGE_KEY
    );

  if (!saved) {
    return;
  }

  try {
    const existing =
      JSON.parse(saved);

    if (
      existing?.id &&
      existing?.role
    ) {
      console.log(
        "Existing Expo Go profile detected:",
        existing
      );
    }
  } catch (error) {
    console.error(
      "Existing profile parsing error:",
      error
    );
  }
}

checkExistingProfile();

/* =========================================================
   END
========================================================= */