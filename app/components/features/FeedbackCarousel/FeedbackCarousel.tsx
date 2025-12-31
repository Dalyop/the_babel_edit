'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface Feedback {
  id: string;
  message: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  } | null;
}

interface FeedbackCarouselProps {
  feedbacks: Feedback[];
}

const FeedbackCarousel: React.FC<FeedbackCarouselProps> = ({ feedbacks }) => {
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
          {feedbacks.map((feedback) => (
            <div className="flex-[0_0_100%] min-w-0 p-4" key={feedback.id}>
              <div className="p-8 text-center h-full flex flex-col justify-center items-center">
                <p className="italic text-gray-600 mb-6 text-lg leading-relaxed">"{feedback.message}"</p>
                <div className="flex items-center justify-center">
                  <img
                    src={feedback.user?.avatar || '/images/babel_logo_black.jpg'}
                    alt={feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}'s avatar` : 'Anonymous user avatar'}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div className="font-semibold text-gray-800">
                    {feedback.user ? `${feedback.user.firstName} ${feedback.user.lastName}` : 'Anonymous'}
                  </div>
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

export default FeedbackCarousel;
