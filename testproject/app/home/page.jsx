"use client";
import React, { useState, useEffect } from "react";
import ChatBox from "../../components/chatbot";

// LikeButton
function LikeButton({ postId, initialLiked }) {
  const [liked, setLiked] = useState(initialLiked);

  const toggleLike = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await res.json();
    setLiked(data.liked);
  };

  return (
    <button
      onClick={toggleLike}
      className={`font-bold ${liked ? "text-red-500" : "text-gray-500"}`}
    >
      ♥
    </button>
  );
}

// Comments
function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then(setComments);
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:5000/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ content: text }),
    });

    const newComment = await res.json();
    setComments([newComment, ...comments]);
    setText("");
  };

  return (
    <div className="mt-2 space-y-2">
      <form onSubmit={submitComment} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-3 rounded-lg hover:bg-purple-700"
        >
          Post
        </button>
      </form>

      {comments.map((c) => (
        <div key={c.id} className="bg-gray-50 p-2 rounded-lg">
          <strong>{c.username}</strong>: {c.content}
          <div className="text-xs text-gray-400">
            {new Date(c.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);

  // Get current user's ID from token
  const token = localStorage.getItem("token");
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  // Fetch posts
  useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("http://localhost:5000/api/posts", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then(setPosts);
}, []);

  const createPost = async () => {
    if (!newPostText.trim()) return;

    const formData = new FormData();
    formData.append("content", newPostText);
    if (newPostImage) formData.append("image", newPostImage);

    const res = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      const post = await res.json();
      setPosts([post, ...posts]);
      setNewPostText("");
      setNewPostImage(null);
    } else {
      alert("Error creating post");
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setPosts(posts.filter((p) => p.id !== postId));
    } else {
      alert("Failed to delete post");
    }
  };

  return (
    <main className="flex flex-col max-w-3xl mx-auto mt-6 space-y-6 px-4">
      {/* Create Post */}
      <div className="bg-white p-4 rounded-2xl shadow-md space-y-3">
        <textarea
          value={newPostText}
          onChange={(e) => setNewPostText(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          maxLength={280}
        />
        <input
          type="file"
          onChange={(e) => setNewPostImage(e.target.files[0])}
          className="block"
        />
        <button
          onClick={createPost}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-600"
        >
          Post
        </button>
      </div>

      {/* Posts Feed */}
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{post.username}</span>
            <span className="text-xs text-gray-400">
              {new Date(post.created_at).toLocaleString()}
            </span>
          </div>
          <p>{post.content}</p>
          {post.image_url && (
            <img
              src={post.image_url}
              alt="post"
              className="w-full rounded-lg mt-2"
            />
          )}

          <div className="flex items-center gap-4 mt-2">
            {/* <LikeButton postId={post.id} initialLiked={false} /> */}
            <LikeButton postId={post.id} initialLiked={post.liked} />

            <Comments postId={post.id} />

            {/* ChatBox with post user */}
            {post.user_id !== userId && (
                <ChatBox userId={userId} otherUserId={post.user_id} />
            )}

            {/* Delete button only for user's own post */}
            {post.user_id === userId && (
              <button
                onClick={() => deletePost(post.id)}
                className="text-red-500 text-sm px-2 py-1 border rounded hover:bg-red-100"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </main>
  );
}
