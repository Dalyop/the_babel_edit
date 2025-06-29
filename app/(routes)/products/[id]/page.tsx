'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import ProductImageGallery from './ProductImageGallery';
import ProductOptions from './ProductOptions';
import ProductTabs from './ProductTabs';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import styles from './ProductDetail.module.css';

const productImages = [
  { src: '/images/babel_logo_black.jpg', alt: 'Causal Black T-Shirt 1' },
  { src: '/images/babel_logo_white.jpg', alt: 'Causal Black T-Shirt 2' },
  { src: '/images/babel_logo_black.jpg', alt: 'Causal Black T-Shirt 3' },
  { src: '/images/babel_logo_white.jpg', alt: 'Causal Black T-Shirt 4' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL'];
const colors = ['black', 'red', 'green', 'white', 'blue', 'purple'];

const youMayAlsoLike = [
  {
    imageSrc: '/images/babel_logo_black.jpg',
    imageAlt: 'Shirt',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    currentPrice: 90.0,
    originalPrice: 100.0,
  },
  {
    imageSrc: '/images/babel_logo_white.jpg',
    imageAlt: 'Bag',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    currentPrice: 90.0,
    originalPrice: 100.0,
  },
  {
    imageSrc: '/images/babel_logo_black.jpg',
    imageAlt: 'Bag',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    currentPrice: 90.0,
    originalPrice: 100.0,
  },
  {
    imageSrc: '/images/babel_logo_white.jpg',
    imageAlt: 'Accessories',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    currentPrice: 90.0,
    originalPrice: 100.0,
  },
  {
    imageSrc: '/images/babel_logo_black.jpg',
    imageAlt: 'Accessories',
    title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
    currentPrice: 90.0,
    originalPrice: 100.0,
  },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // Here you would typically add the item to cart logic
    // For now, we'll just navigate to the cart page
    router.push('/cart');
  };

  const tabs = [
    { label: 'Description', content: <div>T-shirt made from soft, breathable fabric.</div> },
    { label: 'Size Guide', content: <div>Size guide content here.</div> },
    { label: 'Reviews (34)', content: <div>Reviews content here.</div> },
    { label: 'Shipping & Returns', content: <div>Shipping and returns info here.</div> },
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
            <h1 className={styles.productTitle}>Causal Black T-Shirt</h1>
            <div className={styles.productPrice}>$90.00</div>
            <div className={styles.reviewStars}>
              <span style={{ color: '#ffb400' }}>★ ★ ★ ★</span>
              <span style={{ color: '#d1d1d1' }}>★</span>
              <span className={styles.reviewCount}>(34 Reviews)</span>
            </div>
            <div className={styles.productDesc}>
              A versatile black T-shirt made from soft, breathable fabric. Perfect for casual occasions, this classic piece offers a relaxed fit and timeless style.
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
              Add to Cart
            </button>
            <div style={{ color: '#232323', fontSize: '1rem', marginBottom: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8, fontSize: '1.2rem' }}>♡</span> Add to wishlist
            </div>
          </div>
        </div>
        <ProductTabs tabs={tabs} />
        <div className={styles.likeSection}>
          <div className={styles.likeTitle}>You may also like</div>
          <div className={styles.likeList}>
            {youMayAlsoLike.map((item, idx) => (
              <ProductCard
                key={idx}
                imageSrc={item.imageSrc}
                imageAlt={item.imageAlt}
                title={item.title}
                currentPrice={item.currentPrice}
                originalPrice={item.originalPrice}
                onAddToBasket={() => {}}
                className={`${styles.likeCard} smallCard`}
                imageContainerClassName="smallImageContainer"
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
