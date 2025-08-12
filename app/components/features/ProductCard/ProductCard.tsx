import React from 'react';
import styles from './ProductCard.module.css';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore, useWishlistStore, Product } from '@/app/store';
import { toast } from 'react-hot-toast';
import { showGlobalLoading, hideGlobalLoading, LOADING_MESSAGES } from '@/app/utils/loadingUtils';

interface ProductCardProps {
    product: Product;
    className?: string;
    imageContainerClassName?: string;
    variant?: 'default' | 'small';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className = '',
  imageContainerClassName = '',
  variant = 'default',
}) => {
  const addToCart = useCartStore(state => state.addToCart);
  const addToWishlist = useWishlistStore(state => state.addToWishlist);
  const removeFromWishlist = useWishlistStore(state => state.removeFromWishlist);
  const isInWishlist = useWishlistStore(state => state.isInWishlist(product.id));
  const isInCart = useCartStore(state => state.isInCart(product.id));
  
  const cartLoading = useCartStore(state => state.loading);
  const wishlistLoading = useWishlistStore(state => state.loading);

  const handleAddToCart = async () => {
    try {
      showGlobalLoading(LOADING_MESSAGES.ADDING_TO_CART);
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      hideGlobalLoading();
    }
  };

  const handleToggleWishlist = async () => {
    try {
      showGlobalLoading(`${isInWishlist ? 'Removing from' : 'Adding to'} wishlist...`);
      if (isInWishlist) {
        await removeFromWishlist(product.id);
        toast.success(`${product.name} removed from wishlist`);
      } else {
        await addToWishlist(product.id);
        toast.success(`${product.name} added to wishlist!`);
      }
    } catch (error) {
      toast.error(`Failed to ${isInWishlist ? 'remove from' : 'add to'} wishlist`);
    } finally {
      hideGlobalLoading();
    }
  };

  const cardClasses = `${styles.card} ${variant === 'small' ? styles.smallCard : ''} ${className}`;
  const imageContainerClasses = `${styles.imageContainer} ${variant === 'small' ? styles.smallImageContainer : ''} ${imageContainerClassName}`;
  return (
    <div className={cardClasses}>
      <div className={imageContainerClasses}>
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

        <Image
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        
        {/* Rating if available */}
        {product.rating && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>⭐</span>
            <span>{product.rating}</span>
            {product.reviews && <span>({product.reviews})</span>}
          </div>
        )}
        
        <div className={styles.bottomRow}>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>${product.price}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>${product.originalPrice}</span>
            )}
          </div>
          
          <button 
            className={styles.addToBasketBtn}
            onClick={handleAddToCart}
            disabled={isInCart || product.stock === 0 || cartLoading}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartLoading ? 'Adding...' : isInCart ? 'In Cart' : product.stock === 0 ? 'Out of Stock' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;