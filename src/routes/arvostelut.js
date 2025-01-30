//TÄNNE KAIKKI Arvosteluja KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

import express from "express";
import { executeSQL } from "../utils/SQLTools"; // Use executeSQL

const app = express();

app.get("/reviews", async (req, res) => {
  try {
    const [rows] = await executeSQL("SELECT * FROM reviews");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch review!" });
  }
});

export default app;
