// API base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Ensure consistent protocol usage
const getApiUrl = (endpoint: string) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // In development, always use HTTP for localhost
  if (process.env.NODE_ENV !== 'production' && url.includes('localhost')) {
    return url.replace('https:', 'http:');
  }
  
  return url;
};

// Server availability tracking
let isServerAvailable = true;
let lastServerCheck = 0;
const SERVER_CHECK_INTERVAL = 30000; // 30 seconds

// Types and Interfaces
interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  requireAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper to check if running in development
const isDevelopment = () => {
  return process.env.NODE_ENV !== 'production' || 
         (typeof window !== 'undefined' && window.location.hostname === 'localhost');
};

// Cookie utility functions (matching AuthContext but with secure flag fix)
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
  
  // Only use secure flag in production (HTTPS)
  const secureFlag = isDevelopment() ? '' : ';secure';
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/${secureFlag};samesite=strict`;
  
  // Debug log in development
  if (isDevelopment()) {
    console.log(`Cookie set: ${name}`, { value: value.substring(0, 20) + '...', expires: expires.toUTCString() });
  }
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  // Delete with and without secure flag to ensure removal
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;secure;samesite=strict`;
  
  if (isDevelopment()) {
    console.log(`Cookie deleted: ${name}`);
  }
};

// Server Health Check
export const checkServerAvailability = async (): Promise<boolean> => {
  const now = Date.now();
  if (now - lastServerCheck < SERVER_CHECK_INTERVAL) {
    return isServerAvailable;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    isServerAvailable = response.ok;
    lastServerCheck = now;
    return isServerAvailable;
  } catch (error) {
    isServerAvailable = false;
    lastServerCheck = now;
    return false;
  }
};

// Authentication Token Management (using cookies like AuthContext)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = getCookie('accessToken');
  
  if (isDevelopment() && !token) {
    console.warn('No auth token found in cookies');
  }
  
  return token;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    setCookie('accessToken', token, 7);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('userRole');
    
    if (isDevelopment()) {
      console.log('All auth tokens removed');
    }
  }
};

// Token Refresh Handler
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const refreshAuthToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    // Wait for the ongoing refresh to complete
    return new Promise((resolve) => {
      subscribeTokenRefresh((token: string) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    if (isDevelopment()) {
      console.log('Attempting to refresh token...');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        setAuthToken(data.accessToken);
        onTokenRefreshed(data.accessToken);
        
        if (isDevelopment()) {
          console.log('Token refreshed successfully');
        }
        
        return data.accessToken;
      }
    }
    
    if (isDevelopment()) {
      console.warn('Token refresh failed:', response.status);
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  } finally {
    isRefreshing = false;
  }
};

// Main API Request Handler
export const apiRequest = async <T = any>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> => {
  // Check server availability first
  const serverAvailable = await checkServerAvailability();
  if (!serverAvailable) {
    throw new ApiError(
      'The server is currently unavailable. Please check if the backend server is running on port 5000.',
      503,
      'SERVER_UNAVAILABLE'
    );
  }

  const { method = 'GET', headers = {}, body, requireAuth = false } = options;
  
  const url = getApiUrl(endpoint);
  
  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  // Add auth token if required or available
  const token = getAuthToken();
  if (requireAuth && !token) {
    if (isDevelopment()) {
      console.error('Auth required but no token available for:', endpoint);
    }
    throw new ApiError('Authentication required but no token available', 401, 'NO_TOKEN');
  }
  
  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }
  
  // Prepare request config
  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies for refresh token
  };
  
  // Add body if provided
  if (body) {
    requestConfig.body = JSON.stringify(body);
  }
  
  if (isDevelopment()) {
    console.log(`API Request: ${method} ${endpoint}`, { 
      hasToken: !!token,
      requireAuth 
    });
  }
  
  try {
    let response = await fetch(url, requestConfig);
    
    // Handle authentication errors
    if (response.status === 401 && token) {
      if (isDevelopment()) {
        console.log('Received 401, attempting token refresh...');
      }
      
      // Try to refresh token
      const newToken = await refreshAuthToken();
      if (newToken) {
        // Retry the original request with new token
        requestHeaders.Authorization = `Bearer ${newToken}`;
        const retryConfig = { ...requestConfig, headers: requestHeaders };
        response = await fetch(url, retryConfig);
        
        if (!response.ok && response.status === 401) {
          removeAuthToken();
          throw new ApiError('Session expired. Please login again.', 401, 'SESSION_EXPIRED');
        }
      } else {
        // Refresh failed, user needs to login again
        removeAuthToken();
        throw new ApiError('Session expired. Please login again.', 401, 'SESSION_EXPIRED');
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (isDevelopment()) {
        console.error(`API Error: ${response.status}`, errorData);
      }
      
      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData.code
      );
    }
    
    const result = await response.json();
    
    if (isDevelopment()) {
      console.log(`API Success: ${method} ${endpoint}`);
    }
    
    return result;
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API request error:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      undefined,
      'NETWORK_ERROR'
    );
  }
};

// API Endpoints Configuration
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    PROFILE: '/auth/profile',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    FEATURED: '/products/featured',
    BY_ID: (id: string) => `/products/${id}`,
    SEARCH: '/products/search',
    SUGGESTIONS: '/search/suggestions',
    FILTER_OPTIONS: '/filter-options',
    // Admin endpoints
    ADMIN: {
      LIST: '/admin/products',
      BY_ID: (id: string) => `/admin/products/${id}`,
      CREATE: '/admin/products',
      UPDATE: (id: string) => `/admin/products/${id}`,
      DELETE: (id: string) => `/admin/products/${id}`,
    },
  },

  // Collections
  COLLECTIONS: {
    LIST: '/collections',
    BY_ID: (id: string) => `/collections/${id}`,
    BY_NAME: (name: string) => `/collections/${name}`,
    PRODUCTS: (name: string) => `/collections/${name}/products`,
  },

  // Shopping Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (itemId: string) => `/cart/item/${itemId}`,
    REMOVE: (itemId: string) => `/cart/item/${itemId}`,
    CLEAR: '/cart/clear',
  },

  // Wishlist
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: (productId: string) => `/wishlist/remove/${productId}`,
    CHECK: (productId: string) => `/wishlist/check/${productId}`,
    CLEAR: '/wishlist/clear',
    MOVE_TO_CART: (productId: string) => `/wishlist/move-to-cart/${productId}`,
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
  },

  // User Addresses
  ADDRESSES: {
    LIST: '/addresses',
    BY_ID: (id: string) => `/addresses/${id}`,
    CREATE: '/addresses',
    UPDATE: (id: string) => `/addresses/${id}`,
    DELETE: (id: string) => `/addresses/${id}`,
  },

  // User Management (Admin)
  USERS: {
    LIST: '/auth/admin/users',
    BY_ID: (id: string) => `/auth/users/${id}`,
    UPDATE_ROLE: (id: string) => `/auth/users/${id}/role`,
    DELETE: (id: string) => `/auth/users/${id}`,
    STATS: '/auth/users/stats',
  },
} as const;