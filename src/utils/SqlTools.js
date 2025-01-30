const db = require("../yhteys"); // Import database connection

// Generic function to execute SQL queries
const executeSQL = async (query, params = []) => {
  try {
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (err) {
    console.error("Database Error:", err);
    throw err; // Propagate error to calling function
  }
};

module.exports = { executeSQL };
