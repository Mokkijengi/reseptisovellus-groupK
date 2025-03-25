process.env.DB_HOST = "localhost";
process.env.DB_USER = "root";
process.env.DB_PASSWORD = "root";
process.env.DB_NAME = "recipedb";

const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const userRoute = require("../routes/userRoute");

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRoute);

let server;
let createdUserId = null;
const testUsername = "testiuser";

beforeAll(async () => {
  server = app.listen(4000, () => console.log("Testipalvelin käynnistetty"));

  // Poistetaan vanha testikäyttäjä ennen uuden luontia (ettei tule duplikaatteja)
  const res = await request(app).get(`/users?username=${testUsername}`);
  if (res.statusCode === 200 && res.body.length > 0) {
    const existingUserId = res.body[0].id;
    console.log("Poistetaan vanha testikäyttäjä ID:", existingUserId);
    await request(app).delete(`/users/${existingUserId}`);
  }
});

afterAll(async () => {
  if (createdUserId) {
    console.log("Poistetaan käyttäjä lopuksi ID:", createdUserId);
    await request(app).delete(`/users/${createdUserId}`);
  }
  server.close();
});

describe("User control tests", () => {
  test("should add a new user", async () => {
    const res = await request(app).post("/register").send({
      fullName: "Testikäyttäjä",
      username: testUsername,
      email: "testiemail@testi",
      password: "testisalasana",
    });

    console.log("Rekisteröinnin vastaus:", res.statusCode, res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully.");
  });

  test("should fetch created user ID", async () => {
    const res = await request(app).get(`/users?username=${testUsername}`);
    console.log("Käyttäjätiedot haettu:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    createdUserId = res.body[0].id; // Varmistetaan, että haetaan vain yksi käyttäjä
    console.log("Haettu käyttäjän ID:", createdUserId);
  });

  test("should delete just created user", async () => {
    expect(createdUserId).not.toBeNull();

    const res = await request(app).delete(`/users/${createdUserId}`);
    console.log("Poiston vastaus:", res.statusCode, res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "User deleted successfully!");

    createdUserId = null; // Estetään uudelleenpoisto `afterAll`-kohdassa
  });
});
