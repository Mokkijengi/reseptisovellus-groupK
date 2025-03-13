//for registering new user
const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  refreshToken,
  deleteUser,
  editUser,
} = require("../controllers/userController"); // Import controllers

const router = express.Router(); // Luo uusi reititin käyttäjäpoluille
router.post("/register", registerUser); // Uuden käyttäjän rekisteröinti
router.post("/login", loginUser); // Käyttäjän kirjautuminen
router.get("/users", getAllUsers); // Hakee kaikki käyttäjät
router.get("/user", getUser); // Hakee yksittäisen käyttäjän tiedot
router.post("/refreshToken", refreshToken); // Tokenin uusiminen

router.post("/login", loginUser); //logs user

router.put("/users/:id", editUser); // Lisää tämä, jos puuttuu

router.delete("/users/:id", deleteUser); //delete user

module.exports = router; //export the router
