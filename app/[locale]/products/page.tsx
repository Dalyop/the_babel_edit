'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './products.module.css';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import ProductCardSkeleton from '@/app/components/features/ProductCard/ProductCardSkeleton';
import { useProductStore, Product, SortByType, FilterOptions } from '@/app/store';
import { CATEGORY_FILTERS } from '@/app/constants/categoryFilters';

import FilterSidebar from '@/app/components/features/FilterSidebar/FilterSidebar';

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
  const [sortBy, setSortBy] = useState<SortByType>('newest');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Initial data fetch
  useEffect(() => {
    if (search) {
      // Search is still a backend operation
      searchProducts(search, {});
    } else {
      // Fetch all products to enable full client-side filtering
      fetchProducts({ force: true, limit: 1000 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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

    const match = (productValue: string, filterValue: string): boolean => {
      const pVal = productValue.toLowerCase();
      const fVal = filterValue.toLowerCase();

      // Case 1: Direct match or substring
      if (pVal.includes(fVal)) return true;

      // Case 2: Handle simple plurals (from filter to product value)
      // e.g., fVal="dresses", pVal="dress"
      if (fVal.endsWith('s')) {
        let singular = fVal.slice(0, -1);
        if (fVal.endsWith('es')) {
          singular = fVal.slice(0, -2);
        }
        if (pVal.includes(singular)) return true;
      } 
      // Case 3: Handle simple plurals (from product to filter value)
      // e.g., fVal="dress", pVal="dresses"
      else {
        const pluralS = `${fVal}s`;
        const pluralEs = `${fVal}es`;
        if (pVal.includes(pluralS) || pVal.includes(pluralEs)) return true;
      }

      return false;
    };

    // 1. Filter by URL category first
    const categoryFilteredProducts = category
      ? sourceProducts.filter(product => {
          const fieldsToTest = [product.category, product.subcategory, product.type, product.name, ...(product.tags || [])];
          return fieldsToTest.some(field => field && match(field, category));
        })
      : sourceProducts;

    // 2. Apply active filters from the sidebar
    const filtered = categoryFilteredProducts.filter(product => {
      return Object.entries(activeFilters).every(([filterKey, filterValues]) => {
        if (!filterValues || filterValues.length === 0) {
          return true;
        }
        
        const productValue = product[filterKey as keyof Product] as string | string[] | undefined;

        if (!productValue) return false;

        return filterValues.some(val => {
          if (Array.isArray(productValue)) {
            return productValue.some(prodVal => match(prodVal, val));
          } else if (typeof productValue === 'string') {
            return match(productValue, val);
          }
          return false;
        });
      });
    });

    // 3. Apply sorting
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
  }, [search, searchResults, products, activeFilters, sortBy, category]);


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
    const lowerCaseCategory = category.toLowerCase();

    // Helper to check for singular/plural match or keyword inclusion
    const matchesCategory = (filterKey: string, targetCategory: string) => {
      // Direct equality check
      if (filterKey === targetCategory) return true;

      // Check for singular/plural forms
      const singularFilterKey = filterKey.endsWith('s') ? filterKey.slice(0, -1) : filterKey;
      const pluralFilterKey = filterKey.endsWith('s') ? filterKey : `${filterKey}s`;

      if (targetCategory === singularFilterKey || targetCategory === pluralFilterKey) return true;

      // Check if targetCategory contains the filterKey (or its singular/plural) as a keyword
      if (targetCategory.includes(singularFilterKey) || targetCategory.includes(pluralFilterKey)) return true;
      
      // Check if filterKey contains the targetCategory (or its singular/plural) as a keyword
      if (filterKey.includes(singularFilterKey) || filterKey.includes(pluralFilterKey)) return true;

      return false;
    };

    // Find the best matching category key from CATEGORY_FILTERS
    let matchedCategoryKey: string | null = null;
    for (const key in CATEGORY_FILTERS) {
      if (matchesCategory(key, lowerCaseCategory)) {
        matchedCategoryKey = key;
        break;
      }
    }

    if (matchedCategoryKey) {
      return CATEGORY_FILTERS[matchedCategoryKey as keyof typeof CATEGORY_FILTERS] || [];
    }

    return []; // Return empty if no match
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
          <FilterSidebar
            activeFilters={activeFilters}
            activeFilterCount={activeFilterCount}
            expandedSections={expandedSections}
            category={category}
            handleFilterChange={handleFilterChange}
            clearAllFilters={clearAllFilters}
            toggleFilterSection={toggleFilterSection}
          />

          <div className={styles.productsGrid}>
            {isLoading ? (
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