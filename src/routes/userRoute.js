//for registering new user
const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController'); //import user registration from controller

const router = express.Router(); //create a new router for user routes

router.post('/register', registerUser); //handle registering a new user

router.post('/login', loginUser); //logs user

module.exports = router; //export the router