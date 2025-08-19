"use client";
import React, { useState, useEffect, useRef } from "react";
import { initSocket } from "../lib/socket"; // your socket utils

export default function ChatBox() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = token ? JSON.parse(atob(token.split(".")[1])).id : null;

  // Initialize socket
  useEffect(() => {
    if (!token) return;
    const s = initSocket(token);
    setSocket(s);

    s.on("private_message", (msg) => {
      if (selectedUser && (msg.from === selectedUser.id || msg.from === userId)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => s.disconnect();
  }, [token, selectedUser]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch all users
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUsers);
  }, [token]);

  const selectUser = (user) => {
    setSelectedUser(user);
    setMessages([]); // reset messages for new chat
    // TODO: fetch chat history with this user from your backend if available
  };

  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;
    socket.emit("private_message", { to: selectedUser.id, message: text });
    setMessages((prev) => [
      ...prev,
      { from: userId, message: text, timestamp: new Date() },
    ]);
    setText("");
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-lg rounded-xl border border-gray-200 flex flex-col">
      <div className="border-b px-3 py-2 font-semibold">Chat</div>

      {/* User Selector */}
      <div className="p-2 border-b max-h-32 overflow-y-auto">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => selectUser(u)}
            className={`p-1 cursor-pointer rounded ${
              selectedUser?.id === u.id ? "bg-purple-100" : ""
            }`}
          >
            {u.username}
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="p-2 flex flex-col space-y-1 flex-1 max-h-60 overflow-y-auto">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-1 rounded text-sm ${
              m.from === userId ? "bg-purple-200 self-end" : "bg-gray-200 self-start"
            }`}
          >
            {m.message}
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className="flex p-2 border-t">
        <input
          className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Type..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-purple-600 text-white px-3 rounded hover:bg-purple-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
