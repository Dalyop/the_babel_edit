'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useRouter, useParams } from 'next/navigation';
import stripePromise from '../../lib/stripe';
import CheckoutForm from '@/app/components/checkout/CheckoutForm';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import { useCartStore } from '@/app/store/useCartStore';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';
import { CreditCard, Lock, Package, AlertCircle, Truck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';

export default function CheckoutPage() {

  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { items, totalAmount, clearCart } = useCartStore();
  
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true); // For initial page load checks
  const [isInitializingPayment, setIsInitializingPayment] = useState(false); // For payment initialization step
  const [error, setError] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [activeStep, setActiveStep] = useState(1);
  
  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const currentLocale = typeof params.locale === 'string' ? params.locale : 'en';
  
  const shippingCosts = {
    standard: 9.99,
    express: 24.99
  };
  
  const shipping = shippingCosts[shippingMethod];
  const tax = totalAmount * 0.08; // 8% tax
  const total = totalAmount + shipping + tax;

  // Check authentication and cart status
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace(`/${currentLocale}/auth/login?from=${encodeURIComponent(window.location.pathname)}`);
      } else if (items.length === 0) {
        router.push(`/${currentLocale}/cart`);
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, items, router, currentLocale]);

  // Pre-fill user email if available
  useEffect(() => {
    if (user?.email && !shippingInfo.email) {
      setShippingInfo(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);
  
  // Validate shipping form
  const validateShippingForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!shippingInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      errors.email = 'Invalid email address';
    }
    if (!shippingInfo.address.trim()) errors.address = 'Address is required';
    if (!shippingInfo.city.trim()) errors.city = 'City is required';
    if (!shippingInfo.state.trim()) errors.state = 'State is required';
    if (!shippingInfo.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingInfo.zipCode)) {
      errors.zipCode = 'Invalid ZIP code';
    }
    if (!shippingInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(shippingInfo.phone)) {
      errors.phone = 'Invalid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateShippingForm()) {
      return;
    }
    
    setIsInitializingPayment(true);
    setError('');

    try {
      // Step 1: Create the pending order
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
          shippingMethod: shippingMethod,
          // Include shipping info in the order creation
          shippingDetails: shippingInfo,
        },
      });
      
      console.log("✅ Order created:", orderData);
      setOrderId(orderData.id);

      // Step 2: Create the payment intent for that order
      const { clientSecret: secret } = await apiRequest<{ clientSecret: string }>(
        '/payments/create-payment-intent',
        {
          method: 'POST',
          requireAuth: true,
          body: { orderId: orderData.id },
        }
      );
      
      console.log("✅ Payment intent created");
      setClientSecret(secret);

      // Step 3: Move to payment step
      setActiveStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
      console.error('❌ Failed to initialize payment:', err);
      setError(err.message || 'Failed to initialize checkout. Please try again.');
    } finally {
      setIsInitializingPayment(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#dc2626',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  // Show loading while checking auth or cart
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <NavbarWithSuspense />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Verifying your cart...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <NavbarWithSuspense />
        <main className="max-w-7xl mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Checkout Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push(`/${currentLocale}/cart`)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Return to Cart
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <NavbarWithSuspense />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Secure Checkout
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4 text-green-600" />
              <span>SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { num: 1, label: 'Shipping', icon: Truck },
              { num: 2, label: 'Payment', icon: CreditCard },
              { num: 3, label: 'Confirm', icon: CheckCircle2 }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    activeStep >= step.num 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {activeStep > step.num ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`hidden sm:block font-medium ${
                    activeStep >= step.num ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300 ${
                    activeStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            {activeStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Form inputs are the same as before */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input type="text" value={shippingInfo.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.firstName ? 'border-red-500' : 'border-gray-300'}`} placeholder="John" />
                    {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input type="text" value={shippingInfo.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.lastName ? 'border-red-500' : 'border-gray-300'}`} placeholder="Doe" />
                    {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input disabled type="email" value={shippingInfo.email} onChange={(e) => handleInputChange('email', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="john@example.com" />
                    {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input type="tel" value={shippingInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="+1 (555) 123-4567" />
                    {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input type="text" value={shippingInfo.address} onChange={(e) => handleInputChange('address', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.address ? 'border-red-500' : 'border-gray-300'}`} placeholder="123 Main Street" />
                    {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input type="text" value={shippingInfo.city} onChange={(e) => handleInputChange('city', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.city ? 'border-red-500' : 'border-gray-300'}`} placeholder="New York" />
                    {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input type="text" value={shippingInfo.state} onChange={(e) => handleInputChange('state', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.state ? 'border-red-500' : 'border-gray-300'}`} placeholder="NY" maxLength={2} />
                    {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                    <input type="text" value={shippingInfo.zipCode} onChange={(e) => handleInputChange('zipCode', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${ formErrors.zipCode ? 'border-red-500' : 'border-gray-300'}`} placeholder="10001" maxLength={10} />
                    {formErrors.zipCode && <p className="text-red-500 text-xs mt-1">{formErrors.zipCode}</p>}
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Shipping Method</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'standard', label: 'Standard Shipping', time: '3-5 business days', price: shippingCosts.standard },
                      { id: 'express', label: 'Express Shipping', time: '1-2 business days', price: shippingCosts.express }
                    ].map((method) => (
                      <label key={method.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${ shippingMethod === method.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="shipping" value={method.id} checked={shippingMethod === method.id} onChange={(e) => setShippingMethod(e.target.value as 'standard' | 'express')} className="w-4 h-4 text-blue-600"/>
                          <div>
                            <div className="font-semibold text-gray-900">{method.label}</div>
                            <div className="text-sm text-gray-600">{method.time}</div>
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900">${method.price.toFixed(2)}</div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={isInitializingPayment}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 flex items-center justify-center"
                >
                  {isInitializingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span>Initializing Payment...</span>
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>
              </div>
            )}

            {/* Payment Information */}
            {activeStep === 2 && clientSecret && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
                </div>

                <Elements options={options} stripe={stripePromise}>
                  <CheckoutForm 
                    orderId={orderId} 
                    total={total}
                    shippingInfo={shippingInfo}
                    onSuccess={() => {
                      clearCart();
                      router.push(`/${currentLocale}/orders/${orderId}`);
                    }}
                  />
                </Elements>

                <button
                  onClick={() => {
                    setActiveStep(1);
                    setClientSecret(''); // Clear secret to allow re-initialization if needed
                  }}
                  className="w-full mt-4 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Back to Shipping
                </button>

                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              </div>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.color && `${item.color} • `}
                        {item.size && `${item.size} • `}
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ${item.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping ({shippingMethod})</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2">
                    <Lock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <span className="text-xs text-gray-600">Secure</span>
                  </div>
                  <div className="p-2">
                    <Truck className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <span className="text-xs text-gray-600">Fast Ship</span>
                  </div>
                  <div className="p-2">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                    <span className="text-xs text-gray-600">Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
