'use client';

import React, { useEffect } from 'react';
import { useWishlistStore } from '@/app/store/useWishlistStore';
import { useCartStore } from '@/app/store/useCartStore';
import styles from './wishlist.module.css';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';

export default function WishlistPage() {
  const { 
    items, 
    loading, 
    error, 
    removeFromWishlist, 
    fetchWishlist 
  } = useWishlistStore();
  
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
  };

  const handleMoveToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to move item to cart:', error);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className={styles.container}>
          <h1 className={styles.header}>My Wish List</h1>
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading wishlist...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className={styles.container}>
          <h1 className={styles.header}>My Wish List</h1>
          <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.header}>My Wish List</h1>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            Your wish list is empty.<br />Start adding your favorite items!
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map(item => (
              <div className={styles.card} key={item.id}>
                <img 
                  className={styles.productImage} 
                  src={item.product?.images?.[0] || item.product?.imageUrl || '/placeholder.jpg'} 
                  alt={item.product?.name || 'Product'} 
                />
                <div className={styles.productTitle}>{item.product?.name}</div>
                <div className={styles.productBrand}>{item.product?.brand}</div>
                <div className={styles.priceRow}>
                  <span className={styles.currentPrice}>${item.product?.price?.toFixed(2)}</span>
                  {item.product?.originalPrice && item.product?.originalPrice > item.product?.price && (
                    <span className={styles.originalPrice}>${item.product?.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button 
                    className={styles.actionBtn} 
                    onClick={() => handleMoveToCart(item.productId)}
                    disabled={loading}
                  >
                    Move to Cart
                  </button>
                  <button 
                    className={styles.removeBtn} 
                    onClick={() => handleRemove(item.productId)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
} 