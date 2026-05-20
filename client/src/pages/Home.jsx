import React from "react";

export default function Home({ setPage }) {
  return (
    <div className="text-center bg-white p-10 rounded-2xl shadow-lg w-96">
      <h1 className="text-3xl font-bold mb-4">Get Started</h1>
      <p className="text-gray-500 mb-6">Welcome! Choose an option</p>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setPage("login")}
          className="px-5 py-2 bg-blue-500 text-white rounded-lg"
        >
          Login
        </button>

        <button
          onClick={() => setPage("signup")}
          className="px-5 py-2 bg-green-500 text-white rounded-lg"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}