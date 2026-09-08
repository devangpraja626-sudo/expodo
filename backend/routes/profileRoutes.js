const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

/* =========================================================
   POST /api/profiles
   Create or update an Expo Go profile
========================================================= */

router.post("/", async (req, res) => {
  try {
    const profile = req.body || {};

    if (!profile.name || !profile.role) {
      return res.status(400).json({
        success: false,
        message: "Profile name and role are required."
      });
    }

    if (
      !["employee", "employer"].includes(
        profile.role
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile role."
      });
    }

    const authUserId =
      profile.authUserId ||
      profile.auth_user_id ||
      null;

    if (!authUserId) {
      return res.status(400).json({
        success: false,
        message: "Authenticated user ID is required."
      });
    }

    /*
      Find the existing profile by Supabase Auth user.
      This is the important part.

      We don't blindly trust the frontend profile ID.
    */

    const {
      data: existingProfile,
      error: lookupError
    } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (lookupError) {
      console.error(
        "Existing profile lookup error:",
        lookupError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to find existing profile.",
        error: lookupError.message
      });
    }

    /*
      Keep the same profile ID once it exists.
      For a new profile, use the Supabase Auth UUID.
    */

    const profileId =
      existingProfile?.id ||
      profile.id ||
      authUserId;

    /*
      Explicitly map frontend fields to database columns.
    */

    const profileData = {
      id: profileId,

      auth_user_id: authUserId,

      name:
        String(profile.name || "").trim(),

      role:
        profile.role,

      headline:
        String(profile.headline || "").trim(),

      skills:
        Array.isArray(profile.skills)
          ? profile.skills
              .map(skill =>
                String(skill).trim()
              )
              .filter(Boolean)
          : [],

      education:
        String(
          profile.education || ""
        ).trim(),

      experience:
        String(
          profile.experience || ""
        ).trim(),

      desired_position:
        String(
          profile.desiredPosition ||
          profile.desired_position ||
          ""
        ).trim(),

      location:
        String(
          profile.location || ""
        ).trim(),

      work_preference:
        String(
          profile.workPreference ||
          profile.work_preference ||
          ""
        ).trim(),

      about:
        String(
          profile.about || ""
        ).trim(),

      company:
        String(
          profile.company || ""
        ).trim(),

      hiring_position:
        String(
          profile.hiringPosition ||
          profile.hiring_position ||
          ""
        ).trim(),

      required_skills:
        Array.isArray(
          profile.requiredSkills
        )
          ? profile.requiredSkills
              .map(skill =>
                String(skill).trim()
              )
              .filter(Boolean)
          : Array.isArray(
              profile.required_skills
            )
            ? profile.required_skills
                .map(skill =>
                  String(skill).trim()
                )
                .filter(Boolean)
            : [],

      experience_required:
        String(
          profile.experienceRequired ||
          profile.experience_required ||
          ""
        ).trim(),

      work_type:
        String(
          profile.workType ||
          profile.work_type ||
          ""
        ).trim(),

      updated_at:
        new Date().toISOString()
    };

    /*
      Preserve original creation time when updating.
      Supabase will use its default for a new row.
    */

    const {
      data: savedProfile,
      error: saveError
    } = await supabase
      .from("profiles")
      .upsert(
        profileData,
        {
          onConflict: "id"
        }
      )
      .select("*")
      .single();

    if (saveError) {
      console.error(
        "Supabase profile save error:",
        saveError
      );

      return res.status(500).json({
        success: false,
        message: "Unable to save profile.",
        error: saveError.message
      });
    }

    console.log(
      "Expo Go profile saved:",
      savedProfile.id,
      savedProfile.auth_user_id
    );

    return res.json({
      success: true,
      message: "Profile saved successfully.",
      profile: savedProfile
    });

  } catch (error) {
    console.error(
      "Profile save error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while saving profile.",
      error: error.message
    });
  }
});


/* =========================================================
   GET /api/profiles/me/:authUserId

   Load the profile belonging to a Supabase Auth user.
========================================================= */

router.get(
  "/me/:authUserId",
  async (req, res) => {
    try {
      const {
        authUserId
      } = req.params;

      if (!authUserId) {
        return res.status(400).json({
          success: false,
          message:
            "Authentication user ID is required."
        });
      }

      const {
        data: profile,
        error
      } = await supabase
        .from("profiles")
        .select("*")
        .eq(
          "auth_user_id",
          authUserId
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Supabase profile lookup error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to load profile.",
          error: error.message
        });
      }

      return res.json({
        success: true,
        profile:
          profile || null
      });

    } catch (error) {
      console.error(
        "Profile lookup error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load profile."
      });
    }
  }
);


/* =========================================================
   GET /api/profiles/:id

   Public profile lookup by profile ID.
========================================================= */

router.get(
  "/:id",
  async (req, res) => {
    try {
      const {
        id
      } = req.params;

      const {
        data: profile,
        error
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error(
          "Profile fetch error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to load profile.",
          error: error.message
        });
      }

      if (!profile) {
        return res.status(404).json({
          success: false,
          message:
            "Profile not found."
        });
      }

      return res.json({
        success: true,
        profile
      });

    } catch (error) {
      console.error(
        "Profile fetch error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load profile."
      });
    }
  }
);


/* =========================================================
   GET /api/profiles

   List profiles, optionally filtered by role.
========================================================= */

router.get(
  "/",
  async (req, res) => {
    try {
      const role =
        req.query.role;

      let query =
        supabase
          .from("profiles")
          .select("*")
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (
        role &&
        ["employee", "employer"]
          .includes(role)
      ) {
        query =
          query.eq(
            "role",
            role
          );
      }

      const {
        data: profiles,
        error
      } = await query;

      if (error) {
        console.error(
          "Profiles fetch error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to load profiles.",
          error: error.message
        });
      }

      return res.json({
        success: true,
        role:
          role || "all",
        profiles:
          profiles || []
      });

    } catch (error) {
      console.error(
        "Profiles fetch error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load profiles."
      });
    }
  }
);


module.exports = router;