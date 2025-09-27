"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  ArrowRightIcon,
  FunnelIcon,
  GlobeAltIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Store {
  _id: string;
  name: string;
  description: string;
  website?: string;
  logo?: string;
  category: string;
  isActive: boolean;
  contactEmail?: string;
  createdAt: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const router = useRouter();

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    filterAndSortStores();
  }, [stores, searchTerm, selectedCategory, sortBy]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      } else {
        console.error('Failed to fetch stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStores = () => {
    let filtered = stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           store.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || store.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort stores
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredStores(filtered);
  };

  const getCategories = () => {
    const categories = stores.map(store => store.category);
    return [...new Set(categories)].sort();
  };

  const handleStoreClick = (storeId: string) => {
    router.push(`/store/${storeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
              BROWSE STORES
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Amazing Store Collection
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing stores and explore their exclusive offers
            </p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-xl"></div>
                    <div className="ml-4 flex-1">
                      <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
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
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
            BROWSE STORES
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Amazing Store Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing stores and explore their exclusive offers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-2xl mr-4">
              <FunnelIcon className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Find Your Perfect Store</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search stores, categories..."
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

            {/* Sort */}
            <div className="relative group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="name">Name A-Z</option>
                <option value="category">Category</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20">
              <p className="text-gray-700 font-semibold">
                <span className="text-blue-600 font-bold">{filteredStores.length}</span> of {stores.length} stores
              </p>
            </div>
            {filteredStores.length > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Active Stores
              </div>
            )}
          </div>
        </div>

        {/* Stores Grid */}
        {filteredStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <div
                key={store._id}
                onClick={() => handleStoreClick(store._id)}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 border border-gray-100 hover:border-blue-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative p-6">
                  {/* Store Logo - Consistent Sizing */}
                  <div className="flex items-center mb-4">
                    <div className="relative w-18 h-18 rounded-2xl overflow-hidden bg-white flex-shrink-0 shadow-lg ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
                      {store.logo ? (
                        <Image
                          src={store.logo}
                          alt={store.name}
                          fill
                          className="object-contain p-2"
                          sizes="72px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <BuildingStorefrontIcon className="h-10 w-10 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="font-bold text-xl mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full inline-block">
                        {store.category}
                      </p>
                    </div>
                  </div>

                  {/* Store Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {store.description}
                  </p>

                  {/* Enhanced Action Buttons */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (store.website) {
                          window.open(store.website, '_blank');
                        }
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center"
                    >
                      <GlobeAltIcon className="h-4 w-4 mr-1" />
                      Visit Website
                    </button>
                    <div className="flex items-center text-sm font-bold text-orange-600 group-hover:text-orange-700 transition-colors bg-orange-50 px-4 py-2 rounded-lg">
                      <TagIcon className="h-4 w-4 mr-1" />
                      View Deals
                      <ArrowRightIcon className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <BuildingStorefrontIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stores Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find stores.</p>
          </div>
        )}
      </div>
    </div>
  );
}
