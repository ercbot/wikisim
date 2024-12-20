import { generateText, generateObject } from 'ai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { WikiGraph, WikiNode } from './wiki-types';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const model = google("models/gemini-2.0-flash-exp");

const system_prompt = `
You are an AI system specialized in gererating wiki-like articles from an alternative universe.

The first article of this universe was generated from the following prompt: {{PROMPT}}

Be creative, and generate content that is not distict from real world content even if there are world parallels.

Format Requirements:
1. Generate exactly one paragraph (4-6 sentences) that would serve as the opening section of a wiki article
2. Use <link></link> tags around terms that warrant their own articles
3. Only link a term the first time it appears in your output
4. Each entry MUST introduce at least one completely new link not mentioned in previous articles
6. Maintain neutral, encyclopedic tone

Linking Guidelines:
- Link significant proper nouns (people, places, organizations, events, concepts)
- Link to broader categories or systems the topic belongs to
- Don't link common words or phrases
- Don't link modifiers or partial terms

Content Guidelines:
- Focus on essential, defining information about the topic
- When introducing new concepts via links, ensure they create opportunities for interesting future articles
- Reference broader systems or categories the topic belongs to
- Maintain consistency with existing articles while expanding the universe in novel directions
- If you are writing about content that also exists in the real world, YOU MUST alter substantially content to be unique to this universe
`;

const context_prompt = `
Here are the 5 most recently generated wiki pages for context:

{{RECENT_ARTICLES}}

Based on these existing entries and maintaining consistency with their style and content, please generate a new wiki article about: {{TOPIC}}
`;

const first_page_context_prompt = (await import('../prompts/new_page.txt?raw')).default;

const match_links_prompt = (await import('../prompts/match_links.txt?raw')).default;

// Add custom error class
export class QuotaExceededError extends Error {
  constructor(message = 'API quota exceeded. Please try again later.') {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

async function generateWithSystemPrompt(prompt: string, customSystemPrompt?: string) {
  try {
    const { text } = await generateText({
      model: model,
      system: customSystemPrompt || system_prompt,
      prompt: prompt
    });
    return text;
  } catch (error: unknown) {
    if (error instanceof Error && 
        (error.message.includes('Resource has been exhausted') || 
         error.message.includes('quota'))) {
      throw new QuotaExceededError();
    }
    console.error('Error generating text:', error);
    throw error;
  }
}

export async function generateInitialPage(initialPrompt: string) {
    const text = await generateWithSystemPrompt(first_page_context_prompt.replace('{{PROMPT}}', initialPrompt));
    
    // Parse the text to get the title and content
    const titleMatch = text.match(/<title>(.*?)<\/title>/);
    const contentMatch = text.match(/<content>(.*?)<\/content>/s); // 's' flag for multiline matching
    
    if (!titleMatch || !contentMatch) {
      throw new Error('Invalid article format - missing title or content');
    }

    return new WikiNode(titleMatch[1].trim(), contentMatch[1].trim());
}

export async function generateNewPage(
  wikiNode: WikiNode,
  recentPages: string[],
  wikiGraph: WikiGraph,
  initialPrompt: string
) {
  try {
    // Get Recent Page Content
    const recentArticlesContext = recentPages
      .filter(page => wikiGraph.hasNode(page))
      .map(page => `${page}:\n${wikiGraph.getNode(page)?.content}`)
      .join('\n\n');

    const customizedPrompt = context_prompt
      .replace('{{RECENT_ARTICLES}}', recentArticlesContext)
      .replace('{{TOPIC}}', topic);

    // Replace the prompt placeholder in system prompt
    const customizedSystemPrompt = system_prompt.replace('{{PROMPT}}', initialPrompt);

    const text = await generateWithSystemPrompt(customizedPrompt, customizedSystemPrompt);

    const node = new WikiNode(topic, text);
    
    // Map links before adding node
    const linkMappings = await matchLinks(node, wikiGraph);
    node.setLinkMappings(linkMappings);
    
    return node;
  } catch (error) {
    console.error('Error generating page:', error);
    throw error;
  }
};

export async function matchLinks(wikiArticle: WikiNode, wikiGraph: WikiGraph) {
  const links = wikiArticle.outlinks;
  const allAliases = wikiGraph.getAllAliases();
  const existingTopics = wikiGraph.getAllTopics();

  // Initialize result with exact matches
  const result: Record<string, string | null> = {};
  
  // Add exact matches to result
  links.filter(link => allAliases.includes(link)).forEach(match => {
    const node = wikiGraph.getNode(match);
    if (node) {
      result[match] = node.topic;
    }
  });

  // Handle unmatched links with AI
  const unmatchedLinks = links.filter(link => !allAliases.includes(link));
  if (unmatchedLinks.length > 0 && existingTopics.length > 0) {
    // Create schema for each unmatched link
    const matchSchema = z.object(
      Object.fromEntries(
        unmatchedLinks.map(link => [
          link,
          z.union([
            z.enum(existingTopics as [string, ...string[]]),
            z.null()
          ])
        ])
      )
    );

    const customized_prompt = match_links_prompt
      .replace('{{CONTENT}}', wikiArticle.content || '')
      .replace('{{UNMATCHED_LINKS}}', JSON.stringify(unmatchedLinks))
      .replace('{{EXISTING_TOPICS}}', JSON.stringify(existingTopics));

    const { object: aiMatches } = await generateObject({
      model: model,
      schema: matchSchema,
      prompt: customized_prompt
    });

    // Merge AI matches with exact matches
    Object.assign(result, aiMatches);
  }

  return result;
}

/**
 * Converts a string to title case while considering common exceptions
 * @param text The input string to convert to title case
 * @returns The string converted to title case
 */
function toTitleCase(text: string): string {
  // Words that should not be capitalized unless they're the first or last word
  const minorWords = new Set([
      'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor',
      'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet', 'with'
  ]);

  // Split the text into words
  const words = text.toLowerCase().split(/\s+/);
  
  if (words.length === 0) return '';

  // Process each word
  const titleCased = words.map((word, index) => {
      // Always capitalize the first and last word
      if (index === 0 || index === words.length - 1) {
          return capitalizeFirstLetter(word);
      }
      
      // Check if the word should be capitalized
      return minorWords.has(word) ? word : capitalizeFirstLetter(word);
  });

  return titleCased.join(' ');
}

/**
* Capitalizes the first letter of a word
* @param word The word to capitalize
* @returns The word with its first letter capitalized
*/
function capitalizeFirstLetter(word: string): string {
  if (word.length === 0) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}
