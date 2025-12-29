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
        { label: 'T-Shirt', value: 'tshirt' },
        { label: 'Blouse', value: 'blouse' },
        { label: 'Shirt', value: 'shirt' },
        { label: 'Top', value: 'top' },
        { label: 'Sweater & Cardigan', value: 'sweater' },
        { label: 'Jean', value: 'jean' },
        { label: 'Pant & Trouser', value: 'pant' },
        { label: 'Trouser', value: 'trouser' },
        { label: 'Skirt', value: 'skirt' },
        { label: 'Short', value: 'short' },
        { label: 'Dress', value: 'dress' },
        { label: 'Jacket', value: 'jacket' },
        { label: 'Coat', value: 'coat' }
      ]
    }
  ],
  
  bags: [
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'Backpack', value: 'backpack' },
        { label: 'Handbag', value: 'handbag' },
        { label: 'Tote Bag', value: 'tote' },
        { label: 'Shoulder Bag', value: 'shoulder' },
        { label: 'Clutch', value: 'clutch' },
        { label: 'Travel Bag', value: 'travel' },
        { label: 'Wallet', value: 'wallet' }
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
        { label: 'Bag', value: 'bag' },
        { label: 'Hat', value: 'hat' },
        { label: 'Scarf', value: 'scarf' },
        { label: 'Belt', value: 'belt' },
        { label: 'Jewelry', value: 'jewelry' },
        { label: 'Sunglass', value: 'sunglass' },
        { label: 'Watch', value: 'watch' }
      ]
    }
  ],
  
  shoes: [
    {
      title: 'Type',
      key: 'type',
      options: [
        { label: 'Sneaker', value: 'sneaker' },
        { label: 'Boot', value: 'boot' },
        { label: 'Sandal', value: 'sandal' },
        { label: 'Flat', value: 'flat' },
        { label: 'Heel', value: 'heel' },
        { label: 'Loafer', value: 'loafer' },
        { label: 'Athletic', value: 'athletic' },
        { label: 'Casual', value: 'casual' }
      ]
    }
  ],

  'new arrivals': [
    {
      title: 'Category',
      key: 'type',
      options: [
        { label: 'Clothing', value: 'clothing' },
        { label: 'Bags', value: 'bag' },
        { label: 'Shoes', value: 'shoe' },
        { label: 'Accessories', value: 'accessory' }
      ]
    }
  ]
};