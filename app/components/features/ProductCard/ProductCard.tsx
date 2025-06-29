import React from 'react';
import styles from './ProductCard.module.css';
import Image from 'next/image';

interface ProductCardProps {
    imageSrc: string;
    imageAlt: string;
    title: string;
    currentPrice: number | string;
    originalPrice: number | string;
    onAddToBasket: () => void;
    className?: string;
    imageContainerClassName?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  imageSrc,
  imageAlt,
  title,
  currentPrice,
  originalPrice,
  onAddToBasket,
  className = '',
  imageContainerClassName = '',
}) => {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={`${styles.imageContainer} ${imageContainerClassName}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.bottomRow}>
          <div className={styles.priceContainer}>
            <span className={styles.currentPrice}>${currentPrice}</span>
            {originalPrice && (
              <span className={styles.originalPrice}>${originalPrice}</span>
            )}
          </div>
          
          <button 
            className={styles.addToBasketBtn}
            onClick={onAddToBasket}
          >
            🛒 Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;