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
        { label: 'T-Shirt', value: 't-shirts' },
        { label: 'Blouse & Shirt', value: 'blouses-shirts' },
        { label: 'Sweater & Cardigan', value: 'sweaters-cardigans' },
        { label: 'Jean', value: 'jeans' },
        { label: 'Pant & Trouser', value: 'pants-trousers' },
        { label: 'Skirt', value: 'skirts' },
        { label: 'Short', value: 'shorts' },
        { label: 'Dress', value: 'dresses' },
        { label: 'Jacket & Coat', value: 'jackets-coats' }
      ]
    }
  ],
  
  bags: [
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'Backpack', value: 'backpacks' },
        { label: 'Handbag', value: 'handbags' },
        { label: 'Tote Bag', value: 'tote-bags' },
        { label: 'Shoulder Bag', value: 'shoulder-bags' },
        { label: 'Clutch', value: 'clutches' },
        { label: 'Travel Bag', value: 'travel-bags' },
        { label: 'Wallet', value: 'wallets' }
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
        { label: 'Bag', value: 'bags' },
        { label: 'Hat', value: 'hats' },
        { label: 'Scarf', value: 'scarves' },
        { label: 'Belt', value: 'belts' },
        { label: 'Jewelry', value: 'jewelry' },
        { label: 'Sunglass', value: 'sunglasses' },
        { label: 'Watch', value: 'watches' }
      ]
    }
  ],
  
  shoes: [
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'Sneaker', value: 'sneakers' },
        { label: 'Boot', value: 'boots' },
        { label: 'Sandal', value: 'sandals' },
        { label: 'Flat', value: 'flats' },
        { label: 'Heel', value: 'heels' },
        { label: 'Loafer', value: 'loafers' },
        { label: 'Athletic', value: 'athletic' },
        { label: 'Casual', value: 'casual' }
      ]
    }
  ]
};