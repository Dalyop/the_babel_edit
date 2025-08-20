// 'use client';
// import React, { useEffect, useRef } from 'react';
// import { useSearchParams, usePathname } from 'next/navigation';
// import { useProductStore } from '@/app/store';
// import ProductCard from '@/app/components/features/ProductCard/ProductCard';
// import styles from './SearchResults.module.css';

// interface SearchResultsProps {
//   locale: string;
// }

// const SearchResults: React.FC<SearchResultsProps> = ({ locale }) => {
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const searchQuery = searchParams.get('search');
  
//   // Use refs to track previous values and prevent unnecessary calls
//   const prevSearchQuery = useRef<string | null>(null);
//   const prevPathname = useRef<string>('');
  
//   // Get store state and functions
//   const {
//     searchProducts,
//     searchResults,
//     loading,
//     error,
//     setSearchResults
//   } = useProductStore();

//   // Search effect with ref-based change detection
//   useEffect(() => {
//     // Only search if query actually changed
//     if (searchQuery !== prevSearchQuery.current) {
//       prevSearchQuery.current = searchQuery;
      
//       if (searchQuery) {
//         searchProducts(searchQuery);
//       } else {
//         setSearchResults([]);
//       }
//     }
//   }); // No dependencies - runs after every render but has internal change detection

//   // Clear results when leaving search page
//   useEffect(() => {
//     if (pathname !== prevPathname.current) {
//       prevPathname.current = pathname;
      
//       if (!pathname.includes('/products')) {
//         setSearchResults([]);
//       }
//     }
//   }); // No dependencies

//   if (!searchQuery) {
//     return null;
//   }

//   return (
//     <div className={styles.searchResultsContainer}>
//       <div className={styles.searchHeader}>
//         <h1 className={styles.searchTitle}>
//           Search Results for "{searchQuery}"
//         </h1>
//         <p className={styles.searchSubtitle}>
//           {loading ? 'Searching...' : `${searchResults.length} products found`}
//         </p>
//       </div>

//       {loading && (
//         <div className={styles.loadingGrid}>
//           {Array.from({ length: 8 }).map((_, index) => (
//             <div key={index} className={styles.loadingSkeleton}>
//               <div className={styles.skeletonImage} />
//               <div className={styles.skeletonContent}>
//                 <div className={styles.skeletonTitle} />
//                 <div className={styles.skeletonPrice} />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {error && (
//         <div className={styles.errorContainer}>
//           <div className={styles.errorIcon}>⚠️</div>
//           <h3 className={styles.errorTitle}>Search Error</h3>
//           <p className={styles.errorMessage}>{error}</p>
//           <button 
//             onClick={() => searchQuery && searchProducts(searchQuery)}
//             className={styles.retryButton}
//           >
//             Try Again
//           </button>
//         </div>
//       )}

//       {!loading && !error && searchResults.length === 0 && (
//         <div className={styles.emptyState}>
//           <div className={styles.emptyIcon}>🔍</div>
//           <h3 className={styles.emptyTitle}>No Results Found</h3>
//           <p className={styles.emptyMessage}>
//             No products match your search for "{searchQuery}". Try different keywords or browse our categories.
//           </p>
//         </div>
//       )}

//       {!loading && searchResults.length > 0 && (
//         <div className={styles.resultsGrid}>
//           {searchResults.map(product => (
//             <ProductCard 
//               key={product.id}
//               product={product}
//               variant="default"
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchResults;
// SearchInput.tsx
'use client';
import React, { useState, useRef, useCallback } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  onSearch, 
  placeholder = "Search products...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSearchRef = useRef<string>('');

  // Debounced search handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search for same query
    if (value === lastSearchRef.current) {
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      if (value.trim() && value !== lastSearchRef.current) {
        lastSearchRef.current = value;
        onSearch(value.trim());
      }
    }, 300); // 300ms debounce

  }, [onSearch]);

  // Handle form submission (immediate search)
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery && trimmedQuery !== lastSearchRef.current) {
      lastSearchRef.current = trimmedQuery;
      onSearch(trimmedQuery);
    }
  }, [searchQuery, onSearch]);

  // Clear search
  const handleClear = useCallback(() => {
    setSearchQuery('');
    lastSearchRef.current = '';
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear button */}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchInput;