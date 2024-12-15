import React from 'react';
import Card from './srcl/Card';
import MatrixLoader from './srcl/MatrixLoader';
import styles from './WikiPage.module.scss';

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
          <button
            key={index}
            onClick={() => handleLinkClick(term)}
            className={styles.buttonLink}
          >
            {term}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center max-w-screen-md mx-auto p-1 gap-5">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 className='text-4xl font-bold'>{currentTopic}</h1>
        <div/>
      </div>

      <Card className='w-full'>
        <div>
          {loading ? (
            <MatrixLoader rows={10} direction="left-to-right"/>
          ) : (
            <p>{renderContent()}</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WikiPage;