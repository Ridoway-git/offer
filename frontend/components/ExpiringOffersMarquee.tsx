"use client";
import { useState, useEffect } from "react";
import { ClockIcon, ExclamationTriangleIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  expiryDate: string;
  imageUrl?: string;
}

interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ExpiringOffersMarquee() {
  const router = useRouter();
  const [expiringOffers, setExpiringOffers] = useState<Offer[]>([]);
  const [countdowns, setCountdowns] = useState<{ [key: string]: Countdown }>({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchExpiringOffers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateCountdowns();
    }, 1000);

    return () => clearInterval(interval);
  }, [expiringOffers]);

  // Auto-slide effect
  useEffect(() => {
    if (expiringOffers.length <= 3) return;
    
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.ceil(expiringOffers.length / 3));
      setProgress(0);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(slideInterval);
  }, [expiringOffers.length]);

  // Progress bar effect
  useEffect(() => {
    if (expiringOffers.length <= 3) return;
    
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 40); // Update every 40ms for smooth progress

    return () => clearInterval(progressInterval);
  }, [expiringOffers.length]);

  const handleMouseEnter = () => {
    // Pause auto-slide on hover
  };

  const handleMouseLeave = () => {
    // Resume auto-slide when mouse leaves
  };

  const fetchExpiringOffers = async () => {
    try {
      console.log('Fetching expiring offers...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons`);
      if (response.ok) {
        const data = await response.json();
        const offers = data.coupons || [];
        console.log('Total offers found:', offers.length);
        
        // Filter offers that expire within 1-2 days
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const expiringOffers = offers.filter((offer: Offer) => {
          const expiryDate = new Date(offer.expiryDate);
          const timeDiff = expiryDate.getTime() - now.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);
          
          console.log(`Offer: ${offer.title}, Expires: ${offer.expiryDate}, Hours until expiry: ${hoursDiff}`);
          
          // Offers expiring within the next 24-48 hours (1-2 days)
          return hoursDiff >= 0 && hoursDiff <= 48;
        });
        
        console.log('Expiring offers found:', expiringOffers.length);
        setExpiringOffers(expiringOffers);
        initializeCountdowns(expiringOffers);
      }
    } catch (error) {
      console.error('Error fetching expiring offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeCountdowns = (offers: Offer[]) => {
    const countdowns: { [key: string]: Countdown } = {};
    
    offers.forEach(offer => {
      const expiryDate = new Date(offer.expiryDate);
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        countdowns[offer._id] = { hours, minutes, seconds };
      }
    });
    
    setCountdowns(countdowns);
  };

  const updateCountdowns = () => {
    const newCountdowns: { [key: string]: Countdown } = {};
    
    expiringOffers.forEach(offer => {
      const expiryDate = new Date(offer.expiryDate);
      const now = new Date();
      const timeDiff = expiryDate.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        newCountdowns[offer._id] = { hours, minutes, seconds };
      }
    });
    
    setCountdowns(newCountdowns);
  };

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  const handleOfferClick = (offer: Offer) => {
    // Navigate to the store page with the specific offer
    router.push(`/store/${offer.storeId._id}`);
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-6">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="text-white font-bold">Loading expiring offers...</div>
          </div>
        </div>
      </div>
    );
  }

  // For testing - show even if no expiring offers
  if (expiringOffers.length === 0) {
    return (
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-6">
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="text-white font-bold">No offers expiring in 1 day</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-6">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-red-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full animate-bounce"></div>
          <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-12 right-16 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-16 left-20 w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
      
      {/* Marquee container */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/30 shadow-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-white animate-pulse" />
            <span className="text-white font-bold text-lg">🔥 EXPIRING IN 1-2 DAYS - DON'T MISS OUT! 🔥</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
        
        {/* Marquee */}
        <div className="relative overflow-hidden px-4">
          {/* Navigation Arrows */}
          {expiringOffers.length > 3 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + Math.ceil(expiringOffers.length / 3)) % Math.ceil(expiringOffers.length / 3))}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300"
                aria-label="Previous offers"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % Math.ceil(expiringOffers.length / 3))}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-all duration-300"
                aria-label="Next offers"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <div 
            className="flex justify-between gap-4 lg:gap-6 transition-transform duration-500 ease-in-out w-full"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {expiringOffers.slice(currentSlide * 3, (currentSlide + 1) * 3).map((offer) => (
                              <div
                  key={offer._id}
                  onClick={() => handleOfferClick(offer)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOfferClick(offer);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${offer.title} offer details`}
                  className="flex-1 bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/30 shadow-xl min-w-[300px] transform hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-white/20 relative group focus:outline-none focus:ring-2 focus:ring-white/50 focus:scale-105"
                >
                {/* Click indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-white/80" />
                </div>
                <div className="flex items-start space-x-4">
                  {/* Offer Image */}
                  {offer.imageUrl && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white/20 flex-shrink-0 shadow-lg">
                      <Image
                        src={offer.imageUrl}
                        alt={offer.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {/* Store and Discount */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-base truncate">
                        {offer.storeName}
                      </span>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg">
                        {offer.discount}{offer.discountType === 'percentage' ? '%' : ''} OFF
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white font-bold text-sm mb-3 truncate">
                      {offer.title}
                    </h3>
                    
                    {/* Countdown Timer */}
                    <div className="flex items-center space-x-3">
                      <ClockIcon className={`h-5 w-5 text-white/90 ${(countdowns[offer._id]?.hours || 0) < 6 ? 'urgent-pulse' : ''}`} />
                      <div className="flex space-x-2">
                        <div className={`backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg transition-all duration-300 ${
                          (countdowns[offer._id]?.hours || 0) < 6 
                            ? 'bg-red-500/40 urgent-pulse' 
                            : 'bg-white/25'
                        }`}>
                          <span className="text-white font-bold text-sm">
                            {formatTime(countdowns[offer._id]?.hours || 0)}
                          </span>
                        </div>
                        <span className="text-white/80 text-lg font-bold">:</span>
                        <div className={`backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg transition-all duration-300 ${
                          (countdowns[offer._id]?.minutes || 0) < 30 
                            ? 'bg-orange-500/40 urgent-pulse' 
                            : 'bg-white/25'
                        }`}>
                          <span className="text-white font-bold text-sm">
                            {formatTime(countdowns[offer._id]?.minutes || 0)}
                          </span>
                        </div>
                        <span className="text-white/80 text-lg font-bold">:</span>
                        <div className="bg-white/25 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg urgent-pulse">
                          <span className="text-white font-bold text-sm">
                            {formatTime(countdowns[offer._id]?.seconds || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Click hint */}
                    <div className="mt-2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Click to view offer details →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Slide Indicators */}
          {expiringOffers.length > 3 && (
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: Math.ceil(expiringOffers.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-white scale-125' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* Progress Bar and Slide Counter */}
          {expiringOffers.length > 3 && (
            <div className="mt-2 flex flex-col items-center space-y-2">
              <div className="text-white/80 text-sm font-medium">
                {currentSlide + 1} of {Math.ceil(expiringOffers.length / 3)}
              </div>
              <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                  style={{ 
                    width: `${progress}%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
