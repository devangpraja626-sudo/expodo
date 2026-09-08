const API_BASE_URL = "https://expodo.onrender.com";

const SUPABASE_URL =
  "https://inhxlwsjlddhnpalbocl.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_EoecvlHpO_r1ZJzJdJWl5Q_VEgr0dOw";

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

function createProfileObject(authUserId = null) {
  const profile = data.profile || {};

  return {
    id: profile.id || authUserId,

    authUserId:
      authUserId ||
      profile.authUserId ||
      null,

    name: profile.name || "",

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
    console.error("Supabase library not loaded.");
    return false;
  }

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

  return true;
}

/* =========================================================
   AUTH FIELDS
========================================================= */

function createAuthFields() {
  const form =
    document.getElementById("authForm");

  if (!form || document.getElementById("expoAuthFields")) {
    return;
  }

  const wrapper =
    document.createElement("div");

  wrapper.id = "expoAuthFields";

  wrapper.innerHTML = `
    <div style="margin-top:18px;">
      <input
        id="authEmail"
        type="email"
        autocomplete="email"
        placeholder="Email address"
        required
        style="
          width:100%;
          box-sizing:border-box;
          padding:14px 16px;
          border-radius:12px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.04);
          color:#fff;
          outline:none;
          font:inherit;
          margin-bottom:12px;
        "
      >

      <input
        id="authPassword"
        type="password"
        autocomplete="new-password"
        placeholder="Password"
        required
        minlength="6"
        style="
          width:100%;
          box-sizing:border-box;
          padding:14px 16px;
          border-radius:12px;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.04);
          color:#fff;
          outline:none;
          font:inherit;
        "
      >

      <button
        type="button"
        id="authModeToggle"
        style="
          margin-top:10px;
          background:none;
          border:0;
          color:#a78bfa;
          cursor:pointer;
          padding:4px 0;
          font:inherit;
        "
      >
        Already have an account? Log in
      </button>

      <button
        type="button"
        id="resendVerificationBtn"
        style="
          display:none;
          margin-top:8px;
          background:none;
          border:0;
          color:#a78bfa;
          cursor:pointer;
          padding:4px 0;
          font:inherit;
        "
      >
        Resend verification email
      </button>
    </div>
  `;

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );

  if (submitButton) {
    form.insertBefore(
      wrapper,
      submitButton
    );
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
    document.getElementById(
      "fullName"
    );

  const headline =
    document.getElementById(
      "profileHeadline"
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
      name.style.display = "none";
      name.required = false;
    }

    if (headline) {
      headline.style.display = "none";
      headline.required = false;
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
      name.style.display = "";
      name.required = true;
    }

    if (headline) {
      headline.style.display = "";
      headline.required = false;
    }
  }
}

function toggleAuthMode() {
  authMode =
    authMode === "signup"
      ? "login"
      : "signup";

  updateAuthMode();

  const status =
    document.getElementById(
      "authStatus"
    );

  if (status) {
    status.textContent = "";
  }
}

/* =========================================================
   MODAL
========================================================= */

const authModal =
  document.getElementById(
    "authModal"
  );

const authForm =
  document.getElementById(
    "authForm"
  );

const createProfileBtn =
  document.getElementById(
    "createProfileBtn"
  );

const continueProfileBtn =
  document.getElementById(
    "continueProfileBtn"
  );

const authStatus =
  document.getElementById(
    "authStatus"
  );

const fullNameInput =
  document.getElementById(
    "fullName"
  );

const profileHeadlineInput =
  document.getElementById(
    "profileHeadline"
  );

const roleOptions =
  document.querySelectorAll(
    ".role-option"
  );

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

      saveData();

      if (authStatus) {
        authStatus.textContent = "";
      }
    }
  );
});

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
        active
          ? "true"
          : "false"
      );
    });
  }

  createAuthFields();

  authMode = "signup";

  updateAuthMode();

  authModal?.classList.add("active");

  document.body.classList.add(
    "modal-open"
  );

  setTimeout(() => {
    document
      .getElementById("authEmail")
      ?.focus();
  }, 100);
}

function closeAuthModal() {

  authModal?.classList.remove(
    "active"
  );

  document.body.classList.remove(
    "modal-open"
  );

  if (authStatus) {
    authStatus.textContent = "";
  }
}

/* =========================================================
   SIGNUP
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

    if (!authData.user) {
      throw new Error(
        "Unable to create account."
      );
    }

    const profileId =
      authData.user.id;

    data.profile = {
      ...data.profile,

      id: profileId,

      authUserId:
        authData.user.id,

      name,
      headline,

      role:
        data.userType
    };

    data.userType =
      data.userType;

    saveData();

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        ...data.profile,
        role: data.userType
      })
    );

    authStatus.innerHTML =
      "Account created. <strong>Check your email</strong> and click the verification link to continue.";

    document
      .getElementById(
        "resendVerificationBtn"
      )
      ?.style.setProperty(
        "display",
        "block"
      );

  } catch (error) {

    console.error(
      "Supabase signup error:",
      error
    );

    authStatus.textContent =
      error.message ||
      "Unable to create account.";

  } finally {

    createProfileBtn.disabled =
      false;
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

  createProfileBtn.disabled =
    true;

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

    if (!authData.user) {
      throw new Error(
        "Unable to sign in."
      );
    }

    await loadOrCreateAuthenticatedProfile(
      authData.user
    );

    authStatus.textContent =
      "Login successful.";

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

    createProfileBtn.disabled =
      false;
  }
}

/* =========================================================
   AUTHENTICATED PROFILE
========================================================= */

async function loadOrCreateAuthenticatedProfile(
  user
) {

  const response =
    await fetch(
      `${API_BASE_URL}/api/profiles/me/${user.id}`
    );

  const result =
    await response.json();

  if (
    result.success &&
    result.profile
  ) {

    const serverProfile =
      result.profile;

    data.profile = {
      ...data.profile,

      id:
        serverProfile.id,

      authUserId:
        user.id,

      name:
        serverProfile.name ||
        user.user_metadata?.name ||
        "",

      role:
        serverProfile.role ||
        user.user_metadata?.role ||
        "",

      headline:
        serverProfile.headline ||
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
      JSON.stringify(
        data.profile
      )
    );

    return;
  }

  const metadata =
    user.user_metadata || {};

  data.profile = {
    ...data.profile,

    id: user.id,

    authUserId: user.id,

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
      ""
  };

  data.userType =
    data.profile.role;

  saveData();

  await syncProfileToBackend(
    user.id
  );
}

/* =========================================================
   SYNC PROFILE
========================================================= */

async function syncProfileToBackend(
  authUserId
) {

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

    data.profile = {
      ...data.profile,

      ...result.profile,

      authUserId,

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

    saveData();

    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(
        data.profile
      )
    );
  }
}

/* =========================================================
   FORM
========================================================= */

async function createProfile(event) {

  event?.preventDefault();
  event?.stopPropagation();

  createAuthFields();

  if (authMode === "login") {
    await login();
    return;
  }

  await signup();
}

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

    const {
      error
    } =
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

    authStatus.textContent =
      error.message ||
      "Unable to resend email.";
  }
}

/* =========================================================
   SESSION CHECK
========================================================= */

async function checkSession() {

  if (!supabaseClient) {
    return;
  }

  const {
    data: sessionData
  } =
    await supabaseClient.auth.getSession();

  const session =
    sessionData?.session;

  if (!session?.user) {
    return;
  }

  const user =
    session.user;

  if (!user.email_confirmed_at) {
    return;
  }

  try {

    await loadOrCreateAuthenticatedProfile(
      user
    );

    /*
      Only redirect when we already have
      enough information to enter the profile.
    */

    if (
      data.profile?.id &&
      data.profile?.role
    ) {
      const modal =
        document.getElementById(
          "authModal"
        );

      if (
        modal?.classList.contains(
          "active"
        )
      ) {
        window.location.href =
          "profile.html";
      }
    }

  } catch (error) {

    console.error(
      "Authenticated profile sync error:",
      error
    );
  }
}

/* =========================================================
   GENERAL UI
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

document
  .getElementById("loginBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal();
      authMode = "login";
      updateAuthMode();
    }
  );

document
  .getElementById("mobileLoginBtn")
  ?.addEventListener(
    "click",
    () => {
      openAuthModal();
      authMode = "login";
      updateAuthMode();
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
   START
========================================================= */

function loadSupabaseScript() {

  return new Promise(
    (resolve, reject) => {

      if (window.supabase) {
        resolve();
        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

      script.onload =
        resolve;

      script.onerror =
        reject;

      document.head.appendChild(
        script
      );
    }
  );
}

async function initialize() {

  try {

    await loadSupabaseScript();

    initializeSupabase();

    createAuthFields();

    await checkSession();

  } catch (error) {

    console.error(
      "Expo Go initialization error:",
      error
    );
  }
}

initialize();