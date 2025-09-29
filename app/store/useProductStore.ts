import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Product, FilterOptions, Collection } from './types';
import { STORAGE_KEYS, setWithTimestamp, getWithTimestamp } from './storage';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  searchResults: Product[];
  collections: Collection[];
  currentProduct: Product | null;
  loading: boolean;
  searchLoading: boolean;
  error: string | null;
  filters: FilterOptions;
  searchQuery: string;
  lastFetchTime: number | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

interface ProductActions {
  setProducts: (products: Product[]) => void;
  setFeaturedProducts: (products: Product[]) => void;
  setSearchResults: (products: Product[]) => void;
  setCurrentProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setSearchLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: FilterOptions) => void;
  setSearchQuery: (query: string) => void;
  
  // API Actions
  fetchProducts: (filters?: FilterOptions, force?: boolean) => Promise<void>;
  fetchFeaturedProducts: (limit?: number, force?: boolean) => Promise<void>;
  fetchProductById: (id: string, force?: boolean) => Promise<Product | null>;
  searchProducts: (query: string, filters?: FilterOptions) => Promise<void>;
  
  // Cache management
  clearCache: () => void;
  loadFromCache: () => void;
  reset: () => void;
}

type ProductStore = ProductState & ProductActions;

const CACHE_EXPIRATION_HOURS = 1;
const DEBOUNCE_DELAY = 300; // milliseconds

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  searchResults: [],
  collections: [],
  currentProduct: null,
  loading: false,
  searchLoading: false,
  error: null,
  filters: {},
  searchQuery: '',
  lastFetchTime: null,
  pagination: null,
};

// Debounce helper
let searchTimeoutId: NodeJS.Timeout | null = null;

// Cache keys
const CACHE_KEYS = {
  PRODUCTS: STORAGE_KEYS.PRODUCTS,
  FEATURED: `${STORAGE_KEYS.PRODUCTS}_featured`,
  FILTERS: `${STORAGE_KEYS.PRODUCTS}_filters`,
} as const;

// Error handling utility
const handleError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    // Timeout errors
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }
  return defaultMessage;
};

// Query parameter builder
const buildQueryParams = (filters: FilterOptions = {}): URLSearchParams => {
  const queryParams = new URLSearchParams();
  
  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'sortBy') {
        // Handle sortBy mapping
        switch (value) {
          case 'price_asc':
            queryParams.append('sortBy', 'price');
            queryParams.append('sortOrder', 'asc');
            break;
          case 'price_desc':
            queryParams.append('sortBy', 'price');
            queryParams.append('sortOrder', 'desc');
            break;
          case 'name_asc':
            queryParams.append('sortBy', 'name');
            queryParams.append('sortOrder', 'asc');
            break;
          case 'name_desc':
            queryParams.append('sortBy', 'name');
            queryParams.append('sortOrder', 'desc');
            break;
          case 'newest':
            queryParams.append('sortBy', 'createdAt');
            queryParams.append('sortOrder', 'desc');
            break;
          default:
            queryParams.append('sortBy', 'createdAt');
            queryParams.append('sortOrder', 'desc');
        }
      } else {
        queryParams.append(key, String(value));
      }
    }
  });
  
  return queryParams;
};

// Cache utilities
const getCachedData = <T>(key: string, expirationHours = CACHE_EXPIRATION_HOURS): T | null => {
  return getWithTimestamp<T>(key, expirationHours);
};

const setCachedData = <T>(key: string, data: T): void => {
  setWithTimestamp(key, { ...data, lastFetchTime: Date.now() });
};

export const useProductStore = create<ProductStore>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setProducts: (products) => {
      set({ products });
      setCachedData(CACHE_KEYS.PRODUCTS, { products });
    },

    setFeaturedProducts: (featuredProducts) => {
      set({ featuredProducts });
      setCachedData(CACHE_KEYS.FEATURED, { featuredProducts });
    },

    setSearchResults: (searchResults) => set({ searchResults }),
    
    setCurrentProduct: (currentProduct) => set({ currentProduct }),
    
    setLoading: (loading) => set({ loading }),
    
    setSearchLoading: (searchLoading) => set({ searchLoading }),
    
    setError: (error) => set({ error }),
    
    setFilters: (filters) => {
      set({ filters });
      setCachedData(CACHE_KEYS.FILTERS, { filters });
    },
    
    setSearchQuery: (searchQuery) => set({ searchQuery }),

    fetchProducts: async (filters = {}, force = false) => {
      const { setProducts, setLoading, setError, setFilters } = get();
      
      // Generate cache key based on filters
      const filtersKey = `${CACHE_KEYS.PRODUCTS}_${JSON.stringify(filters)}`;
      
      // Check cache first unless force fetch is requested
      if (!force) {
        const cachedData = getCachedData<{ products: Product[] }>(filtersKey);
        if (cachedData?.products?.length) {
          setProducts(cachedData.products);
          setFilters(filters);
          return;
        }
      }

      setLoading(true);
      setError(null);

      // Add retry logic for connection issues
      const maxRetries = 3;
      let retryCount = 0;

      try {
        const queryParams = buildQueryParams(filters);
        const endpoint = `${API_ENDPOINTS.PRODUCTS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        
        const data = await apiRequest<{
          products: Product[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>(endpoint);
        
        if (!data.products) {
          throw new Error('Invalid response format');
        }
        
        setProducts(data.products);
        setFilters(filters);
        set({ 
          lastFetchTime: Date.now(),
          pagination: data.pagination
        });
        
        // Cache with filter-specific key
        setCachedData(filtersKey, { products: data.products });
        
      } catch (error) {
        console.error('Error fetching products:', error);
        const errorMessage = handleError(error, 'Failed to fetch products');
        setError(errorMessage);
        
        // Try to load from cache as fallback
        const cachedData = getCachedData<{ products: Product[] }>(filtersKey);
        if (cachedData?.products?.length) {
          setProducts(cachedData.products);
        }
      } finally {
        setLoading(false);
      }
    },

    fetchFeaturedProducts: async (limit = 10, force = false) => {
      const { setFeaturedProducts, setLoading, setError } = get();
      
      // Check cache first
      if (!force) {
        const cachedData = getCachedData<{ featuredProducts: Product[] }>(CACHE_KEYS.FEATURED);
        if (cachedData?.featuredProducts?.length) {
          setFeaturedProducts(cachedData.featuredProducts);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          limit: limit.toString(),
          sortOrder: 'desc'
        });

        const endpoint = `${API_ENDPOINTS.PRODUCTS.FEATURED}?${queryParams.toString()}`;
        const responseData = await apiRequest<{
          products: Product[];
          meta?: any;
        }>(endpoint);
        
        if (!responseData.products) {
          throw new Error('Invalid response format');
        }
        
        const featuredProducts = responseData.products;
        setFeaturedProducts(featuredProducts);
        
      } catch (error) {
        console.error('Error fetching featured products:', error);
        const errorMessage = handleError(error, 'Failed to fetch featured products');
        setError(errorMessage);
        
        // Try to load from cache as fallback
        const cachedData = getCachedData<{ featuredProducts: Product[] }>(CACHE_KEYS.FEATURED);
        if (cachedData?.featuredProducts?.length) {
          setFeaturedProducts(cachedData.featuredProducts);
        }
      } finally {
        setLoading(false);
      }
    },

    fetchProductById: async (id: string, force = false) => {
      const { setCurrentProduct, setLoading, setError, products } = get();
      
      if (!id) {
        setError('Product ID is required');
        return null;
      }
      
      // Check if product exists in current products first
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct && !force) {
        setCurrentProduct(existingProduct);
        return existingProduct;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoint = API_ENDPOINTS.PRODUCTS.BY_ID(id);
        const product = await apiRequest<Product>(endpoint);
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        setCurrentProduct(product);
        return product;
        
      } catch (error) {
        console.error('Error fetching product:', error);
        const errorMessage = handleError(error, 'Failed to fetch product');
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },

    searchProducts: async (query: string, filters = {}) => {
      const { setSearchResults, setSearchLoading, setError, setSearchQuery } = get();
      
      const trimmedQuery = query.trim();
      
      if (!trimmedQuery) {
        setSearchResults([]);
        setSearchQuery('');
        return;
      }

      setSearchQuery(trimmedQuery);
      
      // Clear existing timeout
      if (searchTimeoutId) {
        clearTimeout(searchTimeoutId);
      }

      // Debounce search
      searchTimeoutId = setTimeout(async () => {
        setSearchLoading(true);
        setError(null);

        try {
          const queryParams = new URLSearchParams({
            search: trimmedQuery,
            ...Object.fromEntries(
              Object.entries(filters)
                .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                .map(([key, value]) => [key, String(value)])
            ),
          });

          const endpoint = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
          const data = await apiRequest<{
            products: Product[];
            pagination?: any;
          }>(endpoint);
          
          setSearchResults(data.products || []);
          
        } catch (error) {
          console.error('Error searching products:', error);
          const errorMessage = handleError(error, 'Search failed');
          setError(errorMessage);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, DEBOUNCE_DELAY);
    },

    clearCache: () => {
      const keys = Object.values(CACHE_KEYS);
      keys.forEach(key => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      });
      
      // Also clear filter-specific caches
      if (typeof window !== 'undefined') {
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
          if (key.startsWith(CACHE_KEYS.PRODUCTS)) {
            localStorage.removeItem(key);
          }
        });
      }
    },

    loadFromCache: () => {
      const { setProducts, setFeaturedProducts, setFilters } = get();
      
      // Load products from cache
      const cachedProducts = getCachedData<{ products: Product[] }>(CACHE_KEYS.PRODUCTS);
      if (cachedProducts?.products?.length) {
        setProducts(cachedProducts.products);
      }
      
      // Load featured products from cache
      const cachedFeatured = getCachedData<{ featuredProducts: Product[] }>(CACHE_KEYS.FEATURED);
      if (cachedFeatured?.featuredProducts?.length) {
        setFeaturedProducts(cachedFeatured.featuredProducts);
      }
      
      // Load filters from cache
      const cachedFilters = getCachedData<{ filters: FilterOptions }>(CACHE_KEYS.FILTERS);
      if (cachedFilters?.filters) {
        setFilters(cachedFilters.filters);
      }
    },

    reset: () => {
      set(initialState);
      get().clearCache();
    },
  }))
);