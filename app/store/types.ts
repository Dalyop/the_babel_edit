// Store types and interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  googleId?: string;
  avatar?: string;
  isVerified: boolean;
  isAgree: boolean;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number; // Original price for discounts
  imageUrl: string;
  images: string[];
  stock: number;
  sku?: string;
  collectionId: string;
  collection: Collection;
  sizes: string[];
  colors: string[];
  tags: string[];
  weight?: number;
  dimensions?: string;
  isActive: boolean;
  isFeatured: boolean;
  category?: string;
  subcategory?: string;
  type?: string;
  material?: string;
  color?: string;
  // Computed fields from backend
  avgRating: number;
  reviewCount: number;
  discountPercentage: number;
}

export type SortByType = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating';

export interface FilterArrayValues {
  Type?: string[];
  Style?: string[];
  Brand?: string[];
  Material?: string[];
  Color?: string[];
  Pattern?: string[];
  Size?: string[];
}

export interface FilterOptions extends Partial<FilterArrayValues> {
  [key: string]: string[] | string | number | boolean | undefined;
  category?: string;
  sortBy?: SortByType;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size?: string;
  color?: string;
  subtotal: number;
}

export interface CartResponse {
  items: CartItem[];
  itemCount: number;
  total: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  paymentMethod?: string;
  paymentIntentId?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress?: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
