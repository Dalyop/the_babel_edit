'use client';
import React, { useState } from "react";
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import styles from "./cart.module.css";

const initialCart = [
  {
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80",
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    size: "M",
    color: "Black",
    price: 90.0,
    quantity: 2,
  },
  {
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80",
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    size: "M",
    color: "Black",
    price: 90.0,
    quantity: 2,
  },
  {
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80",
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    size: "M",
    color: "Black",
    price: 90.0,
    quantity: 2,
  },
  {
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80",
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    size: "M",
    color: "Black",
    price: 90.0,
    quantity: 2,
  },
];

export default function CartPage() {
  const [cart, setCart] = useState(initialCart);
  const [promo, setPromo] = useState("");

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 9.0;
  const total = subtotal + shipping;

  const handleQuantity = (idx: number, delta: number) => {
    setCart(cart => cart.map((item, i) => i === idx ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const handleRemove = (idx: number) => {
    setCart(cart => cart.filter((_, i) => i !== idx));
  };

  const handlePromo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("Promo code logic not implemented.");
  };

  return (
    <div className={styles.cartBg}>
      <Navbar />
      <main className={styles.cartMain}>
        <h1 className={styles.heading}>Shopping Cart</h1>
        <div className={styles.cartContainer}>
          <div className={styles.cartItemsSection}>
            {cart.map((item, idx) => (
              <div className={styles.cartItemCard} key={idx}>
                <img src={item.image} alt={item.name} className={styles.cartImg} />
                <div className={styles.cartItemInfo}>
                  <div className={styles.cartItemName}>{item.name}</div>
                  <div className={styles.cartItemMeta}>Size: {item.size} | Color: {item.color}</div>
                  <div className={styles.cartItemPrice}>${item.price.toFixed(2)}</div>
                  <div className={styles.cartItemControls}>
                    <button className={styles.qtyBtn} type="button" onClick={() => handleQuantity(idx, -1)}>-</button>
                    <span className={styles.qty}>{item.quantity}</span>
                    <button className={styles.qtyBtn} type="button" onClick={() => handleQuantity(idx, 1)}>+</button>
                  </div>
                  <button className={styles.removeBtn} type="button" onClick={() => handleRemove(idx)}>
                    <span className={styles.removeIcon}>🗑️</span> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Order Summary</div>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <hr className={styles.summaryDivider} />
            <form className={styles.promoForm} onSubmit={handlePromo}>
              <div>
                <label className={styles.promoLabel}>Promo Code</label>
              </div>
              <div className={styles.promoRow}>
                <input className={styles.promoInput} type="text" value={promo} onChange={e => setPromo(e.target.value)} />
                <button className={styles.promoBtn} type="submit">Apply</button>
              </div>
            </form>
            <hr className={styles.summaryDivider} />
            <div className={styles.summaryRow}>
              <span>Estimated Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <hr className={styles.summaryDivider} />
            <div className={styles.summaryTotalRow}>
              <span>Total</span>
              <span className={styles.summaryTotal}>${total.toFixed(2)}</span>
            </div>
            <button className={styles.checkoutBtn} type="button">Proceed to Checkout</button>
            <button className={styles.continueBtn} type="button">Continue Shopping</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}