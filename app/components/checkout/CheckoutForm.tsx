'use client';
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useCartStore } from '@/app/store/useCartStore';
import { CreditCard, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CheckoutFormProps {
  orderId: string;
  total: number;
  shippingInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  onSuccess?: () => void;
}

export default function CheckoutForm({ orderId, total, shippingInfo, onSuccess }: CheckoutFormProps) {
    const params = useParams();
    const router = useRouter();
    const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCartStore();
  
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isElementsReady, setIsElementsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setMessage('Payment system not ready. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${currentLocale}/payment/success?orderId=${orderId}`,
          payment_method_data: {
            billing_details: shippingInfo ? {
              name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
              email: shippingInfo.email,
              phone: shippingInfo.phone,
              address: {
                line1: shippingInfo.address,
                city: shippingInfo.city,
                state: shippingInfo.state,
                postal_code: shippingInfo.zipCode,
                country: 'US',
              },
            } : undefined,
          },
        },
      });

      // This point will only be reached if there is an immediate error when
      // confirming the payment. Otherwise, your customer will be redirected to
      // your `return_url`.
      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'An error occurred with your payment method');
        } else {
          setMessage('An unexpected error occurred. Please try again.');
        }
        console.error('Payment error:', error);
      } else {
        // Payment succeeded, call onSuccess if provided
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Payment submission error:', err);
      setMessage('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs' as const,
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Secure payment powered by Stripe</span>
        </div>
      </div>

      {/* Payment Element */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <PaymentElement
          id="payment-element"
          options={paymentElementOptions}
          onReady={() => {
            console.log('Payment Element is ready');
            setIsElementsReady(true);
          }}
          onLoadError={(error) => {
            console.error('Payment Element load error:', error);
            setMessage('Failed to load payment form. Please refresh the page.');
          }}
        />
      </div>

      {/* Error/Success Message */}
      {message && (
        <div className={`flex items-start gap-3 p-4 rounded-lg ${
          message.includes('success') || message.includes('Success') 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            message.includes('success') || message.includes('Success')
              ? 'text-green-600'
              : 'text-red-600'
          }`} />
          <p className={`text-sm ${
            message.includes('success') || message.includes('Success')
              ? 'text-green-800'
              : 'text-red-800'
          }`}>
            {message}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        disabled={isLoading || !stripe || !elements || !isElementsReady}
        id="submit"
        type="submit"
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white text-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          isLoading || !stripe || !elements || !isElementsReady
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/30'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : !isElementsReady ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Loading payment form...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Pay ${total.toFixed(2)}</span>
          </>
        )}
      </button>

      {/* Payment Info */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
        <CheckCircle2 className="w-4 h-4 text-green-600" />
        <p>Your payment is secured with industry-standard encryption</p>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
          <p>Stripe ready: {stripe ? '✓' : '✗'}</p>
          <p>Elements ready: {elements ? '✓' : '✗'}</p>
          <p>Payment form ready: {isElementsReady ? '✓' : '✗'}</p>
        </div>
      )}
    </form>
  );
}