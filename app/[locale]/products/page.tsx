'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './products.module.css';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import ProductCardSkeleton from '@/app/components/features/ProductCard/ProductCardSkeleton';
import { useProductStore, Product } from '@/app/store';
import { CATEGORY_FILTERS } from '@/app/constants/categoryFilters';

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
  } = useProductStore();

  // Local state for filter UI
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating'>('newest');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initial data fetch to get ALL products for client-side filtering
  useEffect(() => {
    const filtersToFetch = category ? { category } : {};
    if (search) {
      // Search is still a backend operation
      searchProducts(search, filtersToFetch);
    } else {
      // Fetch all products for the category to enable client-side filtering
      fetchProducts({ filters: filtersToFetch, force: true, limit: 500 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = newFilters[filterKey] || [];
      
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
      return newFilters;
    });
  }, []);

  // Memoized, client-side filtered and sorted products
  const displayProducts = useMemo(() => {
    let sourceProducts = search ? searchResults : products;

    // Apply active filters (client-side)
    const filtered = sourceProducts.filter(product => {
      return Object.entries(activeFilters).every(([filterKey, filterValues]) => {
        if (!filterValues || filterValues.length === 0) {
          return true;
        }
        
        const productValue = product[filterKey as keyof Product] as string | string[] | undefined;

        if (!productValue) return false;

        // Use .some() to see if any filter value matches
        return filterValues.some(val => {
          if (Array.isArray(productValue)) {
            // Check if any of the product's values (e.g., in its 'sizes' array) includes the filter value
            return productValue.some(prodVal => prodVal.toLowerCase().includes(val.toLowerCase()));
          } else if (typeof productValue === 'string') {
            // Check if the product's value (e.g., its 'type') includes the filter value
            return productValue.toLowerCase().includes(val.toLowerCase());
          }
          return false;
        });
      });
    });

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rating':
          return b.avgRating - a.avgRating;
        case 'newest':
        default:
          return 0; // The initial fetch order is assumed to be newest
      }
    });

    return sorted;
  }, [search, searchResults, products, activeFilters, sortBy]);


  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  const toggleFilterSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  }, []);

  const removeFilter = useCallback((filterKey: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = newFilters[filterKey] || [];
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

  const isLoading = useMemo(() => search ? searchLoading : loading, [search, searchLoading, loading]);

  const handleSortChange = useCallback((newSortBy: any) => {
    setSortBy(newSortBy);
  }, []);
  
  const handleRetry = useCallback(() => {
    const filtersToFetch = category ? { category } : {};
    if (search) {
      searchProducts(search, filtersToFetch);
    } else {
      fetchProducts({ filters: filtersToFetch, force: true, limit: 500 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const getCategoryTitle = useCallback(() => {
    if (search) return `Search Results for "${search}"`;
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    return 'All Products';
  }, [search, category]);

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, values) => count + values.length, 0);
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
              onChange={(e) => handleSortChange(e.target.value)}
              className={styles.sortSelect}
              disabled={loading}
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
                Showing {displayProducts.length} of {products.length} products
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

                  return values.map((value, index) => {
                    const option = filterGroup?.options.find(o => o.value === value);
                    const optionLabel = option ? option.label : value;

                    return (
                      <div key={`${filterKey}-${value}-${index}`} className={styles.filterTag}>
                        <span>{filterTitle}: {optionLabel}</span>
                        <button 
                          className={styles.removeFilterButton}
                          onClick={() => removeFilter(filterKey, value)}
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
            
            {currentCategoryFilters.map((filterGroup, groupIndex) => {
              const currentValues = activeFilters[filterGroup.key] || [];
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
                            onChange={() => handleFilterChange(filterGroup.key, option.value)}
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
            {loading ? (
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
            ) : displayProducts.length > 0 ? (
              displayProducts.map((product: Product) => (
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
            {!loading && displayProducts.length > 0 && (
              <p className={styles.endOfResults}>You've seen all {displayProducts.length} results.</p>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;