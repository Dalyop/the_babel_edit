'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product, User } from '@/app/store/types';
import { useAuth } from '@/app/context/AuthContext';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import { Users, Package, Plus, Search, AlertCircle, MessageSquare, Star } from 'lucide-react';

import AdminProtectedRoute from '@/app/components/AdminProtectedRoute';
import Button from '@/app/components/ui/Button/Button';
import DataTable, { Column, Action } from '@/app/components/ui/DataTable/DataTable';
import ConfirmModal from '@/app/components/ui/ConfirmModal/ConfirmModal';
import { useProductStore } from '@/app/store/useProductStore';
import { commonClasses } from '@/app/utils/designSystem';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
    };
    product: {
        id: string;
        name: string;
    };
}

interface ErrorState {
  type: 'products' | 'users' | 'reviews' | 'action';
  message: string;
}

interface DeleteConfirmState {
  isOpen: boolean;
  type: 'product' | 'user' | 'review';
  id: string;
  name: string;
  hard: boolean;
}

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [featuredReviewIds, setFeaturedReviewIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'reviews'>('products');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [error, setError] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    type: 'product',
    id: '',
    name: '',
    hard: false
  });

  const MAX_RETRIES = 3;
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const isAdmin = user?.role && ['admin', 'super_admin'].includes(user.role.toLowerCase());

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'reviews') {
      fetchReviews();
      fetchFeaturedReviews();
    }
  }, [pagination.page, searchTerm, activeTab]);

  const fetchProducts = async (retry = false) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        includeInactive: 'true',
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await apiRequest<{ products: Product[]; pagination: any }>(
        `${API_ENDPOINTS.PRODUCTS.ADMIN.LIST}?${params.toString()}`,
        { requireAuth: true }
      );
      setProducts(response.products);
      setPagination(response.pagination);
      setRetryCount(0);
    } catch (error: any) {
        // ... error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await apiRequest<{ users: AdminUser[] }>(
        API_ENDPOINTS.USERS.LIST,
        { requireAuth: true }
      );
      setUsers(response.users);
    } catch (error: any) {
      // ... error handling
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await apiRequest<Review[]>(API_ENDPOINTS.REVIEWS.LIST, { requireAuth: true });
      setReviews(response);
    } catch (error) {
      toast.error('Failed to fetch reviews.');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchFeaturedReviews = async () => {
    try {
      const response = await apiRequest<string[]>(API_ENDPOINTS.ADMIN.TESTIMONIALS.LIST, { requireAuth: true });
      setFeaturedReviewIds(response);
    } catch (error) {
      toast.error('Failed to fetch featured testimonials.');
    }
  };

  const handleToggleTestimonial = async (review: Review) => {
    const isFeatured = featuredReviewIds.includes(review.id);
    const action = isFeatured ? 'remove' : 'add';
    setActionLoading(prev => ({ ...prev, [`testimonial-${review.id}`]: true }));
    try {
      if (isFeatured) {
        await apiRequest(API_ENDPOINTS.ADMIN.TESTIMONIALS.REMOVE(review.id), { method: 'DELETE', requireAuth: true });
      } else {
        await apiRequest(API_ENDPOINTS.ADMIN.TESTIMONIALS.ADD, { method: 'POST', body: { reviewId: review.id }, requireAuth: true });
      }
      toast.success(`Review ${action === 'add' ? 'featured' : 'unfeatured'} successfully.`);
      fetchFeaturedReviews(); // Refresh the list
    } catch (error) {
      toast.error(`Failed to ${action} testimonial.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`testimonial-${review.id}`]: false }));
    }
  };

  const handleDeleteReview = async () => {
    const { id, name } = deleteConfirm;
    setActionLoading(prev => ({ ...prev, [`delete-review-${id}`]: true }));
    try {
      await apiRequest(API_ENDPOINTS.REVIEWS.DELETE(id), { method: 'DELETE', requireAuth: true });
      toast.success(`Review from ${name} deleted successfully`);
      fetchReviews();
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete review.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-review-${id}`]: false }));
    }
  };

    const handleDeleteProduct = async () => {
        // ... existing implementation
    };
    const handleHardDeleteProduct = async () => {
        // ... existing implementation
    };
    const handleDeleteUser = async () => {
        // ... existing implementation
    };
    const handleRoleChange = async (userId: string, newRole: string) => {
        // ... existing implementation
    };
    const handleDeleteError = (error: any, itemName: string) => {
        // ... existing implementation
    };
    const showDeleteConfirm = (type: 'product' | 'user' | 'review', id: string, name: string, hard = false) => {
        setDeleteConfirm({ isOpen: true, type, id, name, hard });
    };
    const closeDeleteModal = () => {
        setDeleteConfirm({ isOpen: false, type: 'product', id: '', name: '', hard: false });
    };
    // ... other existing functions

    const productColumns: Column<Product>[] = [ /* ... */ ];
    const productActions: Action<Product>[] = [ /* ... */ ];
    const userColumns: Column<AdminUser>[] = [ /* ... */ ];
    const userActions: Action<AdminUser>[] = [ /* ... */ ];

    const reviewColumns: Column<Review>[] = [
        {
            key: 'author',
            header: 'Author',
            cell: (review) => `${review.user.firstName} ${review.user.lastName}`
        },
        {
            key: 'product',
            header: 'Product',
            cell: (review) => review.product.name
        },
        {
            key: 'rating',
            header: 'Rating',
            cell: (review) => (
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                </div>
            )
        },
        {
            key: 'comment',
            header: 'Comment',
            width: '40%'
        },
        {
            key: 'createdAt',
            header: 'Date',
            cell: (review) => new Date(review.createdAt).toLocaleDateString()
        },
    ];

    const reviewActions: Action<Review>[] = [
        {
            label: (review) => featuredReviewIds.includes(review.id) ? 'Unfeature' : 'Feature',
            onClick: (review) => handleToggleTestimonial(review),
            variant: (review) => featuredReviewIds.includes(review.id) ? 'outline' : 'primary',
            loading: (review) => actionLoading[`testimonial-${review.id}`]
        },
        {
            label: 'Delete',
            onClick: (review) => showDeleteConfirm('review', review.id, `review by ${review.user.firstName}`),
            variant: 'danger',
            loading: (review) => actionLoading[`delete-review-${review.id}`]
        }
    ];

    const renderTabButton = (tab: 'products' | 'users' | 'reviews', icon: React.ReactNode, label: string) => (
        <button
          className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium flex items-center space-x-2 ${activeTab === tab
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          onClick={() => setActiveTab(tab)}
        >
          {icon}
          <span>{label}</span>
        </button>
      );

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* ... header and error rendering ... */}
        <div className={commonClasses.container}>
          <div className="py-8">
            <div className={commonClasses.card}>
              <div className="flex border-b border-gray-200 bg-white">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  {renderTabButton('products', <Package className="h-4 w-4" />, 'Products')}
                  {renderTabButton('users', <Users className="h-4 w-4" />, 'Users')}
                  {renderTabButton('reviews', <MessageSquare className="h-4 w-4" />, 'Reviews')}
                </nav>
              </div>

              {activeTab === 'products' && (
                <div className="p-6">
                  {/* ... existing products tab content ... */}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="p-6">
                  {/* ... existing users tab content ... */}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Reviews Management</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage user reviews and feature them as testimonials on the dashboard.
                    </p>
                  </div>
                  <DataTable
                    data={reviews}
                    columns={reviewColumns}
                    actions={reviewActions}
                    loading={reviewsLoading}
                    emptyMessage="No reviews found"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={closeDeleteModal}
          onConfirm={
            deleteConfirm.type === 'product' ? handleDeleteProduct : 
            deleteConfirm.type === 'user' ? handleDeleteUser : 
            handleDeleteReview
          }
          title={`Delete ${deleteConfirm.type}`}
          message={`Are you sure you want to delete this ${deleteConfirm.type}?`}
          confirmText="Delete"
          variant="danger"
          isLoading={actionLoading[`delete-${deleteConfirm.type}-${deleteConfirm.id}`]}
        />
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminPage;