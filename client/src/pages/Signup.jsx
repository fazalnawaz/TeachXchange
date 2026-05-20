import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import GraduationCapIcon from "../components/icons/GraduationCapIcon";

import { API_URL } from "../config";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
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
      const { data } = await axios.post(`${API_URL}/api/auth/signup`, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", form.email);
      localStorage.setItem(
        "userName",
        `${form.firstName} ${form.lastName}`.trim()
      );
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Signup failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center mb-8">
        <GraduationCapIcon className="w-12 h-12 text-[#2563eb] mb-4" />
        <h1 className="text-2xl font-bold text-[#111827] mb-2">
          Create your account
        </h1>
        <p className="text-[#6b7280] text-sm">
          Join TeachXchange to start learning and teaching
        </p>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 text-center" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="John"
        />

        <Input
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Doe"
        />

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
          placeholder="Create a password"
          showPasswordToggle
        />

        <Button type="submit" variant="full" disabled={loading} className="mt-2">
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-[#6b7280] mt-6">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-[#2563eb] hover:text-[#1d4ed8] no-underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
