//TÄNNE KAIKKI Arvosteluja KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const express = require("express");
const { executeSQL } = require("../utils/SqlTools");

const app = express();

router.get("/reviews", async (req, res) => {
  try {
    const [rows] = await executeSQL("SELECT * FROM reviews");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch review!" });
  }
});

export default app;
