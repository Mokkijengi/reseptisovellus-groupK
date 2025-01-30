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
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testaa tietokantayhteys
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 AS test');
        res.json({ success: true, message: 'Database connection is working!', result: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Database connection failed!' });
    }
});

// Hae kaikki reseptit
app.get('/recipes', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM recipes');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch recipes!' });
    }
});

// Lisää uusi resepti vaaditaan kaikki rivit/tiedot
app.post('/recipes', async (req, res) => {
    const { author_id, title, ingredients, instructions, image_url, keywords, is_private } = req.body;

    if (!title || !ingredients || !instructions) {
        return res.status(400).json({ error: 'Title, ingredients, and instructions are required!' });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO recipes (author_id, title, ingredients, instructions, image_url, keywords, is_private) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [author_id, title, ingredients, instructions, image_url, keywords, is_private]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create recipe!' });
    }
});

// Muokkaa reseptiä yksittäisten rivien muokkaus mahdollista
app.put('/recipes/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No fields to update!' });
    }

    try {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);

        const [result] = await db.query(`UPDATE recipes SET ${fields} WHERE id = ?`, [...values, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found!' });
        }

        res.json({ success: true, message: 'Recipe updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update recipe!' });
    }
});

// Poista resepti
app.delete('/recipes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM recipes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Recipe not found!' });
        }

        res.json({ success: true, message: 'Recipe deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete recipe!' });
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
