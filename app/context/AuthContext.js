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
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
};

const getCookie = (name) => {
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

const deleteCookie = (name) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// User data storage utilities
const setUserData = (userData) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

const getUserData = () => {
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Server health check failed');
      }
      
      const data = await response.json();
      return data.status === 'OK' && data.database === 'connected';
    } catch (error) {
      console.error('Server health check failed:', error);
      return false;
    }
  };

  const initializeAuth = async () => {
    try {
      // Check server health first
      const isServerHealthy = await checkServerHealth();
      if (!isServerHealthy) {
        toast.error('Unable to connect to server. Please try again later.');
        setLoading(false);
        return;
      }

      // First, try to restore user from localStorage
      const storedUser = getUserData();
      const storedToken = getCookie('accessToken');
      
      if (storedUser && storedToken) {
        setUser(storedUser);
        setAccessToken(storedToken);
        
        // Set user role cookie for middleware access
        setCookie('userRole', storedUser.role, 7);
        
        // Verify the stored credentials are still valid
        const isValid = await verifyStoredAuth(storedToken);
        if (!isValid) {
          // If stored auth is invalid, clear everything
          clearAuthData();
        }
      } else if (storedToken) {
        // Have token but no user data, try to fetch user info
        await checkAuth();
      }
      
    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const verifyStoredAuth = async (token) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/auth/verify`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Update user data if it changed on the server
        if (data.user) {
          setUser(data.user);
          setUserData(data.user);
          // Update role cookie if user data changed
          setCookie('userRole', data.user.role, 1);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Auth verification failed:', error);
      return false;
    }
  };

  // Enhanced API call helper with automatic token handling
  const apiCall = async (endpoint, options = {}) => {
    let token = accessToken || getCookie('accessToken');
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    const makeRequest = async (authToken) => {
      const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
      try {
        return await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            ...options.headers,
          },
        });
      } catch (error) {
        // Check server health on network errors
        const isServerHealthy = await checkServerHealth();
        if (!isServerHealthy) {
          throw new Error('Server is currently unavailable. Please try again later.');
        }
        throw error;
      }
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
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store new access token with 1 week expiration
        setAccessToken(data.accessToken);
        setCookie('accessToken', data.accessToken, 7);
        
        // Update user data if provided
        if (data.user) {
          setUser(data.user);
          setUserData(data.user);
          // Update role cookie with 1 week expiration
          setCookie('userRole', data.user.role, 7);
        }
        
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
        return;
      }

      const response = await apiCall('/auth/verify');

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setUserData(userData.user); // Store in localStorage
        setAccessToken(token);
        // Set role cookie for middleware
        setCookie('userRole', userData.user.role, 1);
      } else if (response.status === 401) {
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      if (error.message === 'Session expired') {
        clearAuthData();
      }
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
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
      
      // Store both token and user data
      setAccessToken(data.accessToken);
      setCookie('accessToken', data.accessToken, 1);
      setUser(data.user);
      setUserData(data.user); // Store in localStorage
      
      // ✨ KEY ADDITION: Set user role cookie for middleware access
      setCookie('userRole', data.user.role, 1);
      
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
      
      // Store both token and user data
      setAccessToken(data.accessToken);
      setCookie('accessToken', data.accessToken, 1);
      setUser(data.user);
      setUserData(data.user); // Store in localStorage
      
      // ✨ KEY ADDITION: Set user role cookie for middleware access
      setCookie('userRole', data.user.role, 1);
      
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
    deleteCookie('userRole'); // ✨ Clear role cookie too
    clearUserData(); // Clear from localStorage
  };

  const logout = async () => {
    try {
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

  const setAuthToken = (token) => {
    setAccessToken(token);
    setCookie('accessToken', token, 1);
  };

  // Function to update user data (useful for profile updates)
  const updateUser = (userData) => {
    setUser(userData);
    setUserData(userData);
    // Update role cookie when user data changes
    setCookie('userRole', userData.role, 1);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    authenticatedFetch,
    setUser: updateUser, // Use the enhanced version
    setAuthToken,
    updateUser, // Explicitly expose for profile updates
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