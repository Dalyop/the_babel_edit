'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Product, User } from '@/app/store/types';
import { useAuth } from '@/app/context/AuthContext';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import { Users, Package, Plus, Search } from 'lucide-react';

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

const AdminPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'product' | 'user';
    id: string;
    name: string;
  }>({ isOpen: false, type: 'product', id: '', name: '' });
  
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'en';

  useEffect(() => {
    if (!isAdmin && user) {
      // If user is not admin but is logged in, redirect to home
      router.push(`/${locale}`);
      return;
    }
    if (isAdmin) {
      fetchProducts();
      fetchUsers();
    }
  }, [router, isAdmin, user, locale]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<{ products: Product[] }>(
        API_ENDPOINTS.PRODUCTS.LIST,
        { requireAuth: true }
      );
      setProducts(response.products);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    const { id, name } = deleteConfirm;
    setActionLoading(prev => ({ ...prev, [`delete-product-${id}`]: true }));
    
    try {
      await apiRequest(API_ENDPOINTS.PRODUCTS.ADMIN.DELETE(id), {
        method: 'DELETE',
        requireAuth: true
      });
      toast.success(`Product "${name}" deleted successfully`);
      fetchProducts();
      setDeleteConfirm({ isOpen: false, type: 'product', id: '', name: '' });
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Error deleting product:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-product-${id}`]: false }));
    }
  };

  const showDeleteConfirm = (type: 'product' | 'user', id: string, name: string) => {
    setDeleteConfirm({ isOpen: true, type, id, name });
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await apiRequest<{ users: AdminUser[] }>(
        API_ENDPOINTS.USERS.LIST,
        { requireAuth: true }
      );
      setUsers(response.users);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(prev => ({ ...prev, [`role-${userId}`]: true }));
    try {
      await apiRequest(API_ENDPOINTS.USERS.UPDATE_ROLE(userId), {
        method: 'PUT',
        body: { role: newRole },
        requireAuth: true,
      });
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`role-${userId}`]: false }));
    }
  };

  const handleDeleteUser = async () => {
    const { id, name } = deleteConfirm;
    setActionLoading(prev => ({ ...prev, [`delete-user-${id}`]: true }));
    
    try {
      await apiRequest(API_ENDPOINTS.USERS.DELETE(id), {
        method: 'DELETE',
        requireAuth: true,
      });
      toast.success(`User "${name}" deleted successfully`);
      fetchUsers();
      setDeleteConfirm({ isOpen: false, type: 'user', id: '', name: '' });
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-user-${id}`]: false }));
    }
  };

  // Define table columns for products
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
      cell: (product) => `$${product.price.toFixed(2)}`
    },
    {
      key: 'stock',
      header: 'Stock',
      cell: (product) => (
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
          (product.stock || 0) > 10 
            ? 'bg-green-100 text-green-800'
            : (product.stock || 0) > 0
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {(product.stock || 0) > 0 ? `${product.stock || 0} in stock` : 'Out of stock'}
        </span>
      )
    }
  ];

  // Define actions for products
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

  // Define table columns for users
  const userColumns: Column<AdminUser>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
              {user.firstName ? user.firstName[0].toUpperCase() : user.email[0].toUpperCase()}
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
        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
          user.isVerified 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {user.isVerified ? 'Verified' : 'Unverified'}
        </span>
      )
    }
  ];

  // Define actions for users
  const userActions: Action<AdminUser>[] = [
    {
      label: 'Delete',
      onClick: (user) => showDeleteConfirm('user', user.id, user.firstName + ' ' + user.lastName || user.email),
      variant: 'danger',
      loading: (user) => actionLoading[`delete-user-${user.id}`]
    }
  ];

  // Filter data based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.collection?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Header */}
        <div className="bg-white shadow">
          <div className={commonClasses.container}>
            <div className="flex h-16 justify-between items-center">
              <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search */}
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
        </div>

        {/* Main Content */}
        <div className={commonClasses.container}>
          <div className="py-8">
            <div className={commonClasses.card}>
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 bg-white">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium flex items-center space-x-2 ${
                      activeTab === 'products'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('products')}
                  >
                    <Package className="h-4 w-4" />
                    <span>Products</span>
                  </button>
                  <button
                    className={`whitespace-nowrap py-4 px-1 border-b-2 text-sm font-medium flex items-center space-x-2 ${
                      activeTab === 'users'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </button>
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
          onClose={() => setDeleteConfirm({ isOpen: false, type: 'product', id: '', name: '' })}
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