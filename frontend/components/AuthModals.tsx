"use client";
import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface AuthModalsProps {
  isLoginOpen: boolean;
  isSignupOpen: boolean;
  onLoginClose: () => void;
  onSignupClose: () => void;
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
}

export default function AuthModals({
  isLoginOpen,
  isSignupOpen,
  onLoginClose,
  onSignupClose,
  onSwitchToSignup,
  onSwitchToLogin,
}: AuthModalsProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend status when component mounts
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:5000/health');
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        setBackendStatus('offline');
      }
    };
    checkBackend();
  }, []);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      console.log("Attempting login with data:", loginData);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      console.log("Login response:", res);
      
      if (!res.ok) {
        if (res.status === 0) {
          throw new Error("Cannot connect to server. Please check if the backend is running.");
        }
        const data = await res.json();
        throw new Error(data.message || `Login failed (${res.status})`);
      }
      
      const data = await res.json();
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event('authStatusChanged'));
      onLoginClose();
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const signupPayload = {
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
      };
      console.log("Attempting signup with data:", signupPayload);
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      });
      console.log("Signup response:", res);
      
      if (!res.ok) {
        if (res.status === 0) {
          throw new Error("Cannot connect to server. Please check if the backend is running.");
        }
        const data = await res.json();
        throw new Error(data.message || `Signup failed (${res.status})`);
      }
      
      const data = await res.json();
      onSignupClose();
      onSwitchToLogin();
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Cannot connect to server. Please check your internet connection.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Login Modal */}
      <Transition appear show={isLoginOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onLoginClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl glass backdrop-blur-xl bg-white/10 p-0 text-left align-middle shadow-2xl transition-all w-full max-w-md border border-white/20">
                  {/* Header Section */}
                  <div className="relative bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 p-8 border-b border-white/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm"></div>
                    <button
                      onClick={onLoginClose}
                      className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all z-10"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                    
                    <div className="relative z-10 text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <Dialog.Title as="h3" className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                      </Dialog.Title>
                      <p className="text-white/80 text-sm">Sign in to your account to continue</p>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="p-8">

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.82 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                      </label>
                      <div className="relative group">
                        <input
                          type="email"
                          className="w-full backdrop-blur-sm bg-white/40 border-2 border-white/30 px-4 py-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400/60 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium shadow-lg group-hover:shadow-xl"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          placeholder="email@example.com"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Password
                      </label>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full backdrop-blur-sm bg-white/40 border-2 border-white/30 px-4 py-4 pr-12 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400/60 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium shadow-lg group-hover:shadow-xl"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors p-1 rounded-lg hover:bg-white/20"
                        >
                          {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Backend Status Indicator */}
                    <div className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm ${
                      backendStatus === 'online' 
                        ? 'bg-green-50/90 text-green-700 border border-green-200/60' 
                        : backendStatus === 'offline'
                        ? 'bg-red-50/90 text-red-700 border border-red-200/60'
                        : 'bg-yellow-50/90 text-yellow-700 border border-yellow-200/60'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        backendStatus === 'online' ? 'bg-green-500' : 
                        backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      Server: {backendStatus === 'online' ? 'Connected' : backendStatus === 'offline' ? 'Disconnected' : 'Checking...'}
                    </div>

                    {error && (
                      <div className="p-4 backdrop-blur-sm bg-red-50/90 border border-red-200/60 rounded-xl shadow-lg">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-red-700 text-sm font-medium">{error}</p>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl backdrop-blur-sm relative overflow-hidden group"
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Signing in...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/20 group-hover:to-purple-600/20 transition-all duration-300"></div>
                    </button>

                    <div className="text-center p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                      <span className="text-gray-700 text-sm">Don't have an account? </span>
                      <button
                        type="button"
                        onClick={() => {
                          onLoginClose();
                          onSwitchToSignup();
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 font-semibold transition-all text-sm"
                      >
                        Create one now →
                      </button>
                    </div>
                  </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Signup Modal */}
      <Transition appear show={isSignupOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onSignupClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-md" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-3xl glass backdrop-blur-xl bg-white/10 p-0 text-left align-middle shadow-2xl transition-all w-full max-w-md border border-white/20">
                  {/* Header Section */}
                  <div className="relative bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 p-8 border-b border-white/20">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm"></div>
                    <button
                      onClick={onSignupClose}
                      className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all z-10"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                    
                    <div className="relative z-10 text-center">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <Dialog.Title as="h3" className="text-3xl font-bold text-white mb-2">
                        Create Account
                      </Dialog.Title>
                      <p className="text-white/80 text-sm">Join us and start saving with exclusive deals</p>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="p-8">

                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Username
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          className="w-full backdrop-blur-sm bg-white/40 border-2 border-white/30 px-6 py-5 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400/60 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium shadow-lg group-hover:shadow-xl text-lg"
                          value={signupData.username}
                          onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                          placeholder="Enter your username"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                      </label>
                      <div className="relative group">
                        <input
                          type="email"
                          className="w-full backdrop-blur-sm bg-white/40 border-2 border-white/30 px-6 py-5 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-400/60 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium shadow-lg group-hover:shadow-xl text-lg"
                          value={signupData.email}
                          onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                          placeholder="Enter your email address"
                          required
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Create Password
                      </label>
                      <div className="relative group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full backdrop-blur-sm bg-white/40 border-2 border-white/30 px-6 py-5 pr-14 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400/60 focus:bg-white/50 transition-all duration-300 placeholder-gray-500 text-gray-800 font-medium shadow-lg group-hover:shadow-xl text-lg"
                          value={signupData.password}
                          onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                          placeholder="Create a strong password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-white/20"
                        >
                          {showPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                        </button>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          className="w-full backdrop-blur-sm bg-white/35 border border-white/40 px-6 py-5 pr-14 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400/50 focus:bg-white/45 transition-all duration-300 placeholder-gray-500 text-gray-700 font-medium shadow-md group-hover:shadow-lg text-lg"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                          placeholder="Confirm your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-white/20"
                        >
                          {showConfirmPassword ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
                        </button>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/3 to-pink-500/3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>

                    {/* Backend Status Indicator */}
                    <div className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm ${
                      backendStatus === 'online' 
                        ? 'bg-green-50/90 text-green-700 border border-green-200/60' 
                        : backendStatus === 'offline'
                        ? 'bg-red-50/90 text-red-700 border border-red-200/60'
                        : 'bg-yellow-50/90 text-yellow-700 border border-yellow-200/60'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        backendStatus === 'online' ? 'bg-green-500' : 
                        backendStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      Server: {backendStatus === 'online' ? 'Connected' : backendStatus === 'offline' ? 'Disconnected' : 'Checking...'}
                    </div>

                    {error && (
                      <div className="p-3 backdrop-blur-sm bg-red-50/80 border border-red-200/50 rounded-lg">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
                      disabled={loading}
                    >
                      {loading ? "Creating account..." : "Create Account"}
                    </button>

                    <div className="text-center">
                      <span className="text-gray-700">Already have an account? </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSignupClose();
                          onSwitchToLogin();
                        }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 font-medium transition-all"
                      >
                        Sign in here
                      </button>
                    </div>
                  </form>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 