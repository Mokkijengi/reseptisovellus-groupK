require("dotenv").config();
const mysql = require("mysql2/promise");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "recipes_db",
};

async function connectToDatabase() {
  const connection = await mysql.createPool(dbConfig);
  console.log("Connected to MySQL database.");
  return connection;
}

module.exports = connectToDatabase;
