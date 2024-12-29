import React, { ReactNode } from 'react';
import Card from './srcl/Card';
import MatrixLoader from './srcl/MatrixLoader';
import ButtonLink from './ButtonLink';
import { WikiGraph, WikiNode } from '../utils/wiki-types';

interface WikiPageProps {
  currentNodeId: string;
  loading: boolean;
  onLinkClick: (nodeId: string) => void;
  graph: WikiGraph;
}

const WikiPage: React.FC<WikiPageProps> = ({ 
  currentNodeId,
  loading,
  onLinkClick,
  graph 
}) => {

  const currentNode = graph.getNode(currentNodeId)

  const renderContent = () => {
    if (!currentNode.content) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<root>${currentNode.content}</root>`, 'text/xml');
    const root = doc.documentElement;
    
    const processNode = (node: Node): ReactNode[] => {
      const children: ReactNode[] = [];
      
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        
        if (child.nodeType === Node.TEXT_NODE) {
          // Text node
          children.push(<span key={i}>{child.textContent}</span>);
        } else if (child.nodeName === 'link' && child instanceof Element) {
          // Link node - using type assertion after checking nodeName
          const target = child.getAttribute('to');
          if (target) {
            children.push(
              <ButtonLink
                key={i}
                onClick={() => onLinkClick(target)}
              >
                {child.textContent}
              </ButtonLink>
            );
          }
        }
      }
      
      return children;
    };
  
    return processNode(root);
  };

  return (
    <div className="max-w-2xl w-full mx-auto space-y-8 pt-24">   
        <h1 className="text-4xl sm:font-bold text-center">{currentNode.title}</h1>
        
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