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
  setSearchLoading: (searchLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  
  // API Actions
  fetchProducts: (options?: { filters?: FilterOptions; force?: boolean; limit?: number }) => Promise<void>;
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
const buildQueryParams = (filters: FilterOptions = {}, page: number, limit?: number): URLSearchParams => {
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
        value.forEach(item => {
          queryParams.append(key, item);
        });
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  queryParams.append('page', String(page));
  if (limit) {
    queryParams.append('limit', String(limit));
  }
  
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
    
    fetchProducts: async (options = {}) => {
      console.log('%c[fetchProducts] Start', 'color: #00A8F7', { options });
      const { force = false, filters: newFilters, limit } = options;
      const { page: currentPage, hasMore, loading, filters: currentFilters } = get();

      console.log('[fetchProducts] Current state:', { currentPage, hasMore, loading, currentFilters });

      const isNewFilterSearch = newFilters !== undefined;
      console.log('[fetchProducts] Is this a new filter search?', isNewFilterSearch);
      
      if (loading) {
        console.log('[fetchProducts] Exiting: Already loading.');
        return;
      }
      if (!isNewFilterSearch && !hasMore && !force) {
        console.log('[fetchProducts] Exiting: Not a new search, no more pages to load, and not forced.');
        return;
      }

      const pageToFetch = isNewFilterSearch ? 1 : currentPage;
      const filtersToUse = newFilters || currentFilters;
      console.log('[fetchProducts] Determined params:', { pageToFetch, filtersToUse });

      set({ loading: true, error: null });

      if (isNewFilterSearch) {
        console.log('[fetchProducts] Resetting products for new filter search.');
        set({ products: [], page: 1, hasMore: true });
      }

      try {
        const queryParams = buildQueryParams(filtersToUse, pageToFetch, limit);
        const endpoint = `${API_ENDPOINTS.PRODUCTS.LIST}?${queryParams.toString()}`;
        console.log(`%c[fetchProducts] Calling API: ${endpoint}`, 'color: #7ED321');
        
        const data = await apiRequest<{
          products: Product[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>(endpoint);

        console.log('[fetchProducts] API response received:', data);
        
        if (!data.products) throw new Error('Invalid response format');
        
        console.log('[fetchProducts] Current state before setting new data:', get());
        set((state) => {
          const newState = {
            products: pageToFetch === 1 ? data.products : [...state.products, ...data.products],
            pagination: data.pagination,
            page: pageToFetch + 1,
            hasMore: data.pagination.page < data.pagination.pages,
            filters: filtersToUse,
            lastFetchTime: Date.now(),
          };
          console.log('[fetchProducts] Setting new state:', newState);
          return newState;
        });
        
      } catch (error) {
        console.error('Error fetching products:', error);
        const errorMessage = handleError(error, 'Failed to fetch products');
        set({ error: errorMessage, hasMore: false });
      } finally {
        set({ loading: false });
        console.log('%c[fetchProducts] End', 'color: #D0021B');
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
      const { setProducts } = get();
      
      const cachedProducts = getCachedData<{ products: Product[] }>(CACHE_KEYS.PRODUCTS);
      if (cachedProducts?.products?.length) setProducts(cachedProducts.products);
      
    },

    reset: () => {
      set(initialState);
      get().clearCache();
    },
  }))
);