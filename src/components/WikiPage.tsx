import React from 'react';
import Card from './srcl/Card';
import MatrixLoader from './srcl/MatrixLoader';
import ButtonLink from './ButtonLink';

interface WikiPageProps {
  currentTopic: string;
  pages: { [key: string]: string };
  loading: boolean;
  onPageChange: (topic: string) => void;
  onGenerateNewPage: (topic: string) => void;
}

const WikiPage: React.FC<WikiPageProps> = ({ 
  currentTopic, 
  pages, 
  loading,
  onPageChange, 
  onGenerateNewPage 
}) => {
  const handleLinkClick = (topic: string) => {
    if (pages[topic]) {
      onPageChange(topic);
    } else {
      onGenerateNewPage(topic);
    }
  };

  const renderContent = () => {
    if (!pages[currentTopic]) return null;

    const parts = pages[currentTopic].split(/(<link>.*?<\/link>)/);
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