const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

// MySQL-tietokantayhteys
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Testaa tietokantayhteyttä
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS test');
        res.json({ success: true, message: 'Database connection is working!', result: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Database connection failed!' });
    }
});

// Testi: Hae kaikki reseptit
app.get('/test-recipes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM recipes');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch recipes!' });
    }
});

// Hae kaikki arvioinnit
app.get('/reviews', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reviews');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch reviews!' });
    }
});

// Käynnistä palvelin
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
