'use client';
import React from "react";
import Image from "next/image";
import Navbar from "@/app/components/features/Navbar/Navbar";
import Carousel from "./components/features/Carousel/Carousle";
import TransparentImageCard from "./components/features/Transparent ImageCard/TransparentImageCard";
import ProductCard from "./components/features/ProductCard/ProductCard";

const handleCardClick = (text: string) => {
  alert(text)
}

export default function Home() {
  
  const handleAddToBasket = (product: any) => {
    console.log('Adding to basket:', product);
    // Add your basket logic here
  };

  return (
    <div>
      <Navbar />
      {/* <Carousel
          slides={slides}
          height="500px"
        /> */}
      {/* <TransparentImageCard
        backgroundImage="https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        title="Exclusive Shoes"
        subtitle="PRICE 20% OFF"
        width="350px"
        height="450px"
        onClick={() => handleCardClick('Exclusive Shoes')}
      /> */}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        padding: '24px'
      }}>
        <ProductCard
          imageSrc="/path-to-your-image.jpg"
          imageAlt="Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse"
          title="Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse"
          currentPrice="90.00"
          originalPrice="100.00"
          onAddToBasket={() => handleAddToBasket({
            title: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
            price: 90.00
          })}
        />
      </div>


    </div>

  );
}