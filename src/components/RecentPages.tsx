import React from 'react';
import ButtonLink from './ButtonLink';

interface RecentPagesProps {
  recentPages: string[];
  onPageClick: (topic: string) => void;
}

const RecentPages: React.FC<RecentPagesProps> = ({ recentPages, onPageClick }) => {
    const reversedPages = [...recentPages].reverse();
  
    // Calculate opacity based on position and total length
    const opacity = (index: number) => {
        const length = reversedPages.length;
        return 0.4 + 0.6 * ((index + 1) / length);
    };

  return (
    <div>
      {reversedPages.map((page_topic, index) => (
        <span key={page_topic} style={{ opacity: opacity(index) }}>
          <ButtonLink
            onClick={() => onPageClick(page_topic)}
          >
            {page_topic}
          </ButtonLink>
          {index < recentPages.length - 1 && ' > '}
        </span>
      ))}
    </div>
  );
};

export default RecentPages;
