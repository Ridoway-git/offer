"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Password validation states
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Validate password on change
  useEffect(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    setPasswordChecks(checks);
    
    // Calculate strength (0-4)
    const strength = Object.values(checks).filter(Boolean).length;
    setPasswordStrength(strength);
  }, [password]);

  // Get strength color and text
  const getStrengthInfo = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { color: "text-red-500", bg: "bg-red-500", text: "Very Weak" };
      case 2:
        return { color: "text-orange-500", bg: "bg-orange-500", text: "Weak" };
      case 3:
        return { color: "text-yellow-500", bg: "bg-yellow-500", text: "Fair" };
      case 4:
        return { color: "text-blue-500", bg: "bg-blue-500", text: "Good" };
      case 5:
        return { color: "text-green-500", bg: "bg-green-500", text: "Strong" };
      default:
        return { color: "text-gray-500", bg: "bg-gray-500", text: "Very Weak" };
    }
  };

  const strengthInfo = getStrengthInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (passwordStrength < 3) {
      setError("Password is too weak. Please choose a stronger password.");
      return;
    }
    
    if (username.length < 3) {
      setError("Username must be at least 3 characters long");
      return;
    }
    
    if (!email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 1500);
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
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Create Account</h2>
        
        {/* Username */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">Username</label>
          <input
            type="text"
            className="w-full backdrop-blur-sm bg-white/30 border border-white/40 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/40 transition-all placeholder-gray-600"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        
        {/* Email */}
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
        
        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full backdrop-blur-sm bg-white/30 border border-white/40 px-4 py-3 pr-12 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/40 transition-all placeholder-gray-600"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Password strength:</span>
                <span className={`text-sm font-medium ${strengthInfo.color}`}>
                  {strengthInfo.text}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.bg}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-800 mb-2">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`w-full backdrop-blur-sm bg-white/30 border px-4 py-3 pr-12 rounded-lg focus:ring-2 transition-all placeholder-gray-600 ${
                confirmPassword && password !== confirmPassword 
                  ? 'border-red-300/60 focus:ring-red-500/50 focus:border-red-400/50' 
                  : confirmPassword && password === confirmPassword 
                  ? 'border-green-300/60 focus:ring-green-500/50 focus:border-green-400/50'
                  : 'border-white/40 focus:ring-blue-500/50 focus:border-blue-400/50'
              } focus:bg-white/40`}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
            >
              {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
          {confirmPassword && (
            <div className="mt-2 flex items-center text-sm">
              {password === confirmPassword ? (
                <>
                  <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-green-600">Passwords match</span>
                </>
              ) : (
                <>
                  <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-red-600">Passwords do not match</span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-3 backdrop-blur-sm bg-red-50/80 border border-red-200/50 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 backdrop-blur-sm bg-green-50/80 border border-green-200/50 rounded-lg">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}
        
        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${
            loading || passwordStrength < 3 || password !== confirmPassword
              ? 'bg-gray-300/60 text-gray-500 cursor-not-allowed backdrop-blur-sm'
              : 'bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-105 backdrop-blur-sm'
          }`}
          disabled={loading || passwordStrength < 3 || password !== confirmPassword}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
        
        {/* Login Link */}
        <div className="mt-6 text-center">
          <span className="text-gray-700">Already have an account? </span>
          <Link href="/login" className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 font-medium transition-all">
            Sign in here
          </Link>
        </div>
      </form>
    </div>
  );
} 