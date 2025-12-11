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
  page: number;
  hasMore: boolean;
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
  fetchProducts: (options?: { force?: boolean }) => Promise<void>;
  fetchFeaturedProducts: (limit?: number, force?: boolean) => Promise<void>;
  fetchProductById: (id: string, force?: boolean) => Promise<Product | null>;
  prefetchProductById: (id: string) => Promise<void>;
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
  page: 1,
  hasMore: true,
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
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Unable to connect to server. Please check your internet connection.';
    }
    if (error.message.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
    return error.message;
  }
  return defaultMessage;
};

// Query parameter builder
const buildQueryParams = (filters: FilterOptions = {}, page: number): URLSearchParams => {
  const queryParams = new URLSearchParams();
  
  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'sortBy') {
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
          default:
            queryParams.append('sortBy', 'createdAt');
            queryParams.append('sortOrder', 'desc');
        }
      } else if (Array.isArray(value)) {
        // If the value is an array, append each item separately
        value.forEach(item => {
          queryParams.append(key, item);
        });
      } else {
        // Otherwise, append as a string
        queryParams.append(key, String(value));
      }
    }
  });

  // Add pagination
  queryParams.append('page', String(page));
  
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

    setProducts: (products) => set({ products }),
    setFeaturedProducts: (featuredProducts) => {
      set({ featuredProducts });
      setCachedData(CACHE_KEYS.FEATURED, { featuredProducts });
    },
    setSearchResults: (searchResults) => set({ searchResults }),
    setCurrentProduct: (currentProduct) => set({ currentProduct }),
    setLoading: (loading) => set({ loading }),
    setSearchLoading: (searchLoading) => set({ searchLoading }),
    setError: (error) => set({ error }),
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    
    setFilters: (newFilters) => {
      // The component's useEffect is already responsible for checking if filters have changed.
      // This action will now unconditionally reset and fetch.
      set({ filters: newFilters, page: 1, products: [], hasMore: true });
      get().fetchProducts({ force: true });
    },
    
    fetchProducts: async (options = {}) => {
      const { force = false } = options;
      const { page: pageToFetch, hasMore, loading, filters } = get();

      if (loading || (!force && !hasMore)) {
        return;
      }

      set({ loading: true, error: null });

      try {
        const queryParams = buildQueryParams(filters, pageToFetch);
        const endpoint = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
        
        const data = await apiRequest<{
          products: Product[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>(endpoint);
        
        if (!data.products) throw new Error('Invalid response format');
        
        set((state) => ({
          products: pageToFetch === 1 ? data.products : [...state.products, ...data.products],
          pagination: data.pagination,
          page: state.page + 1,
          hasMore: data.pagination.page < data.pagination.pages,
          lastFetchTime: Date.now(),
        }));
        
      } catch (error) {
        console.error('Error fetching products:', error);
        const errorMessage = handleError(error, 'Failed to fetch products');
        set({ error: errorMessage, hasMore: false });
      } finally {
        set({ loading: false });
      }
    },

    fetchFeaturedProducts: async (limit = 10, force = false) => {
      const { setFeaturedProducts, setLoading, setError } = get();
      
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
        const queryParams = new URLSearchParams({ limit: limit.toString(), sortOrder: 'desc' });
        const endpoint = `${API_ENDPOINTS.PRODUCTS.FEATURED}?${queryParams.toString()}`;
        const responseData = await apiRequest<{ products: Product[] }>(endpoint);
        
        if (!responseData.products) throw new Error('Invalid response format');
        
        setFeaturedProducts(responseData.products);
        
      } catch (error) {
        console.error('Error fetching featured products:', error);
        const errorMessage = handleError(error, 'Failed to fetch featured products');
        setError(errorMessage);
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
      
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct && !force) {
        setCurrentProduct(existingProduct);
        return existingProduct;
      }

      const cachedData = getCachedData<{ product: Product }>(`${CACHE_KEYS.PRODUCTS}_${id}`);
      if (cachedData?.product && !force) {
        setCurrentProduct(cachedData.product);
        return cachedData.product;
      }

      setLoading(true);
      setError(null);

      try {
        const endpoint = API_ENDPOINTS.PRODUCTS.BY_ID(id);
        const product = await apiRequest<Product>(endpoint);
        
        if (!product) throw new Error('Product not found');
        
        setCurrentProduct(product);
        setCachedData(`${CACHE_KEYS.PRODUCTS}_${id}`, { product });
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

    prefetchProductById: async (id: string) => {
      const { products } = get();
      
      if (!id) return;
      
      const existingProduct = products.find(p => p.id === id);
      if (existingProduct) return;

      try {
        const endpoint = API_ENDPOINTS.PRODUCTS.BY_ID(id);
        const product = await apiRequest<Product>(endpoint);
        
        if (product) {
          setCachedData(`${CACHE_KEYS.PRODUCTS}_${id}`, { product });
        }
      } catch (error) {
        console.error('Error prefetching product:', error);
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
      
      if (searchTimeoutId) clearTimeout(searchTimeoutId);

      searchTimeoutId = setTimeout(async () => {
        setSearchLoading(true);
        setError(null);

        try {
          const queryParams = buildQueryParams({ ...filters, search: trimmedQuery }, 1);
          const endpoint = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
          const data = await apiRequest<{ products: Product[] }>(endpoint);
          
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
      if (typeof window !== 'undefined') {
        const keysToRemove = Object.values(CACHE_KEYS);
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    },

    loadFromCache: () => {
      const { setProducts, setFeaturedProducts, setFilters } = get();
      
      const cachedProducts = getCachedData<{ products: Product[] }>(CACHE_KEYS.PRODUCTS);
      if (cachedProducts?.products?.length) setProducts(cachedProducts.products);
      
      const cachedFeatured = getCachedData<{ featuredProducts: Product[] }>(CACHE_KEYS.FEATURED);
      if (cachedFeatured?.featuredProducts?.length) setFeaturedProducts(cachedFeatured.featuredProducts);
      
      const cachedFilters = getCachedData<{ filters: FilterOptions }>(CACHE_KEYS.FILTERS);
      if (cachedFilters?.filters) setFilters(cachedFilters.filters);
    },

    reset: () => {
      set(initialState);
      get().clearCache();
    },
  }))
);