'use client';
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/app/store/useCartStore';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import styles from "./cart.module.css";

export default function CartPage() {
  const params = useParams();
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  
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

  useEffect(() => {
    fetchCart();
  }, []);

  const shipping = 9.0;
  const total = totalAmount + shipping;

  const handleQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemove = (itemId: string) => {
    removeFromCart(itemId);
  };

  const handlePromo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Promo code logic not implemented.");
  };

  if (loading) {
    return (
      <div className={styles.cartBg}>
        <Navbar />
        <main className={styles.cartMain}>
          <h1 className={styles.heading}>Shopping Cart</h1>
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading cart...</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.cartBg}>
        <Navbar />
        <main className={styles.cartMain}>
          <h1 className={styles.heading}>Shopping Cart</h1>
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Error: {error}</div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.cartBg}>
      <Navbar />
      <main className={styles.cartMain}>
        <h1 className={styles.heading}>Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                Your cart is empty.<br />Start adding products to see them here!
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsSection}>
              {items.map((item) => (
                <div className={styles.cartItemCard} key={item.id}>
                  <div className={styles.cartItemImage}>
                    <img 
                      src={item.imageUrl || '/placeholder-product.jpg'} 
                      alt={item.name} 
                      className={styles.cartImg} 
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
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
                        disabled={loading}
                        title="Remove item"
                      >
                        <span className={styles.removeIcon}>✕</span>
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
                          disabled={loading || item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className={styles.qty}>{item.quantity}</span>
                        <button 
                          className={styles.qtyBtn} 
                          type="button" 
                          onClick={() => handleQuantity(item.id, item.quantity + 1)}
                          disabled={loading}
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
              ))}
            </div>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Order Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                <span className={styles.summaryAmount}>${totalAmount.toFixed(2)}</span>
              </div>
              
              <hr className={styles.summaryDivider} />
              
              <form className={styles.promoForm} onSubmit={handlePromo}>
                <label className={styles.promoLabel}>Promo Code</label>
                <div className={styles.promoRow}>
                  <input 
                    className={styles.promoInput} 
                    type="text" 
                    value={promo} 
                    onChange={e => setPromo(e.target.value)}
                    placeholder="Enter promo code"
                  />
                  <button className={styles.promoBtn} type="submit" disabled={!promo.trim()}>
                    Apply
                  </button>
                </div>
              </form>
              
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
                  disabled={loading || items.length === 0}
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
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
