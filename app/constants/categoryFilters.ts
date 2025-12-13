export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  title: string;
  key: string; // The key to be used in API query parameters
  options: FilterOption[];
}

export interface CategoryFilters {
  [key: string]: FilterGroup[];
}

export const CATEGORY_FILTERS: CategoryFilters = {
  clothing: [
    // All filters were removed as they do not exist in the Product model.
    // To add filters for clothing, first add corresponding fields to the
    // 'Product' model in 'prisma/schema.prisma' (e.g., type: String, style: String).
  ],
  
  bags: [
    // All filters were removed as they do not exist in the Product model.
  ],
  
  accessories: [
    // All filters were removed as they do not exist in the Product model.
  ],
  
  shoes: [
    // All filters were removed as they do not exist in the Product model.
  ]
};
