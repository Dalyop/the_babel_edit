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

const productImages = [
  { src: '/images/babel_logo_black.jpg', alt: 'Causal Black T-Shirt 1' },
  { src: '/images/babel_logo_white.jpg', alt: 'Causal Black T-Shirt 2' },
  { src: '/images/babel_logo_black.jpg', alt: 'Causal Black T-Shirt 3' },
  { src: '/images/babel_logo_white.jpg', alt: 'Causal Black T-Shirt 4' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const colors = ['black', 'red', 'green', 'white', 'blue', 'purple'];

// Mock data removed - now using real featured products from the store

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const locale = params.locale as string || 'en';
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [quantity, setQuantity] = useState(1);
  
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
  }, [productId]); // Only depend on productId, not the function
  
  // Fetch featured products for recommendations if not already loaded
  useEffect(() => {
    if (featuredProducts.length === 0) {
      fetchFeaturedProducts(5);
    }
  }, []); // Only run once when component mounts

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
      // Here you would typically add the item to cart logic
      // For now, we'll just navigate to the cart page
      toast.success('Product added to cart!');
      router.push(`/${locale}/cart`);
    }
  };

  const tabs = [
    { label: t('description'), content: <div>{t('productDescription')}</div> },
    { label: t('sizeGuide'), content: <div>{t('sizeGuideContent')}</div> },
    { label: t('reviewsWithCount', { count: 34 }), content: <div>{t('reviewsContent')}</div> },
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

  // Extract product sizes and colors if available
  const availableSizes = currentProduct.sizes?.length ? currentProduct.sizes : sizes;
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
            <ProductOptions
              sizes={availableSizes}
              colors={availableColors}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
              onSizeChange={setSelectedSize}
              onColorChange={setSelectedColor}
              onQuantityChange={setQuantity}
            />
            <button
              className={styles.addToCartBtn}
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
    </div>
  );
}
