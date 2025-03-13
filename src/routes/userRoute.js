//for registering new user
const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  deleteUser,
  editUser,
} = require("../controllers/userController"); //import user registration from controller

const router = express.Router(); //create a new router for user routes

router.post("/register", registerUser); //handle registering a new user

router.post("/login", loginUser); //logs user

router.get("/users", getAllUsers); //get all users

router.put("/users/:id", editUser); // Lisää tämä, jos puuttuu

router.delete("/users/:id", deleteUser); //delete user

module.exports = router; //export the router
