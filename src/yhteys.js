const mysql = require("mysql2/promise"); // Import MySQL2 Promise API
const dotenv = require("dotenv"); // Import dotenv module
dotenv.config(); // Configure dotenv to read .env file

// Create a connection pool with environment variables
const db = mysql.createPool({
  host: process.env.DB_HOST, // Database host
  user: process.env.DB_USER, // Database user
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
});

module.exports = db; // Export the connection pool

// Testaa tietokantayhteyttä
const testConnection = async () => {
  try {
    const [rows] = await db.execute("SELECT 1 AS test");
    console.log("Database connection is working!");
    return rows;
  } catch (err) {
    console.error("Failed to connect to the database:", err.message);
  }
};

testConnection(); // Test the connection
