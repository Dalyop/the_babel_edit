import React, { useState } from 'react';
import Image from 'next/image';
import styles from './ProductImageGallery.module.css';

interface ProductImageGalleryProps {
  images: { src: string; alt: string }[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div className={styles.galleryWrapper}>
      <div className={styles.thumbnails}>
        {images.map((img, idx) => (
          <div
            key={img.src}
            className={`${styles.thumbnail} ${idx === selectedIdx ? styles.active : ''}`}
            onClick={() => setSelectedIdx(idx)}
          >
            <Image src={img.src} alt={img.alt} width={60} height={80} className={styles.thumbImg} />
          </div>
        ))}
      </div>
      <div className={styles.mainImage}>
        <Image src={images[selectedIdx].src} alt={images[selectedIdx].alt} width={350} height={420} className={styles.mainImg} />
      </div>
    </div>
  );
};

export default ProductImageGallery; 