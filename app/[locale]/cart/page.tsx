'use client';
import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useCartStore } from '@/app/store/useCartStore';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import styles from "./cart.module.css";

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const { user, loading: authLoading } = useAuth();
  const { 
    items, 
    loading, 
    error, 
    totalAmount, 
    updateQuantity, 
    removeFromCart, 
    fetchCart 
  } = useCartStore();
  
  const [promo, setPromo] = useState("");
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to login with return URL
      router.replace(`/${currentLocale}/auth/login?from=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [user, authLoading, router, currentLocale]);

  // Memoize fetchCart to avoid unnecessary re-renders
  const loadCart = useCallback(async () => {
    if (!user) return; // Don't fetch if not authenticated
    
    try {
      await fetchCart();
    } finally {
      setIsInitialLoad(false);
    }
  }, [fetchCart, user]);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [loadCart, user]);

  const shipping = 9.0;
  const total = totalAmount + shipping;

  const handleQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemove = async (itemId: string) => {
    setRemovingItems(prev => new Set(prev).add(itemId));
    
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push(`/${currentLocale}/checkout`);
    } catch (error) {
      console.error('Checkout navigation error:', error);
      setIsCheckingOut(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className={styles.cartBg}>
        <NavbarWithSuspense />
        <main className="py-8 px-4 max-w-7xl mx-auto">
          <h1 className={styles.heading}>Shopping Cart</h1>
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Checking authentication...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect is happening)
  if (!user) {
    return (
      <div className={styles.cartBg}>
        <NavbarWithSuspense />
        <main className="py-8 px-4 max-w-7xl mx-auto">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show loading only on initial cart load
  if (isInitialLoad && loading) {
    return (
      <div className={styles.cartBg}>
        <NavbarWithSuspense />
        <main className="py-8 px-4 max-w-7xl mx-auto">
          <h1 className={styles.heading}>Shopping Cart</h1>
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading cart...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className={styles.cartBg}>
        <NavbarWithSuspense />
        <main className="py-8 px-4 max-w-7xl mx-auto">
          <h1 className={styles.heading}>Shopping Cart</h1>
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</p>
                <button 
                  onClick={loadCart}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.cartBg}>
      <NavbarWithSuspense />
      <main className="py-8 px-4 max-w-7xl mx-auto">
        <h1 className={styles.heading}>Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-gray-600 mb-4">Your cart is empty.</p>
                <Link 
                  href={`/${currentLocale}/products`}
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              {items.map((item) => {
                const isUpdating = updatingItems.has(item.id);
                const isRemoving = removingItems.has(item.id);
                const isItemLoading = isUpdating || isRemoving;
                
                return (
                  <div 
                    className={styles.cartItemCard} 
                    key={item.id}
                    style={{ opacity: isRemoving ? 0.5 : 1, transition: 'opacity 0.3s' }}
                  >
                    <div className={styles.cartItemImage}>
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image'} 
                        alt={item.name} 
                        className={styles.cartImg} 
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }}
                      />
                    </div>
                    
                    <div className={styles.cartItemInfo}>
                      <div className={styles.cartItemHeader}>
                        <h3 className={styles.cartItemName}>{item.name}</h3>
                        <button 
                          className={styles.removeBtn} 
                          type="button" 
                          onClick={() => handleRemove(item.id)}
                          disabled={isItemLoading}
                          title="Remove item"
                        >
                          {isRemoving ? (
                            <span className="animate-spin">⟳</span>
                          ) : (
                            <span className={styles.removeIcon}>✕</span>
                          )}
                        </button>
                      </div>
                      
                      {(item.size || item.color) && (
                        <div className={styles.cartItemMeta}>
                          {item.size && <span className={styles.metaItem}>Size: {item.size}</span>}
                          {item.color && <span className={styles.metaItem}>Color: {item.color}</span>}
                        </div>
                      )}
                      
                      <div className={styles.cartItemFooter}>
                        <div className={styles.cartItemPrice}>
                          <span className={styles.priceLabel}>Price:</span>
                          <span className={styles.price}>${item.price.toFixed(2)}</span>
                        </div>
                        
                        <div className={styles.cartItemControls}>
                          <button 
                            className={styles.qtyBtn} 
                            type="button" 
                            onClick={() => handleQuantity(item.id, item.quantity - 1)}
                            disabled={isItemLoading || item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className={styles.qty}>
                            {isUpdating ? (
                              <span className="animate-pulse">...</span>
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button 
                            className={styles.qtyBtn} 
                            type="button" 
                            onClick={() => handleQuantity(item.id, item.quantity + 1)}
                            disabled={isItemLoading}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className={styles.subtotal}>
                          <span className={styles.subtotalLabel}>Subtotal:</span>
                          <span className={styles.subtotalAmount}>${item.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className={styles.summaryAmount}>${totalAmount.toFixed(2)}</span>
              </div>
              
              <hr className={styles.summaryDivider} />
              
              <div className={styles.summaryRow}>
                <span>Estimated Shipping</span>
                <span className={styles.summaryAmount}>${shipping.toFixed(2)}</span>
              </div>
              
              <hr className={styles.summaryDivider} />
              
              <div className={styles.summaryTotalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.summaryTotal}>${total.toFixed(2)}</span>
              </div>
              
              <div className={styles.checkoutActions}>
                <button 
                  className={styles.checkoutBtn} 
                  type="button" 
                  disabled={loading || items.length === 0 || updatingItems.size > 0 || removingItems.size > 0 || isCheckingOut}
                  onClick={handleCheckout}
                >
                  {isCheckingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : loading ? (
                    'Processing...'
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>
                
                <Link href={`/${currentLocale}/products`} className={styles.continueBtn}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}