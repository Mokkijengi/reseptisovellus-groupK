//TÄNNE KAIKKI Arvosteluja KOSKEVAT ROUTET ELI GET, POST, PUT JA DELETE

const express = require("express");
const { addReview, getReviewsByRecipe } = require("../controllers/reviewController");
const router = express.Router();

router.post("/addReview", addReview);
router.get("/reviews/:recipeId", getReviewsByRecipe);

module.exports = router;