import React, { useState, useRef, useEffect } from 'react';
import ButtonLink from './ButtonLink';

interface Example {
  title: string;
  onClick: () => void;
}

interface ExamplesCarouselProps {
  examples: Example[];
}

const ExamplesCarousel: React.FC<ExamplesCarouselProps> = ({ examples }) => {
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const scrollPositionRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const scroll = scrollRef.current;
    let animationFrameId: number;

    const animate = (timestamp: number): void => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isHovered && scroll) {
        scrollPositionRef.current += (deltaTime * 0.05);
        
        const halfWidth = scroll.scrollWidth / 2;
        if (scrollPositionRef.current >= halfWidth) {
          scrollPositionRef.current = 0;
          scroll.scrollLeft = 0;
        }
        
        scroll.scrollLeft = scrollPositionRef.current;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isHovered]);

  const handleScroll = (): void => {
    if (scrollRef.current) {
      const scroll = scrollRef.current;
      const halfWidth = scroll.scrollWidth / 2;
      
      if (scroll.scrollLeft >= halfWidth) {
        scrollPositionRef.current = 0;
        scroll.scrollLeft = 0;
      } else {
        scrollPositionRef.current = scroll.scrollLeft;
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
             style={{
               background: `linear-gradient(to right, var(--theme-background), transparent)`
             }} />
        
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
             style={{
               background: `linear-gradient(to left, var(--theme-background), transparent)`
             }} />
        
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onScroll={handleScroll}
          className="overflow-x-hidden whitespace-nowrap relative"
        >
          <div className="inline-flex gap-4 pb-4">
            {examples.map((example, index) => (
              <ButtonLink
                key={`first-${index}`}
                onClick={example.onClick}
              >
                {example.title}
              </ButtonLink>
            ))}
            {examples.map((example, index) => (
              <ButtonLink
                key={`second-${index}`}
                onClick={example.onClick}
              >
                {example.title}
              </ButtonLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamplesCarousel;