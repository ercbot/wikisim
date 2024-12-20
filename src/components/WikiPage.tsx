import React from 'react';
import Card from './srcl/Card';
import MatrixLoader from './srcl/MatrixLoader';
import ButtonLink from './ButtonLink';
import { WikiGraphData } from '../types';

interface WikiPageProps {
  currentTopic: string;
  content: string;
  loading: boolean;
  onPageChange: (topic: string) => void;
  onGenerateNewPage: (topic: string) => void;
  pages: WikiGraphData;
}

const WikiPage: React.FC<WikiPageProps> = ({ 
  currentTopic, 
  content, 
  loading,
  onPageChange, 
  onGenerateNewPage,
  pages 
}) => {
  const handleLinkClick = (topic: string) => {
    // Convert topic to Title Case
    const titleCaseTopic = topic.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    console.log('Link clicked:', titleCaseTopic);
    if (pages[titleCaseTopic]?.content) {
      console.log('Navigating to existing page');
      onPageChange(titleCaseTopic);
    } else {
      console.log('Generating new page');
      onGenerateNewPage(titleCaseTopic);
    }
  };

  const renderContent = () => {
    if (!content) return null;

    const parts = content.split(/(<link>.*?<\/link>)/);
    return parts.map((part, index) => {
      if (part.startsWith('<link>') && part.endsWith('</link>')) {
        const term = part.replace('<link>', '').replace('</link>', '');
        return (
          <ButtonLink
            key={index}
            onClick={() => handleLinkClick(term)}
          >
            {term}
          </ButtonLink>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8 pt-24">
      
        <h1 className="text-4xl font-bold text-center">{currentTopic}</h1>
        
        {loading ? (
            <MatrixLoader rows={15}/>
        ) : (
          <Card>
            <div>
              <p>{renderContent()}</p>
            </div>
          </Card>
        )}

    </div>
  );
};

export default WikiPage;