//TÄNNE KAIKKI RESEPTEJÄ KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const express = require("express");
const { executeSQL } = require("../utils/SQLTools"); // Use executeSQL

const app = express();

app.get("/test-recipes", async (req, res) => {
  try {
    const [rows] = await executeSQL("SELECT * FROM recipes");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipes!" });
  }
});

module.exports = app;
