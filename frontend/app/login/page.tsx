"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = { message: await res.text() };
      }
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative py-8 overflow-hidden">
      {/* Glassy background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        <div className="absolute inset-0 backdrop-blur-3xl bg-white/30"></div>
        {/* Floating glass orbs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-300/15 to-purple-300/15 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <form
        onSubmit={handleSubmit}
        className="relative z-10 glass backdrop-blur-xl bg-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/30"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Welcome Back</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">Email</label>
          <input
            type="email"
            className="w-full backdrop-blur-sm bg-white/30 border border-white/40 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/40 transition-all placeholder-gray-600"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
          <input
            type="password"
            className="w-full backdrop-blur-sm bg-white/30 border border-white/40 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/40 transition-all placeholder-gray-600"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        
        {error && (
          <div className="mb-4 p-3 backdrop-blur-sm bg-red-50/80 border border-red-200/50 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
        
        <div className="mt-6 text-center">
          <span className="text-gray-700">Don't have an account? </span>
          <Link href="/signup" className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 font-medium transition-all">
            Sign up here
          </Link>
        </div>
      </form>
    </div>
  );
} 