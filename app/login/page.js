"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkAuthRedirect } from "@/lib/checkAuthRedirect";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      await checkAuthRedirect(router);
      setAuthChecking(false);
    };
    checkAuth();
  }, []);

  if (authChecking)
    return <p className="text-black text-center">Checking authentication...</p>;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/login", formData);
      toast.success(res.data.message || "Login successful");
      router.push("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.error || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-center">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-600 hover:underline">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}
