"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UserGroupIcon, TicketIcon, ChartBarIcon, CogIcon,
  PlusIcon, PencilIcon, TrashIcon, EyeIcon, ShieldCheckIcon,
  XMarkIcon, CalendarIcon, TagIcon, BuildingStorefrontIcon,
  CheckIcon, ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  code: string;
  storeId: string;
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

interface Store {
  _id: string;
  name: string;
  description: string;
  website?: string;
  logo?: string;
  category: string;
  contactEmail?: string;
  isActive: boolean;
  createdAt: string;
}

interface Analytics {
  userCount: number;
  couponCount: number;
  activeCoupons: number;
  expiredCoupons: number;
  storeCount: number;
  featuredCoupons: number;
  totalUsage: number;
  recentActivity: {
    newUsers: number;
    newCoupons: number;
    newStores: number;
  };
}

interface CreateOfferData {
  title: string;
  description: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  code: string;
  storeId: string;
  storeName: string;
  category: string;
  isFeatured: boolean;
  expiryDate: string;
  minPurchaseAmount: string;
  imageUrl: string;
}

interface CreateStoreData {
  name: string;
  description: string;
  website: string;
  logo: string;
  category: string;
  contactEmail: string;
  isActive: boolean;
}

interface EditUserData {
  username: string;
  email: string;
  role: string;
}

// Helper function to format date for datetime-local input
const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  // Convert to local timezone and format for datetime-local input
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditOfferModal, setShowEditOfferModal] = useState(false);
  const [showViewOfferModal, setShowViewOfferModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [offerFormData, setOfferFormData] = useState<CreateOfferData>({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage',
    code: '',
    storeId: '',
    storeName: '',
    category: '',
    isFeatured: false,
    expiryDate: '',
    minPurchaseAmount: '0',
    imageUrl: ''
  });
  const [storeFormData, setStoreFormData] = useState<CreateStoreData>({
    name: '',
    description: '',
    website: '',
    logo: '',
    category: '',
    contactEmail: '',
    isActive: true
  });
  const [userFormData, setUserFormData] = useState<EditUserData>({
    username: '',
    email: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user.role === 'admin') {
            setIsAuthenticated(true);
            setIsAdmin(true);
            loadData();
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Load analytics
      const analyticsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/admin/analytics`, { headers });
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      } else {
        console.error('Failed to load analytics:', analyticsRes.status);
        // Set default analytics to prevent errors
        setAnalytics({
          userCount: 0,
          couponCount: 0,
          storeCount: 0,
          activeCoupons: 0,
          expiredCoupons: 0,
          featuredCoupons: 0,
          totalUsage: 0,
          recentActivity: {
            newUsers: 0,
            newCoupons: 0,
            newStores: 0
          }
        });
      }

      // Load users
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/admin/users`, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      } else {
        console.error('Failed to load users:', usersRes.status);
        setUsers([]);
      }

      // Load offers
      const offersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/admin/coupons?t=${Date.now()}`, { headers });
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setOffers(offersData.coupons || []);
      } else {
        console.error('Failed to load offers:', offersRes.status);
        setOffers([]);
      }

      // Load stores (admin endpoint to get all stores including inactive)
      const storesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/admin/stores`, { headers });
      if (storesRes.ok) {
        const storesData = await storesRes.json();
        setStores(storesData.stores || []);
      } else {
        console.error('Failed to load stores:', storesRes.status);
        setStores([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleOfferFormChange = (field: keyof CreateOfferData, value: string | boolean) => {
    setOfferFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate offer code when title changes
    if (field === 'title' && typeof value === 'string') {
      const code = value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 8);
      setOfferFormData(prev => ({
        ...prev,
        code: code + Math.floor(Math.random() * 100)
      }));
    }

    // Auto-set store name when store is selected
    if (field === 'storeId' && typeof value === 'string') {
      const selectedStore = stores.find(store => store._id === value);
      if (selectedStore) {
        setOfferFormData(prev => ({
          ...prev,
          storeName: selectedStore.name,
          category: selectedStore.category
        }));
      }
    }
  };

  const validateOfferForm = (): boolean => {
    const errors: string[] = [];
    
    if (!offerFormData.title.trim()) errors.push('Title is required');
    if (!offerFormData.description.trim()) errors.push('Description is required');
    if (!offerFormData.discount.trim()) errors.push('Discount is required');
    if (!offerFormData.code.trim()) errors.push('Offer code is required');
    if (!offerFormData.storeId) errors.push('Store selection is required');
    if (!offerFormData.category.trim()) errors.push('Category is required');
    if (!offerFormData.expiryDate) errors.push('Expiry date is required');
    
    // Validate discount
    const discountValue = parseFloat(offerFormData.discount);
    if (isNaN(discountValue) || discountValue <= 0) {
      errors.push('Discount must be a positive number');
    }
    if (offerFormData.discountType === 'percentage' && discountValue > 100) {
      errors.push('Percentage discount cannot exceed 100%');
    }

    // Validate expiry date
    if (offerFormData.expiryDate) {
      const expiryDate = new Date(offerFormData.expiryDate);
      const today = new Date();
      // Set time to end of day for expiry date and start of day for today
      expiryDate.setHours(23, 59, 59, 999);
      today.setHours(0, 0, 0, 0);
      
      console.log('Expiry date validation:', {
        inputDate: offerFormData.expiryDate,
        parsedExpiry: expiryDate.toISOString(),
        today: today.toISOString(),
        isValid: expiryDate > today
      });
      
      if (expiryDate <= today) {
        errors.push('Expiry date must be in the future');
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleCreateOffer = async () => {
    if (!validateOfferForm()) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...offerFormData,
          minPurchaseAmount: parseFloat(offerFormData.minPurchaseAmount) || 0
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Offer created:', result);
        
        // Reset form and close modal
        setOfferFormData({
          title: '',
          description: '',
          discount: '',
          discountType: 'percentage',
          code: '',
          storeId: '',
          storeName: '',
          category: '',
          isFeatured: false,
          expiryDate: '',
          minPurchaseAmount: '0',
          imageUrl: ''
        });
        setShowAddOfferModal(false);
        setFormErrors([]);
        
        // Reload data
        loadData();
      } else {
        const error = await response.json();
        setFormErrors([error.message || 'Failed to create offer']);
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      setFormErrors(['Network error. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOffer = async () => {
    if (!validateOfferForm() || !selectedOffer) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons/${selectedOffer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...offerFormData,
          minPurchaseAmount: parseFloat(offerFormData.minPurchaseAmount) || 0
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Offer updated:', result);
        
        // Reset form and close modal
        setOfferFormData({
          title: '',
          description: '',
          discount: '',
          discountType: 'percentage',
          code: '',
          storeId: '',
          storeName: '',
          category: '',
          isFeatured: false,
          expiryDate: '',
          minPurchaseAmount: '0',
          imageUrl: ''
        });
        setShowEditOfferModal(false);
        setSelectedOffer(null);
        setFormErrors([]);
        
        // Reload data
        loadData();
      } else {
        const error = await response.json();
        setFormErrors([error.message || 'Failed to update offer']);
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      setFormErrors(['Network error. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOfferStatus = async (offerId: string) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons/${offerId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadData(); // Reload data to reflect changes
      }
    } catch (error) {
      console.error('Error toggling offer status:', error);
    }
  };

  const deleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/coupons/${offerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadData(); // Reload data to reflect changes
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  // Store Management Functions
  const handleStoreFormChange = (field: keyof CreateStoreData, value: string | boolean) => {
    setStoreFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStoreForm = (): boolean => {
    const errors: string[] = [];
    
    if (!storeFormData.name.trim()) errors.push('Store name is required');
    if (!storeFormData.description.trim()) errors.push('Description is required');
    if (!storeFormData.category.trim()) errors.push('Category is required');
    
    if (storeFormData.website && !storeFormData.website.startsWith('http')) {
      errors.push('Website must start with http:// or https://');
    }
    
    if (storeFormData.contactEmail && !storeFormData.contactEmail.includes('@')) {
      errors.push('Please enter a valid email address');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleCreateStore = async () => {
    if (!validateStoreForm()) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeFormData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Store created:', result);
        
        // Reset form and close modal
        setStoreFormData({
          name: '',
          description: '',
          website: '',
          logo: '',
          category: '',
          contactEmail: '',
          isActive: true
        });
        setShowAddStoreModal(false);
        setFormErrors([]);
        
        // Reload data
        loadData();
      } else {
        const error = await response.json();
        setFormErrors([error.message || 'Failed to create store']);
      }
    } catch (error) {
      console.error('Error creating store:', error);
      setFormErrors(['Network error. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStore = async () => {
    if (!validateStoreForm() || !selectedStore) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/stores/${selectedStore._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeFormData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Store updated:', result);
        
        // Reset form and close modal
        setStoreFormData({
          name: '',
          description: '',
          website: '',
          logo: '',
          category: '',
          contactEmail: '',
          isActive: true
        });
        setShowEditStoreModal(false);
        setSelectedStore(null);
        setFormErrors([]);
        
        // Reload data
        loadData();
      } else {
        const error = await response.json();
        setFormErrors([error.message || 'Failed to update store']);
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setFormErrors(['Network error. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStoreStatus = async (storeId: string) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/stores/${storeId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadData(); // Reload data to reflect changes
      }
    } catch (error) {
      console.error('Error toggling store status:', error);
    }
  };

  const deleteStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store? This will also delete all related coupons.')) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/stores/${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        loadData(); // Reload data to reflect changes
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete store');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  // User Management Functions
  const handleUserFormChange = (field: keyof EditUserData, value: string) => {
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateUserForm = (): boolean => {
    const errors: string[] = [];
    
    if (!userFormData.username.trim()) errors.push('Username is required');
    if (!userFormData.email.trim()) errors.push('Email is required');
    if (!userFormData.email.includes('@')) errors.push('Please enter a valid email address');
    if (!['user', 'admin'].includes(userFormData.role)) errors.push('Invalid role selected');

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleUpdateUser = async () => {
    if (!validateUserForm() || !selectedUser) return;

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userFormData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User updated:', result);
        
        setShowEditUserModal(false);
        setSelectedUser(null);
        setFormErrors([]);
        
        // Reload data
        loadData();
      } else {
        const error = await response.json();
        setFormErrors([error.message || 'Failed to update user']);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setFormErrors(['Network error. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://coupon-backend-amr1.onrender.com'}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('User deleted successfully!');
        loadData(); // Reload data to reflect changes
      } else {
        const errorData = await response.json();
        console.error('Delete user error:', errorData);
        alert(errorData.message || 'Failed to delete user. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Network error. Please check your connection and try again.');
    }
  };

  // Filter and Search Functions
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.storeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || offer.category === filterCategory;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && offer.isActive) ||
                         (filterStatus === 'inactive' && !offer.isActive) ||
                         (filterStatus === 'featured' && offer.isFeatured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || store.category === filterCategory;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && store.isActive) ||
                         (filterStatus === 'inactive' && !store.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterStatus || user.role === filterStatus;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <ShieldCheckIcon className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
      
      {!analytics ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <UserGroupIcon className="h-12 w-12 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.userCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <TicketIcon className="h-12 w-12 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.couponCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <BuildingStorefrontIcon className="h-12 w-12 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Stores</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.storeCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <TagIcon className="h-12 w-12 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Featured Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.featuredCoupons || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <ChartBarIcon className="h-12 w-12 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.activeCoupons || 0}</p>
                  <p className="text-xs text-gray-500">
                    {(analytics.couponCount || 0) > 0 ? Math.round(((analytics.activeCoupons || 0) / (analytics.couponCount || 1)) * 100) : 0}% of total
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <CogIcon className="h-12 w-12 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.expiredCoupons || 0}</p>
                  <p className="text-xs text-gray-500">
                    {(analytics.couponCount || 0) > 0 ? Math.round(((analytics.expiredCoupons || 0) / (analytics.couponCount || 1)) * 100) : 0}% of total
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center">
                <CalendarIcon className="h-12 w-12 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usage</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalUsage || 0}</p>
                  <p className="text-xs text-gray-500">Offer redemptions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity (Last 7 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <UserGroupIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{analytics.recentActivity?.newUsers || 0}</p>
                <p className="text-sm text-gray-600">New Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TicketIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{analytics.recentActivity?.newCoupons || 0}</p>
                <p className="text-sm text-gray-600">New Offers</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <BuildingStorefrontIcon className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{analytics.recentActivity?.newStores || 0}</p>
                <p className="text-sm text-gray-600">New Stores</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">User Management</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedUser(user);
                        setUserFormData({
                          username: user.username,
                          email: user.email,
                          role: user.role
                        });
                        setShowEditUserModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded" 
                      title="Edit User"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deleteUser(user._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded" 
                      title="Delete User"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStores = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Store Management</h2>
        <div className="flex space-x-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {Array.from(new Set(stores.map(store => store.category))).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button 
            onClick={() => setShowAddStoreModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Store
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStores.map((store) => (
              <tr key={store._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {store.logo && (
                      <img className="h-10 w-10 rounded-full mr-3" src={store.logo} alt={store.name} />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                      <div className="text-sm text-gray-500">{store.description.substring(0, 50)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {store.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{store.contactEmail}</div>
                  {store.website && (
                    <div className="text-sm text-blue-600">
                      <a href={store.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    store.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {store.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(store.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleStoreStatus(store._id)}
                      className={`p-1 rounded ${store.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={store.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {store.isActive ? <XMarkIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedStore(store);
                        setStoreFormData({
                          name: store.name,
                          description: store.description,
                          website: store.website || '',
                          logo: store.logo || '',
                          category: store.category,
                          contactEmail: store.contactEmail || '',
                          isActive: store.isActive
                        });
                        setShowEditStoreModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded" 
                      title="Edit Store"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deleteStore(store._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded" 
                      title="Delete Store"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredStores.length === 0 && (
          <div className="text-center py-8">
            <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No stores found. Create your first store!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCoupons = () => (
    <div className="space-y-6">
              <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-800">Offer Management</h2>
          <div className="flex space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {Array.from(new Set(offers.map(offer => offer.category))).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
            <button 
              onClick={() => setShowAddOfferModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Offer
            </button>
          </div>
        </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOffers.map((offer) => (
              <tr key={offer._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                  <div className="text-sm text-gray-500">{offer.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{offer.code}</code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {offer.discount}{offer.discountType === 'percentage' ? '%' : ' BDT'} OFF
                  </div>
                  {offer.minPurchaseAmount > 0 && (
                    <div className="text-xs text-gray-500">Min: {offer.minPurchaseAmount} BDT</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{offer.storeName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {offer.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {offer.isFeatured && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(offer.expiryDate).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => toggleOfferStatus(offer._id)}
                      className={`p-1 rounded ${offer.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={offer.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {offer.isActive ? <XMarkIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedOffer(offer);
                        setShowViewOfferModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded" 
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedOffer(offer);
                        setOfferFormData({
                          title: offer.title,
                          description: offer.description,
                          discount: offer.discount,
                          discountType: offer.discountType,
                          code: offer.code,
                          category: offer.category,
                          storeId: offer.storeId,
                          storeName: offer.storeName,
                          expiryDate: formatDateForInput(offer.expiryDate),
                          isFeatured: offer.isFeatured,
                          minPurchaseAmount: offer.minPurchaseAmount.toString(),
                          imageUrl: offer.imageUrl || ''
                        });
                        setShowEditOfferModal(true);
                      }}
                      className="text-yellow-600 hover:text-yellow-900 p-1 rounded" 
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => deleteOffer(offer._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded" 
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOffers.length === 0 && (
          <div className="text-center py-8">
            <TicketIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {offers.length === 0 ? 'No offers found. Create your first offer!' : 'No offers match your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddOfferModal = () => (
    showAddOfferModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Create New Offer</h3>
              <button 
                onClick={() => setShowAddOfferModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <XMarkIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={offerFormData.title}
                  onChange={(e) => handleOfferFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Summer Sale 2025"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Code *</label>
                <input
                  type="text"
                  value={offerFormData.code}
                  onChange={(e) => handleOfferFormChange('code', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="e.g., SUMMER50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={offerFormData.description}
                onChange={(e) => handleOfferFormChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe the offer details..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={offerFormData.imageUrl}
                onChange={(e) => handleOfferFormChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/offer-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Add an image URL to display with this offer</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount *</label>
                <input
                  type="number"
                  value={offerFormData.discount}
                  onChange={(e) => handleOfferFormChange('discount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="50"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select
                  value={offerFormData.discountType}
                  onChange={(e) => handleOfferFormChange('discountType', e.target.value as 'percentage' | 'fixed')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (BDT)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store *</label>
              <select
                value={offerFormData.storeId}
                onChange={(e) => handleOfferFormChange('storeId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a store</option>
                {stores.map((store) => (
                  <option key={store._id} value={store._id}>
                    {store.name} - {store.category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  value={offerFormData.category}
                  onChange={(e) => handleOfferFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Electronics, Fashion, Food, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date & Time *</label>
                <input
                  type="datetime-local"
                  value={offerFormData.expiryDate}
                  onChange={(e) => handleOfferFormChange('expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Purchase Amount</label>
              <input
                type="number"
                value={offerFormData.minPurchaseAmount}
                onChange={(e) => handleOfferFormChange('minPurchaseAmount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                checked={offerFormData.isFeatured}
                onChange={(e) => handleOfferFormChange('isFeatured', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                Feature this offer (show on homepage)
              </label>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => setShowAddOfferModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOffer}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Offer'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderEditOfferModal = () => (
    showEditOfferModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Edit Offer</h2>
              <button
                onClick={() => {
                  setShowEditOfferModal(false);
                  setSelectedOffer(null);
                  setFormErrors([]);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Form Errors */}
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields - Same as Add Modal but with Update button */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Title *
                </label>
                <input
                  id="edit-title"
                  type="text"
                  value={offerFormData.title}
                  onChange={(e) => handleOfferFormChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter offer title"
                />
              </div>

              <div>
                <label htmlFor="edit-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Offer Code *
                </label>
                <input
                  id="edit-code"
                  type="text"
                  value={offerFormData.code}
                  onChange={(e) => handleOfferFormChange('code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter offer code"
                />
              </div>

              <div>
                <label htmlFor="edit-discount" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount *
                </label>
                <input
                  id="edit-discount"
                  type="text"
                  value={offerFormData.discount}
                  onChange={(e) => handleOfferFormChange('discount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 20% or $50"
                />
              </div>

              <div>
                <label htmlFor="edit-discountType" className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  id="edit-discountType"
                  value={offerFormData.discountType}
                  onChange={(e) => handleOfferFormChange('discountType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                  <option value="bogo">Buy One Get One</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  id="edit-category"
                  type="text"
                  value={offerFormData.category}
                  onChange={(e) => handleOfferFormChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter category"
                />
              </div>

              <div>
                <label htmlFor="edit-expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date & Time *
                </label>
                <input
                  id="edit-expiryDate"
                  type="datetime-local"
                  value={offerFormData.expiryDate}
                  onChange={(e) => handleOfferFormChange('expiryDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="edit-description"
                value={offerFormData.description}
                onChange={(e) => handleOfferFormChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter offer description"
              />
            </div>

            <div>
              <label htmlFor="edit-imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                id="edit-imageUrl"
                type="url"
                value={offerFormData.imageUrl}
                onChange={(e) => handleOfferFormChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/offer-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Add an image URL to display with this offer</p>
            </div>

            <div className="flex items-center">
              <input
                id="edit-isFeatured"
                type="checkbox"
                checked={offerFormData.isFeatured}
                onChange={(e) => handleOfferFormChange('isFeatured', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="edit-isFeatured" className="ml-2 block text-sm text-gray-900">
                Feature this offer (show on homepage)
              </label>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowEditOfferModal(false);
                setSelectedOffer(null);
                setFormErrors([]);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateOffer}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Offer'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderViewOfferModal = () => (
    showViewOfferModal && selectedOffer && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Offer Details</h2>
              <button
                onClick={() => {
                  setShowViewOfferModal(false);
                  setSelectedOffer(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-all"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOffer.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-mono">{selectedOffer.code}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOffer.discount}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg capitalize">{selectedOffer.discountType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOffer.category}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOffer.storeName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date & Time</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {new Date(selectedOffer.expiryDate).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <p className={`p-3 rounded-lg ${selectedOffer.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {selectedOffer.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[100px]">{selectedOffer.description}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedOffer.isFeatured}
                  disabled
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Featured Offer</label>
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={() => {
                setShowViewOfferModal(false);
                setSelectedOffer(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Enhanced Header */}
      <header className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 shadow-2xl border-b border-white/10 overflow-hidden">
        {/* Animated Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-indigo-600/15 via-cyan-600/15 to-blue-600/15 animate-pulse" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-20 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl mr-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
                  Admin Panel
                </h1>
                <span className="text-sm text-blue-200 font-medium group-hover:text-blue-100 transition-colors duration-300">Control Center</span>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.dispatchEvent(new Event('authStatusChanged'));
                router.push('/');
              }}
              className="relative px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-red-500/25 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
            { id: 'users', label: 'Users', icon: UserGroupIcon },
            { id: 'coupons', label: 'Offers', icon: TicketIcon },
            { id: 'stores', label: 'Stores', icon: BuildingStorefrontIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[600px]">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'coupons' && renderCoupons()}
          {activeTab === 'stores' && renderStores()}
        </div>
      </div>

      {/* Add Offer Modal */}
      {renderAddOfferModal()}

      {/* Edit Offer Modal */}
      {renderEditOfferModal()}

      {/* View Offer Modal */}
      {renderViewOfferModal()}

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Create New Store</h3>
                <button 
                  onClick={() => setShowAddStoreModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    value={storeFormData.name}
                    onChange={(e) => handleStoreFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Amazon"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={storeFormData.category}
                    onChange={(e) => handleStoreFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Electronics, Fashion, Food, etc."
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={storeFormData.description}
                  onChange={(e) => handleStoreFormChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe the store..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={storeFormData.website}
                    onChange={(e) => handleStoreFormChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={storeFormData.contactEmail}
                    onChange={(e) => handleStoreFormChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="contact@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={storeFormData.logo}
                  onChange={(e) => handleStoreFormChange('logo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={storeFormData.isActive}
                  onChange={(e) => handleStoreFormChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Store is active
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddStoreModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStore}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Store'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button 
                  onClick={() => setShowEditUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={userFormData.username}
                  onChange={(e) => handleUserFormChange('username', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => handleUserFormChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => handleUserFormChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditUserModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Store Modal */}
      {showEditStoreModal && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Edit Store</h3>
                <button 
                  onClick={() => setShowEditStoreModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                      <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
                  <input
                    type="text"
                    value={storeFormData.name}
                    onChange={(e) => handleStoreFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={storeFormData.category}
                    onChange={(e) => handleStoreFormChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={storeFormData.description}
                  onChange={(e) => handleStoreFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={storeFormData.website}
                    onChange={(e) => handleStoreFormChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={storeFormData.logo}
                    onChange={(e) => handleStoreFormChange('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={storeFormData.contactEmail}
                  onChange={(e) => handleStoreFormChange('contactEmail', e.target.value)}
                  placeholder="contact@store.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={storeFormData.isActive}
                    onChange={(e) => handleStoreFormChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsActive" className="ml-2 block text-sm text-gray-900">
                    Store is active
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditStoreModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStore}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Store'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 