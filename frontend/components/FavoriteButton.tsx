"use client";

import { useState, useEffect } from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface FavoriteButtonProps {
  offerId: string;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ offerId, className = "", onToggle }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, [offerId]);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/coupons/${offerId}/favorite-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Redirect to login or show login modal
        window.dispatchEvent(new Event('openLoginModal'));
        return;
      }

      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/coupons/${offerId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
        onToggle?.(data.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent"></div>
      ) : isFavorite ? (
        <HeartSolidIcon className="h-5 w-5 text-red-500" />
      ) : (
        <HeartIcon className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors duration-300" />
      )}
    </button>
  );
}
