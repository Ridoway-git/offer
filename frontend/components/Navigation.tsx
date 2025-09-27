"use client";
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon, UserIcon, TagIcon, UserGroupIcon, HomeIcon, ArrowRightOnRectangleIcon, BuildingStorefrontIcon, HeartIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AuthModals from "./AuthModals";

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if we're on the homepage
  const isHomePage = pathname === '/';

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      // Fetch user data
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setUser(null);
      });
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for authentication changes
    const handleAuthChange = () => {
      console.log("Auth status change detected, rechecking auth status...");
      checkAuthStatus();
    };
    
    // Listen for modal open events from CouponSection
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };
    
    const handleOpenSignupModal = () => {
      setIsSignupModalOpen(true);
    };
    
    window.addEventListener('authStatusChanged', handleAuthChange);
    window.addEventListener('openLoginModal', handleOpenLoginModal);
    window.addEventListener('openSignupModal', handleOpenSignupModal);
    
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange);
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
      window.removeEventListener('openSignupModal', handleOpenSignupModal);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('authStatusChanged'));
    router.push("/");
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for:', query);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons/search?q=${encodeURIComponent(query)}`);
      console.log('Search response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search results:', data);
        setSearchResults(data.coupons || []);
        setShowSearchResults(true);
      } else {
        console.log('Search endpoint failed, falling back to client-side filtering');
        // Fall back to filtering all coupons
        const allResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons?limit=50`);
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const filtered = (allData.coupons || []).filter((coupon: any) =>
            coupon.title.toLowerCase().includes(query.toLowerCase()) ||
            coupon.description.toLowerCase().includes(query.toLowerCase()) ||
            coupon.storeName.toLowerCase().includes(query.toLowerCase()) ||
            coupon.category.toLowerCase().includes(query.toLowerCase()) ||
            coupon.code.toLowerCase().includes(query.toLowerCase())
          );
          setSearchResults(filtered);
          setShowSearchResults(true);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if ((window as any).searchTimeout) {
      clearTimeout((window as any).searchTimeout);
    }
    
    // Debounce search
    (window as any).searchTimeout = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSearchResultClick = (coupon: any) => {
    setShowSearchResults(false);
    setSearchQuery("");
    
    // Navigate to offers page with the original search query
    router.push(`/offers?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleClickOutside = (e: MouseEvent) => {
    const searchContainer = document.querySelector('#search-container');
    if (searchContainer && !searchContainer.contains(e.target as Node)) {
      setShowSearchResults(false);
    }
  };

  const scrollToCategories = () => {
    const categoriesSection = document.querySelector('#categories-section');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-gray-200/20 shadow-lg shadow-black/5">
        {/* Enhanced animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/20 to-purple-50/30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/60"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Modern Logo */}
            <Link href="/" className="flex items-center group cursor-pointer">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                  Offer Bazar
                </span>
                <span className="text-xs text-gray-500 font-medium group-hover:text-gray-600 transition-colors duration-300">Best deals & offers</span>
              </div>
            </Link>

            {/* Streamlined Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link 
                href="/" 
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50 group"
              >
                <span className="relative z-10">Home</span>
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>

              <Link 
                href="/offers" 
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50 group"
              >
                <span className="relative z-10">Offers</span>
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>

              <Link 
                href="/stores" 
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50 group"
              >
                <span className="relative z-10">Stores</span>
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>

              <Link 
                href="/about" 
                className="relative px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50 group"
              >
                <span className="relative z-10">About</span>
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
            </nav>

            {/* Modern Search Bar */}
            <div id="search-container" className="hidden lg:flex flex-1 max-w-md mx-8 relative">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search offers, stores..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              {/* Enhanced Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 max-h-96 overflow-y-auto z-50 animate-in slide-in-from-top-2 duration-200">
                  {searchResults.length > 0 ? (
                    <div className="py-3">
                      <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                        {searchResults.length} Result{searchResults.length !== 1 ? 's' : ''} Found
                      </div>
                      {searchResults.map((coupon) => (
                        <button
                          key={coupon._id}
                          onClick={() => handleSearchResultClick(coupon)}
                          className="w-full px-4 py-4 text-left hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-200 border-b border-gray-50 last:border-b-0 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                                <span className="text-white text-sm font-bold">
                                  {coupon.discount}{coupon.discountType === 'percentage' ? '%' : ''}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-200">
                                {coupon.title}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {coupon.storeName} • {coupon.category}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                      
                      {/* View All Results Button */}
                      {searchResults.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100">
                          <button
                            onClick={() => {
                              setShowSearchResults(false);
                              router.push(`/offers?search=${encodeURIComponent(searchQuery)}`);
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            View All {searchResults.length} Results
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-2">No offers found for "{searchQuery}"</p>
                      <p className="text-xs text-gray-400">Try different keywords or browse all offers</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modern User Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="w-px h-6 bg-gray-300"></div>
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <Link 
                    href="/favorites" 
                    className="relative px-3 py-2 text-gray-600 hover:text-red-500 font-medium transition-all duration-200 rounded-lg hover:bg-red-50 group"
                    title="Favorites"
                  >
                    <HeartIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                  <Link 
                    href="/profile" 
                    className="relative px-3 py-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50 group"
                    title={user?.username || 'Profile'}
                  >
                    <UserIcon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  </Link>
                  {user && user.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      target="_blank"
                      className="relative px-3 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300 text-sm shadow-lg hover:shadow-xl hover:shadow-purple-500/25 group transform hover:scale-105"
                      title="Admin Panel"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <ShieldCheckIcon className="h-4 w-4 relative group-hover:scale-110 transition-transform duration-200" />
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-gray-600 hover:text-red-600 font-medium transition-all duration-200 rounded-lg hover:bg-red-50 text-sm"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="px-3 py-2 text-gray-600 hover:text-blue-600 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50 text-sm"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setIsSignupModalOpen(true)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Modern Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 transition-all duration-200 rounded-lg hover:bg-blue-50"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modern Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Search */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search offers..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500 text-sm"
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>

              <Link 
                href="/" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon className="h-5 w-5 mr-2.5" />
                Home
              </Link>

              <Link 
                href="/offers" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="h-5 w-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Offers
              </Link>

              <Link 
                href="/stores" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingStorefrontIcon className="h-5 w-5 mr-2.5" />
                Stores
              </Link>

              <Link 
                href="/about" 
                className="block text-gray-700 hover:text-blue-600 font-medium py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserGroupIcon className="h-5 w-5 mr-2.5" />
                About
              </Link>

              
              <div className="border-t border-gray-200 pt-3 mt-3">
                {isLoggedIn ? (
                  <>
                    <Link 
                      href="/favorites" 
                      className="block text-gray-700 hover:text-red-600 font-medium py-2.5 px-3 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <HeartIcon className="h-5 w-5 mr-2.5" />
                      Favorites
                    </Link>
                    <Link 
                      href="/profile" 
                      className="block text-gray-700 hover:text-blue-600 font-medium py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserIcon className="h-5 w-5 mr-2.5" />
                      {user?.username || 'Profile'}
                    </Link>
                    {user && user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        target="_blank"
                        className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 text-center flex items-center justify-center"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <ShieldCheckIcon className="h-5 w-5 mr-2.5" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-red-600 font-medium py-2.5 px-3 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2.5" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setIsLoginModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-gray-700 hover:text-blue-600 font-medium py-2.5 px-3 rounded-lg hover:bg-blue-50 transition-all duration-200 flex items-center"
                    >
                      <UserIcon className="h-5 w-5 mr-2.5" />
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        setIsSignupModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 text-center flex items-center justify-center"
                    >
                      <svg className="h-5 w-5 mr-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModals
        isLoginOpen={isLoginModalOpen}
        isSignupOpen={isSignupModalOpen}
        onLoginClose={() => setIsLoginModalOpen(false)}
        onSignupClose={() => setIsSignupModalOpen(false)}
        onSwitchToSignup={() => setIsSignupModalOpen(true)}
        onSwitchToLogin={() => setIsLoginModalOpen(true)}
      />
    </>
  );
} 