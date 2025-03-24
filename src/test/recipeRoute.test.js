// Ympäristömuuttujat testitilanteessa
process.env.DB_HOST = "localhost";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "root";
process.env.DB_NAME = "recipedb";

const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const recipeRoute = require("../routes/recipeRoute");

// Mockataan token, mutta käytetään oikeaa kantaa
jest.mock("../routes/protectedRoute", () => (req, res, next) => {
  req.user = { userId: 6 }; // Testikäyttäjän ID, muokkaa tarvittaessa
  next();
});

// Luodaan testipalvelin
const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/recipeRoute", recipeRoute);

describe("GET /recipeRoute/my-recipes", () => {
  test("should return only the test user's recipes (IDs 63 and 64)", async () => {
    const res = await request(app)
      .get("/recipeRoute/my-recipes")
      .set("Authorization", "Bearer faketoken"); // Mockattu Token riittää

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const returnedIds = res.body.map(r => r.id).sort();
    expect(returnedIds).toEqual([63, 64]); //63 ja 64 testihenkilön reseptit

    res.body.forEach(recipe => {
      expect(recipe.author_id).toBe(6);
    });
  });
});
