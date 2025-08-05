"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./account.module.css";
import Navbar from "@/app/components/features/Navbar/Navbar";
import Footer from "@/app/components/features/Footer/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useParams } from "next/navigation";
import Loading from "@/app/components/ui/Loading/Loading";

type Address = { type: string; address: string };
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
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
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
        addresses: user.addresses || []
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
          addresses: userData.addresses || []
        };
        
        setProfile(profileData);
        
        // Update the global user context
        updateUser(userData);
      }
      
      alert('Profile updated successfully!');
    } catch (err: any) {
      console.error('Update error:', err);
      setError(`Failed to update profile: ${err.message || err}`);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Use the logout method from auth context instead of manual cleanup
      logout();
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
            <li>Orders</li>
            <li>Track Orders</li>
            <li>Payment Method</li>
            <li>Wishlist</li>
            <li className={styles.active}>Account Settings</li>
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
          
          <form className={styles.profileForm} onSubmit={handleSubmit}>
            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>🔑</span> Name
              </span>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                placeholder="Name" 
                required
              />
            </label>
            
            <label>
              <span className={styles.labelRow}>
                <span className={styles.labelIcon}>✉️</span> Email
              </span>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="Email" 
                required
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
                placeholder="Phone Number" 
              />
            </label>
            
            <div className={styles.addressSection}>
              <div className={styles.addressTitile}>
                <span className={styles.labelIcon}>🏠</span> Address
              </div>
              {profile?.addresses?.map((addr: Address, idx: number) => (
                <div className={styles.addressCard} key={idx}>
                  <span className={styles.addressType}>{addr.type}</span>
                  <span className={styles.addressText}>{addr.address}</span>
                  <span className={styles.addressArrow}>›</span>
                </div>
              ))}
              <button className={styles.addAddressBtn} type="button">
                Add New Address
              </button>
            </div>
            
            <div className={styles.sectionBox}>
              <div className={styles.sectionTitle}>
                <span className={styles.labelIcon}>📦</span> Returns & Exchanges
              </div>
              <button className={styles.sectionBtn} type="button">
                View Returns & Exchanges
              </button>
            </div>
            
            <div className={styles.sectionBox}>
              <div className={styles.sectionTitle}>
                <span className={styles.labelIcon}>👤</span> Account Management
              </div>
              <button className={styles.sectionBtn} type="button">
                Change Password
              </button>
              <button className={styles.sectionBtn} type="button">
                Delete Account
              </button>
            </div>
            
            <button 
              type="submit" 
              className={styles.editProfileBtn} 
              disabled={saving} 
              style={{ marginTop: 16 }}
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}