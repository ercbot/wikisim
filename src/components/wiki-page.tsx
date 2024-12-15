import React, { useState } from 'react';
import { generateText } from 'ai';
import { createGoogleGenerativeAI  } from "@ai-sdk/google"

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
})

const system_prompt = `
You are a specialized wiki content generator. Your role is to create interconnected encyclopedia-style entries that match the tone, style and context of the existing wiki content. You will be provided context about the type of wiki and any existing entries.

Format Requirements:
1. Generate exactly one paragraph (4-6 sentences) that would serve as the opening section of a wiki article
2. Use <link></link> tags around terms that warrant their own articles
3. Only link a term the first time it appears in the text
4. Links should be meaningful concepts relevant to the wiki's domain, not common words
5. Each entry should naturally connect to 2-4 other potential articles through links
6. Maintain neutral, encyclopedic tone appropriate to the wiki's style

Linking Guidelines:
- Link significant proper nouns (people, places, organizations, events, concepts)
- Link technical terms or jargon specific to the wiki's domain
- Link to broader categories or systems the topic belongs to
- Don't link common words or phrases
- Don't link modifiers or partial terms

Content Guidelines:
- Focus on essential, defining information about the topic
- Establish the topic's role/significance in the broader context
- Include at least one specific detail or fact
- Reference broader systems or categories the topic belongs to
- Maintain consistency with any provided existing articles
- Match the level of technical detail shown in other entries

Input will be:
1. Topic to generate article about
2. Context about the wiki's domain/setting
3. Any relevant existing articles for reference

Output should be only the article paragraph with appropriate link tags.
`;

const context_prompt = `
Here are the 5 most recently generated wiki pages for context:

{{RECENT_ARTICLES}}

Based on these existing entries and maintaining consistency with their style and content, please generate a new wiki article about: {{TOPIC}}
`;

// Initial wiki database
const wikiPages = {
  "Carmine": `Carmine, the majestic capital of the <link>Mistlands</link>, stands as a testament to human ingenuity amidst the perpetual crimson fog that gives the city its name. Founded in 847 AE by the <link>Mistwalker clans</link>, the city is built upon massive bronze pillars that elevate it above the toxic mists that plague the lowlands. Its distinctive architecture features spiraling copper spires and interconnected skyways, while the famous <link>Oxidation Gardens</link> showcase plants that have evolved to thrive in the metallic atmosphere. The city serves as both the political and spiritual center of the Mistlands, housing both the <link>Chamber of Atmospheric Sciences</link> and the ancient <link>Temple of the Copper Moon</link>, where the enigmatic <link>Mistpriests</link> conduct their arcane studies of the region's unique weather patterns.`,
  
  "Oxidation Gardens": `The Oxidation Gardens of <link>Carmine</link> represent one of the most remarkable achievements in adaptive agriculture across the <link>Known Realms</link>. Established in 923 AE by botanist-alchemist <link>Serra Vale</link>, these vertical gardens span the eastern facades of three major support pillars of the city. The gardens are famous for their copper-tolerant flora, particularly the luminescent <link>Mistbloom</link> orchids and the hardy <link>Bronzevine</link> creepers that have evolved to metabolize metal particles from the crimson fog. These spectacular hanging gardens not only serve as a vital source of food for the city's upper levels but also act as a massive atmospheric filtration system, their specialized plants gradually purifying the toxic mists that surround Carmine. The Gardens are maintained by the mysterious <link>Green Oxidists</link>, a sect of botanist-priests who have developed secret techniques for cultivating plants in the metallic atmosphere.`
};

const WikiPage = () => {
  const [currentPage, setCurrentPage] = useState("Carmine");
  const [pages, setPages] = useState<{ [key: string]: string }>(wikiPages);
  const [loading, setLoading] = useState(false);
  const [recentPages, setRecentPages] = useState<string[]>(["Carmine"]);

  const generateNewPage = async (topic: string) => {
    setLoading(true);
    try {
      // Prepare recent articles context
      const recentArticlesContext = recentPages
        .filter(page => pages[page])
        .map(page => `${page}:\n${pages[page]}`)
        .join('\n\n');

      // Replace placeholders in the prompt
      const customizedPrompt = context_prompt
        .replace('{{RECENT_ARTICLES}}', recentArticlesContext)
        .replace('{{TOPIC}}', topic);

      // Generate new article based on the topic
      const { text } = await generateText({
        model: google("models/gemini-1.5-pro-latest"),
        system: system_prompt,
        prompt: customizedPrompt
      });

      // Update pages with new content
      setPages(prevPages => ({
        ...prevPages,
        [topic]: text,
      }));

      // Update recent pages list
      setRecentPages(prevRecent => {
        const newRecent = [topic, ...prevRecent.filter(p => p !== topic)].slice(0, 5);
        return newRecent;
      });

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
      // Update recent pages when viewing existing page
      setRecentPages(prevRecent => {
        const newRecent = [topic, ...prevRecent.filter(p => p !== topic)].slice(0, 5);
        return newRecent;
      });
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

      <div className="mt-6 text-sm text-gray-500">
        <h2 className="font-semibold mb-2">Recently Viewed Pages:</h2>
        <ul className="list-disc pl-5">
          {recentPages.map(page => (
            <li key={page}>
              <button 
                onClick={() => handleLinkClick(page)}
                className="text-blue-500 hover:underline"
              >
                {page}
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default WikiPage;