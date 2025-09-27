"use client";

import { useState, useEffect } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  ChevronUpIcon,
  TagIcon,
  XMarkIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function Sidebar({ selectedCategory, onCategoryChange }: SidebarProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    fetchCategories();
    
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/coupons/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    onCategoryChange(selectedCategory === category ? null : category);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleShowAllCategories = () => {
    setShowAllCategories(true);
  };

  const handleShowLessCategories = () => {
    setShowAllCategories(false);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Audio': '🎵',
      'Computers': '💻',
      'E-commerce': '🛒',
      'Electronics': '⚡',
      'Fashion': '👗',
      'Gaming': '🎮',
      'Mobile Phones': '📱',
      'Photography': '📸',
      'Smart Home': '🏠',
      'Transportation': '🚗',
      'Food & Delivery': '🍔',
      'Health & Beauty': '💄',
      'Sports & Fitness': '⚽',
      'Books & Education': '📚',
      'Entertainment': '🎬',
      'Travel': '✈️',
      'Finance': '💳'
    };
    return icons[category] || '🏷️';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Audio': 'from-purple-400 to-pink-400',
      'Computers': 'from-blue-400 to-cyan-400',
      'E-commerce': 'from-green-400 to-emerald-400',
      'Electronics': 'from-indigo-400 to-purple-400',
      'Fashion': 'from-pink-400 to-rose-400',
      'Gaming': 'from-orange-400 to-red-400',
      'Mobile Phones': 'from-teal-400 to-cyan-400',
      'Photography': 'from-yellow-400 to-orange-400',
      'Smart Home': 'from-emerald-400 to-green-400',
      'Transportation': 'from-blue-500 to-indigo-500',
      'Food & Delivery': 'from-orange-500 to-red-500',
      'Health & Beauty': 'from-pink-500 to-purple-500',
      'Sports & Fitness': 'from-green-500 to-emerald-500',
      'Books & Education': 'from-indigo-500 to-purple-500',
      'Entertainment': 'from-purple-500 to-pink-500',
      'Travel': 'from-cyan-500 to-blue-500',
      'Finance': 'from-emerald-500 to-teal-500'
    };
    return colors[category] || 'from-gray-400 to-gray-500';
  };

  const filteredCategories = [...new Set(categories)];



  const sidebarContent = (
    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-6 py-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="relative flex items-center justify-between">
          <h3 className="text-white font-bold text-2xl flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4 backdrop-blur-sm shadow-lg">
              <TagIcon className="h-6 w-6 text-white" />
            </div>
            Categories
          </h3>
          {isMobile && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-all duration-300 p-2 hover:bg-white/20 rounded-xl hover:scale-110"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>



      {/* Categories List */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {/* Individual Categories */}
            {(showAllCategories ? filteredCategories : filteredCategories.slice(0, 3)).map((category, index) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`w-full flex items-center justify-between px-6 py-5 rounded-2xl transition-all duration-500 text-left group relative overflow-hidden ${
                  selectedCategory === category
                    ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 text-white shadow-2xl ring-4 ring-blue-200/50 transform scale-105'
                    : 'hover:bg-gradient-to-br hover:from-gray-50 hover:via-blue-50 hover:to-purple-50 text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-xl hover:ring-2 hover:ring-blue-100/50 hover:transform hover:scale-102'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center relative z-10">
                  <div className={`p-3 rounded-xl mr-4 transition-all duration-500 transform group-hover:scale-110 ${
                    selectedCategory === category 
                      ? 'bg-white/20 backdrop-blur-sm shadow-lg' 
                      : `bg-gradient-to-br ${getCategoryColor(category)} group-hover:shadow-lg shadow-md`
                  }`}>
                    <span className="text-xl">{getCategoryIcon(category)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{category}</span>
                    <span className={`text-sm ${selectedCategory === category ? 'text-white/80' : 'text-gray-500'}`}>
                      {category.toLowerCase()} offers
                    </span>
                  </div>
                </div>
                {selectedCategory === category ? (
                  <div className="bg-white/20 p-2 rounded-xl shadow-lg">
                    <ChevronDownIcon className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-all duration-300 transform group-hover:translate-x-1" />
                )}
              </button>
            ))}

            {/* Show All Button */}
            {!showAllCategories && filteredCategories.length > 3 && (
              <div className="pt-4">
                <button
                  onClick={handleShowAllCategories}
                  className="w-full bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 hover:from-blue-100 hover:via-purple-100 hover:to-indigo-100 text-blue-600 font-bold py-4 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center border border-blue-200 hover:border-blue-300 hover:shadow-xl transform hover:scale-105 group"
                >
                  <div className="bg-blue-100 p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                    <ChevronDownIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-lg">View More</span>
                </button>
              </div>
            )}

            {/* Show Less Button */}
            {showAllCategories && filteredCategories.length > 3 && (
              <div className="pt-4">
                <button
                  onClick={handleShowLessCategories}
                  className="w-full bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 hover:from-gray-100 hover:via-slate-100 hover:to-zinc-100 text-gray-600 font-bold py-4 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center border border-gray-200 hover:border-gray-300 hover:shadow-xl transform hover:scale-105 group"
                >
                  <div className="bg-gray-100 p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                    <ChevronUpIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="text-lg">View Less</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Clear Filter Button */}
        {selectedCategory && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => handleCategoryClick('')}
              className="w-full bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 hover:from-red-100 hover:via-pink-100 hover:to-rose-100 text-red-600 font-bold py-4 px-6 rounded-2xl transition-all duration-500 flex items-center justify-center border border-red-200 hover:border-red-300 hover:shadow-xl transform hover:scale-105 group"
            >
              <div className="bg-red-100 p-2 rounded-xl mr-3 group-hover:scale-110 transition-transform duration-300">
                <XMarkIcon className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-lg">Clear Filter</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-800 text-white p-5 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 hover:shadow-3xl"
        >
          <Bars3Icon className="h-7 w-7" />
        </button>

        {/* Mobile Overlay */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-0 right-0 h-full w-80 max-w-full">
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div id="categories-section" className="hidden lg:block w-72 flex-shrink-0">
      <div className="sticky top-24">
        {sidebarContent}
      </div>
    </div>
  );
} 