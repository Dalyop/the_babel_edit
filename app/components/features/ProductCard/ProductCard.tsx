import React from 'react';
import styles from './ProductCard.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore, useWishlistStore, useProductStore, Product } from '@/app/store';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
    product: Product;
    className?: string;
    imageContainerClassName?: string;
    variant?: 'default' | 'small';
    locale?: string;
    currentCategory?: string | null;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  imageContainerClassName = '',
  variant = 'default',
  locale = 'en',
  currentCategory = null,
}) => {
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const prefetchProductById = useProductStore(state => state.prefetchProductById);
  const isInWishlist = useWishlistStore(state => state.isInWishlist(product.id));
  const isInCart = useCartStore(state => state.isInCart(product.id));
  
  const isAddingToCart = useCartStore(state => state.isProductLoading(product.id));
  const wishlistLoading = useWishlistStore(state => state.loading);

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        toast.success(`${product.name} removed from wishlist`);
      } else {
        await addToWishlist(product.id);
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      toast.error(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist`);
    }
  };

  const handlePrefetch = () => {
    prefetchProductById(product.id);
  };

  const isOutOfStock = product.stock === 0;

  const cardClasses = `
    ${styles.card} 
    ${variant === 'small' ? styles.smallCard : ''} 
    ${isOutOfStock ? 'grayscale opacity-60 pointer-events-none' : ''} 
    ${className}
  `;
  const imageContainerClasses = `${styles.imageContainer} ${variant === 'small' ? styles.smallImageContainer : ''} ${imageContainerClassName}`;

  return (
    <div className={cardClasses}>
      <div className={imageContainerClasses}>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <span className="bg-black text-white font-bold py-2 px-4 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          disabled={wishlistLoading}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isInWishlist ? 'fill-pink-500 text-pink-500' : 'text-gray-600 hover:text-pink-500'
            }`}
          />
        </button>

        <Link 
          href={`/${locale}/products/${product.id}`}
          passHref
          onMouseEnter={handlePrefetch}
        >
          <div className="cursor-pointer relative w-full h-full">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        
        {/* Rating if available */}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>⭐</span>
            <span>{product.avgRating}</span>
            {product.reviewCount > 0 && <span>({product.reviewCount})</span>}
          </div>
        )}
        
        <div className={styles.bottomRow}>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>${product.price}</span>
            {product.comparePrice && (
              <span className={styles.originalPrice}>${product.comparePrice}</span>
            )}
          </div>
          
          <button 
            className={styles.addToBasketBtn}
            onClick={handleAddToCart}
            disabled={isInCart || isOutOfStock || isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4" />
            {isAddingToCart ? 'Adding...' : isInCart ? 'In Cart' : isOutOfStock ? 'Out of Stock' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;