const express = require("express");
const verifyToken = require("../routes/protectedRoute"); // Token-tarkistus
const { executeSQL } = require("../utils/SqlTools");

const router = express.Router();

// Lisää suosikki
router.post("/add", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Saadaan käyttäjän ID tokenista
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required." });
    }

    // Tarkistetaan, onko resepti jo suosikeissa
    const existing = await executeSQL(
      "SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Recipe is already in favorites." });
    }

    // Lisätään suosikki tietokantaan
    await executeSQL(
      "INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)",
      [userId, recipeId]
    );

    res.status(201).json({ message: "Recipe added to favorites!" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Hae käyttäjän suosikit
router.get("/my-favorites", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Hae suosikit ja liittyvät reseptit
    const favorites = await executeSQL(
      `SELECT r.id, r.title 
       FROM favorites f
       JOIN recipes r ON f.recipe_id = r.id
       WHERE f.user_id = ?`,
      [userId]
    );

    res.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Poista suosikki
router.delete("/remove", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required." });
    }

    const result = await executeSQL(
      "DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
      [userId, recipeId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Favorite not found." });
    }

    res.json({ message: "Favorite removed successfully." });
  } catch (error) {
    console.error("Error removing favorite:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;