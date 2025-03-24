// Ympäristömuuttujat testitilanteessa
process.env.DB_HOST = "localhost";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "root";
process.env.DB_NAME = "recipedb";


const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const recipeRoute = require("../routes/recipeRoute");

// Mockataan tokenin tarkistus
jest.mock("../routes/protectedRoute", () => (req, res, next) => {
  req.user = { userId: 6 }; // Testikäyttäjän ID, muokkaa tarvittaessa
  next();
});

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/recipeRoute", recipeRoute);

let createdRecipeId = null;

describe("Recipe integration tests", () => {
  test("should add a new recipe", async () => {
    const res = await request(app)
      .post("/recipeRoute/recipes")
      .set("Authorization", "Bearer faketoken")
      .field("title", "TestiLisäys")
      .field("ingredients", "Testiperunat")
      .field("instructions", "Keitä testiperunat")
      .field("keywords", "testi");

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    createdRecipeId = res.body.id;
    console.log("Luotu uusi resepti onnistuneesti ID:", createdRecipeId);
  });

  test("should delete the recipe that was just created", async () => {
    expect(createdRecipeId).not.toBeNull();

    const res = await request(app)
      .delete(`/recipeRoute/recipes/${createdRecipeId}`)
      .set("Authorization", "Bearer faketoken");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Recipe deleted successfully!");
    console.log("Resepti poistettu onnistuneesti ID:", createdRecipeId);
  });
});
