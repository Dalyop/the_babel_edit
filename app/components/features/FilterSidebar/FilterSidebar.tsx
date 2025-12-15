
'use client';
import React from 'react';
import styles from './FilterSidebar.module.css';
import { CATEGORY_FILTERS } from '@/app/constants/categoryFilters';

interface FilterSidebarProps {
  activeFilters: Record<string, string[]>;
  activeFilterCount: number;
  expandedSections: Record<string, boolean>;
  category: string | null;
  handleFilterChange: (filterKey: string, value: string) => void;
  clearAllFilters: () => void;
  toggleFilterSection: (sectionTitle: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeFilters,
  activeFilterCount,
  expandedSections,
  category,
  handleFilterChange,
  clearAllFilters,
  toggleFilterSection,
}) => {
  const currentCategoryFilters = React.useMemo(() => {
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
  );
};

export default FilterSidebar;
