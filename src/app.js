const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();
const resepti = require("./routes/resepti");

const app = express();
app.use(express.json());

// Use recipe routes
app.use("/resepti", resepti);
app.use("/arvostelut", arvostelut);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
