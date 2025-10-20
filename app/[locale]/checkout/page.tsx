'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useRouter, useParams } from 'next/navigation';
import stripePromise from '../../lib/stripe';
import CheckoutForm from '@/app/components/checkout/CheckoutForm';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import { useCartStore } from '@/app/store/useCartStore';
import styles from './checkout.module.css';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const { items, totalAmount } = useCartStore();
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Prevent duplicate API calls in React Strict Mode
  const initialized = useRef(false);

  const shipping = 9.0;
  const total = totalAmount + shipping;

  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  
  useEffect(() => {
    // Prevent duplicate calls in development (React Strict Mode)
    if (initialized.current) return;
    initialized.current = true;

    // Redirect if cart is empty
    if (items.length === 0) {
      router.push(`/${currentLocale}/cart`);
      return;
    }

    // Create order and get payment intent
    const initializeCheckout = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('Creating order with items:', items);

        // Step 1: Create order (authenticated)
        const orderData = await apiRequest<any>(API_ENDPOINTS.ORDERS.CREATE, {
          method: 'POST',
          requireAuth: true,
          body: {
            items: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color,
            })),
            shippingCost: shipping,
            totalAmount: total,
          },
        });
        console.log("Order created:", orderData);
        setOrderId(orderData.id);

        // Step 2: Create payment intent (authenticated)
        const { clientSecret } = await apiRequest<{ clientSecret: string }>(
          '/payments/create-payment-intent',
          {
            method: 'POST',
            requireAuth: true,
            body: { orderId: orderData.id },
          }
        );
        setClientSecret(clientSecret);
        
      } catch (err: any) {
        console.error('Checkout initialization error:', err);
        setError(err.message || 'Failed to initialize checkout');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [items, total, shipping, router, currentLocale]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className={styles.checkoutBg}>
        <NavbarWithSuspense />
        <main className={styles.checkoutContainer}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
            <p>Initializing secure checkout...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.checkoutBg}>
        <NavbarWithSuspense />
        <main className={styles.checkoutContainer}>
          <div className={styles.errorContainer}>
            <h2>Checkout Error</h2>
            <p>{error}</p>
            <button
              onClick={() => router.push(`/${currentLocale}/cart`)}
              className={styles.backButton}
            >
              Return to Cart
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.checkoutBg}>
      <NavbarWithSuspense />
      <main className={styles.checkoutContainer}>
        <h1 className={styles.heading}>Secure Checkout</h1>

        <div className={styles.checkoutContent}>
          <div className={styles.paymentSection}>
            {clientSecret && (
              <Elements options={options} stripe={stripePromise}>
                <CheckoutForm orderId={orderId} total={total} />
              </Elements>
            )}
          </div>

          <div className={styles.orderSummary}>
            <h2>Order Summary</h2>

            <div className={styles.summaryItems}>
              {items.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>Qty: {item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className={styles.summaryTotals}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}