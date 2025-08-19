const express = require("express");
const router = express.Router();
const pool = require("../database");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");

// Storage for uploaded post images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Middleware to verify JWT
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

// CREATE POST
router.post("/posts", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    
    const imageUrl = req.file 
    ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    : null;


    if (!content || content.length > 280) {
      return res.status(400).json({ error: "Post must be 1–280 characters" });
    }

    const result = await pool.query(
      `INSERT INTO posts (user_id, content, image_url)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, content, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET FEED (all posts, newest first, paginated) with like info
router.get("/posts", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT posts.*, users.username, users.profile_picture,
              EXISTS(
                SELECT 1 FROM likes 
                WHERE likes.post_id = posts.id AND likes.user_id = $1
              ) AS liked
       FROM posts
       JOIN users ON posts.user_id = users.id
       ORDER BY posts.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET SPECIFIC POST
router.get("/posts/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, users.profile_picture
       FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE posts.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE OWN POST
router.delete("/posts/:id", authenticateToken, async (req, res) => {
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [req.params.id]);

    if (post.rows.length === 0) return res.status(404).json({ error: "Post not found" });
    if (post.rows[0].user_id !== req.user.id) return res.status(403).json({ error: "Not your post" });

    await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USER POSTS
router.get("/users/:id/posts", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT posts.*, users.username, users.profile_picture
       FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE users.id = $1
       ORDER BY posts.created_at DESC`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like/unlike a post
router.post("/posts/:id/like", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // use JWT user
    const postId = req.params.id;

    const check = await pool.query(
      "SELECT * FROM likes WHERE user_id=$1 AND post_id=$2",
      [userId, postId]
    );

    if (check.rows.length > 0) {
      // Unlike
      await pool.query("DELETE FROM likes WHERE user_id=$1 AND post_id=$2", [
        userId,
        postId,
      ]);
      return res.json({ success: true, liked: false });
    } else {
      // Like
      await pool.query("INSERT INTO likes(user_id, post_id) VALUES($1, $2)", [
        userId,
        postId,
      ]);
      return res.json({ success: true, liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Add a comment
router.post("/posts/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      "INSERT INTO comments(user_id, post_id, content) VALUES($1, $2, $3) RETURNING *",
      [userId, postId, content]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments
router.get("/posts/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const result = await pool.query(
      `SELECT comments.*, users.username
       FROM comments
       JOIN users ON comments.user_id = users.id
       WHERE comments.post_id=$1
       ORDER BY comments.created_at DESC`,
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
