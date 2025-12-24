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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [debugMode, setDebugMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Fetch all products without filters - we'll filter client-side
  useEffect(() => {
    const baseFilters: FilterOptions = {};
    if (category) {
      baseFilters.category = category;
    }
    
    if (search) {
      searchProducts(search, baseFilters);
    } else {
      // Fetch ALL products - we'll filter them client-side
      fetchProducts({ filters: baseFilters, limit: 100 });
    }
  }, [search, category, fetchProducts, searchProducts]);

  // CLIENT-SIDE FILTERING - Flexible matching for all filter types
  const filteredProducts = useMemo(() => {
    let sourceProducts = search ? searchResults : products;
    
    if (debugMode) {
      console.log('🔍 Starting with', sourceProducts.length, 'products');
      console.log('🔍 Active filters:', activeFilters);
    }
    
    // If no filters, return all products
    if (Object.keys(activeFilters).length === 0) {
      return sourceProducts;
    }

    // Apply filters
    return sourceProducts.filter(product => {
      // Check each filter group
      for (const [filterKey, filterValues] of Object.entries(activeFilters)) {
        if (filterValues.length === 0) continue;

        // For each filter value, check if product matches ANY of them (OR logic within a filter)
        const matchesFilter = filterValues.some(filterValue => {
          const searchTerm = filterValue.toLowerCase();
          // Also create a version without hyphens/spaces for flexible matching
          const searchTermNoHyphens = searchTerm.replace(/[-\s]/g, '');
          
          // Helper function to check if text matches (with or without hyphens/spaces)
          const textMatches = (text: string) => {
            const lowerText = text.toLowerCase();
            const textNoHyphens = lowerText.replace(/[-\s]/g, '');
            return lowerText.includes(searchTerm) || 
                   textNoHyphens.includes(searchTermNoHyphens) ||
                   lowerText.includes(searchTermNoHyphens);
          };
          
          // Check product name (NO DESCRIPTION FILTERING)
          if (textMatches(product.name)) {
            if (debugMode) console.log(`✅ ${product.name} matches name with "${filterValue}"`);
            return true;
          }
          
          // Check product tags (NO DESCRIPTION FILTERING)
          if (product.tags?.some(tag => textMatches(tag))) {
            if (debugMode) console.log(`✅ ${product.name} matches tags with "${filterValue}"`);
            return true;
          }
          
          // Check sizes (exact match for size filter)
          if (filterKey === 'size' && product.sizes?.some(size => 
            size.toLowerCase() === searchTerm || size.toLowerCase().includes(searchTerm)
          )) {
            if (debugMode) console.log(`✅ ${product.name} matches size`);
            return true;
          }
          
          // Check colors (flexible match)
          if (filterKey === 'color' && product.colors?.some(color => 
            textMatches(color)
          )) {
            if (debugMode) console.log(`✅ ${product.name} matches color`);
            return true;
          }
          
          return false;
        });

        // If product doesn't match this filter group, exclude it (AND logic between filter groups)
        if (!matchesFilter) {
          if (debugMode) console.log(`❌ ${product.name} excluded by ${filterKey}`);
          return false;
        }
      }
      
      return true;
    });
  }, [products, searchResults, search, activeFilters, debugMode]);

  // Apply sorting to filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
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
    
    if (debugMode) {
      console.log('📊 Total sorted products:', sorted.length);
    }
    
    return sorted;
  }, [filteredProducts, sortBy, debugMode]);

  // Paginate the sorted products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, currentPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  }, [sortedProducts]);

  // Display products = paginated products
  const displayProducts = paginatedProducts;

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
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [debugMode]);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setCurrentPage(1);
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

  const isLoading = search ? searchLoading : loading;

  const handleSortChange = useCallback((newSortBy: any) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to page 1 when sorting changes
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleRetry = useCallback(() => {
    const baseFilters: FilterOptions = {};
    if (category) {
      baseFilters.category = category;
    }
    
    if (search) {
      searchProducts(search, baseFilters);
    } else {
      fetchProducts({ filters: baseFilters, force: true, limit: 100 });
    }
  }, [search, category, fetchProducts, searchProducts]);

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
      'arrivals': 'new arrivals',
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
              <div><strong>Total Source Products:</strong> {(search ? searchResults : products).length}</div>
              <div><strong>Filtered Products:</strong> {filteredProducts.length}</div>
              <div><strong>Total Pages:</strong> {totalPages}</div>
              <div><strong>Current Page:</strong> {currentPage}</div>
              <div><strong>Displayed on Page:</strong> {displayProducts.length}</div>
              {displayProducts[0] && (
                <>
                  <div><strong>Sample Product Name:</strong> {displayProducts[0].name}</div>
                  <div><strong>Sample Product Tags:</strong> {displayProducts[0].tags?.join(', ') || 'No tags'}</div>
                  <div><strong>Sample Product Sizes:</strong> {displayProducts[0].sizes?.join(', ') || 'No sizes'}</div>
                  <div><strong>Sample Product Colors:</strong> {displayProducts[0].colors?.join(', ') || 'No colors'}</div>
                </>
              )}
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
                Showing {displayProducts.length} of {sortedProducts.length} products
                {currentPage > 1 && ` (Page ${currentPage} of ${totalPages})`}
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
        
        {/* PAGINATION */}
        {!isLoading && sortedProducts.length > 0 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={styles.paginationButton}
              style={{ 
                opacity: currentPage <= 1 ? 0.5 : 1,
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* First page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className={styles.paginationButton}
                    style={{ minWidth: '40px' }}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span>...</span>}
                </>
              )}
              
              {/* Page numbers around current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => {
                  return pageNum === currentPage || 
                         pageNum === currentPage - 1 || 
                         pageNum === currentPage + 1 ||
                         (pageNum === currentPage - 2 && currentPage <= 3) ||
                         (pageNum === currentPage + 2 && currentPage >= totalPages - 2);
                })
                .map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={styles.paginationButton}
                    style={{
                      minWidth: '40px',
                      background: pageNum === currentPage ? '#333' : 'transparent',
                      color: pageNum === currentPage ? 'white' : 'inherit',
                      fontWeight: pageNum === currentPage ? 'bold' : 'normal'
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              
              {/* Last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span>...</span>}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className={styles.paginationButton}
                    style={{ minWidth: '40px' }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={styles.paginationButton}
              style={{ 
                opacity: currentPage >= totalPages ? 0.5 : 1,
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
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