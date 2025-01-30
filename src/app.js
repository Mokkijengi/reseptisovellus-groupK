const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();
const db = require("./yhteys"); // Move the DB connection to a separate file
const recipesRoutes = require("./routes/recipes");

const app = express();
app.use(express.json());

// Use recipe routes
app.use("/resepti", resepti);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
