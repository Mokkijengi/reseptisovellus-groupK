//responsible for registering a new user, maybe later we can add more functionalities like modifying user data, deleting user, etc.

//import db and sqltools
const db = require('../db'); //excisting database connection
const { executeSQL } = require('../utils/SqlTools'); //sql tools from utils
const bcrypt = require('bcryptjs'); //bcrypt for hashing passwords, need to install npm bcrypjs

//function to register a new user
const registerUser = async (req, res) => {
    try {
        console.log("received req.body", req.body); //debugging
        // If req.body is undefined, return an error
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error("❌ Error: req.body is undefined or empty.");
            return res.status(400).json({ message: "Request body is missing." });
        }

        const { fullName, username, email, password } = req.body; //get the data from register form in popup

        if (!fullName || !username || !email || !password) {
            console.error("❌ Validation Error: Missing fields");
            return res.status(400).json({ message: "All fields are required!" });
        }

        //check if user already exists with email or username
        const existingUser = await executeSQL(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
          
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists with same email or username.' });
        }

        //hash the password before storing in database
        const hashPassword = await bcrypt.hash(password, 10);

        //insert the user data into database
        const insertNewUser =`
            INSERT INTO users (username, name, email, password_hash, user_role) 
            VALUES (?, ?, ?, ?, 'user')
        `;
        await executeSQL(insertNewUser, [username, fullName, email, hashPassword]);

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error.' });      
    }
};

module.exports = { registerUser };