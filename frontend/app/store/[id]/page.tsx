"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ClockIcon,
  GiftIcon,
  StarIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  LockClosedIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import FavoriteButton from '@/components/FavoriteButton';

interface Store {
  _id: string;
  name: string;
  description: string;
  website?: string;
  logo?: string;
  category: string;
  isActive: boolean;
  rating?: number;
  totalOffers?: number;
  activeOffers?: number;
  createdAt: string;
}

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  code: string;
  storeId: {
    _id: string;
    name: string;
    logo?: string;
    website?: string;
  };
  storeName: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  expiryDate: string;
  usageCount: number;
  minPurchaseAmount: number;
  imageUrl?: string;
  createdAt: string;
}

interface CopiedState {
  [key: string]: boolean;
}

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;

  const [store, setStore] = useState<Store | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copiedOffers, setCopiedOffers] = useState<CopiedState>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
      checkAuthStatus();
    }

    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('authStatusChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange);
    };
  }, [storeId]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      
      // Fetch store details
      const storeRes = await fetch(`http://localhost:5000/api/stores/${storeId}`);
      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setStore(storeData.store);
      } else if (storeRes.status === 404) {
        setError('Store not found');
        return;
      }

      // Fetch store offers
      const offersRes = await fetch(`http://localhost:5000/api/stores/${storeId}/coupons`);
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData.coupons || []);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      setError('Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const blurOfferCode = (code: string) => {
    if (isLoggedIn || code.length <= 3) {
      return code;
    }
    // Blur last 3 characters
    const visiblePart = code.slice(0, -3);
    const blurredPart = '***';
    return visiblePart + blurredPart;
  };

  const copyToClipboard = async (code: string, offerId: string) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(offerId);
      setTimeout(() => setShowLoginPrompt(null), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopiedOffers(prev => ({ ...prev, [offerId]: true }));
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedOffers(prev => ({ ...prev, [offerId]: false }));
      }, 2000);

      // Track offer usage
      try {
        await fetch(`http://localhost:5000/api/coupons/${offerId}/use`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error tracking offer usage:', error);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
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

  const renderOfferCard = (offer: Offer) => (
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
          {offer.storeId.logo ? (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md ring-2 ring-gray-100">
              <Image
                src={offer.storeId.logo}
                alt={offer.storeName}
                fill
                className="object-cover"
                sizes="56px"
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
              !isLoggedIn ? 'bg-gray-100 border-gray-300' : 'bg-blue-50 border-blue-300'
            }`}>
              <code className={`font-mono font-bold text-sm ${
                !isLoggedIn ? 'text-gray-600' : 'text-blue-800'
              }`}>
                {blurOfferCode(offer.code)}
              </code>
              {!isLoggedIn && (
                <div className="absolute inset-0 flex items-center justify-end pr-2">
                  <LockClosedIcon className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </div>
            <button
              onClick={() => copyToClipboard(offer.code, offer._id)}
              className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center transform hover:scale-105 ${
                isLoggedIn 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg' 
                  : 'bg-gray-400 hover:bg-gray-500 text-white cursor-pointer'
              }`}
              title={isLoggedIn ? "Copy offer code" : "Sign in to copy offer code"}
            >
              {copiedOffers[offer._id] ? (
                <CheckIcon className="h-4 w-4" />
              ) : isLoggedIn ? (
                <DocumentDuplicateIcon className="h-4 w-4" />
              ) : (
                <LockClosedIcon className="h-4 w-4" />
              )}
            </button>
            <FavoriteButton offerId={offer._id} className="ml-2" />
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
          {!isLoggedIn && (
            <p className="text-gray-500 text-xs mt-1">
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
            {formatTimeLeft(offer.expiryDate)}
          </div>

        </div>

        {/* Enhanced Visit Store Button */}
        <a
          href={offer.storeId.website || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center group shadow-lg hover:shadow-xl transform hover:scale-105 hover:shadow-orange-500/25"
        >
          <BuildingStorefrontIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
          Visit Store & Shop
        </a>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            {/* Back Button Skeleton */}
            <div className="h-6 bg-gray-300 rounded w-32 mb-8"></div>
            
            {/* Store Header Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>

            {/* Offers Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Home
          </Link>

          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <BuildingStorefrontIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-2">Store Not Found</h1>
              <p className="text-red-500 mb-6">{error || 'The store you are looking for does not exist.'}</p>
              <Link 
                href="/"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Go Back Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-8 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        {/* Store Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-start space-x-6">
            {/* Store Logo */}
            <div className="flex-shrink-0">
              {store.logo ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shadow-lg ring-2 ring-gray-100">
                  <Image
                    src={store.logo}
                    alt={store.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <BuildingStorefrontIcon className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
              <p className="text-lg text-blue-600 font-medium mb-4">{store.category}</p>
              <p className="text-gray-600 mb-4">{store.description}</p>
              
              {/* Store Stats */}
              {(store.activeOffers && store.activeOffers > 0) || (store.rating && store.rating > 0) ? (
                <div className="flex items-center space-x-6">
                  {store.activeOffers && store.activeOffers > 0 && (
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-semibold text-green-600">
                        {store.activeOffers} Active Offers
                      </span>
                    </div>
                  )}
                  {store.rating && store.rating > 0 && (
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-500 mr-2 fill-current" />
                      <span className="font-semibold text-gray-700">
                        {store.rating.toFixed(1)} Rating
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Visit Store Button */}
            {store.website && (
              <div className="flex-shrink-0">
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <ArrowTopRightOnSquareIcon className="h-5 w-5 mr-2" />
                  Visit Store
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Offers Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            {store.name} Exclusive Deals
          </h2>
          <p className="text-lg text-gray-600">
            {offers.length} exclusive offer{offers.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {/* Offers Grid */}
        {offers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => renderOfferCard(offer))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <TagIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Offers Available</h3>
            <p className="text-gray-600">This store doesn't have any active offers at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
} 