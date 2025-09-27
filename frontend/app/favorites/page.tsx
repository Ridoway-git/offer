"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  HeartIcon, 
  ClockIcon, 
  FireIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  BuildingStorefrontIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  code: string;
  storeName: string;
  category: string;
  expiryDate: string;
  usageCount: number;
  maxUsage?: number;
  minPurchaseAmount?: number;
  imageUrl?: string;
  storeId?: {
    _id: string;
    name: string;
    logo?: string;
    website?: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedOffers, setCopiedOffers] = useState<{[key: string]: boolean}>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    fetchFavorites();
    
    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('authStatusChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange);
    };
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;
    setIsLoggedIn(isAuthenticated);
    return isAuthenticated;
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If not logged in, show empty state but don't show error
        setFavorites([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/coupons/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      } else {
        setError('Failed to load favorites');
      }
    } catch (error) {
      setError('Error loading favorites');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (offerId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/coupons/${offerId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove from local state
        setFavorites(prev => prev.filter(offer => offer._id !== offerId));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const blurOfferCode = (code: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      return code.substring(0, 2) + '••••••';
    }
    return code;
  };

  const copyToClipboard = async (code: string, offerId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginPrompt(offerId);
      setTimeout(() => setShowLoginPrompt(null), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedOffers(prev => ({ ...prev, [offerId]: true }));
      setTimeout(() => {
        setCopiedOffers(prev => ({ ...prev, [offerId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const formatTimeLeft = (expiryDate: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryDate).getTime();
    const timeLeft = expiry - now;

    if (timeLeft <= 0) return 'Expired';

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
      return 'Expires soon';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your favorites...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Favorites</h3>
              <p className="text-gray-600 mb-6">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent mb-4">
            My Favorite Offers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your saved offers and deals in one place
          </p>
        </div>

        {/* Favorites Count */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <HeartSolidIcon className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
              <p className="text-sm text-gray-600">Favorite Offers</p>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((offer) => (
              <div
                key={offer._id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden"
              >
                {/* Enhanced Discount Badge - Top Right Corner */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-4 py-2 rounded-full font-black text-lg shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300 ring-4 ring-white">
                    {offer.discount}{offer.discountType === 'percentage' ? '%' : ''} OFF
                  </div>
                </div>



                <div className="p-5">
                  {/* Store Info - More Prominent */}
                  <div className="flex items-center mb-3">
                    {offer.storeId && offer.storeId.logo ? (
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md ring-2 ring-gray-100">
                        <Image
                          src={offer.storeId.logo}
                          alt={offer.storeName}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <BuildingStorefrontIcon className="h-7 w-7 text-white" />
                      </div>
                    )}
                    <div className="ml-4 flex-1">
                      <h3 className="font-bold text-gray-900 text-xl">{offer.storeName}</h3>
                      <p className="text-sm text-blue-600 font-medium">{offer.category}</p>
                    </div>
                  </div>

                  {/* Title and Description - Reduced spacing */}
                  <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors leading-tight">
                    {offer.title}
                  </h4>
                  
                  {/* Offer Image */}
                  {offer.imageUrl && (
                    <div className="mb-3">
                      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={offer.imageUrl}
                          alt={offer.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          unoptimized
                        />
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Offer Code - Compact */}
                  <div className="mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`flex-1 border-2 border-dashed rounded-lg px-3 py-2 relative ${
                        !localStorage.getItem("token") ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-300'
                      }`}>
                        <code className={`font-mono font-bold text-sm ${
                          !localStorage.getItem("token") ? 'text-gray-600' : 'text-blue-800'
                        }`}>
                          {blurOfferCode(offer.code)}
                        </code>
                        {!localStorage.getItem("token") && (
                          <div className="absolute inset-0 flex items-center justify-end pr-2">
                            <LockClosedIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => copyToClipboard(offer.code, offer._id)}
                        className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center transform hover:scale-105 ${
                          localStorage.getItem("token")
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                            : 'bg-gray-400 hover:bg-gray-500 text-white cursor-pointer'
                        }`}
                        title={localStorage.getItem("token") ? "Copy offer code" : "Sign in to copy offer code"}
                      >
                        {copiedOffers[offer._id] ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : localStorage.getItem("token") ? (
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        ) : (
                          <LockClosedIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleFavorite(offer._id)}
                        className="px-3 py-2 rounded-lg transition-all duration-300 flex items-center transform hover:scale-105 bg-red-500 hover:bg-red-600 text-white shadow-lg"
                        title="Remove from favorites"
                      >
                        <HeartSolidIcon className="h-4 w-4" />
                      </button>
                    </div>
                    {copiedOffers[offer._id] && (
                      <p className="text-green-600 text-xs mt-1 font-medium">Copied to clipboard!</p>
                    )}
                    {showLoginPrompt === offer._id && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-amber-700 text-xs font-medium flex items-center">
                          <LockClosedIcon className="h-3 w-3 mr-1" />
                          Please sign in to copy the full offer code
                        </p>
                      </div>
                    )}
                    {!localStorage.getItem("token") && (
                      <p className="text-gray-500 text-xs mt-1">
                        Sign in to reveal the complete offer code
                      </p>
                    )}
                  </div>

                  {/* Additional Info - Compact */}
                  <div className="space-y-1 text-xs text-gray-500 mb-4">
                    {offer.minPurchaseAmount && offer.minPurchaseAmount > 0 && (
                      <div className="flex items-center">
                        <TagIcon className="h-3 w-3 mr-1 text-blue-500" />
                        Min purchase: {offer.minPurchaseAmount} BDT
                      </div>
                    )}
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1 text-orange-500" />
                      {formatTimeLeft(offer.expiryDate)}
                    </div>
                  </div>

                  {/* Enhanced Visit Store Button */}
                  <a
                    href={offer.storeId && offer.storeId.website ? offer.storeId.website : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-orange-500/25"
                  >
                    <BuildingStorefrontIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Visit Store & Shop
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {localStorage.getItem("token") ? "No favorites yet" : "Sign in to view favorites"}
              </h3>
              <p className="text-gray-600 mb-6">
                {localStorage.getItem("token") 
                  ? "Start adding offers to your favorites to see them here!" 
                  : "Please sign in to view and manage your favorite offers."
                }
              </p>
              {localStorage.getItem("token") ? (
                <a
                  href="/offers"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Browse Offers
                </a>
              ) : (
                <a
                  href="/login"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
