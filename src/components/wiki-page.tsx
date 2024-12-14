import React, { useState } from 'react';

// Initial wiki database
const wikiPages = {
  "Carmine": `Carmine, the majestic capital of the <link>Mistlands</link>, stands as a testament to human ingenuity amidst the perpetual crimson fog that gives the city its name. Founded in 847 AE by the <link>Mistwalker clans</link>, the city is built upon massive bronze pillars that elevate it above the toxic mists that plague the lowlands. Its distinctive architecture features spiraling copper spires and interconnected skyways, while the famous <link>Oxidation Gardens</link> showcase plants that have evolved to thrive in the metallic atmosphere. The city serves as both the political and spiritual center of the Mistlands, housing both the <link>Chamber of Atmospheric Sciences</link> and the ancient <link>Temple of the Copper Moon</link>, where the enigmatic <link>Mistpriests</link> conduct their arcane studies of the region's unique weather patterns.`,
  
  "Oxidation Gardens": `The Oxidation Gardens of <link>Carmine</link> represent one of the most remarkable achievements in adaptive agriculture across the <link>Known Realms</link>. Established in 923 AE by botanist-alchemist <link>Serra Vale</link>, these vertical gardens span the eastern facades of three major support pillars of the city. The gardens are famous for their copper-tolerant flora, particularly the luminescent <link>Mistbloom</link> orchids and the hardy <link>Bronzevine</link> creepers that have evolved to metabolize metal particles from the crimson fog. These spectacular hanging gardens not only serve as a vital source of food for the city's upper levels but also act as a massive atmospheric filtration system, their specialized plants gradually purifying the toxic mists that surround Carmine. The Gardens are maintained by the mysterious <link>Green Oxidists</link>, a sect of botanist-priests who have developed secret techniques for cultivating plants in the metallic atmosphere.`
};

const WikiPage = () => {
  const [currentPage, setCurrentPage] = useState("Carmine");
  const [pages, setPages] = useState<{ [key: string]: string }>(wikiPages);
  const [loading, setLoading] = useState(false);

  const generateNewPage = async (topic: string) => {
    setLoading(true);
    try {
      // Simulating API call with timeout and hardcoded response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newContent = `This is a generated page about ${topic}. It would link to other topics like <link>Carmine</link> and contain rich lore about the world.`;
      
      // Update pages with new content
      setPages(prevPages => ({
        ...prevPages,
        [topic]: newContent
      }));

      setCurrentPage(topic);
    } catch (error) {
      console.error('Error generating page:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (topic: string) => {
    if (pages[topic]) {
      setCurrentPage(topic);
    } else {
      generateNewPage(topic);
    }
  };

  const renderContent = () => {
    if (!pages[currentPage]) return null;

    const parts = pages[currentPage].split(/(<link>.*?<\/link>)/);
    return parts.map((part, index) => {
      if (part.startsWith('<link>') && part.endsWith('</link>')) {
        const term = part.replace('<link>', '').replace('</link>', '');
        return (
          <button
            key={index}
            onClick={() => handleLinkClick(term)}
            className="link-button"
          >
            {term}
          </button>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{currentPage}</h1>
        <div className="h-px bg-gray-200 w-full mb-4" />
      </div>
      
      <div className="prose prose-lg">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <p className="leading-relaxed">{renderContent()}</p>
        )}
      </div>
    </div>
  );
};

export default WikiPage;