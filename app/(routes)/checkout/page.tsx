"use client";
import React, { useState } from "react";
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import styles from "./checkout.module.css";

const orderItems = [
  {
    image: "/images/babel_logo_black.jpg",
    name: "Vintage Denim Jacket",
    size: "M",
    price: 360.0,
  },
  {
    image: "/images/babel_logo_white.jpg",
    name: "Leather Ankle Boots",
    size: "8",
    price: 360.0,
  },
  {
    image: "/images/babel_logo_black.jpg",
    name: "Silk Scarf",
    size: "S",
    price: 360.0,
  },
];

export default function CheckoutPage() {
  const [shipping, setShipping] = useState("express");
  const [saveCard, setSaveCard] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Order placement is not implemented yet.");
  };

  return (
    <div className={styles.checkoutBg}>
      <Navbar />
      <main className={styles.checkoutMain}>
        <h1 className={styles.title}>Checkout</h1>
        <div className={styles.checkoutContainer}>
          <form className={styles.checkoutForm} onSubmit={handleSubmit}>
            <div className={styles.sectionTitle}>Contact Information</div>
            <label className={styles.inputLabel}>
              <span className={styles.labelRow}><span className={styles.labelIcon}>🔑</span> Name</span>
              <input className={styles.input} type="text" placeholder="Name" required />
            </label>
            <label className={styles.inputLabel}>
              <span className={styles.labelRow}><span className={styles.labelIcon}>✉️</span> Email</span>
              <input className={styles.input} type="email" placeholder="Email" required />
            </label>
            <div className={styles.sectionTitle}>Shipping Address</div>
            <label className={styles.inputLabel}>
              <span className={styles.labelRow}><span className={styles.labelIcon}>🏠</span> Address</span>
              <input className={styles.input} type="text" placeholder="Address" required />
            </label>
            <label className={styles.inputLabel}>
              <span className={styles.labelRow}><span className={styles.labelIcon}>🏢</span> City</span>
              <input className={styles.input} type="text" placeholder="State/Province" required />
            </label>
            <label className={styles.inputLabel}>
              <input className={styles.input} type="text" placeholder="Postal Code" required />
            </label>
            <div className={styles.sectionTitle}>Shipping Method</div>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  className={styles.radio}
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shipping === "standard"}
                  onChange={() => setShipping("standard")}
                />
                Standard Shipping (3-5 Business days) -$10.00
              </label>
              <label className={styles.radioLabel}>
                <input
                  className={styles.radio}
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shipping === "express"}
                  onChange={() => setShipping("express")}
                />
                Express Delivery (1-2 Business days) -$20.00
              </label>
            </div>
            <div className={styles.sectionTitle}>Payment Method</div>
            <input className={styles.input} type="text" placeholder="Card Number" required />
            <input className={styles.input} type="text" placeholder="Expiration date" required />
            <div className={styles.paymentRow}>
              <input className={styles.input} type="text" placeholder="CVV" required style={{ maxWidth: 120 }} />
              <button type="button" className={styles.payBtn}>P</button>
              <button type="button" className={styles.payBtn}>#Pay</button>
              <button type="button" className={styles.payBtn}>G Pay</button>
            </div>
            <div className={styles.checkRow}>
              <input
                className={styles.input}
                type="checkbox"
                id="saveCard"
                checked={saveCard}
                onChange={() => setSaveCard(!saveCard)}
              />
              <label htmlFor="saveCard">Save this card for future purchases</label>
            </div>
          </form>
          <div className={styles.summaryCard}>
            <div className={styles.summaryTitle}>Order Summary</div>
            <div className={styles.summaryItems}>
              {orderItems.map((item, idx) => (
                <div className={styles.summaryItem} key={idx}>
                  <img src={item.image} alt={item.name} className={styles.summaryImg} />
                  <div className={styles.summaryInfo}>
                    <div className={styles.summaryName}>{item.name}</div>
                    <div className={styles.summarySize}>Size {item.size}</div>
                  </div>
                  <div className={styles.summaryPrice}>${item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>$360.00</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>6.00</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Tax</span>
              <span>0.00</span>
            </div>
            <div className={styles.summaryTotalRow}>
              <span>Total</span>
              <span className={styles.summaryTotal}>$370.00</span>
            </div>
            <button className={styles.placeOrderBtn} type="button">Place Order</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 