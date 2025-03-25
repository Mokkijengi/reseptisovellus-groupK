const { executeSQL } = require("../utils/SqlTools");
const jwt = require("jsonwebtoken");

const addReview = async (req, res) => {
  try {
    const { recipeId, rating, comment } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    if (!recipeId || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await executeSQL(
      "INSERT INTO reviews (recipe_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())",
      [recipeId, userId, rating, comment]
    );

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ⭐ HAE ARVOSTELUT (NYT SISÄLTÄÄ KOMMENTIT & KÄYTTÄJÄNIMEN)
const getReviewsByRecipe = async (req, res) => {
  try {
    const recipeId = req.params.recipeId;

    // Haetaan arvostelut, mukaan lukien käyttäjänimi (jos mahdollista)
    const reviews = await executeSQL(
      `SELECT r.rating, r.comment, u.username 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.recipe_id = ?`,
      [recipeId]
    );

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { addReview, getReviewsByRecipe };