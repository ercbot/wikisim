import { useEffect, useState } from 'react'
import WikiPage from './components/WikiPage'
import RecentPages from './components/RecentPages'
import WorldPrompt from './components/WorldPrompt'
import Card from './components/srcl/Card'
import WikiGraphDisplay from './components/WikiGraphDisplay'

import { generateNewPage, generateInitialPage, QuotaExceededError } from './utils/wikiGenerator'
import ActionButton from './components/srcl/ActionButton'
import { WikiGraph, WikiNode } from './utils/wiki-types';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('');
  const [graph, setGraph] = useState<WikiGraph>(new WikiGraph());
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

  const handleGenerateNewPage = async (topic: string) => {
    setLoading(true);
    setError(null);
    try {
      handlePageChange(topic);
      const node = await generateNewPage(topic, recentPages, graph, initialPrompt);
      graph.addNode(node);
      setGraph(graph);
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
      const node = await generateInitialPage(prompt);
      graph.addNode(node);
      // Add in the nodes that were linked to, but haven't been generated yet
      const linkedNodes = graph.getLinkedNodes(node.topic);
      for (const linkedNode of linkedNodes) {
        if (!graph.hasNode(linkedNode.topic)) {
          graph.addNode(linkedNode);
        }
      }

      setGraph(graph);
      setCurrentPage(node.topic);
    } catch (error) {
      console.error('Error generating initial page:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentPage('');
    setGraph(new WikiGraph());
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
      <main>
        <div className='max-h-[calc(100vh-12rem)] overflow-y-auto'>
          {graph.nodeCount === 0 ? (
            <WorldPrompt 
              onSubmit={handleWorldPromptSubmit}
              loading={loading}
            />
          ) : (
            <>
              {/* Show either WikiPage or WikiGraph based on showGraph state */}
              {showGraph ? (
                <div className="h-[calc(100vh-12rem)]">
                  <WikiGraphDisplay
                    graph={graph}
                    currentPage={currentPage}
                    onNodeClick={handlePageChange}
                  />
                </div>
              ) : (
                <WikiPage 
                  currentTopic={currentPage}
                  content={graph.getNode(currentPage)?.content ?? ''}
                  loading={loading}
                  onPageChange={handlePageChange}
                  onGenerateNewPage={handleGenerateNewPage}
                  graph={graph}
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
