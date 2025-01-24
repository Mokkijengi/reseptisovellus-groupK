const express = require("express");
const dotenv = require("dotenv");
const connectToDatabase = require("./config/db");
const recipeRoutes = require("./routes/recipeRoutes");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());

// Ejs toimii kuin html mutta pystyy käyttämään js:ää
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Initialize the database and start the server
(async () => {
  try {
    const db = await connectToDatabase();

    // Use the API routes
    app.use("/api", recipeRoutes(db));

    // Define view routes
    app.get("/", (req, res) => {
      res.render("pages/home", { title: "Home" });
    });

    app.get("/recipe/:id", (req, res) => {
      res.render("pages/resepti", { title: "Reseptit", resepti: {} });
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error starting the application:", err);
    process.exit(1);
  }
})();
