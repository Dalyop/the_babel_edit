import { create } from 'zustand';
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
}

type ProductStore = ProductState & ProductActions;

const CACHE_EXPIRATION_HOURS = 1; // Cache expires after 1 hour
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  searchResults: [],
  collections: [],
  currentProduct: null,
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
  lastFetchTime: null,
  pagination: null,
};

export const useProductStore = create<ProductStore>((set, get) => ({
  ...initialState,

  setProducts: (products) => {
    set({ products });
    setWithTimestamp(STORAGE_KEYS.PRODUCTS, { 
      products, 
      lastFetchTime: Date.now() 
    });
  },

  setFeaturedProducts: (featuredProducts) => {
    set({ featuredProducts });
    setWithTimestamp(`${STORAGE_KEYS.PRODUCTS}_featured`, {
      featuredProducts,
      lastFetchTime: Date.now()
    });
  },

  setSearchResults: (searchResults) => set({ searchResults }),
  
  setCurrentProduct: (currentProduct) => set({ currentProduct }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  setFilters: (filters) => set({ filters }),
  
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  fetchProducts: async (filters = {}, force = false) => {
    const { setProducts, setLoading, setError, setFilters } = get();
    
    // Check cache first unless force fetch is requested
    if (!force) {
      const cachedData = getWithTimestamp<{ products: Product[]; lastFetchTime: number }>(
        STORAGE_KEYS.PRODUCTS, 
        CACHE_EXPIRATION_HOURS
      );
      
      if (cachedData?.products?.length) {
        setProducts(cachedData.products);
        setFilters(filters);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      // Map filters to backend query parameters
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice !== undefined) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.inStock !== undefined) queryParams.append('inStock', filters.inStock.toString());
      if (filters.onSale !== undefined) queryParams.append('onSale', filters.onSale.toString());
      
      // Map sortBy to backend format
      if (filters.sortBy) {
        switch (filters.sortBy) {
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
      }

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
      
      setProducts(data.products);
      setFilters(filters);
      set({ 
        lastFetchTime: Date.now(),
        pagination: data.pagination
      });
      
    } catch (error) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch products');
      
      // Try to load from cache as fallback
      const cachedData = getWithTimestamp<{ products: Product[] }>(STORAGE_KEYS.PRODUCTS);
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
      const cachedData = getWithTimestamp<{ featuredProducts: Product[] }>(
        `${STORAGE_KEYS.PRODUCTS}_featured`,
        CACHE_EXPIRATION_HOURS
      );
      
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
      
      // Handle the backend response format
      const featuredProducts = responseData.products || [];
      
      setFeaturedProducts(featuredProducts);
      
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch featured products');
      
      // Try to load from cache as fallback
      const cachedData = getWithTimestamp<{ featuredProducts: Product[] }>(
        `${STORAGE_KEYS.PRODUCTS}_featured`
      );
      if (cachedData?.featuredProducts?.length) {
        setFeaturedProducts(cachedData.featuredProducts);
      }
    } finally {
      setLoading(false);
    }
  },

  fetchProductById: async (id: string, force = false) => {
    const { setCurrentProduct, setLoading, setError, products } = get();
    
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
      
      setCurrentProduct(product);
      return product;
      
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch product');
      return null;
    } finally {
      setLoading(false);
    }
  },

  searchProducts: async (query: string, filters = {}) => {
    const { setSearchResults, setLoading, setError, setSearchQuery } = get();
    
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchQuery(query);

    try {
      const queryParams = new URLSearchParams({
        search: query, // Use 'search' parameter as per backend
        ...Object.fromEntries(
          Object.entries(filters)
            .filter(([_, value]) => value !== undefined)
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
      setError(error instanceof Error ? error.message : 'Search failed');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  },

  clearCache: () => {
    const keys = [STORAGE_KEYS.PRODUCTS, `${STORAGE_KEYS.PRODUCTS}_featured`];
    keys.forEach(key => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    });
  },

  loadFromCache: () => {
    const { setProducts, setFeaturedProducts } = get();
    
    // Load products from cache
    const cachedProducts = getWithTimestamp<{ products: Product[] }>(STORAGE_KEYS.PRODUCTS);
    if (cachedProducts?.products?.length) {
      setProducts(cachedProducts.products);
    }
    
    // Load featured products from cache
    const cachedFeatured = getWithTimestamp<{ featuredProducts: Product[] }>(
      `${STORAGE_KEYS.PRODUCTS}_featured`
    );
    if (cachedFeatured?.featuredProducts?.length) {
      setFeaturedProducts(cachedFeatured.featuredProducts);
    }
  },
}));