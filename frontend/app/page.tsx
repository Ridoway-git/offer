"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import OfferSection from "@/components/OfferSection";
import Sidebar from "@/components/Sidebar";
import ExpiringOffersMarquee from "@/components/ExpiringOffersMarquee";

const sliderImages = [
  "https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
  "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlide]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <div className="min-h-screen bg-white">
      {/* Expiring Offers Marquee */}
      <ExpiringOffersMarquee />
      
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full filter blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg backdrop-blur-sm border border-white/20">
              <SparklesIcon className="h-5 w-5 mr-3 animate-pulse" />
              <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Featured Offers</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                Discover Amazing Deals
              </span>
            </h2>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">Explore exclusive offers from top brands and save big on your favorite products</p>
          </div>

          <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm bg-white/10">
            {/* Enhanced gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent z-10"></div>
            
            {/* Hero CTA Content */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center text-white px-4">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl">
                  Discover Amazing Deals
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto drop-shadow-lg opacity-90">
                  Save up to 70% on your favorite brands and products
                </p>
                <button 
                  onClick={() => document.getElementById('offers-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-orange-500/25"
                >
                  Shop Now & Save Big
                </button>
              </div>
            </div>
            
            <div 
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {sliderImages.map((image, index) => (
                <div
                  key={index}
                  className="min-w-full h-full relative"
                >
                  <Image 
                    src={image} 
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>

            {/* Enhanced navigation arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-5 rounded-full transition-all duration-300 group z-30 shadow-2xl border border-white/30 hover:scale-110 hover:shadow-white/20"
            >
              <ChevronLeftIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-800 p-5 rounded-full transition-all duration-300 group z-30 shadow-2xl border border-white/30 hover:scale-110 hover:shadow-white/20"
            >
              <ChevronRightIcon className="h-8 w-8 group-hover:scale-110 transition-transform" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 z-20">
              {sliderImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentSlide
                      ? 'w-8 h-3 bg-white rounded-full shadow-lg'
                      : 'w-3 h-3 bg-white/60 hover:bg-white/80 rounded-full hover:scale-125'
                  }`}
                />
              ))}
            </div>

            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-medium z-20 border border-white/30">
              <span className="font-bold">{currentSlide + 1}</span>
              <span className="mx-1 opacity-60">/</span>
              <span className="opacity-80">{sliderImages.length}</span>
            </div>

            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold z-20 shadow-lg animate-pulse">
              ✨ Premium Deals
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <Sidebar 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
            />
            
                      {/* Main Content */}
          <div className="flex-1 min-w-0">
                        <OfferSection 
              selectedCategory={selectedCategory}
              selectedStore={selectedStore}
              onStoreSelect={setSelectedStore}
            />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
