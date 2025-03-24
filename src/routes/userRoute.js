const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUser,
  refreshToken,
  deleteUser,
  editUser,
  getSingleUser,
} = require("../controllers/userController"); // Import controllers

const verifyToken = require("../routes/protectedRoute"); // Lisätty autentikointivarmistus

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", getAllUsers);
router.get("/user", getUser);
router.post("/refreshToken", refreshToken);
router.put("/users/:id", editUser);
router.get("/users/:id", getSingleUser); // Hakee yksittäisen käyttäjän tiedot idllä

router.delete("/users/:id", deleteUser);

// Lisätty reitti hakemaan kirjautuneen käyttäjän tiedot tokenin avulla
router.get("/me", verifyToken, getUser);

module.exports = router;
