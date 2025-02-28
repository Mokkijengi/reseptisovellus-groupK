//for registering new user
const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
} = require("../controllers/userController"); //import user registration from controller

const router = express.Router(); //create a new router for user routes

router.post("/register", registerUser); //handle registering a new user

router.post("/login", loginUser); //logs user

router.get("/users", getAllUsers); //get all users

module.exports = router; //export the router
