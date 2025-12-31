import React, { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: { src: string; alt: string }[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Handle case with no images gracefully
  if (!images || images.length === 0) {
    return (
      <div className="border-2 border-gray-200 rounded-lg bg-white w-full aspect-[350/420] flex items-center justify-center">
        <p className="text-gray-500">No image available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-6">
      <div className="flex flex-row md:flex-col gap-4 overflow-x-auto">
        {images.map((img, idx) => (
          <div
            key={img.src + idx}
            className={`border-2 rounded-md overflow-hidden cursor-pointer transition-colors duration-200 w-[60px] h-[80px] bg-white flex-shrink-0 ${
              idx === selectedIdx ? 'border-blue-600' : 'border-transparent'
            }`}
            onClick={() => setSelectedIdx(idx)}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={60}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white w-full aspect-[350/420] relative">
        <Image 
          src={images[selectedIdx].src} 
          alt={images[selectedIdx].alt} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover" 
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;
 