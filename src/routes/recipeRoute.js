//TÄNNE KAIKKI RESEPTEJÄ KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const express = require("express");
const { executeSQL } = require("../utils/SqlTools");

const router = express.Router();

router.get("/recipes", async (req, res) => {
  try {
    const rows = await executeSQL("SELECT * FROM recipes");
    console.log(rows); // Log rows to inspect
    res.json(rows);
    /**  if (Array.isArray(rows)) {
      res.json(rows); // If rows is an array, return it directly
    } else {
      console.error("Unexpected result format:", rows);
      res.status(500).json({ error: "Unexpected result format!" });
    }*/
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipes!" });
  }
});

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

// Lisää uusi resepti, pakolliset kentät: author_id, title, ingredients, instructions
router.post("/recipes", async (req, res) => {
  const {
    author_id,
    title,
    ingredients,
    instructions,
    image_url,
    keywords,
    is_private,
  } = req.body;

  console.log("Received new recipe:", req.body); // Debug-loki

  // Tarkistetaan, että pakolliset kentät ovat mukana
  if (!author_id || !title || !ingredients || !instructions) {
    console.error("Error: Missing required fields");
    return res.status(400).json({
      error: "Author ID, title, ingredients, and instructions are required!",
    });
  }

  // Asetetaan oletusarvot valinnaisille kentille, jos niitä ei ole annettu
  const finalImageUrl = image_url || null; // Voi olla NULL
  const finalKeywords = keywords || null; // Voi olla NULL
  const finalIsPrivate = is_private !== undefined ? is_private : 0; // Oletus julkinen (0)

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
    const [result] = await executeSQL(
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
