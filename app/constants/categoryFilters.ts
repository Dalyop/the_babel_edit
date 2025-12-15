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
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'T-Shirts', value: 't-shirts' },
        { label: 'Blouses & Shirts', value: 'blouses-shirts' },
        { label: 'Sweaters & Cardigans', value: 'sweaters-cardigans' },
        { label: 'Jeans', value: 'jeans' },
        { label: 'Pants & Trousers', value: 'pants-trousers' },
        { label: 'Skirts', value: 'skirts' },
        { label: 'Shorts', value: 'shorts' },
        { label: 'Dresses', value: 'dresses' },
        { label: 'Jackets & Coats', value: 'jackets-coats' }
      ]
    }
  ],
  
  bags: [
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'Backpacks', value: 'backpacks' },
        { label: 'Handbags', value: 'handbags' },
        { label: 'Tote Bags', value: 'tote-bags' },
        { label: 'Shoulder Bags', value: 'shoulder-bags' },
        { label: 'Clutches', value: 'clutches' },
        { label: 'Travel Bags', value: 'travel-bags' },
        { label: 'Wallets', value: 'wallets' }
      ]
    },
    {
      title: 'Material',
      key: 'material',
      options: [
        { label: 'Leather', value: 'leather' },
        { label: 'Canvas', value: 'canvas' },
        { label: 'Nylon', value: 'nylon' },
        { label: 'Polyester', value: 'polyester' },
        { label: 'Cotton', value: 'cotton' }
      ]
    }
  ],
  
  accessories: [
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'Bags', value: 'bags' },
        { label: 'Hats', value: 'hats' },
        { label: 'Scarves', value: 'scarves' },
        { label: 'Belts', value: 'belts' },
        { label: 'Jewelry', value: 'jewelry' },
        { label: 'Sunglasses', value: 'sunglasses' },
        { label: 'Watches', value: 'watches' }
      ]
    }
  ],
  
  shoes: [
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'Sneakers', value: 'sneakers' },
        { label: 'Boots', value: 'boots' },
        { label: 'Sandals', value: 'sandals' },
        { label: 'Flats', value: 'flats' },
        { label: 'Heels', value: 'heels' },
        { label: 'Loafers', value: 'loafers' },
        { label: 'Athletic', value: 'athletic' },
        { label: 'Casual', value: 'casual' }
      ]
    }
  ]
};