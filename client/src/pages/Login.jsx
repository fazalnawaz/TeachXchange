import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Login({ setPage }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, form);
      const data = response.data;
      localStorage.setItem("token", data.token);
      setMessage(data.message || "Login successful");
      setForm({ email: "", password: "" });
    } catch (error) {
      setMessage(
        error.response?.data?.message || error.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg w-96">
      {message && (
        <div className="mb-4 text-sm text-gray-700">{message}</div>
      )}
      <h2 className="text-2xl font-bold mb-4">Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="w-full p-2 border rounded mb-3"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-sm mt-3">
        No account?{' '}
        <span className="text-blue-500 cursor-pointer" onClick={() => setPage("signup")}>
          Sign up
        </span>
      </p>

      <p className="text-sm text-gray-500 mt-2 cursor-pointer" onClick={() => setPage("home")}>
        Back
      </p>
    </form>
  );
}