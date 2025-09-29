'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './products.module.css';
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense';
import Footer from '@/app/components/features/Footer/Footer';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import { useProductStore, FilterOptions, Product } from '@/app/store';
import { CATEGORY_FILTERS } from '@/app/constants/categoryFilters';

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  // Store selectors
  const store = useProductStore();
  const {
    fetchProducts,
    searchProducts,
    products,
    searchResults,
    loading,
    searchLoading,
    error
  } = store;

  // Local state
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating'>('newest');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  // Handle filter changes
  const handleFilterChange = useCallback((filterType: string, value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      const currentValues = Array.isArray(newFilters[filterType]) 
        ? newFilters[filterType] as string[]
        : [];
      
      if (currentValues.includes(value)) {
        // Remove the value if it exists
        const updatedValues = currentValues.filter(v => v !== value);
        if (updatedValues.length === 0) {
          delete newFilters[filterType];
        } else {
          newFilters[filterType] = updatedValues;
        }
      } else {
        // Add the new value
        newFilters[filterType] = [...currentValues, value];
      }
      return newFilters;
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
  }, []);

  // Toggle filter section expansion
  const toggleFilterSection = useCallback((sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  }, []);

  // Remove specific filter
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

  // Initialize expanded sections when category changes
  useEffect(() => {
    if (category) {
      const normalizedCategory = category.toLowerCase() === 'clothes' ? 'clothing' : category.toLowerCase();
      if (CATEGORY_FILTERS[normalizedCategory as keyof typeof CATEGORY_FILTERS]) {
        const initialExpanded: {[key: string]: boolean} = {};
        CATEGORY_FILTERS[normalizedCategory as keyof typeof CATEGORY_FILTERS].forEach(filterGroup => {
          initialExpanded[filterGroup.title] = true; // All sections expanded by default
        });
        setExpandedSections(initialExpanded);
      }
    }
  }, [category]);

  // Memoized filters object
  const currentFilters = useMemo(() => ({
    ...activeFilters,
    sortBy,
    ...(category && { category }),
  }), [activeFilters, sortBy, category]);

  // Determine which products to show and loading state
  const displayProducts = useMemo(() => search ? searchResults : products, [search, searchResults, products]);
  const isLoading = useMemo(() => search ? searchLoading : loading, [search, searchLoading, loading]);

  // Client-side filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    if (!displayProducts?.length) return [];

    // Apply filters
    let filtered = displayProducts.filter((product: Product) => {
      // Check each active filter
      return Object.entries(activeFilters).every(([filterType, filterValues]) => {
        if (!Array.isArray(filterValues) || filterValues.length === 0) return true;
        
        const type = filterType.toLowerCase();
        
        // Map filter types to product properties based on your actual data
        switch (type) {
          case 'type':
            return filterValues.some(value => {
              const searchValue = value.toLowerCase();
              // Check tags, name, description, and category for the filter value
              return product.tags?.some(tag => 
                  tag.toLowerCase().includes(searchValue) || 
                  searchValue.includes(tag.toLowerCase())
                ) ||
                product.name?.toLowerCase().includes(searchValue) ||
                searchValue.includes(product.name?.toLowerCase() || '') ||
                product.description?.toLowerCase().includes(searchValue) ||
                product.category?.toLowerCase().includes(searchValue);
            });
            
          case 'size':
            // Check if product has the exact size
            return filterValues.some(value => 
              product.sizes?.some(size => size === value)
            );
            
          case 'color':
            // Check if product has the exact color
            return filterValues.some(value => 
              product.colors?.some(color => color === value)
            );
            
          case 'material':
            // Check tags for material-related keywords
            return filterValues.some(value => 
              product.tags?.some(tag => tag.toLowerCase().includes(value.toLowerCase())) ||
              product.name?.toLowerCase().includes(value.toLowerCase()) ||
              product.description?.toLowerCase().includes(value.toLowerCase())
            );
            
          default:
            return true;
        }
      });
    });

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.price || 0) - (b.price || 0);
        case 'price_desc':
          return (b.price || 0) - (a.price || 0);
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'rating':
          return (b.avgRating || 0) - (a.avgRating || 0);
        case 'newest':
        default:
          return (parseInt(b.id) || 0) - (parseInt(a.id) || 0);
      }
    });
  }, [displayProducts, activeFilters, sortBy]);

  // Fetch data effect
  useEffect(() => {
    const controller = new AbortController();
    
    const loadProducts = async () => {
      try {
        const filters = {
          ...(category ? { category } : {}),
          sortBy
        };

        if (search) {
          await searchProducts(search, filters);
        } else {
          await fetchProducts(filters);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load products:', error);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [search, category, sortBy, searchProducts, fetchProducts]);

  // Handlers
  const handleSortChange = useCallback((newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
  }, []);

  const handleRetry = useCallback(() => {
    const filters = {
      ...(category ? { category } : {}),
      sortBy
    };
    
    if (search) {
      searchProducts(search, filters);
    } else {
      fetchProducts(filters);
    }
  }, [search, category, sortBy, searchProducts, fetchProducts]);

  const getCategoryTitle = useCallback(() => {
    if (search) return `Search Results for "${search}"`;
    if (category) return category.charAt(0).toUpperCase() + category.slice(1);
    return 'All Products';
  }, [search, category]);

  // Count active filters
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
              disabled={isLoading}
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
                {filteredAndSortedProducts.length} products found
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

        {/* Active Filters Tags */}
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
              // Map category URL params to filter keys
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
              const isExpanded = expandedSections[filterGroup.title] ?? true; // Default to true if not set
              
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
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className={styles.errorContainer}>
                <p>{error}</p>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Retry
                </button>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className={styles.noResultsContainer}>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                {activeFilterCount > 0 && (
                  <button className={styles.clearFiltersButton} onClick={clearAllFilters}>
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedProducts.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;