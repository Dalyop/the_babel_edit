'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product, User } from '@/app/store/types';
import { useAuth } from '@/app/context/AuthContext';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import { Users, Package, Plus, Search, AlertCircle } from 'lucide-react';

import AdminProtectedRoute from '@/app/components/AdminProtectedRoute';
import Button from '@/app/components/ui/Button/Button';
import DataTable, { Column, Action } from '@/app/components/ui/DataTable/DataTable';
import ConfirmModal from '@/app/components/ui/ConfirmModal/ConfirmModal';
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

interface ErrorState {
  type: 'products' | 'users' | 'action';
  message: string;
}

interface DeleteConfirmState {
  isOpen: boolean;
  type: 'product' | 'user';
  id: string;
  name: string;
}

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    type: 'product',
    id: '',
    name: ''
  });

  const MAX_RETRIES = 3;
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  const isAdmin = user?.role && ['admin', 'super_admin'].includes(user.role.toLowerCase());

  useEffect(() => {
      fetchProducts();
      fetchUsers();
  }, []);

  const fetchProducts = async (retry = false) => {
    setLoading(true);
    setError(null);

    try {
      // Use the admin products endpoint
      const response = await apiRequest<{ products: Product[] }>(
        API_ENDPOINTS.PRODUCTS.ADMIN.LIST,
        { requireAuth: true }
      );
      setProducts(response.products);
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

  const handleDeleteProduct = async () => {
    const { id, name } = deleteConfirm;
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

      toast.success(`Product "${name}" deleted successfully`);
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

  const showDeleteConfirm = (type: 'product' | 'user', id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, type, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteConfirm({ isOpen: false, type: 'product', id: '', name: '' });
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

  // Table columns and actions
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

  // Filtered data
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.collection?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const renderTabButton = (tab: 'products' | 'users', icon: React.ReactNode, label: string) => (
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

        {/* Header */}
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

        {/* Main Content */}
        <div className={commonClasses.container}>
          <div className="py-8">
            <div className={commonClasses.card}>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 bg-white">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  {renderTabButton('products', <Package className="h-4 w-4" />, 'Products')}
                  {renderTabButton('users', <Users className="h-4 w-4" />, 'Users')}
                </nav>
              </div>

              {/* Products Tab */}
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
                    data={filteredProducts}
                    columns={productColumns}
                    actions={productActions}
                    loading={loading}
                    emptyMessage="No products found"
                  />
                </div>
              )}

              {/* Users Tab */}
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
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={closeDeleteModal}
          onConfirm={deleteConfirm.type === 'product' ? handleDeleteProduct : handleDeleteUser}
          title={`Delete ${deleteConfirm.type === 'product' ? 'Product' : 'User'}`}
          message={`Are you sure you want to delete ${deleteConfirm.type === 'product' ? 'product' : 'user'} "${deleteConfirm.name}"? This action cannot be undone.`}
          confirmText="Delete"
          variant="danger"
          isLoading={actionLoading[`delete-${deleteConfirm.type}-${deleteConfirm.id}`]}
        />
      </div>
    </AdminProtectedRoute>
  );
};

export default AdminPage;