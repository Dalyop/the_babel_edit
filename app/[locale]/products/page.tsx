'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './products.module.css';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import { useProductStore, FilterOptions } from '@/app/store';

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const searchProducts = useProductStore(state => state.searchProducts);
  const products = useProductStore(state => state.products);
  const searchResults = useProductStore(state => state.searchResults);
  const loading = useProductStore(state => state.loading);
  const error = useProductStore(state => state.error);
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sortBy, setSortBy] = useState<string>('newest');
  
  // Determine which products to show
  const displayProducts = search ? searchResults : products;
  
  useEffect(() => {
    const newFilters: FilterOptions = {
      ...filters,
      sortBy: sortBy as any,
    };
    
    if (category) {
      newFilters.category = category;
    }
    
    if (search) {
      searchProducts(search, newFilters);
    } else {
      fetchProducts(newFilters);
    }
    
    setFilters(newFilters);
  }, [category, search, sortBy, fetchProducts, searchProducts]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const getCategoryTitle = () => {
    if (search) return `Search Results for "${search}"`;
    if (category) {
      return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
    }
    return 'All Products';
  };
  return (
    <div className={styles.pageBg}>
      <NavbarWithSuspense />
      {/* Full width flash sale banner */}
      <div className={styles.catalogHeader}>
        <div className={styles.catalogTitleBox}>
          <div className={styles.catalogTitle}>{getCategoryTitle()}</div>
          <div className={styles.catalogSubtitle}>
            Slash Sales begins in April. Get up to 80% Discount on all products <a href="#">Read More</a>
          </div>
        </div>
      </div>
      <main className="py-8 px-4 max-w-7xl mx-auto">
        <div className={styles.catalogBar}>
          <div>{loading ? 'Loading...' : `${displayProducts.length} products found`}</div>
          <div className={styles.catalogSort}>Sort by: 
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
        <div className={styles.catalogContent}>
          <aside className={styles.catalogSidebar}>
            <div className={styles.filterSection}>
              <div className={styles.filterTitle}>FILTERS</div>
              <label><input type="checkbox" /> Women</label>
              <label><input type="checkbox" /> Ladies</label>
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
          </aside>
          <section className={styles.catalogGrid}>
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <h3 className="text-red-800 font-medium text-lg">Error Loading Products</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <p className="text-red-600 text-sm mt-1">
                  Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
                </p>
                <button
                  onClick={() => {
                    if (search) {
                      searchProducts(search, filters);
                    } else {
                      fetchProducts(filters);
                    }
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
            {!loading && !error && displayProducts.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600">
                  {search 
                    ? `No products match your search for "${search}"`
                    : 'No products available in this category'
                  }
                </p>
              </div>
            )}
            {!loading && displayProducts.length > 0 && (
              displayProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  variant="default"
                />
              ))
            )}
          </section>
        </div>
        {!loading && displayProducts.length > 0 && (
          <div className={styles.catalogPagination}>
            <button className={styles.pageBtn}>&lt;</button>
            <button className={styles.pageBtnActive}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>...</button>
            <button className={styles.pageBtn}>13</button>
            <button className={styles.pageBtn}>&gt;</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;