const express = require("express");
const router = express.Router();
const RecipeModel = require("../models/recipeModel");

module.exports = (db) => {
  const recipeModel = new RecipeModel(db);

  router.get("/recipes", async (req, res) => {
    try {
      const recipes = await recipeModel.getAllRecipes();
      res.json(recipes);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  router.post("/recipes", async (req, res) => {
    try {
      await recipeModel.addRecipe(req.body);
      res.status(201).send("Recipe added successfully.");
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  return router;
};
