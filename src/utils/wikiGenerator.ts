import { generateText, generateObject } from 'ai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { WikiGraph, WikiNode } from './wiki-types';
import { parseWikiNode } from './parser';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const model = google("models/gemini-2.0-flash-exp");

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
    const { text } = await generateText({
      model: model,
      system: system_prompt,
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

    console.log(text)

    const node = parseWikiNode(text);
    
    console.log(node)
    return node;
  } catch (error) {
    console.error('Error generating page:', error);
    throw error;
  }
};