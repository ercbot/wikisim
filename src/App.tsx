import { useEffect, useState } from 'react'
import WikiPage from './components/WikiPage'
import RecentPages from './components/RecentPages'
import WorldPrompt from './components/WorldPrompt'

import { generateNewPage, generateInitialPage } from './utils/wikiGenerator'

function App() {
  const [currentPage, setCurrentPage] = useState<string>('');
  const [pages, setPages] = useState<{ [key: string]: string }>({});
  const [recentPages, setRecentPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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
    try {
      handlePageChange(topic);
      const newPageContent = await generateNewPage(topic, pages);
      setPages(prevPages => ({
        ...prevPages,
        [topic]: newPageContent,
      }));
    } catch (error) {
      console.error('Error generating page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorldPromptSubmit = async (prompt: string) => {
    setLoading(true);
    try {
      const { title, content } = await generateInitialPage(prompt);
      setPages({ [title]: content });
      setCurrentPage(title);
    } catch (error) {
      console.error('Error generating initial page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleSelect = (title: string, content: string) => {
    setPages({ [title]: content });
    setCurrentPage(title);
  };

  return (
    <div className="relative">
      <div className="fixed top-4 left-4 z-10 flex gap-4 items-center">
        <img src="/logo.svg" alt="logo" className="w-12 h-12" />
        {recentPages.length > 0 && (
          <RecentPages 
            recentPages={recentPages}
            onPageClick={handlePageChange}
          />
        )}
      </div>

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
  )
}

export default App
