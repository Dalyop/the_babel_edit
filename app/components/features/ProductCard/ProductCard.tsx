import React from 'react';
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
    border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm
    transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:border-blue-200
    w-full h-full flex flex-col
    ${variant === 'small' ? 'max-w-[180px] md:max-w-full' : ''}
    ${isOutOfStock ? 'grayscale opacity-60 pointer-events-none' : ''} 
    ${className}
  `;
  const imageContainerClasses = `
    relative w-full overflow-hidden
    ${variant === 'small' ? 'h-40 md:h-32' : 'h-60 md:h-52'}
    ${imageContainerClassName}
  `;
  const imageClasses = "object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out";

  return (
    <div className={cardClasses.trim()}>
      <div className={`${imageContainerClasses.trim()} group`}>
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
              className={imageClasses}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        </Link>
      </div>
      
      <div className="p-3 md:p-4 flex flex-col gap-2 md:gap-3 flex-grow">
        <h3 className="text-xs md:text-sm font-medium text-gray-800 line-clamp-2 min-h-[28px] md:min-h-[32px]">
            {product.name}
        </h3>
        
        {/* Rating if available */}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
            <span>⭐</span>
            <span>{product.avgRating}</span>
            {product.reviewCount > 0 && <span>({product.reviewCount})</span>}
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm md:text-base font-semibold text-blue-600">${product.price}</span>
            {product.comparePrice && (
              <span className="text-xs md:text-sm text-gray-400 line-through">${product.comparePrice}</span>
            )}
          </div>
          
          <button 
            className="flex-shrink-0 bg-blue-600 text-white border-none rounded-md p-2 text-xs font-medium cursor-pointer transition-all duration-300 ease-in-out
                       flex items-center justify-center gap-2 whitespace-nowrap h-8
                       hover:bg-blue-700 hover:-translate-y-px hover:shadow-md
                       disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            onClick={handleAddToCart}
            disabled={isInCart || isOutOfStock || isAddingToCart}
          >
            <ShoppingCart className="h-3 w-3 md:h-4 md:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;