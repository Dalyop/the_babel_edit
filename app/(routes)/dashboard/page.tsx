'use client';

import React, { useRef, useState } from 'react'
import styles from './dashboard.module.css';
import Navbar from '@/app/components/features/Navbar/Navbar'
import Carousel from '@/app/components/features/Carousel/Carousel';
import TextDivider from '@/app/components/ui/TextDivider/TextDivider';
import TransparentImageCard from '@/app/components/features/Transparent ImageCard/TransparentImageCard';
import ProductCard from '@/app/components/features/ProductCard/ProductCard';
import ArrowButton from '@/app/components/ui/ArrowButton/ArrowButton';

function dashboard() {
    const productsWrapperRef = useRef<HTMLDivElement>(null);
    const [currentPosition, setCurrentPosition] = useState(0);

    const scrollProducts = (direction: 'left' | 'right') => {
        if (!productsWrapperRef.current) return;
        
        const cardWidth = 320; // Width of each card
        const gap = 24; // Gap between cards (1.5rem = 24px)
        const scrollAmount = cardWidth + gap;
        const containerWidth = productsWrapperRef.current.parentElement?.clientWidth || 0;
        const totalWidth = productsWrapperRef.current.scrollWidth;
        const maxScroll = -(totalWidth - containerWidth);
        
        if (direction === 'left') {
            setCurrentPosition(prev => Math.min(0, prev + scrollAmount));
        } else {
            setCurrentPosition(prev => Math.max(maxScroll, prev - scrollAmount));
        }
    };

    const slides = [
        {
            id: '1',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: 'Mountain landscape at sunset',
            description: 'Discover breathtaking mountain landscapes and hiking trails'
        },
        {
            id: '2',
            image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: 'Tropical beach with palm trees',
            description: 'Relax on pristine beaches with crystal clear waters'
        },
        {
            id: '3',
            image: 'https://plus.unsplash.com/premium_photo-1683121266311-04c92a01f5e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: 'City skyline at night',
            description: 'Experience the vibrant energy of metropolitan cities'
        },
        {
            id: '4',
            image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            alt: 'Forest path with tall trees',
            description: 'Walk through ancient forests and connect with nature'
        }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.navbar}>
                <Navbar />
            </header>
            <section className={styles.carousel}>
                <Carousel
                    slides={slides}
                    height="500px"
                />
            </section>
            <TextDivider
                text="This Weeks Highlight"
            />
            <section className={styles.section}>
                <article className={styles.cards}>
                    <TransparentImageCard
                        backgroundImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                        title="Exclusive Shoes"
                        subtitle="Exclusive Shoes"
                        description="Price 20% Off"
                        className={styles.card1}
                    />
                    <TransparentImageCard 
                        backgroundImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                        title="Exquisite Styles & Collection"
                        subtitle="Exquisite Styles & Collection"
                        description="Price 20% off"
                        className={styles.card2}
                    />
                </article>
                <article className={styles.cards}>
                    <TransparentImageCard
                        backgroundImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                        title="New Arrivals"
                        subtitle="New Arrivals"
                        description="Price 20% off"
                        className={styles.card2}
                    />
                    <TransparentImageCard 
                        backgroundImage="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                        title="Exclusive Items"
                        subtitle="Exclusive Items"
                        description="Price 20% off"
                        className={styles.card1}
                    />
                </article>
            </section>
            <TextDivider 
                text='Popular This Week'
            />

            <section className={styles.productsSection}>
                <ArrowButton 
                    direction="left" 
                    onClick={() => scrollProducts('left')}
                    className={currentPosition === 0 ? styles.hidden : ''}
                />
                <div className={styles.productsContainer}>
                    <div 
                        ref={productsWrapperRef}
                        className={styles.productsWrapper}
                        style={{ transform: `translateX(${currentPosition}px)` }}
                    >
                        <ProductCard 
                            imageSrc="https://images.unsplash.com/photo-1542291026-7eec264c27ff"
                            imageAlt="Red Nike Sneakers"
                            title="Nike Red Sneakers"
                            currentPrice={99.99}
                            originalPrice={129.99}
                            onAddToBasket={() => console.log('Added to basket')}
                        />
                        <ProductCard 
                            imageSrc="https://images.unsplash.com/photo-1608231387042-66d1773070a5"
                            imageAlt="Black Adidas Shoes"
                            title="Adidas Black Ultraboost"
                            currentPrice={149.99}
                            originalPrice={179.99}
                            onAddToBasket={() => console.log('Added to basket')}
                        />
                        <ProductCard 
                            imageSrc="https://images.unsplash.com/photo-1600269452121-4f2416e55c28"
                            imageAlt="White Puma Shoes"
                            title="Puma White Runner"
                            currentPrice={79.99}
                            originalPrice={99.99}
                            onAddToBasket={() => console.log('Added to basket')}
                        />
                        <ProductCard 
                            imageSrc="https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb"
                            imageAlt="Blue New Balance"
                            title="New Balance Blue Classic"
                            currentPrice={89.99}
                            originalPrice={119.99}
                            onAddToBasket={() => console.log('Added to basket')}
                        />
                        <ProductCard 
                            imageSrc="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"
                            imageAlt="Green Reebok"
                            title="Reebok Green Sport"
                            currentPrice={69.99}
                            originalPrice={89.99}
                            onAddToBasket={() => console.log('Added to basket')}
                        />
                    </div>
                </div>
                <ArrowButton 
                    direction="right" 
                    onClick={() => scrollProducts('right')}
                    className={currentPosition <= -(productsWrapperRef.current?.scrollWidth || 0) + (productsWrapperRef.current?.parentElement?.clientWidth || 0) ? styles.hidden : ''}
                />
            </section>
        </div>
    )
}

export default dashboard