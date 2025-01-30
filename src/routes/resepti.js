//TÄNNE KAIKKI RESEPTEJÄ KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const { executeSQL } = require("../utils/dbHelper"); // Use executeSQL

app.get("/test-recipes", async (req, res) => {
  try {
    const [rows] = await executeSQL("SELECT * FROM recipes");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipes!" });
  }
});
