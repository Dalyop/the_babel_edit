'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './products.module.css';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import ProductCardSkeleton from '@/app/components/features/ProductCard/ProductCardSkeleton';
import { useProductStore, FilterOptions, Product } from '@/app/store';
import { CATEGORY_FILTERS } from '@/app/constants/categoryFilters';

// A simple Intersection Observer hook
const useIntersectionObserver = (callback: () => void, options?: IntersectionObserverInit) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const target = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    if (target.current) {
      observer.current.observe(target.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [callback, options]);

  return target;
};


const ProductsPage = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  // Store selectors
  const {
    fetchProducts,
    searchProducts,
    products,
    searchResults,
    loading,
    searchLoading,
    error,
    hasMore,
    page,
    setFilters: setStoreFilters,
  } = useProductStore();

  // Local state
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating'>('newest');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = Array.isArray(newFilters[filterType]) 
        ? newFilters[filterType] as string[]
        : [];
      
      if (currentValues.includes(value)) {
        const updatedValues = currentValues.filter(v => v !== value);
        if (updatedValues.length === 0) {
          delete newFilters[filterType];
        } else {
          newFilters[filterType] = updatedValues;
        }
      } else {
        newFilters[filterType] = [...currentValues, value];
      }
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const toggleFilterSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  }, []);

  const removeFilter = useCallback((filterType: string, value?: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value) {
        const currentValues = Array.isArray(newFilters[filterType]) 
          ? newFilters[filterType] as string[]
          : [];
        const updatedValues = currentValues.filter(v => v !== value);
        if (updatedValues.length === 0) {
          delete newFilters[filterType];
        } else {
          newFilters[filterType] = updatedValues;
        }
      } else {
        delete newFilters[filterType];
      }
      return newFilters;
    });
  }, []);

  useEffect(() => {
    if (category) {
      const normalizedCategory = category.toLowerCase() === 'clothes' ? 'clothing' : category.toLowerCase();
      if (CATEGORY_FILTERS[normalizedCategory as keyof typeof CATEGORY_FILTERS]) {
        const initialExpanded: {[key: string]: boolean} = {};
        CATEGORY_FILTERS[normalizedCategory as keyof typeof CATEGORY_FILTERS].forEach(filterGroup => {
          initialExpanded[filterGroup.title] = true;
        });
        setExpandedSections(initialExpanded);
      }
    }
  }, [category]);

  const currentFilters = useMemo(() => ({
    ...activeFilters,
    sortBy,
    ...(category && { category }),
  }), [activeFilters, sortBy, category]);

  const displayProducts = useMemo(() => search ? searchResults : products, [search, searchResults, products]);
  const isLoading = useMemo(() => search ? searchLoading : loading, [search, searchLoading, loading]);

  useEffect(() => {
    if (search) {
      searchProducts(search, currentFilters);
    } else {
      setStoreFilters(currentFilters);
    }
  }, [search, currentFilters, searchProducts, setStoreFilters]);

  const loadMoreProducts = useCallback(() => {
    if (!loading && hasMore && !search) {
      fetchProducts();
    }
  }, [loading, hasMore, fetchProducts, search]);

  const observerRef = useIntersectionObserver(loadMoreProducts, {
    rootMargin: '200px',
  });

  const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  }, []);
  
  const handleRetry = useCallback(() => {
    if (search) {
      searchProducts(search, currentFilters);
    } else {
      fetchProducts({ force: true });
    }
  }, [search, currentFilters, searchProducts, fetchProducts]);

  const getCategoryTitle = useCallback(() => {
    if (search) return `Search Results for "${search}"`;
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    return 'All Products';
  }, [search, category]);

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count: number, values) => {
      return count + (Array.isArray(values) ? values.length : 0);
    }, 0);
  }, [activeFilters]);

  return (
    <div className={styles.pageBg}>
      <NavbarWithSuspense />
      
      <div className={styles.catalogHeader}>
        <div className={styles.catalogTitleBox}>
          <div className={styles.catalogTitle}>{getCategoryTitle()}</div>
          <div className={styles.catalogSubtitle}>
            Slash Sales begins in April. Get up to 80% Discount on all products{' '}
            <a href="#">Read More</a>
          </div>
        </div>
      </div>

      <main className={styles.catalogMain}>
        <div className={styles.sortContainer}>
          <div className={styles.sortAndFilter}>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className={styles.sortSelect}
              disabled={isLoading && page === 1}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
              <option value="rating">Highest Rated</option>
            </select>
            
            <div className={styles.filterSummary}>
              <span className={styles.resultCount}>
                
              </span>
              {activeFilterCount > 0 && (
                <button 
                  className={styles.clearFiltersButton}
                  onClick={clearAllFilters}
                >
                  Clear all filters ({activeFilterCount})
                </button>
              )}
            </div>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className={styles.activeFiltersContainer}>
            <div className={styles.activeFiltersTitle}>Active Filters:</div>
            <div className={styles.activeFiltersTags}>
              {Object.entries(activeFilters).map(([filterType, values]) => 
                Array.isArray(values) ? values.map((value, index) => (
                  <div key={`${filterType}-${value}-${index}`} className={styles.filterTag}>
                    <span>{filterType}: {value}</span>
                    <button 
                      className={styles.removeFilterButton}
                      onClick={() => removeFilter(filterType, value)}
                      aria-label={`Remove ${filterType}: ${value} filter`}
                    >
                      ×
                    </button>
                  </div>
                )) : null
              )}
            </div>
          </div>
        )}

        <div className={styles.catalogContent}>
          <div className={styles.filtersContainer}>
            {activeFilterCount > 0 && (
              <div className={styles.filtersHeader}>
                <button 
                  className={styles.clearAllButton}
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
              </div>
            )}
            
            {category && (() => {
              const categoryMap: { [key: string]: string } = {
                'new-arrivals': 'new arrivals',
                'newarrivals': 'new arrivals', 
                'clothes': 'clothing',
                'clothing': 'clothing',
                'accessories': 'accessories',
                'bags': 'bags',
                'shoes': 'shoes'
              };
              
              const categoryKey = categoryMap[category.toLowerCase()] || category.toLowerCase();
              const normalizedCategory = categoryKey === 'clothes' ? 'clothing' : categoryKey;
              return CATEGORY_FILTERS[normalizedCategory as keyof typeof CATEGORY_FILTERS];
            })()?.map((filterGroup, groupIndex) => {
              const currentValues = (activeFilters[filterGroup.title] as string[]) || [];
              const isExpanded = expandedSections[filterGroup.title] ?? true;
              
              return (
                <div key={groupIndex} className={styles.filterSection}>
                  <div 
                    className={`${styles.filterTitle} ${isExpanded ? styles.expanded : ''}`}
                    onClick={() => toggleFilterSection(filterGroup.title)}
                  >
                    {filterGroup.title}
                    {currentValues.length > 0 && (
                      <span className={styles.filterCount}>({currentValues.length})</span>
                    )}
                  </div>
                  <div className={`${styles.filterOptions} ${isExpanded ? styles.expanded : ''}`}>
                    {filterGroup.options.map((option, optionIndex) => {
                      const isChecked = currentValues.includes(option.value);
                      return (
                        <div key={optionIndex} className={styles.filterOption}>
                          <input
                            type="checkbox"
                            id={`${filterGroup.title}-${option.value}`}
                            checked={isChecked}
                            onChange={() => handleFilterChange(filterGroup.title, option.value)}
                          />
                          <label 
                            htmlFor={`${filterGroup.title}-${option.value}`}
                            className={isChecked ? styles.checkedLabel : ''}
                          >
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.productsGrid}>
            {error ? (
              <div className={styles.errorContainer}>
                <p>{error}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Retry
                </button>
              </div>
            ) : (
              <>
                {displayProducts.map((product: Product) => (
                  <ProductCard key={`${product.id}-${product.name}`} product={product} />
                ))}
                {/* Skeletons for initial load AND infinite scroll appear here */}
                {isLoading && hasMore &&
                  Array.from({ length: page === 1 ? 8 : 4 }).map((_, index) => (
                    <ProductCardSkeleton key={`skeleton-${index}`} />
                  ))
                }
              </>
            )}
            {!isLoading && displayProducts.length === 0 && (
              <div className={styles.noResultsContainer}>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                {activeFilterCount > 0 && (
                  <button className={styles.clearFiltersButton} onClick={clearAllFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Observer target for infinite scroll */}
        <div ref={observerRef} className={styles.loaderContainer}>
            {!isLoading && !hasMore && displayProducts.length > 0 && (
              <p className={styles.endOfResults}>You've reached the end of the results.</p>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;