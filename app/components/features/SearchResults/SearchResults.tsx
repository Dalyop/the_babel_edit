'use client';
import React, { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { useProductStore } from '@/app/store';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import styles from './SearchResults.module.css';

interface SearchResultsProps {
  locale: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ locale }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const searchQuery = searchParams.get('search');
  
  const {
    searchProducts,
    searchResults,
    loading,
    error,
    setSearchResults
  } = useProductStore();

  useEffect(() => {
    if (searchQuery) {
      searchProducts(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchProducts, setSearchResults]);

  // Clear results when leaving search page
  useEffect(() => {
    return () => {
      if (!pathname.includes('/products')) {
        setSearchResults([]);
      }
    };
  }, [pathname, setSearchResults]);

  if (!searchQuery) {
    return null;
  }

  return (
    <div className={styles.searchResultsContainer}>
      <div className={styles.searchHeader}>
        <h1 className={styles.searchTitle}>
          Search Results for "{searchQuery}"
        </h1>
        <p className={styles.searchSubtitle}>
          {loading ? 'Searching...' : `${searchResults.length} products found`}
        </p>
      </div>

      {loading && (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={styles.loadingSkeleton}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonPrice} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Search Error</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            onClick={() => searchProducts(searchQuery)}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && searchResults.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>No Results Found</h3>
          <p className={styles.emptyMessage}>
            No products match your search for "{searchQuery}". Try different keywords or browse our categories.
          </p>
        </div>
      )}

      {!loading && searchResults.length > 0 && (
        <div className={styles.resultsGrid}>
          {searchResults.map(product => (
            <ProductCard 
              key={product.id}
              product={product}
              variant="default"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
