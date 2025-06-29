'use client';
import React from 'react';
import styles from './products.module.css';
import Navbar from '@/app/components/features/Navbar/Navbar';
import Footer from '@/app/components/features/Footer/Footer';
import ModernProductCard from '@/app/components/features/ProductCard/ModernProductCard';

const products = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  imageSrc: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=600&q=80',
  imageAlt: 'Model in red dress',
  title: 'Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse',
  price: 120.23,
  originalPrice: 120.23,
  orders: 24,
  isFavorite: false,
}));

const ProductsPage = () => {
  return (
    <div className={styles.pageBg}>
      <Navbar />
      <main className={styles.catalogMain}>
        <div className={styles.catalogHeader}>
          <div className={styles.catalogTitleBox}>
            <div className={styles.catalogTitle}>Ladies Top</div>
            <div className={styles.catalogSubtitle}>
              Slash Sales begins in April. Get up to 80% Discount on all products <a href="#">Read More</a>
            </div>
          </div>
        </div>
        <div className={styles.catalogBar}>
          <div>Showing 1 - 20 out of 2,356 Products</div>
          <div className={styles.catalogSort}>Sort by: <span className={styles.catalogSortValue}>New Arrivals ▼</span></div>
        </div>
        <div className={styles.catalogContent}>
          <aside className={styles.catalogSidebar}>
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>PRICES</div>
              <div className={styles.filterRange}>Range</div>
              <div className={styles.filterRangeValue}>$120 - $300</div>
              <input type="range" min="120" max="300" className={styles.rangeSlider} />
            </div>
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>FILTERS</div>
              <label><input type="checkbox" /> Women</label>
              <label><input type="checkbox" /> Ladies</label>
              <label><input type="checkbox" /> Girls</label>
              <label><input type="checkbox" /> Babies</label>
            </div>
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>CATEGORIES</div>
              <label><input type="checkbox" /> Dresses</label>
              <label><input type="checkbox" /> Tops</label>
              <label><input type="checkbox" /> Lingerie & Lounge Wear</label>
              <label><input type="checkbox" /> Blouse</label>
              <label><input type="checkbox" /> Vintage</label>
              <div className={styles.filterMore}>+ 4 more</div>
            </div>
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>SIZE</div>
              <label><input type="checkbox" /> Medium</label>
              <label><input type="checkbox" /> Large</label>
              <label><input type="checkbox" /> Plus Size</label>
              <label><input type="checkbox" /> Sexy Plus Size</label>
            </div>
          </aside>
          <section className={styles.catalogGrid}>
            {products.map((product, idx) => (
              <ModernProductCard key={product.id} {...product} />
            ))}
          </section>
        </div>
        <div className={styles.catalogPagination}>
          <button className={styles.pageBtn}>&lt;</button>
          <button className={styles.pageBtnActive}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>...</button>
          <button className={styles.pageBtn}>13</button>
          <button className={styles.pageBtn}>&gt;</button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;