Social Media App with Real-Time Chat

A full-stack social media application built with Next.js, React, Express, PostgreSQL, and Socket.io. This project supports user authentication, posts, likes, comments, and real-time one-to-one chat between users.

# Features

- User authentication (register/login) with JWT
- Profile with optional profile picture and bio
- Create, like, and comment on posts
- Real-time private messaging
- Online users tracking
- Chatbox UI on bottom-right corner
- Persisted messages in PostgreSQL

# Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: Express.js, Socket.io
- Database: PostgreSQL
- Authentication: JWT
- File Uploads: Multer

# database schema
```
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  bio TEXT,
  interests TEXT[],
  profile_picture VARCHAR(255)
);

-- Posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id),
  user_id INT REFERENCES users(id)
);

-- Comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id),
  user_id INT REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id),
  receiver_id INT REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

# Api endpoints

- Auth

POST /api/register – Register a new user (with profile picture upload)

POST /api/login – Login and receive JWT

GET /api/me – Get current user info (requires JWT)

- Posts

GET /api/posts – Fetch all posts

POST /api/posts – Create a new post

DELETE /api/posts/:id – Delete a post

- Messages

GET /api/messages/:userId – Fetch all messages between logged-in user and selected user

# Socket.io Events

- Client → Server

- private_message – Send a private message

```socket.emit("private_message", { toUserId, message });```


- like_post – Like a post

- comment_post – Add a comment



- private_message – Receive a private message

- like_update – Real-time post like update

- comment_update – Real-time comment update

# Setup:

- clone repo
``git clone <your-repo-url>
cd <repo-folder>
``

- Install backend dependencies:
``npm install``

- Create a .env file with the following:
``PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/yourdb
JWT_SECRET=your_jwt_secret
``

- Start server:
``nodemon routes/server.js
``

- Start frontend:
``cd frontend
npm install
npm run dev
``


# Task 1 is in this folder