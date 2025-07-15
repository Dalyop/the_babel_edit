'use client';

import React, { useState } from 'react';
import styles from './wishlist.module.css';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';

const initialWishlist = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    title: 'Nike Red Sneakers',
    brand: 'Nike',
    currentPrice: 99.99,
    originalPrice: 129.99,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
    title: 'Adidas Black Ultraboost',
    brand: 'Adidas',
    currentPrice: 149.99,
    originalPrice: 179.99,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1600269452121-4f2416e55c28',
    title: 'Puma White Runner',
    brand: 'Puma',
    currentPrice: 79.99,
    originalPrice: 99.99,
  },
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(initialWishlist);

  const handleRemove = (id: number) => {
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  const handleMoveToCart = (id: number) => {
    // Here you would add to cart and remove from wishlist
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.header}>My Wish List</h1>
        {wishlist.length === 0 ? (
          <div className={styles.emptyState}>
            Your wish list is empty.<br />Start adding your favorite items!
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlist.map(item => (
              <div className={styles.card} key={item.id}>
                <img className={styles.productImage} src={item.image} alt={item.title} />
                <div className={styles.productTitle}>{item.title}</div>
                <div className={styles.productBrand}>{item.brand}</div>
                <div className={styles.priceRow}>
                  <span className={styles.currentPrice}>${item.currentPrice.toFixed(2)}</span>
                  <span className={styles.originalPrice}>${item.originalPrice.toFixed(2)}</span>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.actionBtn} onClick={() => handleMoveToCart(item.id)}>
                    Move to Cart
                  </button>
                  <button className={styles.removeBtn} onClick={() => handleRemove(item.id)}>
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