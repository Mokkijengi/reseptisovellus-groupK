//responsible for registering a new user, maybe later we can add more functionalities like modifying user data, deleting user, etc.

//import db and sqltools
const db = require("../db"); //excisting database connection
const { executeSQL } = require("../utils/SqlTools"); //sql tools from utils
const bcrypt = require("bcryptjs"); //bcrypt for hashing passwords, need to install npm bcrypjs

const jwt = require("jsonwebtoken"); //jwt for token to check if user is logged in

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
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exists with same email or username." });
    }

    //hash the password before storing in database
    const hashPassword = await bcrypt.hash(password, 10);

    //insert the user data into database
    const insertNewUser = `
            INSERT INTO users (username, name, email, password_hash, user_role) 
            VALUES (?, ?, ?, ?, 'user')
        `;
    await executeSQL(insertNewUser, [username, fullName, email, hashPassword]);

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

//function to login a user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // check any missing fields
    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // query wiht only username to check if user exists
    const sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
    const [rows] = await db.query(sql, [username]);

    if (rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];

    // compare plain text password with hashed password from database
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        //userId: user.user_id,
        userId: user.id,
        username: user.username,
        role: user.user_role, //tässä vai muualla tarkistus?
      },
      process.env.JWT_SECRET, //secret key .env tiedostosta
      //{ expiresIn: "1h" }
      //testaukseen 1min
      { expiresIn: "1m" } //ei toimi?
    );

    //console.log("JWT Secret:", process.env.JWT_SECRET);

    //if ok, login and move to recipe page
    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await executeSQL("SELECT * FROM users");

    if (!result || !Array.isArray(result)) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json(result); // Varmistetaan, että palautetaan taulukko
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await executeSQL("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.json({ success: true, message: "User deleted successfully!" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user!" });
  }
};

const editUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const result = await executeSQL(
      "UPDATE users SET username = ?, email = ?, user_role = ? WHERE id = ?",
      [username, email, role, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "User not found or no changes made!" });
    }

    res.json({ success: true, message: "User updated successfully!" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user!" });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, deleteUser, editUser };
