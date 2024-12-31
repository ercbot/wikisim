import { WikiGraph, WikiNode } from './wiki-types';
import { parseWikiNode } from './parser';

// Initialize prompts as let variables
let system_prompt = '';
let initial_article_prompt = '';
let clicked_article_prompt = '';

// Create an initialization function
export async function initializePrompts() {
  system_prompt = (await import('../prompts/system_prompt.txt?raw')).default;
  initial_article_prompt = (await import('../prompts/initial_article.txt?raw')).default;
  clicked_article_prompt = (await import('../prompts/clicked_article.txt?raw')).default;
}

// Add custom error class
export class QuotaExceededError extends Error {
  constructor(message = 'API quota exceeded. Please try again later.') {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

async function generateWithSystemPrompt(prompt: string) {
  try {    
    const requestBody = {
      prompt,
      systemPrompt: system_prompt
    };

    const bodyString = JSON.stringify(requestBody);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyString
    });

    // Log the raw response
    const responseText = await response.text();
    
    if (!response.ok) {
      try {
        const error = JSON.parse(responseText);
        if (response.status === 429) {
          throw new QuotaExceededError();
        }
        throw new Error(error.message);
      } catch (e) {
        throw new Error(`Server error: ${responseText}`);
      }
    }

    try {
      const { text } = JSON.parse(responseText);
      return text;
    } catch (e) {
      throw new Error(`Failed to parse response: ${responseText}`);
    }
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      throw error;
    }
    console.error('Error generating text:', error);
    throw error;
  }
}

export async function generateInitialPage(initialPrompt: string) {
  // Generate page  
  const text = await generateWithSystemPrompt(initial_article_prompt.replace('{{PROMPT}}', initialPrompt));
  // Parse Text into a new WikiNode
  return parseWikiNode(text)
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

    const existingIds = wikiGraph.getAllNodeIds();
    
    const customizedPrompt = clicked_article_prompt
      .replace('{{RECENT_ARTICLES}}', recentArticlesContext)
      .replace('{{PROMPT}}', initialPrompt)
      .replace('{{SLUG}}', wikiNode.id)
      .replace('{{EXISTING_IDS}}', `- ${existingIds.join('\n- ')}`);

    const text = await generateWithSystemPrompt(customizedPrompt);

    const node = parseWikiNode(text);
    
    return node;
  } catch (error) {
    console.error('Error generating page:', error);
    throw error;
  }
};