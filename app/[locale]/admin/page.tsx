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

interface Feedback {
  id: string;
  type: string;
  message: string;
  pageUrl: string;
  isResolved: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface ErrorState {
  type: 'products' | 'users' | 'reviews' | 'action';
  message: string;
}

interface DeleteConfirmState {
  isOpen: boolean;
  type: 'product' | 'user' | 'review' | 'feedback';
  id: string;
  name: string;
  hard: boolean;
}

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [featuredReviewIds, setFeaturedReviewIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'reviews' | 'feedback'>('products');
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
    } else if (activeTab === 'feedback') {
      fetchFeedbacks();
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
      const isServerError = error.status === 503 || error.code === 'SERVER_UNAVAILABLE';
      const errorMessage = isServerError
        ? 'The server is currently unavailable.'
        : error.message || 'Failed to fetch products';

      console.error('Error fetching products:', error);
      setError({
        type: 'products',
        message: errorMessage
      });

      if (retry && retryCount < MAX_RETRIES && !isServerError) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchProducts(true), 1000 * Math.pow(2, retryCount));
      } else {
        if (isServerError) {
          toast.error('Server is not responding. Please try again later.', {
            duration: 5000
          });
        } else {
          toast.error(errorMessage);
        }
      }
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
      const errorMessage = error.message || 'Failed to fetch users';
      console.error('Error fetching users:', error);
      toast.error(errorMessage);
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

  const fetchFeedbacks = async () => {
    setFeedbacksLoading(true);
    try {
      const response = await apiRequest<Feedback[]>(API_ENDPOINTS.FEEDBACK.LIST, { requireAuth: true });
      setFeedbacks(response);
    } catch (error) {
      toast.error('Failed to fetch feedbacks.');
    } finally {
      setFeedbacksLoading(false);
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

  const handleToggleResolve = async (feedbackId: string, isResolved: boolean) => {
    setActionLoading(prev => ({ ...prev, [`resolve-feedback-${feedbackId}`]: true }));
    try {
      await apiRequest(API_ENDPOINTS.FEEDBACK.UPDATE(feedbackId), { method: 'PUT', body: { isResolved }, requireAuth: true });
      toast.success(`Feedback marked as ${isResolved ? 'resolved' : 'unresolved'}.`);
      fetchFeedbacks();
    } catch (error) {
      toast.error('Failed to update feedback status.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`resolve-feedback-${feedbackId}`]: false }));
    }
  };

  const handleDeleteFeedback = async () => {
    const { id, name } = deleteConfirm;
    setActionLoading(prev => ({ ...prev, [`delete-feedback-${id}`]: true }));
    try {
      await apiRequest(API_ENDPOINTS.FEEDBACK.DELETE(id), { method: 'DELETE', requireAuth: true });
      toast.success(`Feedback from ${name} deleted successfully`);
      fetchFeedbacks();
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete feedback.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-feedback-${id}`]: false }));
    }
  };

  const handleDeleteProduct = async () => {
    const { id, name, hard } = deleteConfirm;
    if (hard) {
      handleHardDeleteProduct();
      return;
    }
    setActionLoading(prev => ({ ...prev, [`delete-product-${id}`]: true }));
    setError(null);

    try {
      await apiRequest(
        API_ENDPOINTS.PRODUCTS.ADMIN.DELETE(id),
        {
          method: 'DELETE',
          requireAuth: true
        }
      );

      toast.success(`Product "${name}" soft-deleted successfully`);
      await fetchProducts();
      closeDeleteModal();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete product';
      console.error('Error deleting product:', error);

      setError({
        type: 'action',
        message: `Failed to delete product "${name}": ${errorMessage}`
      });

      handleDeleteError(error, name);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-product-${id}`]: false }));
    }
  };

  const handleHardDeleteProduct = async () => {
    const { id, name } = deleteConfirm;
    setActionLoading(prev => ({ ...prev, [`hard-delete-product-${id}`]: true }));
    setError(null);

    try {
      await apiRequest(
        `/admin/products/${id}/hard`,
        {
          method: 'DELETE',
          requireAuth: true
        }
      );

      toast.success(`Product "${name}" permanently deleted successfully`);
      await fetchProducts();
      closeDeleteModal();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to permanently delete product';
      console.error('Error permanently deleting product:', error);

      setError({
        type: 'action',
        message: `Failed to permanently delete product "${name}": ${errorMessage}`
      });

      handleDeleteError(error, name);
    } finally {
      setActionLoading(prev => ({ ...prev, [`hard-delete-product-${id}`]: false }));
    }
  };

  const handleDeleteUser = async () => {
    const { id, name } = deleteConfirm;
    setActionLoading(prev => ({ ...prev, [`delete-user-${id}`]: true }));

    try {
      await apiRequest(
        API_ENDPOINTS.USERS.DELETE(id),
        {
          method: 'DELETE',
          requireAuth: true,
        }
      );

      toast.success(`User "${name}" deleted successfully`);
      fetchUsers();
      closeDeleteModal();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete user';
      console.error('Error deleting user:', error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-user-${id}`]: false }));
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(prev => ({ ...prev, [`role-${userId}`]: true }));

    try {
      await apiRequest(
        API_ENDPOINTS.USERS.UPDATE_ROLE(userId),
        {
          method: 'PUT',
          body: { role: newRole },
          requireAuth: true,
        }
      );

      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update user role';
      console.error('Error updating user role:', error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [`role-${userId}`]: false }));
    }
  };

  const handleDeleteError = (error: any, itemName: string) => {
    if (error.status === 403) {
      toast.error('You do not have permission to delete this product');
    } else if (error.status === 404) {
      toast.error('Product not found. It may have been deleted already.');
      fetchProducts();
    } else {
      toast.error(error.message || 'Delete failed');
    }
  };

  const showDeleteConfirm = (type: 'product' | 'user' | 'review' | 'feedback', id: string, name: string, hard = false) => {
    setDeleteConfirm({ isOpen: true, type, id, name, hard });
  };

  const closeDeleteModal = () => {
    setDeleteConfirm({ isOpen: false, type: 'product', id: '', name: '', hard: false });
  };

  const getStockStatus = (stock: number) => {
    if (stock > 10) return { class: 'bg-green-100 text-green-800', text: `${stock} in stock` };
    if (stock > 0) return { class: 'bg-yellow-100 text-yellow-800', text: `${stock} in stock` };
    return { class: 'bg-red-100 text-red-800', text: 'Out of stock' };
  };

  const getUserDisplayName = (user: AdminUser) => {
    return user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;
  };

  const getUserInitial = (user: AdminUser) => {
    return user.firstName
      ? user.firstName[0].toUpperCase()
      : user.email[0].toUpperCase();
  };

  const productColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Name',
      width: '30%'
    },
    {
      key: 'collection.name',
      header: 'Collection',
      cell: (product) => product.collection?.name || '-'
    },
    {
      key: 'price',
      header: 'Price',
      cell: (product) => `${product.price.toFixed(2)}`
    },
    {
      key: 'stock',
      header: 'Stock',
      cell: (product) => {
        const stock = product.stock || 0;
        const status = getStockStatus(stock);
        return (
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${status.class}`}>
            {status.text}
          </span>
        );
      }
    }
  ];

  const productActions: Action<Product>[] = [
    {
      label: 'Edit',
      onClick: (product) => router.push(`/${locale}/admin/products/${product.id}/edit`),
      variant: 'outline'
    },
    {
      label: 'Delete',
      onClick: (product) => showDeleteConfirm('product', product.id, product.name),
      variant: 'danger',
      loading: (product) => actionLoading[`delete-product-${product.id}`]
    },
    {
      label: 'Hard Delete',
      onClick: (product) => showDeleteConfirm('product', product.id, product.name, true),
      variant: 'danger',
      loading: (product) => actionLoading[`hard-delete-product-${product.id}`]
    }
  ];

  const userColumns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {getUserInitial(user)}
            </div>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      cell: (user) => (
        <select
          value={user.role}
          onChange={(e) => handleRoleChange(user.id, e.target.value)}
          className={commonClasses.input}
          disabled={actionLoading[`role-${user.id}`]}
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      cell: (user) => new Date(user.createdAt).toLocaleDateString()
    },
    {
      key: 'isVerified',
      header: 'Status',
      cell: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${user.isVerified
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
          }`}>
          {user.isVerified ? 'Verified' : 'Unverified'}
        </span>
      )
    }
  ];

  const userActions: Action<AdminUser>[] = [
    {
      label: 'Delete',
      onClick: (user) => showDeleteConfirm('user', user.id, getUserDisplayName(user)),
      variant: 'danger',
      loading: (user) => actionLoading[`delete-user-${user.id}`]
    }
  ];

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

  const feedbackColumns: Column<Feedback>[] = [
    {
      key: 'author',
      header: 'Author',
      cell: (feedback) => feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName} (${feedback.user.email})` : 'Anonymous'
    },
    {
      key: 'type',
      header: 'Type',
    },
    {
      key: 'message',
      header: 'Message',
      width: '40%'
    },
    {
      key: 'pageUrl',
      header: 'Page URL',
    },
    {
      key: 'isResolved',
      header: 'Status',
      cell: (feedback) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${feedback.isResolved
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
          }`}>
          {feedback.isResolved ? 'Resolved' : 'Unresolved'}
        </span>
      )
    },
  ];

  const feedbackActions: Action<Feedback>[] = [
    {
      label: 'Mark as Resolved',
      onClick: (feedback) => handleToggleResolve(feedback.id, true),
      variant: 'outline',
      loading: (feedback) => actionLoading[`resolve-feedback-${feedback.id}`]
    },
    {
      label: 'Delete',
      onClick: (feedback) => showDeleteConfirm('feedback', feedback.id, `feedback by ${feedback.user?.firstName || 'Anonymous'}`),
      variant: 'danger',
      loading: (feedback) => actionLoading[`delete-feedback-${feedback.id}`]
    }
  ];

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderError = () => {
    if (!error) return null;

    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error.message}</p>
            {error.type !== 'action' && retryCount > 0 && (
              <p className="mt-1 text-sm text-red-600">
                Retrying... Attempt {retryCount} of {MAX_RETRIES}
              </p>
            )}
            {error.type !== 'action' && retryCount >= MAX_RETRIES && (
              <button
                onClick={() => fetchProducts(true)}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTabButton = (tab: 'products' | 'users' | 'reviews' | 'feedback', icon: React.ReactNode, label: string) => (
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
        {renderError()}

        <div className="bg-white shadow">
          <div className={commonClasses.container}>
            <div className="flex h-16 justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${commonClasses.input} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={commonClasses.container}>
          <div className="py-8">
            <div className={commonClasses.card}>
              <div className="flex border-b border-gray-200 bg-white">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  {renderTabButton('products', <Package className="h-4 w-4" />, 'Products')}
                  {renderTabButton('users', <Users className="h-4 w-4" />, 'Users')}
                  {renderTabButton('reviews', <MessageSquare className="h-4 w-4" />, 'Reviews')}
                  {renderTabButton('feedback', <MessageSquare className="h-4 w-4" />, 'Feedback')}
                </nav>
              </div>

              {activeTab === 'products' && (
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-2 sm:space-y-0">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Manage your product catalog including inventory and pricing.
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(`/${locale}/admin/products/create`)}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Add New Product
                    </Button>
                  </div>

                  <DataTable
                    data={products}
                    columns={productColumns}
                    actions={productActions}
                    loading={loading}
                    emptyMessage="No products found"
                  />
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Page {pagination.page} of {pagination.pages}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Users Management</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage user accounts, roles, and permissions.
                    </p>
                  </div>

                  <DataTable
                    data={filteredUsers}
                    columns={userColumns}
                    actions={userActions}
                    loading={usersLoading}
                    emptyMessage="No users found"
                  />
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

              {activeTab === 'feedback' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Feedback Management</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage user feedback and suggestions.
                    </p>
                  </div>
                  <DataTable
                    data={feedbacks}
                    columns={feedbackColumns}
                    actions={feedbackActions}
                    loading={feedbacksLoading}
                    emptyMessage="No feedback found"
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
            deleteConfirm.type === 'review' ? handleDeleteReview :
            handleDeleteFeedback
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