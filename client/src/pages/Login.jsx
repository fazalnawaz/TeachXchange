import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import GraduationCapIcon from "../components/icons/GraduationCapIcon";

import { API_URL } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", form.email);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center mb-8">
        <GraduationCapIcon className="w-12 h-12 text-[#2563eb] mb-4" />
        <h1 className="text-2xl font-bold text-[#111827] mb-2">Welcome Back</h1>
        <p className="text-[#6b7280] text-sm">
          Sign in to your TeachXchange account
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          showPasswordToggle
          labelRight={
            <Link
              to="/login"
              className="text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] no-underline"
              onClick={(e) => e.preventDefault()}
            >
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" variant="full" disabled={loading} className="mt-2">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="text-center text-sm text-[#6b7280] mt-6">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#2563eb] hover:text-[#1d4ed8] no-underline"
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
