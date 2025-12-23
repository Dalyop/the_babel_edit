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
import { useDebounce } from '@/app/hooks/useDebounce';

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const {
    fetchProducts,
    searchProducts,
    products,
    searchResults,
    loading,
    searchLoading,
    error,
    page,
    pagination,
    setPage,
  } = useProductStore();

  const [sortBy, setSortBy] = useState<SortByType>('newest');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const debouncedActiveFilters = useDebounce(activeFilters, 500);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [debugMode, setDebugMode] = useState(false);

  // This hook converts active UI filters into a search query string and structured filters
  const { combinedSearchQuery, structuredFilters } = useMemo(() => {
    const searchableKeys = ['material', 'style', 'brand', 'tag', 'type', 'occasion', 'fit', 'length', 'sleeve', 'neckline', 'pattern'];
    const structuredKeys = ['size', 'color'];
    
    const searchTerms = new Set<string>();
    if (search) {
      searchTerms.add(search);
    }

    const newStructuredFilters: Record<string, string[]> = {};

    Object.entries(debouncedActiveFilters).forEach(([key, values]) => {
      if (searchableKeys.includes(key)) {
        values.forEach(value => searchTerms.add(value));
      } else if (structuredKeys.includes(key)) {
        newStructuredFilters[key] = values;
      }
    });

    return {
      combinedSearchQuery: Array.from(searchTerms).join(' '),
      structuredFilters: newStructuredFilters,
    };
  }, [debouncedActiveFilters, search]);

  useEffect(() => {
    const baseFilters: FilterOptions = {
      ...structuredFilters,
    };
    if (category) {
      baseFilters.category = category;
    }
    
    // Always use searchProducts if there's a query, otherwise fetch all
    if (combinedSearchQuery) {
      searchProducts(combinedSearchQuery, baseFilters);
    } else {
      fetchProducts({ filters: baseFilters, page });
    }
    
    if (debugMode) {
      console.log('📡 Fetching with query:', combinedSearchQuery);
      console.log('📡 and filters:', baseFilters);
    }
  }, [combinedSearchQuery, structuredFilters, category, page, searchProducts, fetchProducts, debugMode]);

  const handleFilterChange = useCallback((filterKey: string, value: string) => {
    if (debugMode) {
      console.log('🎯 Filter Change:', filterKey, '=', value);
    }
    
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
      
      if (debugMode) {
        console.log('🎯 New Active Filters:', newFilters);
      }
      return newFilters;
    });
    setPage(1);
  }, [setPage, debugMode]);

  const displayProducts = useMemo(() => {
    let sourceProducts = search ? searchResults : products;
    
    const sorted = [...sourceProducts].sort((a, b) => {
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
          return (b.avgRating || 0) - (a.avgRating || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
    
    return sorted;
  }, [search, searchResults, products, sortBy]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setPage(1);
  }, [setPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (pagination?.pages || 1)) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  const isLoading = search ? searchLoading : loading;

  const handleSortChange = useCallback((newSortBy: any) => {
    setSortBy(newSortBy);
  }, []);
  
  const handleRetry = useCallback(() => {
    const baseFilters: FilterOptions = {
      ...structuredFilters,
    };
    if (category) {
      baseFilters.category = category;
    }
    
    if (combinedSearchQuery) {
      searchProducts(combinedSearchQuery, baseFilters);
    } else {
      fetchProducts({ filters: baseFilters, force: true, page });
    }
  }, [combinedSearchQuery, structuredFilters, category, page, searchProducts, fetchProducts]);

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
        {/* DEBUG PANEL */}
        <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '8px' }}>
          <button 
            onClick={() => setDebugMode(!debugMode)}
            style={{ 
              padding: '8px 16px', 
              background: debugMode ? '#4CAF50' : '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: debugMode ? '10px' : '0'
            }}
          >
            {debugMode ? '🐛 Debug Mode ON' : '🐛 Debug Mode OFF'}
          </button>
          
          {debugMode && (
            <div style={{ marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
              <div><strong>Category:</strong> {category || 'None'}</div>
              <div><strong>Active Filters:</strong> {JSON.stringify(activeFilters)}</div>
              <div><strong>Combined Search:</strong> {combinedSearchQuery}</div>
              <div><strong>Structured Filters:</strong> {JSON.stringify(structuredFilters)}</div>
              <div><strong>Total Products:</strong> {displayProducts.length}</div>
              <div><strong>Sample Product Tags:</strong> {displayProducts[0]?.tags?.join(', ') || 'No tags'}</div>
              <div><strong>Sample Product Name:</strong> {displayProducts[0]?.name || 'No products'}</div>
            </div>
          )}
        </div>

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
              <span className={styles.resultCount}>
                Showing {displayProducts.length} of {pagination?.total || 0} products
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
            {isLoading ? (
              Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : error ? (
              <div className={styles.errorContainer}>
                <p>{error}</p>
                <button onClick={handleRetry}>Retry</button>
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
        
        {!isLoading && displayProducts.length > 0 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1 || loading}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <span className={styles.paginationInfo}>
              Page {page} of {pagination?.pages || 1}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= (pagination?.pages || 1) || loading}
              className={styles.paginationButton}
            >
              Next
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;