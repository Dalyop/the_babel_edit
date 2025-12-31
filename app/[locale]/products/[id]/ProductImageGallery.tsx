import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ProductImageGallery.module.css';

interface ProductImageGalleryProps {
  images: { src: string; alt: string }[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6">
      <div className="flex flex-row md:flex-col gap-4 overflow-x-auto">
        {images.map((img, idx) => (
          <div
            key={img.src}
            className={`${styles.thumbnail} ${idx === selectedIdx ? styles.active : ''} flex-shrink-0`}
            onClick={() => setSelectedIdx(idx)}
          >
            <Image src={img.src} alt={img.alt} width={60} height={80} className={styles.thumbImg} />
          </div>
        ))}
      </div>
      <div className={styles.mainImage}>
        <Image 
          src={images[selectedIdx].src} 
          alt={images[selectedIdx].alt} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.mainImg} 
        />
      </div>
    </div>
  );
};

export default ProductImageGallery; 