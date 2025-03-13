// Responsible for registering a new user, logging in, and user-related operations

// Import database and utilities
const db = require("../db"); // Existing database connection
const { executeSQL } = require("../utils/SqlTools"); // SQL tools from utils
const bcrypt = require("bcryptjs"); // bcrypt for hashing passwords

const jwt = require("jsonwebtoken"); // JWT for authentication

// Register a new user
const registerUser = async (req, res) => {
  try {
    console.log("Received req.body", req.body); // Debugging
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error("❌ Error: req.body is undefined or empty.");
      return res.status(400).json({ message: "Request body is missing." });
    }

    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      console.error("❌ Validation Error: Missing fields");
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if user already exists
    const existingUser = await executeSQL(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ message: "User already exists with same email or username." });
    }

    // Hash password before storing in database
    const hashPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
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

// Login user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const sql = "SELECT * FROM users WHERE username = ? LIMIT 1";
    const [rows] = await db.query(sql, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = rows[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.user_role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // **Korjattu, aiempi "24" oli virhe**
    );

    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all users (for admin use)
const getAllUsers = async (req, res) => {
  try {
    const result = await executeSQL("SELECT * FROM users");

    if (!result || !Array.isArray(result)) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get the logged-in user's details
const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const [user] = await executeSQL(
      "SELECT id, username, email, user_role FROM users WHERE id = ?",
      [userId]
    );
    
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Refresh token if expired
const refreshToken = async (req, res) => {
  const oldToken = req.headers.authorization?.split(" ")[1];
  if (!oldToken) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });

    const newToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, getUser, refreshToken };