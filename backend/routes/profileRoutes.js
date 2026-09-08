const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const profile = req.body;

    if (!profile || !profile.name || !profile.role) {
      return res.status(400).json({
        success: false,
        message: "Profile name and role are required."
      });
    }

    if (!["employee", "employer"].includes(profile.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile role."
      });
    }

    const authUserId = profile.authUserId || profile.auth_user_id || null;

    let existingProfile = null;

    if (authUserId) {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_user_id", authUserId)
        .maybeSingle();

      existingProfile = data;
    }

    const profileId =
      existingProfile?.id ||
      profile.id ||
      authUserId;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: "Profile ID is required."
      });
    }

    const data = {
      id: profileId,
      auth_user_id: authUserId,

      name: profile.name,
      role: profile.role,
      headline: profile.headline || "",

      skills: Array.isArray(profile.skills)
        ? profile.skills
        : [],

      education: profile.education || "",
      experience: profile.experience || "",
      desired_position: profile.desiredPosition || "",
      location: profile.location || "",
      work_preference: profile.workPreference || "",
      about: profile.about || "",

      company: profile.company || "",
      hiring_position: profile.hiringPosition || "",

      required_skills: Array.isArray(profile.requiredSkills)
        ? profile.requiredSkills
        : [],

      experience_required:
        profile.experienceRequired || "",

      work_type:
        profile.workType || "",

      updated_at: new Date().toISOString()
    };

    const { data: savedProfile, error } = await supabase
      .from("profiles")
      .upsert(data, {
        onConflict: "id"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase profile error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to save profile.",
        error: error.message
      });
    }

    res.json({
      success: true,
      message: "Profile saved successfully.",
      profile: savedProfile
    });

  } catch (error) {
    console.error("Profile save error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while saving profile."
    });
  }
});

router.get("/me/:authUserId", async (req, res) => {
  try {
    const { authUserId } = req.params;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to load profile."
      });
    }

    res.json({
      success: true,
      profile: data || null
    });

  } catch (error) {
    console.error("Profile lookup error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load profile."
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: "Profile not found."
      });
    }

    res.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error("Profile fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load profile."
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const role = req.query.role;

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (
      role &&
      ["employee", "employer"].includes(role)
    ) {
      query = query.eq("role", role);
    }

    const { data: profiles, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Unable to load profiles.",
        error: error.message
      });
    }

    res.json({
      success: true,
      role: role || "all",
      profiles: profiles || []
    });

  } catch (error) {
    console.error("Profiles fetch error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load profiles."
    });
  }
});

module.exports = router;