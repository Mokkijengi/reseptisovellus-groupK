const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const app = express();

dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Varmistetaan, että staattiset tiedostot löytyvät
app.use(express.static("views"));
app.use("/assets", express.static(__dirname + "/views/assets"));
app.use("/css", express.static(__dirname + "/views/css"));
app.use("/js", express.static(__dirname + "/views/js"));

// Reitit
app.use("/recipeRoute", require("./routes/recipeRoute"));
//app.use("/userRoute", require("./routes/userRoute"));
//app.use("/emailRoute", require("./routes/emailRoute"));
//app.use("/reviewRoute", require("./routes/reviewRoute"));

// HTML-tiedostojen tarjoaminen
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.get("/recipePage.html", (req, res) => {
  res.sendFile(__dirname + "/views/recipePage.html");
});
app.get("/singleRecipePage.html", (req, res) => {
  res.sendFile(__dirname + "/views/singleRecipePage.html");
});
app.get("/userPage.html", (req, res) => {
  res.sendFile(__dirname + "/views/userPage.html");
});

// Käynnistetään palvelin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
