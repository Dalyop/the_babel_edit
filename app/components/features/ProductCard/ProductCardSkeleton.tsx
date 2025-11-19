'use client';

import React from 'react';
import Skeleton from '@/app/components/ui/Skeleton/Skeleton';
import styles from './ProductCard.module.css';

const ProductCardSkeleton = () => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <Skeleton className="h-full w-full" />
      </div>
      <div className={styles.cardContent}>
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/4 mt-2" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;