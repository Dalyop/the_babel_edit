'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import ProductImageGallery from './ProductImageGallery';
import ProductOptions from './ProductOptions';
import ProductTabs from './ProductTabs';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import { Product } from '@/app/store';
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

const youMayAlsoLike: Product[] = [
  {
    id: 'similar-1',
    name: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    description: 'Elegant striped blouse with flutter sleeves',
    price: 90.0,
    originalPrice: 100.0,
    category: 'clothing',
    images: ['/images/babel_logo_black.jpg'],
    stock: 10,
    rating: 4.5,
    reviews: 89,
    isOnSale: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'similar-2',
    name: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    description: 'Stylish white striped blouse',
    price: 90.0,
    originalPrice: 100.0,
    category: 'clothing',
    images: ['/images/babel_logo_white.jpg'],
    stock: 8,
    rating: 4.3,
    reviews: 67,
    isOnSale: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'similar-3',
    name: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    description: 'Classic black striped blouse',
    price: 90.0,
    originalPrice: 100.0,
    category: 'clothing',
    images: ['/images/babel_logo_black.jpg'],
    stock: 15,
    rating: 4.7,
    reviews: 123,
    isOnSale: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'similar-4',
    name: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    description: 'Trendy white accessories blouse',
    price: 90.0,
    originalPrice: 100.0,
    category: 'clothing',
    images: ['/images/babel_logo_white.jpg'],
    stock: 5,
    rating: 4.1,
    reviews: 34,
    isOnSale: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'similar-5',
    name: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    description: 'Modern black accessories blouse',
    price: 90.0,
    originalPrice: 100.0,
    category: 'clothing',
    images: ['/images/babel_logo_black.jpg'],
    stock: 12,
    rating: 4.6,
    reviews: 78,
    isOnSale: true,
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [quantity, setQuantity] = useState(1);

  // Translation setup
  const currentLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en';
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
    // Here you would typically add the item to cart logic
    // For now, we'll just navigate to the cart page
    router.push('/cart');
  };

  const tabs = [
    { label: t('description'), content: <div>{t('productDescription')}</div> },
    { label: t('sizeGuide'), content: <div>{t('sizeGuideContent')}</div> },
    { label: t('reviewsWithCount', { count: 34 }), content: <div>{t('reviewsContent')}</div> },
    { label: t('shippingReturns'), content: <div>{t('shippingReturnsContent')}</div> },
  ];

  return (
    <div className={styles.productDetailBg}>
      <Navbar />
      <main className={styles.productDetailMain}>
        <div className={styles.productContent}>
          <div className={styles.leftCol}>
            <ProductImageGallery images={productImages} />
          </div>
          <div className={styles.rightCol}>
            <h1 className={styles.productTitle}>{t('productTitle')}</h1>
            <div className={styles.productPrice}>{t('productPrice')}</div>
            <div className={styles.reviewStars}>
              <span style={{ color: '#ffb400' }}>★ ★ ★ ★</span>
              <span style={{ color: '#d1d1d1' }}>★</span>
              <span className={styles.reviewCount}>(34 {t('reviews')})</span>
            </div>
            <div className={styles.productDesc}>
              {t('productDescription')}
            </div>
            <ProductOptions
              sizes={sizes}
              colors={colors}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
              onSizeChange={setSelectedSize}
              onColorChange={setSelectedColor}
              onQuantityChange={setQuantity}
            />
            <button
              className=""
              style={{
                background: '#ff2d17',
                color: '#fff',
                border: 'none',
                borderRadius: 7,
                padding: '0.9rem 0',
                fontSize: '1.15rem',
                fontWeight: 700,
                width: '100%',
                marginBottom: '0.7rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onClick={handleAddToCart}
              type="button"
            >
              {t('addToCart')}
            </button>
            <div style={{ color: '#232323', fontSize: '1rem', marginBottom: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8, fontSize: '1.2rem' }}>♡</span> {t('addToWishlist')}
            </div>
          </div>
        </div>
        <ProductTabs tabs={tabs} />
        <div className={styles.likeSection}>
          <div className={styles.likeTitle}>{t('youMayAlsoLike')}</div>
          <div className={styles.likeList}>
            {youMayAlsoLike.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className={`${styles.likeCard} smallCard`}
                imageContainerClassName="smallImageContainer"
                variant="small"
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
