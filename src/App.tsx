import { useEffect, useState } from 'react'
import WikiPage from './components/WikiPage'
import RecentPages from './components/RecentPages'
import WorldPrompt from './components/WorldPrompt'
import Card from './components/srcl/Card'

import { generateNewPage, generateInitialPage, QuotaExceededError } from './utils/wikiGenerator'

function App() {
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pages, setPages] = useState<{ [key: string]: string }>({});
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  const handleGenerateNewPage = async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      handlePageChange(topic);
      const newPageContent = await generateNewPage(topic, pages);
      setPages(prevPages => ({
        ...prevPages,
        [topic]: newPageContent,
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
      const { title, content } = await generateInitialPage(prompt);
      setPages({ [title]: content });
      setCurrentPage(title);
    } catch (error) {
      console.error('Error generating initial page:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleExampleSelect = (title: string, content: string) => {
    setPages({ [title]: content });
    setCurrentPage(title);
  };

  const handleReset = () => {
    setCurrentPage('');
    setPages({});
    setRecentPages([]);
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
          <WikiPage 
            currentTopic={currentPage}
            pages={pages}
            loading={loading}
            onPageChange={handlePageChange}
            onGenerateNewPage={handleGenerateNewPage}
          />
        )}
        </div>
      </main>
    </div>
  )
}

export default App
