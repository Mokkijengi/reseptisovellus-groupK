//TÄNNE KAIKKI RESEPTEJÄ KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const express = require("express");
const db = require("../yhteys");

const { executeSQL } = require("../utils/SQLTools");

const router = express.Router();

router.get("/test-recipes", async (req, res) => {
  try {
    const rows = await executeSQL("SELECT * FROM recipes");

    if (!Array.isArray(rows)) {
      throw new Error("Database query did not return an array");
    }

    res.json(rows); // ✅ Palautetaan oikeassa muodossa
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to fetch recipes!" });
  }
});

module.exports = router;
