'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Search, User, Heart, Star, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';

interface Feedback {
  id: string;
  message: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  } | null;
}

// Your original components would be imported here
import NavbarWithSuspense from '@/app/components/features/Navbar/NavbarWithSuspense'
import Carousel from '@/app/components/features/Carousel/Carousel';
import FeedbackCarousel from '@/app/components/features/FeedbackCarousel/FeedbackCarousel';
import Footer from '@/app/components/features/Footer/Footer';
import { useProductStore, useCartStore, useWishlistStore, Product } from '@/app/store';
import { useAuth } from '@/app/context/AuthContext';
import { apiRequest, API_ENDPOINTS } from '@/app/lib/api';

const TextDivider = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center py-8">
    <div className="flex-grow h-px bg-gray-300"></div>
    <h2 className="mx-8 text-2xl md:text-3xl font-bold text-gray-900">{text}</h2>
    <div className="flex-grow h-px bg-gray-300"></div>
  </div>
);

const TransparentImageCard = ({ backgroundImage, title, subtitle, description, className }: {
  backgroundImage: string;
  title: string;
  subtitle: string;
  description: string;
  className: string;
}) => (
  <div className={`relative group overflow-hidden rounded-xl ${className}`}>
    <Image
      src={backgroundImage}
      alt={title}
      layout="fill"
      objectFit="cover"
      className="group-hover:scale-105 transition-transform duration-300"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end">
      <div className="w-full h-24 md:h-28 p-6 text-white bg-white/10 backdrop-blur-md backdrop-saturate-150 border-t border-white/20 flex flex-col justify-center">
        <h3 className="text-xl md:text-2xl font-bold mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm opacity-90 line-clamp-2">{description}</p>
      </div>
    </div>
  </div>
);

// Square Product Card specifically for "Popular This Week" section
const SquareProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || 'en';

  const isProductInWishlist = isInWishlist(product.id);
  const isProductInCart = useCartStore(state => state.isInCart(product.id));

  const handleProductClick = () => {
    router.push(`/${locale}/products/${product.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to add items to cart', {
        duration: 3000,
        position: 'top-right',
      });
      router.push(`/${locale}/auth/login`);
      return;
    }

    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart!`, {
        duration: 3000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart. Please try again.', {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is authenticated
    if (!user) {
      toast.error('Please sign in to add items to wishlist', {
        duration: 3000,
        position: 'top-right',
      });
      router.push(`/${locale}/auth/login`);
      return;
    }

    try {
      if (isProductInWishlist) {
        await removeFromWishlist(product.id);
        toast.success(`${product.name} removed from wishlist`, {
          duration: 2000,
        });
      } else {
        await addToWishlist(product.id);
        toast.success(`${product.name} added to wishlist!`, {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      toast.error(`Failed to ${isProductInWishlist ? 'remove from' : 'add to'} wishlist`, {
        duration: 3000,
      });
    }
  };

  return (
    <div
      className="flex-shrink-0 w-72 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleProductClick}
    >
      {/* Square Image Container */}
      <div className="relative w-full h-72 overflow-hidden">
        <Image
          src={product.imageUrl || product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          layout="fill"
          objectFit="cover"
        />
        {product.isActive && product.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold">
            -{product.discountPercentage}%
          </div>
        )}
        {product.isFeatured && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
            Featured
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 right-3 bg-white bg-opacity-90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-lg"
        >
          <Heart className={`w-4 h-4 ${isProductInWishlist ? 'fill-pink-500 text-pink-500' : 'text-gray-700'}`} />
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isProductInCart}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-5 h-5 text-gray-900" />
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
            {product.name}
          </h3>
          {product.collection && (
            <p className="text-xs text-gray-500">{product.collection.name}</p>
          )}
        </div>

        {/* Rating */}
        {product.avgRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-gray-600">{product.avgRating}</span>
            <span className="text-xs text-gray-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-lg">
            ${product.price}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              ${product.comparePrice}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {/* <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          product.isInStock 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.isInStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div> */}
      </div>
    </div>
  );
}
const ArrowButton = ({ direction, onClick, className }: {
  direction: 'left' | 'right';
  onClick: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow ${direction === 'left' ? 'left-4' : 'right-4'
      } ${className}`}
  >
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={direction === 'left' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
      />
    </svg>
  </button>
);

function Dashboard() {
  const params = useParams();
  const locale = (params.locale as string) || 'en';

  // Store integration
  const {
    fetchFeaturedProducts,
    fetchProducts,
    featuredProducts,
    products,
    loading,
    error
  } = useProductStore();

  // Additional state for collections/categories
  const [collections, setCollections] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [featuredFeedbacks, setFeaturedFeedbacks] = useState<Feedback[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products from backend
    fetchFeaturedProducts(8); // Get 8 featured products

    // Fetch collections for the highlight cards
    fetchCollections();

    // Fetch hero carousel data
    fetchHeroData();
  }, []);

  useEffect(() => {
    const fetchFeaturedFeedbacks = async () => {
      try {
        const data = await apiRequest<Feedback[]>(API_ENDPOINTS.FEEDBACK.FEATURED);
        setFeaturedFeedbacks(data);
      } catch (error) {
        console.error('Failed to fetch featured feedbacks:', error);
      } finally {
        setFeedbacksLoading(false);
      }
    };
    fetchFeaturedFeedbacks();
  }, []);

  // Fetch collections for the highlight section
  const fetchCollections = async () => {
    try {
      const response = await apiRequest<any>('/collections');
      setCollections(response.collections || response || []);
    } catch (error) {
      console.warn('Backend not available, using fallback collections:');
      // Set empty collections array so the page still renders with default cards
      setCollections([]);
    }
  };

  const fetchHeroData = async () => {
    // For now, using default slides, create an API endpoint for this later Isaac
    const defaultSlides = [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
        alt: 'Fashion Collection',
        description: 'Discover the latest fashion trends'
      },
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop',
        alt: 'Luxury Shopping',
        description: 'Experience luxury like never before'
      },
      {
        id: '3',
        image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=600&fit=crop',
        alt: 'Summer Collection',
        description: 'New summer arrivals are here'
      },
      {
        id: '4',
        image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=1200&h=600&fit=crop',
        alt: 'Forest path with tall trees',
        description: 'Walk through ancient forests and connect with nature'
      }
    ];
    setHeroSlides(defaultSlides);
  };

  // Your original translation function
  const t = (key: string, vars?: { [key: string]: string | number }) => {
    const translations: { [locale: string]: { [key: string]: string } } = {
      en: {
        thisWeeksHighlight: "This Week's Highlight",
        exclusiveShoes: "Exclusive Collection",
        exquisiteStyles: "Exquisite Styles",
        priceOff: `Special Offer ${vars?.percent || 20}% off`,
        popularThisWeek: "Popular This Week",
        brandsForYou: "Brands For You",
        newArrivals: "New Arrivals",
        exclusiveItems: "Exclusive Items"
      }
    };
    let str = translations[locale]?.[key] || translations['en'][key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{{${k}}}`, String(v));
      });
    }
    return str;
  };

  const productsWrapperRef = useRef<HTMLDivElement>(null);
  const [currentPosition, setCurrentPosition] = useState(0);

  const scrollProducts = (direction: 'left' | 'right') => {
    if (!productsWrapperRef.current) return;

    const cardWidth = 288; // Width of square cards (w-72 = 18rem = 288px)
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

  // Create highlight cards from collections
  const getHighlightCards = () => {
    const defaultCards = [
      {
        title: t('exclusiveShoes'),
        description: t('priceOff', { percent: 20 }),
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop'
      },
      {
        title: t('exquisiteStyles'),
        description: t('priceOff', { percent: 15 }),
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&h=500&fit=crop'
      },
      {
        title: t('newArrivals'),
        description: t('priceOff', { percent: 25 }),
        image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop'
      },
      {
        title: t('exclusiveItems'),
        description: t('priceOff', { percent: 30 }),
        image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop'
      }
    ];

    // If we have collections from API, use them
    if (collections.length > 0) {
      return collections.slice(0, 4).map((collection, index) => ({
        title: collection.name || defaultCards[index]?.title,
        description: collection.description || defaultCards[index]?.description,
        image: collection.imageUrl || defaultCards[index]?.image
      }));
    }

    return defaultCards;
  };

  const highlightCards = getHighlightCards();

  return (
    <div className="min-h-screen">
      <header>
        <NavbarWithSuspense />
      </header>

      <section>
        <Carousel
          slides={heroSlides}
          height="500px"
        />
      </section>

      <TextDivider text={t('thisWeeksHighlight')} />

      <section className="py-8 px-4 max-w-7xl mx-auto">
        {/* Desktop: Your original asymmetric layout, Mobile: 2-column grid */}
        <article className="hidden md:flex justify-center gap-4 mb-4">
          <TransparentImageCard
            backgroundImage={highlightCards[0]?.image}
            title={highlightCards[0]?.title}
            subtitle={highlightCards[0]?.title}
            description={highlightCards[0]?.description}
            className="flex-[0_0_30%] min-w-[250px] h-96"
          />
          <TransparentImageCard
            backgroundImage={highlightCards[1]?.image}
            title={highlightCards[1]?.title}
            subtitle={highlightCards[1]?.title}
            description={highlightCards[1]?.description}
            className="flex-[0_0_60%] min-w-[250px] h-96"
          />
        </article>

        <article className="hidden md:flex justify-center gap-4">
          <TransparentImageCard
            backgroundImage={highlightCards[2]?.image}
            title={highlightCards[2]?.title}
            subtitle={highlightCards[2]?.title}
            description={highlightCards[2]?.description}
            className="flex-[0_0_60%] min-w-[250px] h-96"
          />
          <TransparentImageCard
            backgroundImage={highlightCards[3]?.image}
            title={highlightCards[3]?.title}
            subtitle={highlightCards[3]?.title}
            description={highlightCards[3]?.description}
            className="flex-[0_0_30%] min-w-[250px] h-96"
          />
        </article>

        {/* Mobile: 2x2 Grid */}
        <div className="md:hidden grid grid-cols-2 gap-4">
          {highlightCards.map((card, index) => (
            <TransparentImageCard
              key={index}
              backgroundImage={card.image}
              title={card.title}
              subtitle={card.title}
              description={card.description}
              className="h-64"
            />
          ))}
        </div>
      </section>

      <TextDivider text={t('popularThisWeek')} />

      <section className="py-12 bg-gray-50 relative max-w-full">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop: Arrow navigation */}
          <ArrowButton
            direction="left"
            onClick={() => scrollProducts('left')}
            className={`hidden md:flex ${currentPosition === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          />

          {/* Products Container */}
          <div className="overflow-x-auto md:overflow-hidden px-4 md:px-16">
            <div
              ref={productsWrapperRef}
              className="flex gap-6 md:transition-transform md:duration-300 ease-in-out pb-4"
              style={{
                transform: typeof window !== 'undefined' && window.innerWidth >= 768
                  ? `translateX(${currentPosition}px)`
                  : 'none'
              }}
            >
              {loading ? (
                // Loading skeleton cards - Square shaped
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-72 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="w-72 h-72 bg-gray-200 animate-pulse" />
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 animate-pulse rounded mb-2" />
                      <div className="h-3 bg-gray-200 animate-pulse rounded mb-2" />
                      <div className="h-5 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : error ? (
                // Error state
                <div className="flex flex-col items-center justify-center py-16 px-4 w-full">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-red-700 mb-2">Unable to Load Products</h3>
                  <p className="text-gray-600 text-center max-w-md mb-4">
                    {error.includes('Failed to fetch') ?
                      'Unable to connect to backend. Make sure your backend server is running.' :
                      error
                    }
                  </p>
                  {/* <div className="text-sm text-gray-500 mb-4">
                    Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
                  </div> */}
                  <button
                    onClick={() => fetchFeaturedProducts(8, true)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : featuredProducts.length > 0 ? (
                // Real products from backend - Using square cards
                featuredProducts.filter(p => p.stock > 0).map((product) => (
                  <SquareProductCard key={product.id} product={product} />
                ))
              ) : (
                // Empty state when no products
                <div className="flex flex-col items-center justify-center py-16 px-4 w-full">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Featured Products</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    No featured products available at the moment. Check back later or browse our full catalog.
                  </p>
                  <button
                    onClick={() => fetchFeaturedProducts(8, true)}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Products
                  </button>
                </div>
              )}
            </div>
          </div>

          <ArrowButton
            direction="right"
            onClick={() => scrollProducts('right')}
            className={`hidden md:flex ${currentPosition <= -(productsWrapperRef.current?.scrollWidth || 0) +
                (productsWrapperRef.current?.parentElement?.clientWidth || 0)
                ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          />
        </div>
      </section>

      <TextDivider text={t('brandsForYou')} />

      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 items-center">
          {[
            { name: "Nike", src: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png" },
            { name: "Adidas", src: "https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png" },
            { name: "Gucci", src: "https://logos-world.net/wp-content/uploads/2020/04/Gucci-Logo.png" },
            { name: "Louis Vuitton", src: "https://logos-world.net/wp-content/uploads/2020/04/Louis-Vuitton-Logo.png" },
            { name: "Zara", src: "https://logos-world.net/wp-content/uploads/2020/05/Zara-Logo-700x394.png" },
            { name: "H&M", src: "https://logos-world.net/wp-content/uploads/2020/04/HM-Logo-700x394.png" },
            { name: "Puma", src: "https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png" },
            { name: "Uniqlo", src: "https://logos-world.net/wp-content/uploads/2023/01/Uniqlo-Logo-500x281.png" },
            { name: "Chanel", src: "https://www.stickpng.com/img/icons-logos-emojis/iconic-brands/chanel-logo-transparent-png" },
            { name: "Prada", src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Prada.png" },
            { name: "Dior", src: "https://www.stickpng.com/assets/images/icons/iconic-brands/dior-logo.png" },
            { name: "Versace", src: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Versace_logo.svg" },
            { name: "Balenciaga", src: "https://logowik.com/content/uploads/images/balenciaga5106.jpg" },
            { name: "Fendi", src: "https://www.citypng.com/public/uploads/preview/-11594957117gcn10p5y5q.png" },
            { name: "Burberry", src: "https://static.cdnlogo.com/logos/b/6/burberry.svg" },
            { name: "Hermes", src: "https://logo-teka.com/wp-content/uploads/2025/07/hermes-logo.png" },
          ].map((brand, index) => (
            <div key={index} className="flex items-center justify-center p-4 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 group">
              <img
                src={brand.src}
                alt={brand.name}
                className="h-6 md:h-8 w-auto object-contain opacity-60 group-hover:opacity-90 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 30"><rect width="80" height="30" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1" rx="4"/><text x="40" y="20" font-family="Arial, sans-serif" font-size="10" fill="#6b7280" text-anchor="middle">${brand.name}</text></svg>`)}`;
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <TextDivider text="Share Your Thoughts" />
      <section className="py-8 px-4 max-w-7xl mx-auto text-center">
        <p className="text-lg text-gray-600 mb-6 text-center">
          Your feedback helps us grow! Share your suggestions, report issues, or simply say hello.
        </p>
        <Link href={`/${locale}/account?tab=feedback`}>
          <Button className="px-8 py-3 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300">
            <MessageSquarePlus className="mr-3 h-5 w-5" />
            Leave Feedback
          </Button>
        </Link>
      </section>

      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div
          className="relative min-h-[400px] md:min-h-[500px] bg-cover bg-center rounded-2xl overflow-hidden"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop&crop=center')`
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="relative h-full flex items-center justify-center md:justify-start">
            <div className="text-center md:text-left bg-black bg-opacity-50 p-8 md:p-12 rounded-2xl m-6 max-w-md">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">SUMMER COLLECTIONS</h2>
              <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors mb-8">
                SHOP NOW &rarr;
              </button>
              <div className="flex justify-center md:justify-start items-center space-x-4 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">07</div>
                  <div className="text-sm opacity-80">Days</div>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">08</div>
                  <div className="text-sm opacity-80">Hours</div>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">04</div>
                  <div className="text-sm opacity-80">Minutes</div>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="text-center">
                  <div className="text-2xl font-bold">05</div>
                  <div className="text-sm opacity-80">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <p className="text-pink-600 font-script text-xl mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">THEY SAYS</h2>
            <p className="text-gray-500 text-sm tracking-wider">OUR HAPPY CLIENTS</p>
          </div>
          {feedbacksLoading ? (
            <div>Loading testimonials...</div>
          ) : featuredFeedbacks.length > 0 ? (
            <FeedbackCarousel feedbacks={featuredFeedbacks} />
          ) : (
            <p>No testimonials yet.</p>
          )}
        </div>
      </section>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Dashboard;
