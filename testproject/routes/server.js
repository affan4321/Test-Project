const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const messageRoutes = require("./messages");
const jwt = require("jsonwebtoken");
const path = require("path");
const pool = require("../database"); // Make sure your DB pool is here

dotenv.config();

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use("/api", authRoutes);
app.use("/api", postRoutes);
app.use("/api", messageRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Map to track online users
const onlineUsers = new Map();

// Middleware for authenticating socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Unauthorized"));

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Handle socket connections
io.on("connection", (socket) => {
  onlineUsers.set(socket.user.id, socket.id);
  console.log(`User connected: ${socket.user.username}`);

  // Private messages
  socket.on("private_message", async ({ toUserId, message }) => {
    // Save message to DB
    try {
      await pool.query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)",
        [socket.user.id, toUserId, message]
      );
    } catch (err) {
      console.error("DB insert error:", err);
    }

    const toSocketId = onlineUsers.get(toUserId);
    if (toSocketId) {
      io.to(toSocketId).emit("private_message", {
        fromUserId: socket.user.id,
        message,
        timestamp: new Date(),
      });
    }

    // Echo back to sender
    socket.emit("private_message", {
      fromUserId: socket.user.id,
      message,
      timestamp: new Date(),
    });
  });

  // Join a room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.user.username} joined room ${roomId}`);
  });

  // Real-time like updates
  socket.on("like_post", (postId) => {
    io.emit("like_update", { postId, user: socket.user.id });
  });

  // Real-time comment updates
  socket.on("comment_post", ({ postId, comment }) => {
    io.emit("comment_update", {
      postId,
      user: socket.user.username,
      comment,
      timestamp: new Date(),
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.user.id);
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
