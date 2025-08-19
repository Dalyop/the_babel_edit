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
  const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | number | null>(null);

  // Use ref to track if we've already fetched data
  const hasFetchedRef = useRef(false);

  // Redirect if not authenticated after loading completes
  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to login...');
      router.replace(`/${currentLocale}/auth/login`);
    }
  }, [loading, user, router, currentLocale]);

  // Memoize the fetchProfile function to prevent recreating it on every render
  const fetchProfile = useCallback(async () => {
    if (!authenticatedFetch || hasFetchedRef.current) return;

    setProfileLoading(true);
    setError('');
    hasFetchedRef.current = true;

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
          phone: profileData.phone,
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
      hasFetchedRef.current = false; // Reset on error so it can be retried
    } finally {
      setProfileLoading(false);
    }
  }, [authenticatedFetch, updateUser]); // Only depend on stable functions

  // Initialize profile data from user context
  useEffect(() => {
    if (user && (user.name || user.email) && !profile) {
      const userData = {
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        addresses: user.addresses || [],
        role: user.role || ''
      };

      setProfile(userData);
      setForm({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      });
    }
  }, [user?.id, profile]); // Only run when user ID changes or profile is null

  // Fetch fresh profile data (only once)
  useEffect(() => {
    if (user && authenticatedFetch && !hasFetchedRef.current) {
      fetchProfile();
    }
  }, [user?.id, fetchProfile]); // Only depend on user ID and the memoized fetch function

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
          addresses: userData.addresses || [],
          role: userData.role || ''
        };

        setProfile(profileData);

        // Update the global user context
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

  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const method = editingAddress !== null ? 'PUT' : 'POST';
      const endpoint = editingAddress !== null
        ? `/user/addresses/${editingAddress}`
        : '/user/addresses';

      const response = await authenticatedFetch(endpoint, {
        method,
        body: JSON.stringify(newAddress),
        headers: { 'Content-Type': 'application/json' }
      });

      // Refresh profile to get updated addresses
      await fetchProfile();

      setNewAddress({ type: 'home', address: '', city: '', state: '', zipCode: '', country: '' });
      setEditingAddress(null);
      setShowAddressForm(false);
      toast.success(`Address ${editingAddress !== null ? 'updated' : 'added'} successfully!`);
    } catch (err: any) {
      setError(`Failed to ${editingAddress !== null ? 'update' : 'add'} address: ${err.message || err}`);
      toast.error(`Failed to ${editingAddress !== null ? 'update' : 'add'} address: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  // open dialog instead of deleting immediately
  const handleDeleteAddress = (addressId: string | number) => {
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
              {profile?.addresses?.map((addr, idx) => (
                <div key={idx} className={styles.addressItem}>
                  <div className={styles.addressDetails}>
                    <span className={styles.addressType}>{addr.type}</span>
                    <p className={styles.addressText}>{addr.address}</p>
                    {(addr.city || addr.state || addr.zipCode) && (
                      <p className={styles.addressMeta}>
                        {[addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ')}
                      </p>
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
                      onClick={() => handleDeleteAddress(addr.id || idx)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )) || (
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
                    <span>Street Address</span>
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
                placeholder="Enter new password"
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
            <div className={styles.emptyState}>
              <p>No orders found. Start shopping to see your orders here!</p>
              <Link href={`/${currentLocale}/products`} className={styles.primaryBtn}>
                Browse Products
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return <Loading
      fullScreen={true}
      text="Checking authentication..."
      size="large"
    />;
  }

  // Redirect if no user (this will be handled by useEffect)
  if (!user) {
    return <Loading
      fullScreen={true}
      text="Redirecting to login..."
      size="large"
    />;
  }

  // Show loading while fetching profile (only if we don't have basic user data)
  if (profileLoading && !profile) {
    return <Loading
      fullScreen={true}
      text="Loading your profile..."
      size="large"
    />;
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
          {/* Show error message if there's an error */}
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
              <br />
              <small>Check the browser console for more details.</small>
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

          {/* Tab Content */}
          {renderTabContent()}

          {/* Logout Confirmation Dialog */}
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

          {/* Delete Address Confirmation Dialog */}
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