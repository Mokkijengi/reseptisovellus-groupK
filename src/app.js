const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const app = express(); //siirretty kaiken varalta 11.2. AINO

const path = require("path"); //liittyy Modal-komponenttiin

app.use(express.json());

app.use("/protected", require("./routes/protectedRoute")); //tokenin tarkistus, lisätty 16.2. AINO

app.use("/recipeRoute", require("./routes/recipeRoute"));

app.use("/userRoute", require("./routes/userRoute")); //TARVITAAN UUDEN KÄYTTÄJÄN LUOMISEEN MUUTETTU 11.2. AINO

//app.use("/emailRoute", require("./routes/emailRoute"));
//app.use("/reviewRoute", require("./routes/reviewRoute"));
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Serve Static Files from the 'utils' directory
app.use("/src/utils", express.static(path.join(__dirname, "utils")));
app.use(
  "/src/utils/Modal",
  express.static(path.join(__dirname, "utils/Modal"))
);
app.use(
  "/src/utils/Modal/modalStyle.css",
  express.static(path.join(__dirname, "utils/Modal/modalStyle.css"))
);
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
