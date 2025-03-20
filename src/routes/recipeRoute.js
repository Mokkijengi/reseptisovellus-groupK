// TÄNNE KAIKKI RESEPTEJÄ KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const express = require("express");
const { executeSQL } = require("../utils/SqlTools");
const verifyToken = require("../routes/protectedRoute"); // 🔹 Lisätty autentikointivarmistus

const router = express.Router();

// Hae KAIKKI reseptit (sisältää sekä julkiset että yksityiset)
router.get("/recipes", async (req, res) => {
  try {
    const rows = await executeSQL("SELECT * FROM recipes");
    console.log(rows); // Log rows to inspect
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipes!" });
  }
});

// Hae yksittäinen resepti ID:n perusteella
router.get("/recipe/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await executeSQL("SELECT * FROM recipes WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found!" });
    }

    console.log("Found recipe:", rows[0]); // Check the recipe that is being returned
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipe!" });
  }
});

// Hae kirjautuneen käyttäjän omat reseptit
router.get("/my-recipes", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Haetaan käyttäjän ID tokenista

    if (!userId) {
      return res.status(400).json({ error: "User ID missing in token!" });
    }

    const rows = await executeSQL(
      "SELECT * FROM recipes WHERE author_id = ?",
      [userId]
    );

    console.log(`🔹 Käyttäjän ${userId} reseptit haettu!`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ error: "Failed to fetch user recipes!" });
  }
});

// Lisää uusi resepti, pakolliset kentät: author_id, title, ingredients, instructions
router.post("/recipes", verifyToken, async (req, res) => {
  const { title, ingredients, instructions, image_url, keywords, is_private } = req.body;
  const author_id = req.user.userId; // Haetaan käyttäjä ID tokenista

  console.log("Received new recipe:", req.body); // Debug-loki

  if (!author_id || !title || !ingredients || !instructions) {
    console.error("Error: Missing required fields");
    return res.status(400).json({
      error: "Author ID, title, ingredients, and instructions are required!",
    });
  }

  const finalImageUrl = image_url || null;
  const finalKeywords = keywords || null;
  const finalIsPrivate = is_private !== undefined ? is_private : 0;

  console.log("Inserting with values:", {
    author_id,
    title,
    ingredients,
    instructions,
    finalImageUrl,
    finalKeywords,
    finalIsPrivate,
  });

  try {
    const result = await executeSQL(
      "INSERT INTO recipes (author_id, title, ingredients, instructions, image_url, keywords, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        author_id,
        title,
        ingredients,
        instructions,
        finalImageUrl,
        finalKeywords,
        finalIsPrivate,
      ]
    );

    console.log("Recipe added successfully:", result);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to create recipe!" });
  }
});

// Muokkaa reseptiä yksittäisten rivien muokkaus mahdollista
router.put("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {}; // Estetään undefined-virhe

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update!" });
  }

  try {
    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);

    const result = await executeSQL(
      `UPDATE recipes SET ${fields} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recipe not found!" });
    }

    res.json({ success: true, message: "Recipe updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update recipe!" });
  }
});

// Poista resepti
router.delete("/recipes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await executeSQL("DELETE FROM recipes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recipe not found!" });
    }

    res.json({ success: true, message: "Recipe deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete recipe!" });
  }
});

module.exports = router;
