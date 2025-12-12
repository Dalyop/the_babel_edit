'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './products.module.css';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import ProductCardSkeleton from '@/app/components/features/ProductCard/ProductCardSkeleton';
import { useProductStore, Product, FilterOptions, SortByType } from '@/app/store';
import { CATEGORY_FILTERS } from '@/app/constants/categoryFilters';
import { useDebounce } from '@/app/hooks/useDebounce';

const PAGE_LIMIT = 24;

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  // Store selectors
  const {
    fetchProducts,
    products,
    pagination,
    loading,
    error,
    hasMore,
  } = useProductStore();

  // Local state for filter UI
  const [sortBy, setSortBy] = useState<SortByType>('newest');
  const [activeFilters, setActiveFilters] = useState<Partial<FilterOptions>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const debouncedActiveFilters = useDebounce(activeFilters, 300);

  // Centralized effect for fetching products
  useEffect(() => {
    console.log('%c[ProductsPage] Effect triggered', 'color: #FFA500', { debouncedActiveFilters, sortBy, category, search });
    // Consolidate all filter criteria
    const filtersToFetch: FilterOptions = {
      ...debouncedActiveFilters,
      sortBy,
    };
    if (category) {
      filtersToFetch.category = category;
    }
    if (search) {
      filtersToFetch.search = search;
    }

    console.log('[ProductsPage] Calling fetchProducts with:', { filtersToFetch });
    fetchProducts({ filters: filtersToFetch, limit: PAGE_LIMIT });
    // Note: `fetchProducts` is stable and doesn't need to be in the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedActiveFilters, sortBy, category, search]);


  const handleFilterChange = useCallback((filterKey: keyof FilterOptions, value: string) => {
    console.log(`%c[ProductsPage] Filter changed:`, 'color: #FFD700', { filterKey, value });
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = (newFilters[filterKey] as string[] | undefined) || [];
      
      if (currentValues.includes(value)) {
        const updatedValues = currentValues.filter(v => v !== value);
        if (updatedValues.length === 0) {
          delete newFilters[filterKey];
        } else {
          newFilters[filterKey] = updatedValues;
        }
      } else {
        newFilters[filterKey] = [...currentValues, value];
      }
      console.log('[ProductsPage] New activeFilters state:', newFilters);
      return newFilters;
    });
  }, []);

  const handleLoadMore = useCallback(() => {
    // Filters are taken from the store's state, we just need to trigger the fetch
    if (hasMore && !loading) {
      fetchProducts({ limit: PAGE_LIMIT });
    }
  }, [hasMore, loading, fetchProducts]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const toggleFilterSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  }, []);

  const removeFilter = useCallback((filterKey: keyof FilterOptions, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = (newFilters[filterKey] as string[] | undefined) || [];
      const updatedValues = currentValues.filter(v => v !== value);
      
      if (updatedValues.length === 0) {
        delete newFilters[filterKey];
      } else {
        newFilters[filterKey] = updatedValues;
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

  const handleSortChange = useCallback((newSortBy: SortByType) => {
    setSortBy(newSortBy);
  }, []);
  
  const handleRetry = useCallback(() => {
    const filtersToFetch: FilterOptions = { ...activeFilters, sortBy };
    if (category) filtersToFetch.category = category;
    if (search) filtersToFetch.search = search;
    
    fetchProducts({ filters: filtersToFetch, force: true, limit: PAGE_LIMIT });
  }, [activeFilters, sortBy, category, search, fetchProducts]);

  const getCategoryTitle = useCallback(() => {
    if (search) return `Search Results for "${search}"`;
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    return 'All Products';
  }, [search, category]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(activeFilters).reduce((count, [key, values]) => {
      // We only count filters that are arrays of selections, not single values like 'sortBy'
      if (Array.isArray(values)) {
        return count + values.length;
      }
      return count;
    }, 0);
  }, [activeFilters]);
  
  const currentCategoryFilters = useMemo(() => {
    if (!category) return [];
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
    return CATEGORY_FILTERS[categoryKey as keyof typeof CATEGORY_FILTERS] || [];
  }, [category]);


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
              onChange={(e) => handleSortChange(e.target.value as SortByType)}
              className={styles.sortSelect}
              disabled={loading && products.length === 0}
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
            
            <div className={styles.filterSummary}>
              <span className={styles.resultCount}>
                Showing {products.length} of {pagination?.total || 0} products
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
              {Object.entries(activeFilters).map(([filterKey, values]) => {
                  const filterGroup = currentCategoryFilters.find(g => g.key === filterKey);
                  const filterTitle = filterGroup ? filterGroup.title : filterKey;

                  return (values as string[]).map((value, index) => {
                    const option = filterGroup?.options.find(o => o.value === value);
                    const optionLabel = option ? option.label : value;

                    return (
                      <div key={`${filterKey}-${value}-${index}`} className={styles.filterTag}>
                        <span>{filterTitle}: {optionLabel}</span>
                        <button 
                          className={styles.removeFilterButton}
                          onClick={() => removeFilter(filterKey as keyof FilterOptions, value)}
                          aria-label={`Remove ${filterTitle}: ${optionLabel} filter`}
                        >
                          ×
                        </button>
                      </div>
                    )
                  });
              })}
            </div>
          </div>
        )}

        <div className={styles.catalogContent}>
          <div className={styles.filtersContainer}>
            {currentCategoryFilters.length > 0 && (
               <div className={styles.filtersHeader}>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <button 
                    className={styles.clearAllButton}
                    onClick={clearAllFilters}
                  >
                    Clear All
                  </button>
                )}
              </div>
            )}
            
            {currentCategoryFilters.map((filterGroup, groupIndex) => {
              const currentValues = (activeFilters[filterGroup.key as keyof FilterOptions] as string[]) || [];
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
                            id={`${filterGroup.key}-${option.value}`}
                            checked={isChecked}
                            onChange={() => handleFilterChange(filterGroup.key as keyof FilterOptions, option.value)}
                          />
                          <label 
                            htmlFor={`${filterGroup.key}-${option.value}`}
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
            {loading && products.length === 0 ? (
              Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : error ? (
              <div className={styles.errorContainer}>
                <p>{error}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Retry
                </button>
              </div>
            ) : products.length > 0 ? (
              products.map((product: Product) => (
                <ProductCard key={`${product.id}-${product.name}`} product={product} />
              ))
            ) : (
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
        
        <div className={styles.loaderContainer}>
            {loading && products.length > 0 && (
              <ProductCardSkeleton />
            )}
            {!loading && hasMore && products.length > 0 && (
              <button className={styles.loadMoreButton} onClick={handleLoadMore}>
                Load More
              </button>
            )}
            {!loading && !hasMore && products.length > 0 && (
              <p className={styles.endOfResults}>You've seen all {pagination?.total || 0} results.</p>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;