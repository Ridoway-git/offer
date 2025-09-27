"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  CalendarIcon,
  PencilIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  HeartIcon,
  StarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError("");
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data = { message: await res.text() };
        }
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");
        setUser(data.user);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-purple-600 to-pink-600";
      case "user":
        return "bg-gradient-to-r from-blue-600 to-cyan-600";
      default:
        return "bg-gradient-to-r from-gray-600 to-gray-700";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheckIcon className="h-5 w-5" />;
      case "user":
        return <UserIcon className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl animate-pulse">
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            My Profile
          </h1>
        </div>

        <div className="flex justify-center">
          {/* Profile Card */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              {/* Profile Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">{user.username}</h2>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-semibold ${getRoleColor(user.role)}`}>
                  {getRoleIcon(user.role)}
                  <span className="ml-2 capitalize">{user.role}</span>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center mb-3">
                      <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Email Address</h3>
                    </div>
                    <p className="text-gray-700 font-medium">{user.email}</p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center mb-3">
                      <CalendarIcon className="h-6 w-6 text-purple-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">Member Since</h3>
                    </div>
                    <p className="text-gray-700 font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center mb-3">
                    <ClockIcon className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Account Status</h3>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-green-700 font-medium">Active Account</span>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Account Actions</h3>
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 