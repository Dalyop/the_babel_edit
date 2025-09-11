'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import ProductImageGallery from './ProductImageGallery';
import ProductOptions from './ProductOptions';
import ProductTabs from './ProductTabs';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import { useProductStore } from '@/app/store';
import { Product } from '@/app/store/types';
import styles from './ProductDetail.module.css';
import en from '@/locales/en/common.json';
import fr from '@/locales/fr/common.json';

// Size mapping for UK and US
const sizeData = {
  uk: [
    { label: 'XS', value: 'XS', ukSize: '6', usSize: '2' },
    { label: 'S', value: 'S', ukSize: '8', usSize: '4' },
    { label: 'M', value: 'M', ukSize: '10', usSize: '6' },
    { label: 'L', value: 'L', ukSize: '12', usSize: '8' },
    { label: 'XL', value: 'XL', ukSize: '14', usSize: '10' },
  ],
  us: [
    { label: 'XS', value: 'XS', ukSize: '6', usSize: '2' },
    { label: 'S', value: 'S', ukSize: '8', usSize: '4' },
    { label: 'M', value: 'M', ukSize: '10', usSize: '6' },
    { label: 'L', value: 'L', ukSize: '12', usSize: '8' },
    { label: 'XL', value: 'XL', ukSize: '14', usSize: '10' },
  ]
};

const colors = ['black', 'red', 'green', 'white', 'blue', 'purple'];

// Size Guide Modal Component
const SizeGuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  // Handle click outside to close modal
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
     <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
      style={{ zIndex: 9999 }}
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V9a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Size Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Size Chart */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h3 className="text-lg font-semibold">International Size Chart</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-900 uppercase tracking-wider">Size</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900 uppercase tracking-wider">UK</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900 uppercase tracking-wider">US</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900 uppercase tracking-wider">EU</th>
                    <th className="text-center py-4 px-6 text-sm font-semibold text-gray-900 uppercase tracking-wider">Chest (cm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { size: 'XS', uk: '6', us: '2', eu: '34', chest: '81-84' },
                    { size: 'S', uk: '8', us: '4', eu: '36', chest: '86-89' },
                    { size: 'M', uk: '10', us: '6', eu: '38', chest: '91-94' },
                    { size: 'L', uk: '12', us: '8', eu: '40', chest: '96-99' },
                    { size: 'XL', uk: '14', us: '10', eu: '42', chest: '101-104' },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                      <td className="py-4 px-6 font-bold text-gray-900">{row.size}</td>
                      <td className="py-4 px-6 text-center text-gray-700 font-medium">{row.uk}</td>
                      <td className="py-4 px-6 text-center text-gray-700 font-medium">{row.us}</td>
                      <td className="py-4 px-6 text-center text-gray-700 font-medium">{row.eu}</td>
                      <td className="py-4 px-6 text-center text-gray-700 font-medium">{row.chest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Measurement Guide */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">How to Measure</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span className="text-sm text-gray-700"><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span className="text-sm text-gray-700"><strong>Waist:</strong> Measure around your natural waistline, keeping the tape comfortably loose.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span className="text-sm text-gray-700"><strong>Hip:</strong> Measure around the fullest part of your hips.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Fit Tips</h4>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">Between sizes? We recommend sizing up for a more relaxed fit.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">All measurements are approximate and may vary by style.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">For the perfect fit, check the specific measurements for each item.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const locale = params.locale as string || 'en';

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [quantity, setQuantity] = useState(1);
  const [sizeSystem, setSizeSystem] = useState<'uk' | 'us'>('uk');
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Product store
  const {
    currentProduct,
    loading,
    error,
    fetchProductById,
    featuredProducts,
    fetchFeaturedProducts
  } = useProductStore();

  // Fetch product data
  useEffect(() => {
    if (productId) {
      fetchProductById(productId);
    }
  }, [productId]);

  // Fetch featured products for recommendations if not already loaded
  useEffect(() => {
    if (featuredProducts.length === 0) {
      fetchFeaturedProducts(5);
    }
  }, []);

  // Translation setup
  const currentLocale = locale;
  const translations: Record<string, Record<string, string>> = { en, fr };
  const t = (key: string, vars?: Record<string, any>) => {
    let str = (translations[currentLocale] || translations['en'])[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{{${k}}}`, v);
      });
    }
    return str;
  };

  const handleAddToCart = () => {
    if (currentProduct) {
      toast.success('Product added to cart!');
      router.push(`/${locale}/cart`);
    }
  };

  const getCurrentSizeDisplay = (size: string) => {
    const sizeInfo = sizeData[sizeSystem].find(s => s.value === size);
    if (!sizeInfo) return size;

    return sizeSystem === 'uk'
      ? `${size} (UK ${sizeInfo.ukSize})`
      : `${size} (US ${sizeInfo.usSize})`;
  };

  const tabs = [
    { label: t('description'), content: <div>{t('productDescription')}</div> },
    { label: t('shippingReturns'), content: <div>{t('shippingReturnsContent')}</div> },
  ];

  // Loading state
  if (loading) {
    return (
      <div className={styles.productDetailBg}>
        <Navbar />
        <main className={styles.productDetailMain}>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !currentProduct) {
    return (
      <div className={styles.productDetailBg}>
        <Navbar />
        <main className="py-8 px-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {error || 'Product not found'}
              </p>
              <button
                onClick={() => router.push(`/${locale}/dashboard`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Product images - use actual product images or fallback to defaults
  const productImages = currentProduct.images?.length
    ? currentProduct.images.map((img, index) => ({
      src: img,
      alt: `${currentProduct.name} ${index + 1}`
    }))
    : [{ src: currentProduct.imageUrl || '/images/babel_logo_black.jpg', alt: currentProduct.name }];

  // Extract product colors if available
  const availableColors = currentProduct.colors?.length ? currentProduct.colors : colors;

  return (
    <div className={styles.productDetailBg}>
      <Navbar />
      <main className="py-8 px-4 max-w-7xl mx-auto">
        <div className={styles.productContent}>
          <div className={styles.leftCol}>
            <ProductImageGallery images={productImages} />
          </div>
          <div className={styles.rightCol}>
            <h1 className={styles.productTitle}>{currentProduct.name}</h1>
            <div className={styles.productPrice}>
              ${currentProduct.price?.toFixed(2)}
              {currentProduct.comparePrice && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${currentProduct.comparePrice.toFixed(2)}
                </span>
              )}
            </div>
            <div className={styles.reviewStars}>
              <span style={{ color: '#ffb400' }}>{'★'.repeat(Math.floor(currentProduct.avgRating || 4))}</span>
              <span style={{ color: '#d1d1d1' }}>{'★'.repeat(5 - Math.floor(currentProduct.avgRating || 4))}</span>
              <span className={styles.reviewCount}>({currentProduct.reviewCount || 0} {t('reviews')})</span>
            </div>
            <div className={styles.productDesc}>
              {currentProduct.description}
            </div>

            {/* Size System Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-0">
                  Size System
                </label>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Size Guide
                </button>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-xl p-1 inline-flex">
                <button
                  onClick={() => setSizeSystem('uk')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${sizeSystem === 'uk'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  UK Sizes
                </button>
                <button
                  onClick={() => setSizeSystem('us')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${sizeSystem === 'us'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  US Sizes
                </button>
              </div>
            </div>

            {/* Enhanced Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Size: <span className="font-normal text-gray-600">{getCurrentSizeDisplay(selectedSize)}</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {sizeData[sizeSystem].map((sizeOption) => (
                  <button
                    key={sizeOption.value}
                    onClick={() => setSelectedSize(sizeOption.value)}
                    className={`relative p-3 border-2 rounded-xl text-center transition-all duration-200 ${selectedSize === sizeOption.value
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                  >
                    <div className="font-semibold">{sizeOption.label}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {sizeSystem === 'uk' ? sizeOption.ukSize : sizeOption.usSize}
                    </div>
                    {selectedSize === sizeOption.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Color: <span className="font-normal text-gray-600 capitalize">{selectedColor}</span>
              </label>
              <div className="flex gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-4 transition-all duration-200 ${selectedColor === color
                        ? 'border-blue-600 scale-110'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {selectedColor === color && (
                      <div className="w-full h-full rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="flex-1 text-center font-semibold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <button
              className={`${styles.addToCartBtn} mb-4`}
              onClick={handleAddToCart}
              type="button"
            >
              {t('addToCart')}
            </button>
            <button className={styles.wishlistBtn}>
              <span className={styles.wishlistIcon}>♡</span> {t('addToWishlist')}
            </button>
          </div>
        </div>

        <ProductTabs tabs={tabs} />

        <div className={styles.likeSection}>
          <div className={styles.likeTitle}>{t('youMayAlsoLike')}</div>
          <div className={styles.likeList}>
            {featuredProducts.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/${locale}/products/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <ProductCard
                  product={product}
                  className={`${styles.likeCard} smallCard`}
                  imageContainerClassName="smallImageContainer"
                  variant="small"
                />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />
    </div>
  );
}