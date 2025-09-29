'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCartStore } from '@/app/store/useCartStore';
import styles from './CheckoutForm.module.css';

interface CheckoutFormProps {
  orderId: string;
  total: number;
}

export default function CheckoutForm({ orderId, total }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { clearCart } = useCartStore();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?orderId=${orderId}`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred');
      } else {
        setMessage('An unexpected error occurred.');
      }
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <h2>Payment Details</h2>
        <p className={styles.secureText}>
          🔒 Secure payment powered by Stripe
        </p>
      </div>

      <PaymentElement 
        id="payment-element" 
        options={paymentElementOptions}
        className={styles.paymentElement}
      />

      <button 
        disabled={isLoading || !stripe || !elements} 
        id="submit"
        className={styles.submitButton}
      >
        <span id="button-text">
          {isLoading ? (
            <div className={styles.spinner} id="spinner"></div>
          ) : (
            `Pay $${total.toFixed(2)}`
          )}
        </span>
      </button>

      {message && (
        <div className={styles.paymentMessage} id="payment-message">
          {message}
        </div>
      )}

      <div className={styles.paymentInfo}>
        <p>Your payment is secured with industry-standard encryption</p>
      </div>
    </form>
  );
}