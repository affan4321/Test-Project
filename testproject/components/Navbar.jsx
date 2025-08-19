"use client";
import React from "react";
import { useRouter } from "next/navigation";

export function StickyNavbar() {
  const router = useRouter();

  return (
    <nav className="w-full py-4 px-6 lg:px-16 flex items-center justify-between bg-white shadow-md sticky top-0 z-20">
      <h1
        className="text-2xl font-bold text-purple-600 cursor-pointer"
        onClick={() => router.push("/")}
      >
        Facelook
      </h1>

      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/login")}
          className="px-5 py-2 rounded-lg font-semibold text-purple-600 border border-purple-600 hover:bg-purple-50 transition"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/register")}
          className="px-5 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition"
        >
          Register
        </button>
      </div>
    </nav>
  );
}
