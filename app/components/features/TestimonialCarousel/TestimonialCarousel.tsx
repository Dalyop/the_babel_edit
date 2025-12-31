'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  product: {
    name: string;
  };
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ testimonials }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
  }, [emblaApi, setScrollSnaps, onSelect]);

  return (
    <div className="overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial) => (
            <div className="flex-[0_0_100%] min-w-0 p-4" key={testimonial.id}>
              <div className="bg-white rounded-lg p-8 text-center shadow-lg h-full flex flex-col justify-center items-center">
                <p className="italic text-gray-600 mb-6 text-lg leading-relaxed">"{testimonial.comment}"</p>
                <img
                  src={testimonial.user.avatar || '/images/babel_logo_black.jpg'}
                  alt={`${testimonial.user.firstName} ${testimonial.user.lastName}'s avatar`}
                  className="w-16 h-16 rounded-full mb-4 object-cover"
                />
                <div className="font-semibold text-gray-800">
                  {testimonial.user.firstName} {testimonial.user.lastName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-4">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`bg-gray-300 border-0 rounded-full w-3 h-3 mx-1 cursor-pointer p-0 ${index === selectedIndex ? 'bg-gray-700' : ''}`}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
