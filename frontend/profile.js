/* =========================================================
EXPO GO — PROFILE CONTROLLER
Supabase Auth + Render Backend + Persistent Profile
========================================================= */

const API_BASE_URL = "https://expodo.onrender.com";
const PROFILE_STORAGE_KEY = "expoGoProfile";

const SUPABASE_URL =
"https://inhxlwsjlddhnpalbocl.supabase.co";

const SUPABASE_ANON_KEY =
"sb_publishable_g3o2x8l0trhHpqndi-wLg_zfYfFaXb";

let supabaseClient = null;
let profile = null;
let currentAuthUser = null;

let connections = [];
let connectionProfiles = {};

/* =========================================================
SUPABASE
========================================================= */

function initializeSupabase() {
if (!window.supabase) {
console.error("Supabase library is not loaded.");
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
id: data.id || "",

authUserId:
  data.authUserId ||
  data.auth_user_id ||
  currentAuthUser?.id ||
  "",

name: data.name || "",

role: data.role || "",

headline: data.headline || "",

skills: normalizeArray(data.skills),

education: data.education || "",

experience: data.experience || "",

desiredPosition:
  data.desiredPosition ||
  data.desired_position ||
  "",

location: data.location || "",

workPreference:
  data.workPreference ||
  data.work_preference ||
  "",

about: data.about || "",

company: data.company || "",

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
"${API_BASE_URL}/api/profiles/me/${userId}"
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
"${API_BASE_URL}/api/profiles",
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
currentAuthUser =
await getAuthenticatedUser();

if (!currentAuthUser) {
  console.warn(
    "No authenticated user."
  );

  window.location.href =
    "index.html";

  return false;
}

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

  await syncProfileToBackend();

  return true;
}

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

window.location.href =
  "index.html";

return false;

} catch (error) {
console.error(
"Profile loading error:",
error
);

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
"${percentage}%"
);

const fill =
document.getElementById(
"completionFill"
);

if (fill) {
fill.style.width =
"${percentage}%";
}

setText(
"completionFields",
"${completed} of ${total} sections completed"
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
"${API_BASE_URL}/api/match",
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

grid
.querySelectorAll(
".match-result-card"
)
.forEach(card =>
card.remove()
);

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

const recipientId =
  getMatchAuthUserId(match);

const connectionAction =
  recipientId
    ? createMatchConnectionButton(
        recipientId
      )
    : "";

card.innerHTML = `
  <div class="match-card-top">

    <div class="match-avatar">
      ${escapeHtml(initial)}
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

    ${connectionAction}

  </div>
`;

grid.appendChild(card);

});

bindMatchConnectionButtons();
}

/* =========================================================
HTML ESCAPE
========================================================= */

function escapeHtml(value) {
return String(value || "")
.replaceAll("&", "&")
.replaceAll("<", "<")
.replaceAll(">", ">")
.replaceAll('"', """)
.replaceAll("'", "'");
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

setValue(
"editLocation",
profile.location
);

setValue(
"editWorkPreference",
profile.workPreference
);

setValue(
"editCompany",
profile.company
);

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

setValue(
"editWorkType",
profile.workType
);

setValue(
"editAbout",
profile.about
);

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
CONNECTIONS — LOAD
========================================================= */

async function loadConnections() {
if (
!supabaseClient ||
!currentAuthUser
) {
return;
}

try {
const userId =
currentAuthUser.id;

const {
  data,
  error
} =
  await supabaseClient
    .from("connections")
    .select("*")
    .or(
      `requester_id.eq.${userId},recipient_id.eq.${userId}`
    )
    .order(
      "created_at",
      {
        ascending: false
      }
    );

if (error) {
  throw error;
}

connections =
  data || [];

await loadConnectionProfiles();

} catch (error) {
console.error(
"Connections loading error:",
error
);

connections = [];
connectionProfiles = {};

}
}

/* =========================================================
LOAD CONNECTION PROFILES
========================================================= */

async function loadConnectionProfiles() {
connectionProfiles = {};

if (!currentAuthUser) {
return;
}

const ids =
new Set();

connections.forEach(
connection => {

  if (
    connection.requester_id &&
    connection.requester_id !==
      currentAuthUser.id
  ) {
    ids.add(
      connection.requester_id
    );
  }

  if (
    connection.recipient_id &&
    connection.recipient_id !==
      currentAuthUser.id
  ) {
    ids.add(
      connection.recipient_id
    );
  }
}

);

for (const id of ids) {
try {
const response =
await fetch(
"${API_BASE_URL}/api/profiles/me/${id}"
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

        authUserId:
          id
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
OTHER USER
========================================================= */

function getConnectionOtherUser(
connection
) {
if (
!currentAuthUser ||
!connection
) {
return "";
}

return connection.requester_id ===
currentAuthUser.id
? connection.recipient_id
: connection.requester_id;
}

/* =========================================================
FIND CONNECTION WITH USER
========================================================= */

function getConnectionWithUser(
userId
) {
if (
!currentAuthUser ||
!userId
) {
return null;
}

const matches =
connections.filter(
connection =>
(
connection.requester_id ===
currentAuthUser.id &&
connection.recipient_id ===
userId
) ||
(
connection.requester_id ===
userId &&
connection.recipient_id ===
currentAuthUser.id
)
);

return (
matches.find(
connection =>
connection.status ===
"accepted"
) ||

matches.find(
  connection =>
    connection.status ===
    "pending"
) ||

matches.find(
  connection =>
    connection.status ===
    "declined"
) ||

null

);
}

/* =========================================================
CONNECTION STATE
========================================================= */

function getConnectionState(
userId
) {
if (
!currentAuthUser ||
!userId
) {
return "none";
}

const connection =
getConnectionWithUser(
userId
);

if (!connection) {
return "none";
}

if (
connection.status ===
"accepted"
) {
return "accepted";
}

if (
connection.status ===
"pending"
) {
if (
connection.requester_id ===
currentAuthUser.id
) {
return "sent";
}

if (
  connection.recipient_id ===
  currentAuthUser.id
) {
  return "incoming";
}

}

/*
If we were the recipient of a
declined request, allow us to
start a new request in the
opposite direction.
*/

if (
connection.status ===
"declined" &&
connection.recipient_id ===
currentAuthUser.id
) {
return "none";
}

/*
If we previously sent a request
that was declined, keep it disabled.
*/

if (
connection.status ===
"declined" &&
connection.requester_id ===
currentAuthUser.id
) {
return "declined";
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
recipientId ===
currentAuthUser.id
) {
return;
}

const existing =
getConnectionWithUser(
recipientId
);

if (existing) {

if (
  existing.status ===
  "accepted"
) {
  return;
}

/*
  Incoming request:
  NEVER automatically accept it.
  The UI should show "Accept request".
*/

if (
  existing.status ===
    "pending" &&
  existing.recipient_id ===
    currentAuthUser.id
) {
  return;
}

/*
  Request already sent.
*/

if (
  existing.status ===
    "pending" &&
  existing.requester_id ===
    currentAuthUser.id
) {
  return;
}

/*
  We previously sent a request
  which was declined.
*/

if (
  existing.status ===
    "declined" &&
  existing.requester_id ===
    currentAuthUser.id
) {
  return;
}

}

if (button) {
button.disabled = true;
button.textContent =
"Sending...";
}

try {
const {
data,
error
} =
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

connections.unshift(
  data
);

await loadConnections();

await loadMatches();

} catch (error) {
console.error(
"Connection request error:",
error
);

if (button) {
  button.disabled = false;
  button.textContent =
    "Connect";
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
!currentAuthUser ||
!connectionId
) {
return;
}

try {
const {
data,
error
} =
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
  connections[index] =
    data;
}

await loadConnections();

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
MATCH CONNECTION BUTTON
========================================================= */

function getMatchAuthUserId(
match
) {
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
if (
!recipientId ||
!currentAuthUser
) {
return "";
}

const state =
getConnectionState(
recipientId
);

if (
state ===
"accepted"
) {
return "<button type="button" class="match-connection-action connected" disabled > Connected </button>";
}

if (
state ===
"sent"
) {
return "<button type="button" class="match-connection-action pending" disabled > Request sent </button>";
}

if (
state ===
"incoming"
) {
const connection =
getConnectionWithUser(
recipientId
);

return `
  <button
    type="button"
    class="match-connection-action respond"
    data-match-accept="${escapeHtml(
      connection?.id || ""
    )}"
  >
    Accept request
  </button>
`;

}

if (
state ===
"declined"
) {
return "<button type="button" class="match-connection-action pending" disabled > Request declined </button>";
}

return "<button type="button" class="match-connection-action" data-match-connect="${escapeHtml( recipientId )}" > Connect </button>";
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

      if (
        button.disabled
      ) {
        return;
      }

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

      if (
        button.disabled
      ) {
        return;
      }

      const connectionId =
        button.dataset.matchAccept;

      if (!connectionId) {
        return;
      }

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

/*
Load connection state before
rendering matches so the correct
button appears immediately.
*/

await loadConnections();

await loadMatches();

console.log(
"Expo Go profile is ready."
);

console.log(
"Expo Go connections are ready."
);
}

initialize();