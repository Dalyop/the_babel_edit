'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { apiRequest, API_ENDPOINTS, setAuthToken, removeAuthToken, checkServerAvailability } from '@/app/lib/api';

type Address = {
  id?: string;
  type: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  name: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
  isVerified?: boolean;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
  authenticatedFetch: (endpoint: string, options?: any) => Promise<any>;
  setUser: (userData: User | null) => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Cookie utility functions
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const setCookie = (name: string, value: string, days = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// User data storage utilities
const setUserData = (userData: User) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

const getUserData = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

const clearUserData = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Failed to clear user data:', error);
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check server health first
      const isServerHealthy = await checkServerAvailability();
      if (!isServerHealthy) {
        toast.error('Unable to connect to server. Please ensure the backend is running on port 5000.');
        setLoading(false);
        return;
      }

      // Restore user from localStorage
      const storedUser = getUserData();
      const storedToken = getCookie('accessToken');

      if (storedUser && storedToken) {
        setUserState(storedUser);
        setCookie('userRole', storedUser.role, 7);

        // Verify the stored credentials are still valid
        const isValid = await verifyStoredAuth();
        if (!isValid) {
          clearAuthData();
        }
      } else if (storedToken) {
        // Have token but no user data, fetch user info
        await checkAuth();
      }

    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const verifyStoredAuth = async (): Promise<boolean> => {
    try {
      const response = await apiRequest<{ user: User }>(
        API_ENDPOINTS.AUTH.VERIFY,
        { requireAuth: true }
      );

      if (response.user) {
        setUserState(response.user);
        setUserData(response.user);
        setCookie('userRole', response.user.role, 7);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Auth verification failed:', error);

      // Don't clear auth on 500 errors - only on 401
      if (error.status === 401 || error.code === 'SESSION_EXPIRED') {
        return false;
      }

      // For other errors (like 500), keep existing session
      // and let the user continue
      console.warn('Verify endpoint error - keeping existing session');
      return true; // Assume valid if we have a token
    }
  };
  
  const checkAuth = async () => {
    try {
      const token = getCookie('accessToken');
      if (!token) {
        return;
      }

      const response = await apiRequest<{ user: User }>(
        API_ENDPOINTS.AUTH.VERIFY,
        { requireAuth: true }
      );

      if (response.user) {
        setUserState(response.user);
        setUserData(response.user);
        setCookie('userRole', response.user.role, 7);
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      if (error.code === 'SESSION_EXPIRED') {
        clearAuthData();
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest<{ accessToken: string; user: User }>(
        API_ENDPOINTS.AUTH.LOGIN,
        {
          method: 'POST',
          body: { email, password },
        }
      );

      // Store token and user data
      setAuthToken(response.accessToken);
      setUserState(response.user);
      setUserData(response.user);
      setCookie('userRole', response.user.role, 7);

      toast.success("Login successful!");

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  };

  const signup = async (userData: any) => {
    try {
      const response = await apiRequest<{ accessToken: string; user: User }>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          method: 'POST',
          body: userData,
        }
      );

      // Store token and user data
      setAuthToken(response.accessToken);
      setUserState(response.user);
      setUserData(response.user);
      setCookie('userRole', response.user.role, 7);

      toast.success("Account created successfully!");

      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Signup failed');
      return {
        success: false,
        error: error.message || 'Signup failed'
      };
    }
  };

  const clearAuthData = () => {
    setUserState(null);
    removeAuthToken();
    deleteCookie('userRole');
    clearUserData();
  };

  const logout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        requireAuth: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      router.push('/auth/login');
    }
  };

  // Function to make authenticated API calls from components
  const authenticatedFetch = async (endpoint: string, options: any = {}) => {
    try {
      return await apiRequest(endpoint, {
        ...options,
        requireAuth: true,
      });
    } catch (error: any) {
      console.error('API call failed:', error);

      // If session expired, clear auth and redirect
      if (error.code === 'SESSION_EXPIRED') {
        clearAuthData();
        router.push('/auth/login');
      }

      throw error;
    }
  };

  // Function to update user data
  const updateUser = (userData: User) => {
    setUserState(userData);
    setUserData(userData);
    setCookie('userRole', userData.role, 7);
  };

  const setUser = (userData: User | null) => {
    if (userData) {
      updateUser(userData);
    } else {
      clearAuthData();
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading,
    authenticatedFetch,
    setUser,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};