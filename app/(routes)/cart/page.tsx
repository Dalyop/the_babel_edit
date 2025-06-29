'use client';
import React from 'react';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import CartItemCard from '@/app/components/features/ProductCard/CartItemCard';
import styles from './cart.module.css';
import babelLogo from '@/public/images/babel_logo_black.jpg';

const cartItems = [
  {
    image: '/images/babel_logo_black.jpg',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    size: 'M',
    color: 'Black',
    price: 90.0,
  },
  {
    image: '/images/babel_logo_black.jpg',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    size: 'M',
    color: 'Black',
    price: 90.0,
  },
  {
    image: '/images/babel_logo_black.jpg',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    size: 'M',
    color: 'Black',
    price: 90.0,
  },
  {
    image: '/images/babel_logo_black.jpg',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    size: 'M',
    color: 'Black',
    price: 90.0,
  },
];

function CartPage() {
  return (
    <div className={styles.cartBg}>
      <Navbar />
      <main className={styles.cartMain}>
        <h1 className={styles.heading}>Shopping Cart</h1>
        <div className={styles.cartContent}>
          <div className={styles.cartItemsSection}>
            {cartItems.map((item, idx) => (
              <CartItemCard
                key={idx}
                image={item.image}
                title={item.title}
                size={item.size}
                color={item.color}
                price={item.price}
                onRemove={() => {}}
              />
            ))}
          </div>
          <div className={styles.orderSummaryBox}>
            <h2 className={styles.orderSummaryTitle}>Order Summary</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>$360.00</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Promo Code</span>
            </div>
            <div className={styles.promoRow}>
              <input className={styles.promoInput} placeholder="Enter code" />
              <button className={styles.promoBtn}>Apply</button>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated Shipping</span>
              <span>$10.00</span>
            </div>
            <div className={styles.summaryTotalRow}>
              <span>Total</span>
              <span className={styles.totalPrice}>$370.00</span>
            </div>
            <button className={styles.checkoutBtn}>Proceed to Checkout</button>
            <button className={styles.continueBtn}>Continue Shopping</button>
          </div>
        </div>
        <div className={styles.pagination}>
          <span className={styles.pageNum}>1</span>
          <span className={styles.pageNum}>2</span>
          <span className={styles.pageNum}>...</span>
          <span className={styles.pageNum}>13</span>
          <button className={styles.nextBtn}>{'>'}</button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CartPage;