//TÄNNE KAIKKI Arvosteluja KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE
app.get("/reviews", async (req, res) => {
  try {
    const [rows] = await executeSQL("SELECT * FROM reviews");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reviews!" });
  }
});
