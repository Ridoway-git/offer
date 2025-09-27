"use client";

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import FavoriteButton from '../../components/FavoriteButton';
import { 
  MagnifyingGlassIcon, 
  TagIcon, 
  CalendarIcon, 
  StarIcon,
  FireIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  SparklesIcon,
  FunnelIcon,
  DocumentDuplicateIcon,
  BuildingStorefrontIcon,
  CheckIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

interface Offer {
  _id: string;
  title: string;
  code: string;
  description: string;
  discount: number;
  minPurchaseAmount: number;
  expiryDate: string;
  isActive: boolean;
  isFeatured: boolean;
  category: string;
  storeId: {
    _id: string;
    name: string;
    logo?: string;
    website?: string;
  };
  storeName: string;
  usageCount: number;
  imageUrl?: string;
  createdAt: string;
}

function OffersContent() {
  const searchParams = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [offersPerPage] = useState(12);
  const [copiedOffers, setCopiedOffers] = useState<Set<string>>(new Set());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Handle URL search parameters
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchOffers();
    checkAuthStatus();
    
    // Listen for auth status changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('authStatusChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    filterAndSortOffers();
  }, [offers, searchTerm, selectedCategory, selectedStore, sortBy]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons`);
      if (response.ok) {
        const data = await response.json();
        console.log('First offer data:', data.coupons?.[0]); // Debug first offer
        setOffers(data.coupons || []);
      } else {
        console.error('Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOffers = () => {
    let filtered = offers.filter(offer => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
                           offer.title.toLowerCase().includes(searchLower) ||
                           offer.code.toLowerCase().includes(searchLower) ||
                           offer.storeName.toLowerCase().includes(searchLower) ||
                           offer.category.toLowerCase().includes(searchLower) ||
                           offer.description.toLowerCase().includes(searchLower);
      const matchesCategory = !selectedCategory || offer.category === selectedCategory;
      const matchesStore = !selectedStore || offer.storeName === selectedStore;
      
      return matchesSearch && matchesCategory && matchesStore && offer.isActive;
    });

    // Sort offers
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'discount-high':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'discount-low':
        filtered.sort((a, b) => a.discount - b.discount);
        break;
      case 'expiry-soon':
        filtered.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
    }

    setFilteredOffers(filtered);
    setCurrentPage(1);
  };

  const getCategories = () => {
    const categories = Array.from(new Set(offers.map(offer => offer.category)));
    return categories.filter(category => category && category !== 'search');
  };

  const getStores = () => {
    const stores = Array.from(new Set(offers.map(offer => offer.storeName)));
    return stores.filter(store => store);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryColor = (days: number) => {
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-orange-500';
    return 'text-green-500';
  };

  const blurOfferCode = (code: string) => {
    if (!localStorage.getItem("token")) {
      return code.substring(0, 3) + "••••••";
    }
    return code;
  };

  const copyToClipboard = async (code: string, offerId: string) => {
    if (!localStorage.getItem("token")) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedOffers(prev => new Set([...prev, offerId]));
      setTimeout(() => {
        setCopiedOffers(prev => {
          const newSet = new Set(prev);
          newSet.delete(offerId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Pagination
  const indexOfLastOffer = currentPage * offersPerPage;
  const indexOfFirstOffer = indexOfLastOffer - offersPerPage;
  const currentOffers = filteredOffers.slice(indexOfFirstOffer, indexOfLastOffer);
  const totalPages = Math.ceil(filteredOffers.length / offersPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Login Prompt */}
        {showLoginPrompt && (
          <div className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm animate-pulse">
            <div className="flex items-center space-x-3">
              <LockClosedIcon className="h-5 w-5" />
              <span className="font-semibold">Sign in to copy offer codes!</span>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm border border-white/20">
            <SparklesIcon className="h-5 w-5 mr-3 animate-pulse" />
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Exclusive Deals</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
              All Offers & Deals
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover amazing discounts and exclusive offers from your favorite stores. 
            Find the perfect deal for your next purchase!
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mb-12">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
              <FunnelIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Deal</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search offers, stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative group">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Store Filter */}
            <div className="relative group">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="">All Stores</option>
                {getStores().map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Sort */}
            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="discount-high">Highest Discount</option>
                <option value="discount-low">Lowest Discount</option>
                <option value="expiry-soon">Expiring Soon</option>
                <option value="popular">Most Popular</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Header */}
        {searchTerm && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Search Results</h3>
                  <p className="text-gray-600">
                    Found <span className="font-bold text-blue-600">{filteredOffers.length}</span> offers for "{searchTerm}"
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors duration-200"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
              <p className="text-gray-700 font-semibold">
                <span className="text-blue-600 font-bold">{filteredOffers.length}</span> of {offers.length} offers
              </p>
            </div>
            {filteredOffers.length > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Active Deals
              </div>
            )}
          </div>
          {filteredOffers.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
              <span className="text-gray-700 font-semibold">
                Page <span className="text-blue-600 font-bold">{currentPage}</span> of {totalPages}
              </span>
            </div>
          )}
        </div>

        {/* Offers Grid */}
        {currentOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOffers.map((offer) => {
              const daysUntilExpiry = getDaysUntilExpiry(offer.expiryDate);
              const isExpiringSoon = daysUntilExpiry <= 7;
              
              return (
                <div
                  key={offer._id}
                  className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden ${
                    offer.isFeatured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                  }`}
                >
                  {/* Enhanced Discount Badge - Top Right Corner */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-4 py-2 rounded-full font-black text-lg shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-300 ring-4 ring-white">
                      {offer.discount}% OFF
                    </div>
                  </div>



                  <div className="p-5">
                    {/* Store Info - More Prominent */}
                    <div className="flex items-center mb-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md ring-2 ring-gray-100">
                        {offer.storeId && offer.storeId.logo ? (
                          <Image
                            src={offer.storeId.logo}
                            alt={offer.storeName}
                            fill
                            className="object-cover"
                            sizes="56px"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <BuildingStorefrontIcon className="h-7 w-7 text-white" />
                          </div>
                        )}
                      </div>
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                          localStorage.getItem("token") 
                            ? "bg-blue-50 border-blue-300" 
                            : "bg-gray-100 border-gray-300"
                        }`}>
                          <code className={`font-mono font-bold text-sm ${
                            localStorage.getItem("token") 
                              ? "text-blue-800" 
                              : "text-gray-600"
                          }`}>
                            {blurOfferCode(offer.code)}
                          </code>
                        </div>
                        <button
                          onClick={() => copyToClipboard(offer.code, offer._id)}
                          className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center transform hover:scale-105 shadow-lg ${
                            localStorage.getItem("token") 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                              : "bg-gray-100 text-gray-600 cursor-not-allowed"
                          }`}
                          title={localStorage.getItem("token") ? "Copy offer code" : "Sign in to copy code"}
                        >
                          {copiedOffers.has(offer._id) ? (
                            <CheckIcon className="h-4 w-4" />
                          ) : localStorage.getItem("token") ? (
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          ) : (
                            <LockClosedIcon className="h-4 w-4" />
                          )}
                        </button>
                        <FavoriteButton offerId={offer._id} />
                      </div>
                      {!localStorage.getItem("token") && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Sign in to reveal the complete offer code
                        </p>
                      )}
                    </div>

                    {/* Additional Info - Compact */}
                    <div className="space-y-1 text-xs text-gray-500 mb-4">
                      {offer.minPurchaseAmount > 0 && (
                        <div className="flex items-center">
                          <TagIcon className="h-3 w-3 mr-1 text-blue-500" />
                          Min purchase: {offer.minPurchaseAmount} BDT
                        </div>
                      )}
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1 text-orange-500" />
                        {isExpiringSoon ? `${daysUntilExpiry} days left` : formatDate(offer.expiryDate)}
                      </div>
                      <div className="flex items-center">
                        <FireIcon className="h-3 w-3 mr-1 text-red-500" />
                        {offer.usageCount} uses
                      </div>
                    </div>

                    {/* Enhanced Visit Store Button */}
                    <a
                      href={offer.storeId && offer.storeId.website ? offer.storeId.website : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-orange-500/25"
                    >
                      <ShoppingBagIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                      Visit Store & Shop
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <TagIcon className="h-10 w-10 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No offers found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters to find more offers.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedStore('');
                  setSortBy('newest');
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16">
            <nav className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 flex items-center space-x-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 text-sm font-bold rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OffersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        </div>
      </div>
    }>
      <OffersContent />
    </Suspense>
  );
}

