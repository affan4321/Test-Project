// messages.js
const express = require("express");
const router = express.Router();
const pool = require("../database"); // assuming you use PostgreSQL with 'pool'

// Middleware to check JWT
const jwt = require("jsonwebtoken");
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Create messages table if not exists
// Run this once in your DB:
// CREATE TABLE messages (
//   id SERIAL PRIMARY KEY,
//   sender_id INT NOT NULL,
//   receiver_id INT NOT NULL,
//   message TEXT NOT NULL,
//   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// Fetch messages between logged-in user and target user
router.get("/messages/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1) 
       ORDER BY timestamp ASC`,
      [req.user.id, userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
