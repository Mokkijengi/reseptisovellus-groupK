// TÄNNE KAIKKI RESEPTEJÄ KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const express = require("express");
const multer = require("multer");
const { executeSQL } = require("../utils/SqlTools");
const verifyToken = require("../routes/protectedRoute");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Hae KAIKKI reseptit (sisältää sekä julkiset että yksityiset)
router.get("/recipes", async (req, res) => {
  try {
    const rows = await executeSQL("SELECT * FROM recipes");
    console.log(rows);
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

    console.log("Found recipe:", rows[0]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recipe!" });
  }
});

// Hae kirjautuneen käyttäjän omat reseptit
router.get("/my-recipes", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID missing in token!" });
    }

    const rows = await executeSQL("SELECT * FROM recipes WHERE author_id = ?", [
      userId,
    ]);

    console.log(`🔹 Käyttäjän ${userId} reseptit haettu!`);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user recipes:", err);
    res.status(500).json({ error: "Failed to fetch user recipes!" });
  }
});

// Lisäys
router.post(
  "/recipes",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    const { title, ingredients, instructions, keywords, is_private } = req.body;
    const author_id = req.user.userId;
    const image = req.file ? req.file.buffer : null;

    if (!author_id || !title || !ingredients || !instructions) {
      return res.status(400).json({
        error: "Author ID, title, ingredients, and instructions are required!",
      });
    }

    try {
      const result = await executeSQL(
        "INSERT INTO recipes (author_id, title, ingredients, instructions, image_url, keywords, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          author_id,
          title,
          ingredients,
          instructions,
          image,
          keywords || null,
          is_private !== undefined ? is_private : 0,
        ]
      );

      res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Failed to create recipe!" });
    }
  }
);

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

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Failed to create recipe!" });
  }
});

// Muokkaus
router.put(
  "/recipes/:id",
  verifyToken,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const { title, ingredients, instructions, keywords } = req.body;
    const image = req.file ? req.file.buffer : null;

    if (!title && !ingredients && !instructions && !image && !keywords) {
      return res.status(400).json({ error: "No fields to update!" });
    }

    try {
      let existingImage = null;
      if (!image) {
        const existing = await executeSQL(
          "SELECT image_url FROM recipes WHERE id = ?",
          [id]
        );
        if (existing.length > 0) {
          existingImage = existing[0].image_url;
        }
      }

      const fields = [];
      const values = [];

      if (title) {
        fields.push("title = ?");
        values.push(title);
      }
      if (ingredients) {
        fields.push("ingredients = ?");
        values.push(ingredients);
      }
      if (instructions) {
        fields.push("instructions = ?");
        values.push(instructions);
      }
      if (keywords !== undefined) {
        // Tarkistetaan, että keywords on annettu (voi olla tyhjä)
        fields.push("keywords = ?");
        values.push(keywords);
      }
      if (image || existingImage) {
        fields.push("image_url = ?");
        values.push(image || existingImage);
      }

      const result = await executeSQL(
        `UPDATE recipes SET ${fields.join(", ")} WHERE id = ?`,
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
  }
);

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

// Palauta reseptin kuva erillisenä pyyntönä
router.get("/recipe/:id/image", async (req, res) => {
  const { id } = req.params;

  try {
    const rows = await executeSQL(
      "SELECT image_url FROM recipes WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0 || !rows[0].image_url) {
      return res.status(404).send("Image not found");
    }

    res.setHeader("Content-Type", "image/png");
    res.send(rows[0].image_url);
  } catch (err) {
    console.error("Error fetching image:", err);
    res.status(500).send("Failed to fetch image");
  }
});

module.exports = router;
