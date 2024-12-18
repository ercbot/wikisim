import { useEffect, useState } from 'react'
import WikiPage from './components/WikiPage'
import RecentPages from './components/RecentPages'
import WorldPrompt from './components/WorldPrompt'
import Card from './components/srcl/Card'
import WikiGraph from './components/WikiGraph'

import { generateNewPage, generateInitialPage, QuotaExceededError } from './utils/wikiGenerator'
import ActionButton from './components/srcl/ActionButton'
import { WikiGraphData, WikiNode } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pages, setPages] = useState<WikiGraphData>({});
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    document.body.classList.add('theme-light');
  }, []);

  const handlePageChange = (topic: string) => {
    setRecentPages(prevRecent => {
      const newRecent = [currentPage, ...prevRecent.filter(p => p !== currentPage)].slice(0, 5);
      return newRecent;
    });
    setCurrentPage(topic);
  };

  const extractLinks = (content: string): string[] => {
    const linkRegex = /<link>(.*?)<\/link>/g;
    const matches = [...content.matchAll(linkRegex)];
    return matches.map(match => 
      match[1].split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    );
  };

  const handleGenerateNewPage = async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      handlePageChange(topic);
      const content = await generateNewPage(topic, recentPages, pages, initialPrompt);
      const outlinks = extractLinks(content);
      
      setPages(prevPages => ({
        ...prevPages,
        [topic]: {
          topic,
          content,
          outlinks,
        },
      }));
    } catch (error) {
      console.error('Error generating page:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleWorldPromptSubmit = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      setInitialPrompt(prompt);
      const { title, content } = await generateInitialPage(prompt);
      const outlinks = extractLinks(content);
      
      setPages({
        [title]: {
          topic: title,
          content,
          outlinks,
        },
      });
      setCurrentPage(title);
    } catch (error) {
      console.error('Error generating initial page:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleExampleSelect = (title: string, content: string) => {
    const outlinks = extractLinks(content);
    setPages({
      [title]: {
        topic: title,
        content,
        outlinks,
      },
    });
    setCurrentPage(title);
  };

  const handleReset = () => {
    setCurrentPage('');
    setPages({});
    setRecentPages([]);
    setInitialPrompt('');
    setShowGraph(false);
  };

  return (
    <div className="relative min-h-screen">
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="bg-red-50">
            <div className="text-red-700 flex items-center gap-2">
              <div>
                {error instanceof QuotaExceededError 
                  ? "API quota exceeded. Please try again later."
                  : "An error occurred. Please try again."}
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="z-40 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <img 
            src="/logo.svg" 
            alt="logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={handleReset}
          />
          {recentPages.length > 0 && (
            <RecentPages 
              recentPages={recentPages}
              onPageClick={handlePageChange}
            />
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pt-12">
        <div className='max-h-[calc(100vh-12rem)] overflow-y-auto'>
          {Object.keys(pages).length === 0 ? (
            <WorldPrompt 
              onSubmit={handleWorldPromptSubmit} 
              onExampleSelect={handleExampleSelect}
              loading={loading}
            />
          ) : (
            <>
              {/* Show either WikiPage or WikiGraph based on showGraph state */}
              {showGraph ? (
                <div className="h-[calc(100vh-12rem)]">
                  <WikiGraph
                    pages={pages}
                    currentPage={currentPage}
                    onNodeClick={handlePageChange}
                  />
                </div>
              ) : (
                <WikiPage 
                  currentTopic={currentPage}
                  content={pages[currentPage]?.content ?? ''}
                  loading={loading}
                  onPageChange={handlePageChange}
                  onGenerateNewPage={handleGenerateNewPage}
                  pages={pages}
                />
              )}
              
              {/* Navigation Controls */}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
                <ActionButton
                  onClick={() => setShowGraph(prev => !prev)}
                >
                  {showGraph ? 'Show Page' : 'Show Graph'}
                </ActionButton>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
