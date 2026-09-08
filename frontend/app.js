/* =========================================================
   EXPO GO — FRONTEND CONTROLLER
   Supabase Authentication + Persistent Profile Sync
========================================================= */

const API_BASE_URL = "https://expodo.onrender.com";

const SUPABASE_URL =
  "https://inhxlwsjlddhnpalbocl.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_EoecvlHpO_r1ZJdJWl5Q_VEgr0dOw";

const STORAGE_KEY = "expoGoPrototype";
const PROFILE_STORAGE_KEY = "expoGoProfile";

let supabaseClient = null;
let authMode = "signup";

const DEFAULT_DATA = {
  userType: null,

  profile: {
    id: null,
    authUserId: null,

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
    const saved =
      localStorage.getItem(STORAGE_KEY);

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

/* =========================================================
   PROFILE OBJECT
========================================================= */

function createProfileObject(authUserId = null) {
  const profile = data.profile || {};

  return {
    id:
      profile.id ||
      authUserId,

    authUserId:
      authUserId ||
      profile.authUserId ||
      null,

    name:
      profile.name || "",

    role:
      data.userType ||
      profile.role ||
      "",

    headline:
      profile.headline || "",

    skills:
      normalizeArray(profile.skills),

    education:
      profile.education || "",

    experience:
      profile.experience || "",

    desiredPosition:
      profile.desiredPosition || "",

    location:
      profile.location || "",

    workPreference:
      profile.workPreference || "",

    about:
      profile.about || "",

    company:
      profile.company || "",

    hiringPosition:
      profile.hiringPosition || "",

    requiredSkills:
      normalizeArray(profile.requiredSkills),

    experienceRequired:
      profile.experienceRequired || "",

    workType:
      profile.workType || ""
  };
}

/* =========================================================
   SUPABASE
========================================================= */

function initializeSupabase() {
  if (!window.supabase) {
    console.error(
      "Supabase library not loaded."
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
   ELEMENTS
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
  document.querySelectorAll(".role-option");

/* =========================================================
   AUTH FIELDS
========================================================= */

function createAuthFields() {
  const form =
    document.getElementById("authForm");

  if (
    !form ||
    document.getElementById("expoAuthFields")
  ) {
    return;
  }

  const wrapper =
    document.createElement("div");

  wrapper.id = "expoAuthFields";

  wrapper.innerHTML = `
    <div class="form-field">
      <label for="authEmail">
        Email address
      </label>

      <input
        type="email"
        id="authEmail"
        name="email"
        placeholder="you@example.com"
        autocomplete="email"
        required
      />
    </div>

    <div class="form-field">
      <label for="authPassword">
        Password
      </label>

      <input
        type="password"
        id="authPassword"
        name="password"
        placeholder="Minimum 6 characters"
        autocomplete="new-password"
        minlength="6"
        required
      />
    </div>

    <button
      type="button"
      id="authModeToggle"
      class="auth-mode-toggle"
    >
      Already have an account? Log in
    </button>

    <button
      type="button"
      id="resendVerificationBtn"
      class="auth-mode-toggle"
      style="display:none;"
    >
      Resend verification email
    </button>
  `;

  const status =
    document.getElementById("authStatus");

  if (status) {
    form.insertBefore(wrapper, status);
  } else {
    form.appendChild(wrapper);
  }

  document
    .getElementById("authModeToggle")
    ?.addEventListener(
      "click",
      toggleAuthMode
    );

  document
    .getElementById("resendVerificationBtn")
    ?.addEventListener(
      "click",
      resendVerification
    );

  updateAuthMode();
}

/* =========================================================
   AUTH MODE
========================================================= */

function updateAuthMode() {
  const toggle =
    document.getElementById(
      "authModeToggle"
    );

  const submit =
    document.getElementById(
      "createProfileBtn"
    );

  const name =
    document.getElementById("fullName");

  const headline =
    document.getElementById(
      "profileHeadline"
    );

  const title =
    document.getElementById("authTitle");

  const subtitle =
    document.getElementById(
      "authSubtitle"
    );

  if (authMode === "login") {
    if (toggle) {
      toggle.textContent =
        "New to Expo Go? Create an account";
    }

    if (submit) {
      submit.innerHTML =
        'Log in <span>→</span>';
    }

    if (name) {
      name.closest(".form-field")
        ?.style.setProperty(
          "display",
          "none"
        );

      name.required = false;
    }

    if (headline) {
      headline.closest(".form-field")
        ?.style.setProperty(
          "display",
          "none"
        );

      headline.required = false;
    }

    if (title) {
      title.textContent =
        "Welcome back.";
    }

    if (subtitle) {
      subtitle.textContent =
        "Log in to continue to your Expo Go profile.";
    }

  } else {
    if (toggle) {
      toggle.textContent =
        "Already have an account? Log in";
    }

    if (submit) {
      submit.innerHTML =
        'Create my profile <span>→</span>';
    }

    if (name) {
      name.closest(".form-field")
        ?.style.removeProperty(
          "display"
        );

      name.required = true;
    }

    if (headline) {
      headline.closest(".form-field")
        ?.style.removeProperty(
          "display"
        );

      headline.required = false;
    }

    if (title) {
      title.textContent =
        "Let's build your profile.";
    }

    if (subtitle) {
      subtitle.textContent =
        "Start with the basics. You can complete your profile next.";
    }
  }
}

function toggleAuthMode() {
  authMode =
    authMode === "signup"
      ? "login"
      : "signup";

  updateAuthMode();

  if (authStatus) {
    authStatus.textContent = "";
  }

  const resend =
    document.getElementById(
      "resendVerificationBtn"
    );

  if (resend) {
    resend.style.display = "none";
  }
}

/* =========================================================
   ROLE SELECTION
========================================================= */

roleOptions.forEach(option => {
  option.addEventListener(
    "click",
    () => {
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

      data.profile.role =
        data.userType;

      saveData();

      if (authStatus) {
        authStatus.textContent = "";
      }
    }
  );
});

/* =========================================================
   MODAL
========================================================= */

function openAuthModal(
  role = null,
  mode = "signup"
) {
  if (role) {
    data.userType = role;
    data.profile.role = role;

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

  createAuthFields();

  authMode = mode;

  updateAuthMode();

  authModal?.classList.add("active");

  authModal?.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "modal-open"
  );
}

function closeAuthModal() {
  authModal?.classList.remove(
    "active"
  );

  authModal?.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "modal-open"
  );

  if (authStatus) {
    authStatus.textContent = "";
  }
}

/* =========================================================
   SIGN UP
========================================================= */

async function signup() {
  const name =
    fullNameInput?.value.trim() || "";

  const headline =
    profileHeadlineInput?.value.trim() || "";

  const email =
    document
      .getElementById("authEmail")
      ?.value.trim() || "";

  const password =
    document
      .getElementById("authPassword")
      ?.value || "";

  if (!data.userType) {
    authStatus.textContent =
      "Please select Employee or Employer.";
    return;
  }

  if (!name) {
    authStatus.textContent =
      "Please enter your name.";

    fullNameInput?.focus();
    return;
  }

  if (!email) {
    authStatus.textContent =
      "Please enter your email.";
    return;
  }

  if (password.length < 6) {
    authStatus.textContent =
      "Password must be at least 6 characters.";
    return;
  }

  createProfileBtn.disabled = true;

  authStatus.textContent =
    "Creating your secure account...";

  try {
    const {
      data: authData,
      error
    } =
      await supabaseClient.auth.signUp({
        email,
        password,

        options: {
          data: {
            name,
            role: data.userType,
            headline
          },

          emailRedirectTo:
            `${window.location.origin}/index.html`
        }
      });

    if (error) {
      throw error;
    }

    if (!authData?.user) {
      throw new Error(
        "Unable to create account."
      );
    }

    data.profile = {
      ...data.profile,

      id:
        authData.user.id,

      authUserId:
        authData.user.id,

      name,

      headline,

      role:
        data.userType
    };

    data.userType =
      data.profile.role;

    saveData();

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(data.profile)
    );

    /*
      Persist immediately.
    */

    try {
      await syncProfileToBackend(
        authData.user.id
      );
    } catch (syncError) {
      console.error(
        "Initial profile sync failed:",
        syncError
      );
    }

    authStatus.innerHTML =
      "Account created. <strong>Check your email</strong> and click the verification link to continue.";

    const resend =
      document.getElementById(
        "resendVerificationBtn"
      );

    if (resend) {
      resend.style.display = "block";
    }

  } catch (error) {
    console.error(
      "Supabase signup error:",
      error
    );

    authStatus.textContent =
      error.message ||
      "Unable to create account.";

  } finally {
    createProfileBtn.disabled = false;
  }
}

/* =========================================================
   LOGIN
========================================================= */

async function login() {
  const email =
    document
      .getElementById("authEmail")
      ?.value.trim() || "";

  const password =
    document
      .getElementById("authPassword")
      ?.value || "";

  if (!email || !password) {
    authStatus.textContent =
      "Enter your email and password.";
    return;
  }

  createProfileBtn.disabled = true;

  authStatus.textContent =
    "Signing you in...";

  try {
    const {
      data: authData,
      error
    } =
      await supabaseClient.auth
        .signInWithPassword({
          email,
          password
        });

    if (error) {
      throw error;
    }

    if (!authData?.user) {
      throw new Error(
        "Unable to sign in."
      );
    }

    await loadOrCreateAuthenticatedProfile(
      authData.user
    );

    authStatus.textContent =
      "Login successful.";

    /*
      ONLY the explicit login flow redirects.
      Auth state listener does NOT redirect anymore.
    */

    setTimeout(() => {
      window.location.href =
        "profile.html";
    }, 300);

  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    authStatus.textContent =
      error.message ||
      "Unable to log in.";

  } finally {
    createProfileBtn.disabled = false;
  }
}

/* =========================================================
   LOAD AUTH PROFILE
========================================================= */

async function loadOrCreateAuthenticatedProfile(user) {
  try {
    const response =
      await fetch(
        `${API_BASE_URL}/api/profiles/me/${user.id}`
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
      const serverProfile =
        result.profile;

      data.profile = {
        ...data.profile,

        id:
          serverProfile.id ||
          user.id,

        authUserId:
          user.id,

        name:
          serverProfile.name ||
          user.user_metadata?.name ||
          data.profile.name ||
          user.email ||
          "",

        role:
          serverProfile.role ||
          user.user_metadata?.role ||
          data.profile.role ||
          "",

        headline:
          serverProfile.headline ||
          data.profile.headline ||
          "",

        skills:
          normalizeArray(
            serverProfile.skills
          ),

        education:
          serverProfile.education ||
          "",

        experience:
          serverProfile.experience ||
          "",

        desiredPosition:
          serverProfile.desired_position ||
          "",

        location:
          serverProfile.location ||
          "",

        workPreference:
          serverProfile.work_preference ||
          "",

        about:
          serverProfile.about ||
          "",

        company:
          serverProfile.company ||
          "",

        hiringPosition:
          serverProfile.hiring_position ||
          "",

        requiredSkills:
          normalizeArray(
            serverProfile.required_skills
          ),

        experienceRequired:
          serverProfile.experience_required ||
          "",

        workType:
          serverProfile.work_type ||
          ""
      };

      data.userType =
        data.profile.role;

      saveData();

      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(data.profile)
      );

      return;
    }

    /*
      Server profile does not exist.
      Recover from local storage / metadata.
    */

    const metadata =
      user.user_metadata || {};

    data.profile = {
      ...data.profile,

      id:
        data.profile.id ||
        user.id,

      authUserId:
        user.id,

      name:
        data.profile.name ||
        metadata.name ||
        user.email ||
        "",

      role:
        data.profile.role ||
        metadata.role ||
        "",

      headline:
        data.profile.headline ||
        metadata.headline ||
        "",

      skills:
        normalizeArray(
          data.profile.skills
        ),

      requiredSkills:
        normalizeArray(
          data.profile.requiredSkills
        )
    };

    data.userType =
      data.profile.role;

    saveData();

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(data.profile)
    );

    /*
      Recreate server profile if necessary.
    */

    if (data.profile.role) {
      try {
        await syncProfileToBackend(
          user.id
        );
      } catch (syncError) {
        console.error(
          "Profile recreation sync failed:",
          syncError
        );
      }
    }

  } catch (error) {
    console.error(
      "Authenticated profile loading error:",
      error
    );

    /*
      Do NOT redirect here.
      Local profile can still be recovered.
    */

    const saved =
      localStorage.getItem(
        PROFILE_STORAGE_KEY
      );

    if (saved) {
      try {
        const local =
          JSON.parse(saved);

        data.profile = {
          ...data.profile,
          ...local,
          authUserId:
            user.id
        };

        data.userType =
          data.profile.role;

        saveData();

        return;
      } catch (_) {}
    }

    throw error;
  }
}

/* =========================================================
   PROFILE SYNC
========================================================= */

async function syncProfileToBackend(authUserId) {
  const payload =
    createProfileObject(
      authUserId
    );

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

  const raw =
    await response.text();

  let result = {};

  try {
    result =
      raw
        ? JSON.parse(raw)
        : {};
  } catch {
    result = {};
  }

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
    const server =
      result.profile;

    data.profile = {
      ...data.profile,

      id:
        server.id ||
        data.profile.id,

      authUserId,

      name:
        server.name ||
        data.profile.name,

      role:
        server.role ||
        data.profile.role,

      headline:
        server.headline ||
        data.profile.headline,

      skills:
        normalizeArray(
          server.skills
        ),

      education:
        server.education ||
        data.profile.education,

      experience:
        server.experience ||
        data.profile.experience,

      desiredPosition:
        server.desired_position ||
        data.profile.desiredPosition,

      location:
        server.location ||
        data.profile.location,

      workPreference:
        server.work_preference ||
        data.profile.workPreference,

      about:
        server.about ||
        data.profile.about,

      company:
        server.company ||
        data.profile.company,

      hiringPosition:
        server.hiring_position ||
        data.profile.hiringPosition,

      requiredSkills:
        normalizeArray(
          server.required_skills
        ),

      experienceRequired:
        server.experience_required ||
        data.profile.experienceRequired,

      workType:
        server.work_type ||
        data.profile.workType
    };

    data.userType =
      data.profile.role;

    saveData();

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(data.profile)
    );
  }
}

/* =========================================================
   RESEND VERIFICATION
========================================================= */

async function resendVerification() {
  const email =
    document
      .getElementById("authEmail")
      ?.value.trim();

  if (!email) {
    authStatus.textContent =
      "Enter your email first.";
    return;
  }

  try {
    const { error } =
      await supabaseClient.auth.resend({
        type: "signup",

        email,

        options: {
          emailRedirectTo:
            `${window.location.origin}/index.html`
        }
      });

    if (error) {
      throw error;
    }

    authStatus.textContent =
      "Verification email sent again.";

  } catch (error) {
    console.error(
      "Verification resend error:",
      error
    );

    authStatus.textContent =
      error.message ||
      "Unable to resend verification email.";
  }
}

/* =========================================================
   SESSION CHECK
   IMPORTANT:
   This no longer redirects automatically.
========================================================= */

async function checkSession() {
  if (!supabaseClient) {
    return null;
  }

  const {
    data: sessionData,
    error
  } =
    await supabaseClient.auth.getSession();

  if (error) {
    console.error(
      "Session error:",
      error
    );

    return null;
  }

  const session =
    sessionData?.session;

  if (!session?.user) {
    return null;
  }

  /*
    Recover profile data silently,
    but stay on the homepage.
  */

  try {
    await loadOrCreateAuthenticatedProfile(
      session.user
    );

    return session.user;

  } catch (error) {
    console.error(
      "Session profile recovery error:",
      error
    );

    return session.user;
  }
}

/* =========================================================
   AUTH STATE
   IMPORTANT:
   Never redirect automatically from here.
========================================================= */

function setupAuthListener() {
  if (!supabaseClient) {
    return;
  }

  supabaseClient.auth.onAuthStateChange(
    async (
      event,
      session
    ) => {
      console.log(
        "Expo Go auth event:",
        event
      );

      if (
        event === "SIGNED_IN" &&
        session?.user
      ) {
        /*
          Only synchronize the profile.
          Do NOT redirect.
        */

        try {
          await loadOrCreateAuthenticatedProfile(
            session.user
          );
        } catch (error) {
          console.error(
            "Auth profile recovery error:",
            error
          );
        }
      }
    }
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

document
  .getElementById("employeeBtn")
  ?.addEventListener(
    "click",
    () =>
      openAuthModal(
        "employee",
        "signup"
      )
  );

document
  .getElementById("employerBtn")
  ?.addEventListener(
    "click",
    () =>
      openAuthModal(
        "employer",
        "signup"
      )
  );

document
  .getElementById("bottomJoinBtn")
  ?.addEventListener(
    "click",
    () =>
      openAuthModal(
        null,
        "signup"
      )
  );

document
  .getElementById("joinBtn")
  ?.addEventListener(
    "click",
    () =>
      openAuthModal(
        null,
        "signup"
      )
  );

document
  .getElementById("loginBtn")
  ?.addEventListener(
    "click",
    () =>
      openAuthModal(
        null,
        "login"
      )
  );

document
  .getElementById("mobileLoginBtn")
  ?.addEventListener(
    "click",
    () =>
      openAuthModal(
        null,
        "login"
      )
  );

document
  .getElementById("mobileJoinBtn")
  ?.addEventListener(
    "click",
    () =>
      openAuthModal(
        null,
        "signup"
      )
  );

/* =========================================================
   HOW IT WORKS
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

          mobileNav?.classList.remove(
            "active"
          );
        }
      }
    );
  });

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
   MODAL EVENTS
========================================================= */

authForm?.addEventListener(
  "submit",
  event => {
    event.preventDefault();
    createProfile();
  }
);

createProfileBtn?.addEventListener(
  "click",
  createProfile
);

continueProfileBtn?.addEventListener(
  "click",
  createProfile
);

document
  .getElementById("closeModal")
  ?.addEventListener(
    "click",
    closeAuthModal
  );

document
  .getElementById("modalBackdrop")
  ?.addEventListener(
    "click",
    closeAuthModal
  );

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

document.addEventListener(
  "keydown",
  event => {
    if (event.key === "Escape") {
      closeAuthModal();
    }
  }
);

/* =========================================================
   FORM CONTROLLER
========================================================= */

async function createProfile() {
  if (authMode === "login") {
    await login();
  } else {
    await signup();
  }
}

/* =========================================================
   INITIALIZATION
========================================================= */

async function initialize() {
  try {
    if (!window.supabase) {
      console.error(
        "Expo Go: Supabase library unavailable."
      );

      return;
    }

    if (!initializeSupabase()) {
      return;
    }

    createAuthFields();

    setupAuthListener();

    /*
      Recover session/profile silently.
      No automatic redirect.
    */

    await checkSession();

    console.log(
      "Expo Go is ready."
    );

  } catch (error) {
    console.error(
      "Expo Go initialization error:",
      error
    );
  }
}

initialize();