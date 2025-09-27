// API Configuration - Updated for Render deployment
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  ME: `${API_BASE_URL}/api/auth/me`,
  HEALTH: `${API_BASE_URL}/health`,
  
  // Coupons
  COUPONS: `${API_BASE_URL}/api/coupons`,
  FEATURED_COUPONS: `${API_BASE_URL}/api/coupons/featured`,
  COUPON_CATEGORIES: `${API_BASE_URL}/api/coupons/categories`,
  COUPON_SEARCH: `${API_BASE_URL}/api/coupons/search`,
  COUPON_USE: (id: string) => `${API_BASE_URL}/api/coupons/${id}/use`,
  COUPON_TOGGLE: (id: string) => `${API_BASE_URL}/api/coupons/${id}/toggle`,
  COUPON_DETAIL: (id: string) => `${API_BASE_URL}/api/coupons/${id}`,
  
  // Stores
  STORES: `${API_BASE_URL}/api/stores`,
  STORE_DETAIL: (id: string) => `${API_BASE_URL}/api/stores/${id}`,
  STORE_COUPONS: (id: string) => `${API_BASE_URL}/api/stores/${id}/coupons`,
  STORE_TOGGLE: (id: string) => `${API_BASE_URL}/api/stores/${id}/toggle`,
  
  // Admin
  ADMIN_ANALYTICS: `${API_BASE_URL}/api/admin/analytics`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_COUPONS: `${API_BASE_URL}/api/admin/coupons`,
  ADMIN_STORES: `${API_BASE_URL}/api/admin/stores`,
  ADMIN_USER_DETAIL: (id: string) => `${API_BASE_URL}/api/admin/users/${id}`,
};
