import { generateText } from 'ai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { WikiGraphData } from '../types';

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

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
      model: google("models/gemini-2.0-flash-exp"),
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

    return {
      title: titleMatch[1].trim(),
      content: contentMatch[1].trim()
    };
}

export async function generateNewPage(
  topic: string, 
  recentPages: string[],
  wikiPages: WikiGraphData,
  initialPrompt: string
) {
  try {
    // Get Recent Page Content
    const recentArticlesContext = recentPages
      .filter(page => wikiPages[page]) // Filter out any missing pages
      .map(page => `${page}:\n${wikiPages[page].content}`)
      .join('\n\n');

    const customizedPrompt = context_prompt
      .replace('{{RECENT_ARTICLES}}', recentArticlesContext)
      .replace('{{TOPIC}}', topic);

    // Replace the prompt placeholder in system prompt
    const customizedSystemPrompt = system_prompt.replace('{{PROMPT}}', initialPrompt);

    const text = await generateWithSystemPrompt(customizedPrompt, customizedSystemPrompt);

    return text;
  } catch (error) {
    console.error('Error generating page:', error);
    throw error;
  }
};