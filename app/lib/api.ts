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

// Server Health Check
const checkServerAvailability = async (): Promise<boolean> => {
  const now = Date.now();
  if (now - lastServerCheck < SERVER_CHECK_INTERVAL) {
    return isServerAvailable;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    isServerAvailable = response.ok;
    lastServerCheck = now;
    return isServerAvailable;
  } catch (error) {
    isServerAvailable = false;
    lastServerCheck = now;
    return false;
  }
};

// Authentication Token Management
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Try localStorage first (for React state persistence)
  const token = localStorage.getItem('accessToken');
  if (token) return token;
  
  // Fallback to cookies
  const cookieToken = document.cookie
    .split(';')
    .find(row => row.trim().startsWith('accessToken='))
    ?.split('=')[1];
    
  return cookieToken || null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    // Also try to clear cookie (though it should be httpOnly)
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

// Token Refresh Handler
const refreshAuthToken = async (): Promise<boolean> => {
  try {
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
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
};

// Main API Request Handler
export const apiRequest = async <T = any>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> => {
  // Check server availability first
  if (!await checkServerAvailability()) {
    throw new ApiError(
      'The server is currently unavailable. Please try again later.',
      503,
      'SERVER_UNAVAILABLE'
    );
  }

  const { method = 'GET', headers = {}, body, requireAuth = false } = options;
  
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Prepare headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  // Add auth token if required or available
  if (requireAuth || getAuthToken()) {
    const token = getAuthToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    } else if (requireAuth) {
      throw new Error('Authentication required but no token available');
    }
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
  
  try {
    const response = await fetch(url, requestConfig);
    
    // Handle authentication errors
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAuthToken();
      if (refreshed) {
        // Retry the original request with new token
        const newToken = getAuthToken();
        if (newToken) {
          requestHeaders.Authorization = `Bearer ${newToken}`;
        }
        const retryResponse = await fetch(url, requestConfig);
        
        if (!retryResponse.ok) {
          throw new ApiError(
            retryResponse.status === 401 ? 'Authentication failed' : 'Request failed',
            retryResponse.status
          );
        }
        
        const retryResult = await retryResponse.json();
        return retryResult;
      } else {
        // Refresh failed, user needs to login again
        removeAuthToken();
        throw new ApiError('Authentication required', 401);
      }
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status
      );
    }
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    console.error('API request error:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred'
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
    SEARCH: '/products',
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
    BY_ID: (id: string) => `/auth/admin/users/${id}`,
    UPDATE_ROLE: (id: string) => `/auth/admin/users/${id}/role`,
    DELETE: (id: string) => `/auth/admin/users/${id}`,
    STATS: '/auth/admin/users/stats',
  },
} as const;