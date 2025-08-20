const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../database");
const { authenticateJWT } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer config (store in uploads/ folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// ---------------------- REGISTER ----------------------
router.post("/register", upload.single("profile_picture"), async (req, res) => {
  try {
    const { username, email, password, name, bio } = req.body;
    let { interests } = req.body;

    // Convert interests from stringified JSON to array
    if (interests) {
      try {
        interests = JSON.parse(interests);
      } catch (err) {
        return res.status(400).json({ error: "Invalid interests format" });
      }
    }

    const profilePicture = req.file ? `/public/uploads/${req.file.filename}` : null;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password, name, bio, interests, profile_picture) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, username, email, name, bio, interests, profile_picture`,
      [username, email, hashedPassword, name, bio, interests, profilePicture]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- LOGIN ----------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- CURRENT USER ----------------------
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email, name, bio, profile_picture, interests FROM users WHERE id=$1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------- GET ALL USERS (for chat) ----------------------
router.get("/users", authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, profile_picture FROM users WHERE id != $1",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
