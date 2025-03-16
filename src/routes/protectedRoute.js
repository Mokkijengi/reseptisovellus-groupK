const jwt = require("jsonwebtoken");

//Varmistetaan että käyttäjä on kirjautunut ja token on validi
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  //Jos tokenia ei löydy, käyttäjä ei ole kirjautunut
  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Lisätty käyttäjän tiedot requestiin
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden - Invalid token" });
  }
};

module.exports = verifyToken;
