require("dotenv").config();

const express = require("express");
const cors = require("cors");

const profileRoutes = require("./routes/profileRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
   ========================================================= */

app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expo Go backend is running.",
    service: "Expo Go API",
    version: "1.0.0"
  });
});

/* =========================================================
   API HEALTH
   ========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    message: "Expo Go API is ready."
  });
});

/* =========================================================
   PROFILE API
   ========================================================= */

app.use("/api/profiles", profileRoutes);

/* =========================================================
   MATCHING ROUTE
   ========================================================= */

app.post("/api/match", async (req, res) => {
  try {
    const profile = req.body;

    if (!profile || !profile.role) {
      return res.status(400).json({
        success: false,
        message: "Profile data is required."
      });
    }

    res.json({
      success: true,
      message: "Matching engine is ready.",
      matches: []
    });

  } catch (error) {
    console.error("Matching error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process matching."
    });
  }
});

/* =========================================================
   404
   ========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Expo Go API route not found."
  });
});

/* =========================================================
   SERVER
   ========================================================= */

app.listen(PORT, () => {
  console.log(
    `Expo Go backend running on port ${PORT}`
  );
});