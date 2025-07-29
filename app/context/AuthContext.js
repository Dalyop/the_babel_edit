'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Cookie utility functions
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const getCookie = (name) => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  // Enhanced API call helper with automatic token handling
  const apiCall = async (endpoint, options = {}) => {
    let token = accessToken || getCookie('accessToken');
    
    const makeRequest = async (authToken) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        ...options,
        credentials: 'include', // Important for httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
          ...options.headers,
        },
      });
    };

    let response = await makeRequest(token);

    // If token expired, try to refresh
    if (response.status === 401 && token) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await makeRequest(newToken);
      } else {
        logout();
        throw new Error('Session expired');
      }
    }

    return response;
  };

  const refreshToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // This sends httpOnly refresh cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store new access token
        setAccessToken(data.accessToken);
        setCookie('accessToken', data.accessToken, 1); // 1 day expiry
        
        return data.accessToken;
      } else {
        throw new Error('Refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  const checkAuth = async () => {
    try {
      const token = accessToken || getCookie('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await apiCall('/verify');

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setAccessToken(token);
      } else if (response.status === 401) {
        // Token invalid/expired - cleanup
        clearAuthData();
      } else {
        // Network or server error - keep trying later
        console.error('Auth verification failed, status:', response.status);
      }
    } catch (error) {
      // Network error - don't clear tokens immediately for better UX
      console.error('Auth check failed:', error);
      
      // Only clear if it's clearly an auth error
      if (error.message === 'Session expired') {
        clearAuthData();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Important for receiving httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message);
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store access token (short-lived, ~15 minutes)
      setAccessToken(data.accessToken);
      setCookie('accessToken', data.accessToken, 1); // 1 day as fallback
      
      // Refresh token should be set as httpOnly cookie by backend
      setUser(data.user);
      toast.success("Login successful!");
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message);
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      
      // Store access token
      setAccessToken(data.accessToken);
      setCookie('accessToken', data.accessToken, 1);
      
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const clearAuthData = () => {
    setAccessToken(null);
    setUser(null);
    deleteCookie('accessToken');
  };

  const logout = async () => {
    try {
      // Call backend logout to clear httpOnly refresh cookie
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      router.push('/login');
    }
  };

  // Function to make authenticated API calls from components
  const authenticatedFetch = async (endpoint, options = {}) => {
    try {
      const response = await apiCall(endpoint, options);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Request failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Add these helper functions for Google auth
  // const setUser = (userData) => {
  //   setUser(userData);
  // };

  const setAuthToken = (token) => {
    setAccessToken(token);
    setCookie('accessToken', token, 1);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    authenticatedFetch, // Expose this for components to use
    setUser, // For Google auth callback
    setAuthToken, // For Google auth callback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthContext.Provider>
  );
};