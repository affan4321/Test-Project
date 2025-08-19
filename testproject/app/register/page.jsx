"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter(); // initialize router
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    bio: "",
    interests: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "interests") {
        formData.append(
          "interests",
          JSON.stringify(value.split(",").map((i) => i.trim()))
        );
      } else {
        formData.append(key, value);
      }
    });

    if (profilePicture) formData.append("profile_picture", profilePicture);

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      alert("User registered successfully!");
      router.push("/login");
    }
    else {
      const error = await res.json();
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-5"
        encType="multipart/form-data"
      >
        <h1 className="text-3xl font-bold text-center text-purple-600 mb-4">
          Register
        </h1>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Interests</label>
          <input
            type="text"
            name="interests"
            placeholder="e.g. coding, music, football"
            value={form.interests}
            onChange={handleChange}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <button className="w-full py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition">
          Register
        </button>
      </form>
    </div>
  );
}
