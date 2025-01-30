const express = require("express");
const router = express.Router();
const db = require("../db"); // Import database connection

// Get all recipes
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM recipes");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipes!" });
  }
});

// Create a new recipe
router.post("/", async (req, res) => {
  try {
    const { title, description, ingredients, instructions } = req.body;

    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const query = `INSERT INTO recipes (title, description, ingredients, instructions) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [
      title,
      description,
      ingredients,
      instructions,
    ]);

    res
      .status(201)
      .json({
        success: true,
        message: "Recipe created!",
        recipeId: result.insertId,
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create recipe!" });
  }
});

// Update a recipe
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ingredients, instructions } = req.body;

    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const query = `UPDATE recipes SET title=?, description=?, ingredients=?, instructions=? WHERE id=?`;
    const [result] = await db.query(query, [
      title,
      description,
      ingredients,
      instructions,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recipe not found!" });
    }

    res.json({ success: true, message: "Recipe updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update recipe!" });
  }
});

// Delete a recipe
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM recipes WHERE id=?`;
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Recipe not found!" });
    }

    res.json({ success: true, message: "Recipe deleted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete recipe!" });
  }
});

module.exports = router;
