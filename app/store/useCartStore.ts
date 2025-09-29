import { create } from 'zustand';
import { CartItem, CartResponse, Product } from './types';
import { STORAGE_KEYS, setWithTimestamp, getWithTimestamp } from './storage';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalAmount: number;
}

interface CartActions {
  // Core cart operations
  addToCart: (productId: string, quantity?: number, options?: { size?: string; color?: string }) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Data management
  fetchCart: () => Promise<void>;
  loadFromStorage: () => void;
  syncWithBackend: () => Promise<void>;
  
  // Getters
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
}

type CartStore = CartState & CartActions;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { totalItems, totalAmount };
};

const saveToStorage = (items: CartItem[]) => {
  setWithTimestamp(STORAGE_KEYS.CART, { items });
};

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalAmount: 0,
};

export const useCartStore = create<CartStore>((set, get) => ({
  ...initialState,

  addToCart: async (productId: string, quantity = 1, options = {}) => {
    set({ loading: true, error: null });
    
    try {
      await apiRequest(API_ENDPOINTS.CART.ADD, {
        method: 'POST',
        requireAuth: true,
        body: {
          productId,
          quantity,
          size: options.size,
          color: options.color,
        },
      });
      
      // Refresh cart after adding
      await get().fetchCart();
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add to cart' });
      
      // Fallback to local storage for offline functionality
      const { items } = get();
      const existingItemIndex = items.findIndex(item => 
        item.productId === productId && 
        item.size === options.size &&
        item.color === options.color
      );

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        updatedItems = items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity, subtotal: item.price * (item.quantity + quantity) }
            : item
        );
      } else {
        // For offline mode, we'd need product data - this is a simplified version
        const newItem: CartItem = {
          id: `offline-${productId}-${Date.now()}`,
          productId,
          name: 'Product', // Would need to fetch from product store
          price: 0, // Would need actual price
          imageUrl: '',
          quantity,
          size: options.size,
          color: options.color,
          subtotal: 0,
        };
        updatedItems = [...items, newItem];
      }

      const totals = calculateTotals(updatedItems);
      set({ 
        items: updatedItems, 
        ...totals
      });
      
      saveToStorage(updatedItems);
    } finally {
      set({ loading: false });
    }
  },

  removeFromCart: async (itemId: string) => {
    set({ loading: true, error: null });
    
    try {
      await apiRequest(API_ENDPOINTS.CART.REMOVE(itemId), {
        method: 'DELETE',
        requireAuth: true,
      });
      
      // Refresh cart after removing
      await get().fetchCart();
      
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to remove from cart' });
      
      // Fallback to local removal
      const { items } = get();
      const updatedItems = items.filter(item => item.id !== itemId);
      const totals = calculateTotals(updatedItems);
      
      set({ 
        items: updatedItems, 
        ...totals
      });
      
      saveToStorage(updatedItems);
    } finally {
      set({ loading: false });
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await get().removeFromCart(itemId);
      return;
    }

    set({ loading: true, error: null });
    
    try {
      await apiRequest(API_ENDPOINTS.CART.UPDATE(itemId), {
        method: 'PUT',
        requireAuth: true,
        body: { quantity },
      });
      
      // Refresh cart after updating
      await get().fetchCart();
      
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update quantity' });
      
      // Fallback to local update
      const { items } = get();
      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      );

      const totals = calculateTotals(updatedItems);
      set({ 
        items: updatedItems, 
        ...totals
      });
      
      saveToStorage(updatedItems);
    } finally {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    
    try {
      await apiRequest(API_ENDPOINTS.CART.CLEAR, {
        method: 'DELETE',
        requireAuth: true,
      });
      
      set({ 
        items: [], 
        totalItems: 0, 
        totalAmount: 0, 
        error: null 
      });
      
      saveToStorage([]);
      
    } catch (error) {
      console.error('Failed to clear cart:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to clear cart' });
      
      // Fallback to local clear
      set({ 
        items: [], 
        totalItems: 0, 
        totalAmount: 0
      });
      
      saveToStorage([]);
    } finally {
      set({ loading: false });
    }
  },

  fetchCart: async () => {
    set({ loading: true, error: null });
    
    try {
      const cartData = await apiRequest<CartResponse>(API_ENDPOINTS.CART.GET, {
        method: 'GET',
        requireAuth: true,
      });
      
      set({ 
        items: cartData.items, 
        totalItems: cartData.itemCount, 
        totalAmount: cartData.total,
        error: null 
      });
      
      saveToStorage(cartData.items);
      
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      
      // If authenticated request fails, try loading from storage
      if (error instanceof Error && error.message.includes('Authentication')) {
        get().loadFromStorage();
      } else {
        set({ error: error instanceof Error ? error.message : 'Failed to fetch cart' });
        get().loadFromStorage(); // Fallback to local storage
      }
    } finally {
      set({ loading: false });
    }
  },

  loadFromStorage: () => {
    const cachedData = getWithTimestamp<{ items: CartItem[] }>(STORAGE_KEYS.CART);
    
    if (cachedData?.items?.length) {
      const totals = calculateTotals(cachedData.items);
      set({ 
        items: cachedData.items, 
        ...totals,
        error: null 
      });
    }
  },

  getCartItemCount: () => {
    const { totalItems } = get();
    return totalItems;
  },

  getCartTotal: () => {
    const { totalAmount } = get();
    return totalAmount;
  },

  isInCart: (productId: string) => {
    const { items } = get();
    return items.some(item => item.productId === productId);
  },

  syncWithBackend: async () => {
    const { items } = get();
    
    // Only sync if user is authenticated and has items
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') || localStorage.getItem('token') : null;
    if (!token) {
      console.log('No auth token found, skipping cart sync');
      return;
    }
    
    if (items.length === 0) {
      console.log('No cart items to sync');
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      console.log('Syncing cart with backend...', items.length, 'items');
      
      // Sync local cart items with backend
      let syncedCount = 0;
      for (const item of items) {
        // Only sync offline items (items created without backend)
        if (item.id.startsWith('offline-')) {
          try {
            await apiRequest(API_ENDPOINTS.CART.ADD, {
              method: 'POST',
              requireAuth: true,
              body: {
                productId: item.productId,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
              },
            });
            syncedCount++;
          } catch (itemError) {
            console.error('Failed to sync item:', item.id, itemError);
          }
        }
      }
      
      console.log(`Synced ${syncedCount} items with backend`);
      
      // After syncing, fetch the updated cart from backend
      await get().fetchCart();
      
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to sync cart' });
    } finally {
      set({ loading: false });
    }
  },
}));






// clearCart: async () => {
//   try {
//     set({ loading: true, error: null });
    
//     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/clear`, {
//       method: 'DELETE',
//       credentials: 'include',
//     });

//     if (!response.ok) {
//       throw new Error('Failed to clear cart');
//     }

//     set({ 
//       items: [], 
//       totalAmount: 0, 
//       loading: false 
//     });
//   } catch (error) {
//     console.error('Clear cart error:', error);
//     set({ 
//       error: error instanceof Error ? error.message : 'Failed to clear cart',
//       loading: false 
//     });
//   }
// },