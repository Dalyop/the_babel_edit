'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Elements, useStripe } from '@stripe/react-stripe-js';
import stripePromise from '../../../lib/stripe';
import { useCartStore } from '@/app/store/useCartStore';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import styles from './success.module.css';

function PaymentSuccessContent() {
  const stripe = useStripe();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  
  const { clearCart } = useCartStore();
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = searchParams.get('payment_intent_client_secret');
    
    if (!clientSecret) {
      setMessage('Invalid payment session');
      setLoading(false);
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          clearCart();
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
      setLoading(false);
    });
  }, [stripe, searchParams, clearCart]);

  if (loading) {
    return (
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
        <p>Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className={styles.successCard}>
      {message === 'Payment succeeded!' ? (
        <>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Payment Successful!</h1>
          <p className={styles.successMessage}>
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className={styles.successActions}>
            <button
              onClick={() => router.push(`/${locale}/orders`)}
              className={styles.primaryButton}
            >
              View Orders
            </button>
            <button
              onClick={() => router.push(`/${locale}/products`)}
              className={styles.secondaryButton}
            >
              Continue Shopping
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.errorIcon}>✕</div>
          <h1 className={styles.errorTitle}>Payment Status</h1>
          <p className={styles.errorMessage}>{message}</p>
          <div className={styles.successActions}>
            <button
              onClick={() => router.push(`/${locale}/checkout`)}
              className={styles.primaryButton}
            >
              Try Again
            </button>
            <button
              onClick={() => router.push(`/${locale}/cart`)}
              className={styles.secondaryButton}
            >
              Return to Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Elements stripe={stripePromise}>
      <div className={styles.successBg}>
        <NavbarWithSuspense />
        <main className={styles.successContainer}>
          <Suspense fallback={
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <p>Loading...</p>
            </div>
          }>
            <PaymentSuccessContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </Elements>
  );
}