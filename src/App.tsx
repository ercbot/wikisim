import { useEffect, useState } from 'react'
import WikiPage from './components/WikiPage'
import RecentPages from './components/RecentPages'
import { generateNewPage } from './utils/wikiGenerator'

// Initial wiki database
const wikiPages = {
  "Carmine": `Carmine, the majestic capital of the <link>Mistlands</link>, stands as a testament to human ingenuity amidst the perpetual crimson fog that gives the city its name. Founded in 847 AE by the <link>Mistwalker clans</link>, the city is built upon massive bronze pillars that elevate it above the toxic mists that plague the lowlands. Its distinctive architecture features spiraling copper spires and interconnected skyways, while the famous <link>Oxidation Gardens</link> showcase plants that have evolved to thrive in the metallic atmosphere. The city serves as both the political and spiritual center of the Mistlands, housing both the <link>Chamber of Atmospheric Sciences</link> and the ancient <link>Temple of the Copper Moon</link>, where the enigmatic <link>Mistpriests</link> conduct their arcane studies of the region's unique weather patterns.`,
  
  "Oxidation Gardens": `The Oxidation Gardens of <link>Carmine</link> represent one of the most remarkable achievements in adaptive agriculture across the <link>Known Realms</link>. Established in 923 AE by botanist-alchemist <link>Serra Vale</link>, these vertical gardens span the eastern facades of three major support pillars of the city. The gardens are famous for their copper-tolerant flora, particularly the luminescent <link>Mistbloom</link> orchids and the hardy <link>Bronzevine</link> creepers that have evolved to metabolize metal particles from the crimson fog. These spectacular hanging gardens not only serve as a vital source of food for the city's upper levels but also act as a massive atmospheric filtration system, their specialized plants gradually purifying the toxic mists that surround Carmine. The Gardens are maintained by the mysterious <link>Green Oxidists</link>, a sect of botanist-priests who have developed secret techniques for cultivating plants in the metallic atmosphere.`
};

function App() {
  const [currentPage, setCurrentPage] = useState("Carmine");
  const [pages, setPages] = useState<{ [key: string]: string }>(wikiPages);
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

  return (
    <div className="relative">
      <div className="fixed top-4 left-4 z-10 flex items-center gap-4">
        <img src="/logo.svg" alt="logo" className="w-12 h-12" />
        { recentPages.length > 0 && (
          <RecentPages 
            recentPages={recentPages}
            onPageClick={handlePageChange}
          />
        )}
      </div>

      <WikiPage 
        currentTopic={currentPage}
        pages={pages}
        loading={loading}
        onPageChange={handlePageChange}
        onGenerateNewPage={handleGenerateNewPage}
      />
    </div>
  )
}

export default App
