'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import { useAuth } from '@/app/context/AuthContext';
import { Loader2, Package, AlertCircle, Star } from 'lucide-react';
import { API_ENDPOINTS } from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import ReviewModal from '@/app/components/features/Modal/ReviewModal';
import { Order } from '@/app/lib/types';

const OrdersPage = () => {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { user, loading: authLoading, authenticatedFetch } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<{ id: string; name: string; imageUrl: string } | null>(null);

  useEffect(() => {
    if (authLoading) {
      // Wait for authentication to resolve
      return;
    }

    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        setError('You must be logged in to view your orders.');
        return;
      }

      try {
        const data = await authenticatedFetch(API_ENDPOINTS.ORDERS.LIST);
        setOrders(data.orders);
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, authLoading, authenticatedFetch]);

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

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Order #{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">
            Date: {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusChipClass(order.status)}`}>
            {order.status}
          </span>
          <p className="font-bold text-lg text-gray-900">${order.total.toFixed(2)}</p>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4 mb-6">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4">
              <img
                src={item.product?.imageUrl || '/placeholder-product.png'}
                alt={item.product?.name || 'Product image'}
                className="w-16 h-16 object-cover rounded-md border"
              />
              <div className='flex-grow'>
                <p className="font-semibold text-gray-800">{item.product?.name || 'Product no longer available'}</p>
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
              <p className="text-sm font-semibold text-gray-700">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
        <Link href={`/${locale}/orders/${order.id}`} className="inline-block w-full text-center bg-[var(--color-primary-light)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--color-primary)] transition-colors duration-300">
            View Order Details
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <NavbarWithSuspense />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Orders</h1>
        </div>

        {loading && (
          <div className="text-center py-20">
            <Loader2 className="mx-auto w-12 h-12 text-blue-600 animate-spin" />
            <p className="mt-4 text-lg text-gray-600">Loading your orders...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20 bg-[var(--color-accent)] bg-opacity-5 border border-[var(--color-accent)] border-opacity-20 rounded-lg">
            <AlertCircle className="mx-auto w-12 h-12 text-[var(--color-accent)]" />
            <p className="mt-4 text-lg text-[var(--color-accent)] font-semibold">{error}</p>
            <p className='mt-2 text-gray-600'>There was a problem fetching your order history.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {orders.length > 0 ? (
              <div className="space-y-8">
                {orders.map(order => <OrderCard key={order.id} order={order} />)}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
                <Package className="mx-auto w-12 h-12 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold text-gray-800">No Orders Yet</h2>
                <p className="mt-2 text-gray-500">You haven't placed any orders with us. When you do, they will appear here.</p>
                <Link href={`/${locale}/products`} className="mt-6 inline-block bg-[var(--color-primary-light)] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[var(--color-primary)] transition-colors">
                  Start Shopping
                </Link>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
      {reviewModalOpen && selectedProductForReview && (
          <ReviewModal
            isOpen={reviewModalOpen}
            onClose={() => setReviewModalOpen(false)}
            product={selectedProductForReview}
            onSubmit={handleReviewSubmit}
          />
      )}
    </div>
  );
};

export default OrdersPage;
