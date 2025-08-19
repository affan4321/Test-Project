"use client";
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-8 px-6 lg:px-16 flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-2">Facelook</h2>
      <p className="text-sm mb-4">
        Connect, share, and explore. All rights reserved © {new Date().getFullYear()}
      </p>
      <div className="flex gap-4">
        <a href="#" className="hover:underline">
          Privacy Policy
        </a>
        <a href="#" className="hover:underline">
          Terms of Service
        </a>
        <a href="#" className="hover:underline">
          Contact
        </a>
      </div>
    </footer>
  );
};

export default Footer;
