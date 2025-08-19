"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold mb-4">Welcome to Facelook</h1>
        <p className="mb-8 text-lg">
          Connect with friends, share moments, and explore what’s happening around you.
        </p>
        <div className="flex justify-center gap-6">
          <button
            onClick={() => router.push("/login")}
            className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/register")}
            className="border border-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-purple-600 transition"
          >
            Register
          </button>
        </div>
      </div>
      <div className="mt-16">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
          alt="Social Media Illustration"
          className="rounded-xl shadow-2xl w-full max-w-lg"
        />
      </div>
    </div>
  );
}
