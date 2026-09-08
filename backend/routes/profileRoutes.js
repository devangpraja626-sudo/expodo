const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

/* =========================================================
   CREATE / UPDATE PROFILE
   ========================================================= */

router.post("/", async (req, res) => {
  try {
    const profile = req.body;

    if (!profile || !profile.id || !profile.name || !profile.role) {
      return res.status(400).json({
        success: false,
        message: "Profile id, name and role are required."
      });
    }

    if (!["employee", "employer"].includes(profile.role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile role."
      });
    }

    const data = {
      id: profile.id,
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

      experience_required: profile.experienceRequired || "",
      work_type: profile.workType || "",

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

    res.status(200).json({
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

/* =========================================================
   GET PROFILE BY ID
   ========================================================= */

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

/* =========================================================
   GET PROFILES
   ========================================================= */

router.get("/", async (req, res) => {
  try {
    const role = req.query.role;

    let query = supabase
      .from("profiles")
      .select("*")
      .order("created_at", {
        ascending: false
      });

    if (role && ["employee", "employer"].includes(role)) {
      query = query.eq("role", role);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error("Supabase profiles error:", error);

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