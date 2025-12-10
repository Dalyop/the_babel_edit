"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./account.module.css";
import Navbar from "@/app/components/features/Navbar/Navbar";
import Footer from "@/app/components/features/Footer/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useParams } from "next/navigation";
import Loading from "@/app/components/ui/Loading/Loading";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { API_ENDPOINTS } from "@/app/lib/api";
import { Loader2, Package, AlertCircle } from 'lucide-react';

type Address = {
  id?: string;
  type: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

type Profile = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
};

// Define the structure of an order based on your backend's API response
interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }[];
}

export default function AccountPage() {
  const params = useParams();
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  const router = useRouter();
  const { user, loading, authenticatedFetch, updateUser, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profile');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [newAddress, setNewAddress] = useState({ type: 'home', address: '', city: '', state: '', zipCode: '', country: '' });
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  // Redirect if not authenticated after loading completes
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login...');
      router.replace(`/${currentLocale}/auth/login`);
    }
  }, [loading, user, router, currentLocale]);

  // Memoize the fetchProfile function
  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setProfileLoading(true);
    setError('');

    try {
      const endpoint = `/auth/profile`;
      console.log('Fetching profile from:', endpoint);

      const data = await authenticatedFetch(endpoint);
      console.log('Profile fetch successful:', data);

      const userData = data.user || data.data || data;

      if (userData) {
        const profileData = {
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          addresses: userData.addresses || []
        };

        setProfile(profileData);
        setForm({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || '',
        });

        // Update the user context with fresh data
        updateUser(userData);
      } else {
        console.error('No user data in response:', data);
        setError('No profile data found in response');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(`Failed to load profile: ${err.message || err}`);
    } finally {
      setProfileLoading(false);
    }
  }, [authenticatedFetch, updateUser, user]);

  // Initialize profile data from user context and fetch fresh data
  useEffect(() => {
    if (!user || loading) return;

    // Set initial profile from user context
    if (!profile) {
      const userData = {
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        addresses: user.addresses || []
      };

      setProfile(userData);
      setForm({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
      });
    }

    // Fetch fresh profile data only once
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProfile();
    }
  }, [user, loading, profile, authenticatedFetch, fetchProfile]);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders' && user) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
          const data = await authenticatedFetch(API_ENDPOINTS.ORDERS.LIST);
          setOrders(data.orders);
        } catch (err: any) {
          setOrdersError(err.message || 'An unexpected error occurred.');
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, user, authenticatedFetch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      console.log('Submitting form data:', form);
      const updated = await authenticatedFetch(`/auth/profile`, {
        method: "PUT",
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
      });

      console.log('Update successful:', updated);
      const userData = updated.user || updated.data || updated;

      if (userData) {
        const profileData = {
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          addresses: userData.addresses || []
        };

        setProfile(profileData);
        updateUser(userData);
      }

      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Update error:', err);
      setError(`Failed to update profile: ${err.message || err}`);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await authenticatedFetch('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
        headers: { 'Content-Type': 'application/json' }
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err: any) {
      setError(`Failed to change password: ${err.message || err}`);
      toast.error(`Failed to change password: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address: Address, idx: number) => {
    setEditingAddress(address.id || String(idx));
    setNewAddress({
      type: address.type || 'home',
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
    });
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newAddress.address.trim()) {
      toast.error('Street address is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const method = editingAddress !== null ? 'PUT' : 'POST';
      const endpoint = editingAddress !== null
        ? `/user/addresses/${editingAddress}`
        : '/user/addresses';

      await authenticatedFetch(endpoint, {
        method,
        body: JSON.stringify(newAddress),
        headers: { 'Content-Type': 'application/json' }
      });

      // Refresh profile to get updated addresses
      hasFetchedRef.current = false;
      await fetchProfile();

      setNewAddress({ type: 'home', address: '', city: '', state: '', zipCode: '', country: '' });
      setEditingAddress(null);
      setShowAddressForm(false);
      toast.success(`Address ${editingAddress !== null ? 'updated' : 'added'} successfully!`);
    } catch (err: any) {
      setError(`Failed to ${editingAddress !== null ? 'update' : 'add'} address: ${err.message || err}`);
      toast.error(`Failed to ${editingAddress !== null ? 'update' : 'add'} address`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    setSaving(true);
    try {
      await authenticatedFetch(`/user/addresses/${addressToDelete}`, {
        method: "DELETE",
      });
      
      hasFetchedRef.current = false;
      await fetchProfile();
      toast.success("Address deleted successfully!");
    } catch (err: any) {
      toast.error(`Failed to delete address: ${err.message || err}`);
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const handleConfirm = () => {
    logout();
    setLogoutDialogOpen(false);
  };

  const getStatusChipClass = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-[var(--color-success)] text-white';
      case 'SHIPPED':
        return 'bg-[var(--color-primary-light)] text-white';
      case 'PENDING':
        return 'bg-[var(--color-warning)] text-amber-800';
      case 'CANCELLED':
        return 'bg-[var(--color-accent)] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Order #{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusChipClass(order.status)}`}>
            {order.status}
          </span>
          <p className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</p>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4 mb-6">
          {order.items.slice(0, 2).map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <img
                src={item.product?.imageUrl || '/placeholder-product.png'}
                alt={item.product?.name || 'Product image'}
                className="w-16 h-16 object-cover rounded-md border"
              />
              <div className='flex-grow'>
                <p className="font-semibold text-gray-800">{item.product?.name || 'Product no longer available'}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          {order.items.length > 2 && (
             <p className="text-sm text-gray-500 pt-2 text-center">
               + {order.items.length - 2} more item(s)
             </p>
          )}
        </div>
        <Link href={`/${currentLocale}/orders/${order.id}`} className="inline-block w-full text-center bg-[var(--color-primary-light)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--color-primary)] transition-colors duration-300">
            View Order Details
        </Link>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form className={styles.profileForm} onSubmit={handleSubmit}>
            <h2 className={styles.tabTitle}>Profile Settings</h2>
            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>👤</span> Full Name
              </span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
                className={styles.formInput}
              />
            </label>

            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>✉️</span> Email Address
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                className={styles.formInput}
              />
            </label>

            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>📞</span> Phone Number
              </span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className={styles.formInput}
              />
            </label>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        );

      case 'addresses':
        return (
          <div className={styles.addressesTab}>
            <div className={styles.tabHeader}>
              <h2 className={styles.tabTitle}>Manage Addresses</h2>
              <button
                className={styles.primaryBtn}
                onClick={() => {
                  setShowAddressForm(true);
                  setEditingAddress(null);
                  setNewAddress({ type: 'home', address: '', city: '', state: '', zipCode: '', country: '' });
                }}
              >
                Add New Address
              </button>
            </div>

            <div className={styles.addressesList}>
              {profile?.addresses && profile.addresses.length > 0 ? (
                profile.addresses.map((addr, idx) => (
                  <div key={addr.id || idx} className={styles.addressItem}>
                    <div className={styles.addressDetails}>
                      <span className={styles.addressType}>{addr.type}</span>
                      <p className={styles.addressText}>{addr.address}</p>
                      {(addr.city || addr.state || addr.zipCode) && (
                        <p className={styles.addressMeta}>
                          {[addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ')}
                        </p>
                      )}
                      {addr.country && (
                        <p className={styles.addressMeta}>{addr.country}</p>
                      )}
                    </div>
                    <div className={styles.addressActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditAddress(addr, idx)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteAddress(addr.id || String(idx))}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No addresses added yet. Click "Add New Address" to get started.</p>
                </div>
              )}
            </div>

            {showAddressForm && (
              <div className={styles.addressFormOverlay}>
                <form className={styles.addressForm} onSubmit={handleAddressSubmit}>
                  <h3>{editingAddress !== null ? 'Edit Address' : 'Add New Address'}</h3>

                  <label>
                    <span>Address Type</span>
                    <select
                      name="type"
                      value={newAddress.type}
                      onChange={handleAddressChange}
                      className={styles.formInput}
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </label>

                  <label>
                    <span>Street Address *</span>
                    <input
                      type="text"
                      name="address"
                      value={newAddress.address}
                      onChange={handleAddressChange}
                      placeholder="123 Main Street"
                      required
                      className={styles.formInput}
                    />
                  </label>

                  <div className={styles.addressRow}>
                    <label>
                      <span>City</span>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleAddressChange}
                        placeholder="New York"
                        className={styles.formInput}
                      />
                    </label>

                    <label>
                      <span>State</span>
                      <input
                        type="text"
                        name="state"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        placeholder="NY"
                        className={styles.formInput}
                      />
                    </label>
                  </div>

                  <div className={styles.addressRow}>
                    <label>
                      <span>ZIP Code</span>
                      <input
                        type="text"
                        name="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleAddressChange}
                        placeholder="10001"
                        className={styles.formInput}
                      />
                    </label>

                    <label>
                      <span>Country</span>
                      <input
                        type="text"
                        name="country"
                        value={newAddress.country}
                        onChange={handleAddressChange}
                        placeholder="United States"
                        className={styles.formInput}
                      />
                    </label>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelBtn}
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        setNewAddress({ type: 'home', address: '', city: '', state: '', zipCode: '', country: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.primaryBtn}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : (editingAddress !== null ? 'Update Address' : 'Add Address')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        );

      case 'security':
        return (
          <form className={styles.profileForm} onSubmit={handlePasswordSubmit}>
            <h2 className={styles.tabTitle}>Change Password</h2>

            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>🔒</span> Current Password
              </span>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                required
                className={styles.formInput}
              />
            </label>

            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>🔑</span> New Password
              </span>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min 8 characters)"
                required
                minLength={8}
                className={styles.formInput}
              />
            </label>

            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>✅</span> Confirm New Password
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm your new password"
                required
                className={styles.formInput}
              />
            </label>

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={saving}
            >
              {saving ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        );

      case 'orders':
        return (
          <div className={styles.ordersTab}>
            <h2 className={styles.tabTitle}>Order History</h2>
            {ordersLoading ? (
                <div className="text-center py-20">
                    <Loader2 className="mx-auto w-12 h-12 text-blue-600 animate-spin" />
                    <p className="mt-4 text-lg text-gray-600">Loading your orders...</p>
                </div>
            ) : ordersError ? (
                <div className="text-center py-20 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="mx-auto w-12 h-12 text-red-500" />
                    <p className="mt-4 text-lg text-red-700 font-semibold">{ordersError}</p>
                    <p className='mt-2 text-gray-600'>There was a problem fetching your order history.</p>
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-8">
                    {orders.map(order => <OrderCard key={order.id} order={order} />)}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Package className="mx-auto w-12 h-12 text-gray-400" />
                    <h2 className="mt-4 text-xl font-semibold text-gray-800">No Orders Yet</h2>
                    <p className="mt-2 text-gray-500">You haven't placed any orders with us. When you do, they will appear here.</p>
                    <Link href={`/${currentLocale}/products`} className={styles.primaryBtn}>
                        Browse Products
                    </Link>
                </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Loading fullScreen={true} text="Checking authentication..." size="large" />;
  }

  if (!user) {
    return <Loading fullScreen={true} text="Redirecting to login..." size="large" />;
  }

  if (profileLoading && !profile) {
    return <Loading fullScreen={true} text="Loading your profile..." size="large" />;
  }

  return (
    <div className={styles.accountBg}>
      <Navbar />
      <main className={styles.accountMain}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>My Account</div>
          <ul className={styles.sidebarMenu}>
            <li className={activeTab === 'profile' ? styles.active : ''} onClick={() => setActiveTab('profile')}>Profile Settings</li>
            <li className={activeTab === 'orders' ? styles.active : ''} onClick={() => setActiveTab('orders')}>Orders</li>
            <li className={activeTab === 'addresses' ? styles.active : ''} onClick={() => setActiveTab('addresses')}>Addresses</li>
            <li className={activeTab === 'wishlist' ? styles.active : ''}>
              <Link href={`/${currentLocale}/wishlist`}>Wishlist</Link>
            </li>
            <li className={activeTab === 'security' ? styles.active : ''} onClick={() => setActiveTab('security')}>Security</li>
          </ul>
          <div className={styles.logout} onClick={handleLogout}>
            Logout
          </div>
        </div>

        <div className={styles.profileContent}>
          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33',
              marginBottom: '1rem'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className={styles.profileHeader}>
            <img
              src={profile?.avatar || user?.avatar || "/images/babel_logo_black.jpg"}
              alt="avatar"
              className={styles.avatar}
            />
            <div>
              <div className={styles.profileName}>
                {profile?.name || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'No name available'}
              </div>
              <div className={styles.profileEmail}>
                {profile?.email || user?.email || 'No email available'}
              </div>
            </div>
          </div>

          {renderTabContent()}

          <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                Are you sure you want to logout?
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirm}>
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Address</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setAddressToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteAddress}
                  disabled={saving}
                >
                  {saving ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
}