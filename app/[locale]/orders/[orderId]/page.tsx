'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2, AlertCircle, Package, ArrowLeft, Star } from 'lucide-react';
import { API_ENDPOINTS } from '@/app/lib/api';
import { toast } from 'react-hot-toast';

// Assuming the same Order interface as the orders list page
interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }[];
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: { id: string; name: string; imageUrl: string };
  onSubmit: (reviewData: { rating: number; comment: string }) => Promise<void>;
}

const ReviewModal = ({ isOpen, onClose, product, onSubmit }: ReviewModalProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    if (!isOpen) return null;

    const handleSubmitting = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ rating, comment });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Leave a Review for {product.name}</h2>
                <form onSubmit={handleSubmitting}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-8 h-8 cursor-pointer ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-2 border rounded"
                            rows={4}
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-[var(--color-primary-light)] text-white rounded">Submit Review</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OrderDetailPage = () => {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const orderId = params?.orderId as string;
  const { user, loading: authLoading, authenticatedFetch } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ id: string; name: string; imageUrl: string } | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for authentication to resolve
    }

    const fetchOrder = async () => {
      if (!user || !orderId) {
        setLoading(false);
        setError('Invalid request. You must be logged in to view an order.');
        return;
      }

      try {
        const data = await authenticatedFetch(API_ENDPOINTS.ORDERS.BY_ID(orderId));
        setOrder(data);
      } catch (err: any) {
        if (err.status === 404) {
            setError('Order not found.');
        } else {
            setError(err.message || 'An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, authLoading, authenticatedFetch, orderId]);
  
  const totalLoading = loading || authLoading;
  
  const getStatusChipClass = (status: Order['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-[var(--color-success)] text-white';
      case 'SHIPPED':
        return 'bg-[var(--color-primary-light)] text-white';
      case 'PENDING':
        return 'bg-[var(--color-warning)] text-amber-800';
      case 'CANCELLED':
        return 'bg-[var(--color-accent)] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleReviewSubmit = async ({ rating, comment }: { rating: number; comment: string }) => {
    if (!selectedProductForReview) return;

    try {
        await authenticatedFetch(API_ENDPOINTS.REVIEWS.CREATE, {
            method: 'POST',
            body: JSON.stringify({
                productId: selectedProductForReview.id,
                rating,
                comment,
            }),
        });
        toast.success('Review submitted successfully!');
        setReviewModalOpen(false);
    } catch (error) {
        toast.error('Failed to submit review.');
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="mx-auto w-12 h-12 text-[var(--color-primary-light)] animate-spin" />
                <p className="mt-4 text-lg text-gray-600">Loading Order Details...</p>
            </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center p-8 bg-white shadow-md rounded-lg">
                <AlertCircle className="mx-auto w-12 h-12 text-[var(--color-accent)]" />
                <p className="mt-4 text-xl text-[var(--color-accent)] font-semibold">{error}</p>
                <p className='mt-2 text-gray-600'>We couldn't retrieve the details for this order.</p>
                <Link href={`/${locale}/orders`} className="mt-6 inline-flex items-center gap-2 bg-[var(--color-primary-light)] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[var(--color-primary)] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    Back to My Orders
                </Link>
            </div>
        </div>
    );
  }

  if (!order) {
    return null; // Should be handled by error state
  }
  
  const { shippingAddress } = order;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarWithSuspense />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/${locale}/orders`} className="inline-flex items-center gap-2 text-[var(--color-primary-light)] hover:text-[var(--color-primary)] mb-6 font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Back to My Orders
        </Link>
        
        <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <span className={`px-4 py-2 text-base font-medium rounded-full ${getStatusChipClass(order.status)}`}>
                        {order.status}
                    </span>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Shipping Address</h2>
                    <address className="not-italic text-gray-600 space-y-1">
                        {shippingAddress ? (
                            <>
                                <p>{shippingAddress.street}</p>
                                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                                <p>{shippingAddress.country}</p>
                            </>
                        ) : (
                            <p>No shipping address provided.</p>
                        )}
                    </address>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Payment Summary</h2>
                    <div className="space-y-2 text-gray-600">
                        <div className="flex justify-between"><span>Subtotal</span> <span>${order.total.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Shipping</span> <span className='text-[var(--color-success)]'>FREE</span></div>
                        <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2 mt-2"><span>Total</span> <span>${order.total.toFixed(2)}</span></div>
                    </div>
                </div>
            </div>

            <div className="p-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Items in this Order</h2>
                <div className="space-y-4">
                    {order.items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                            <img
                                src={item.product?.imageUrl || '/placeholder-product.png'}
                                alt={item.product?.name || 'Product image'}
                                className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <div className='flex-grow'>
                                <p className="font-semibold text-gray-900">{item.product?.name || 'Product no longer available'}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                {item.product && (
                                    <button 
                                        onClick={() => {
                                            setSelectedProductForReview(item.product);
                                            setReviewModalOpen(true);
                                        }}
                                        className="text-sm text-[var(--color-primary-light)] hover:underline"
                                    >
                                        Leave a Review
                                    </button>
                                )}
                            </div>
                            <div className='text-right'>
                                <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </main>
      <Footer />
            {reviewModalOpen && selectedProductForReview && (
              <ReviewModal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                product={selectedProductForReview}
                onSubmit={handleReviewSubmit}
              />
            )}    </div>
  );
};

export default OrderDetailPage;
