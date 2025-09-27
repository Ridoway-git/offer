"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  BuildingStorefrontIcon,
  TagIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

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

interface StoreSectionProps {
  onStoreSelect: (storeId: string | null) => void;
  selectedStore?: string | null;
}

export default function StoreSection({ onStoreSelect, selectedStore }: StoreSectionProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      } else {
        setError('Failed to load stores');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreClick = (storeId: string) => {
    router.push(`/store/${storeId}`);
  };

  const renderStoreCard = (store: Store) => (
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
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Visit Website
          </button>
          <div className="flex items-center text-sm font-bold text-orange-600 group-hover:text-orange-700 transition-colors bg-orange-50 px-4 py-2 rounded-lg">
            View Deals
            <ArrowRightIcon className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="w-full mb-8">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
            BROWSE STORES
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Amazing Store Collection
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Click on any store to explore their exclusive offers
          </p>
        </div>
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
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full mb-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={fetchStores}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full mb-8">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4">
          BROWSE STORES
        </div>
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
          Amazing Store Collection
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Click on any store to explore their exclusive offers
        </p>
      </div>

      {/* Stores Grid */}
      {stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => renderStoreCard(store))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <BuildingStorefrontIcon className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stores Available</h3>
          <p className="text-gray-600">Check back soon for amazing stores and deals!</p>
        </div>
      )}
    </section>
  );
} 