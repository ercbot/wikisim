import { generateText } from 'ai';
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

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
`;

const context_prompt = `
Here are the 5 most recently generated wiki pages for context:

{{RECENT_ARTICLES}}

Based on these existing entries and maintaining consistency with their style and content, please generate a new wiki article about: {{TOPIC}}
`;

export async function generateNewPage(topic: string, pages: { [key: string]: string }) {
  try {
    // Prepare recent articles context
    const recentArticlesContext = Object.entries(pages)
      .slice(0, 5)
      .map(([page, content]) => `${page}:\n${content}`)
      .join('\n\n');

    const customizedPrompt = context_prompt
      .replace('{{RECENT_ARTICLES}}', recentArticlesContext)
      .replace('{{TOPIC}}', topic);

    const { text } = await generateText({
      model: google("models/gemini-1.5-pro-latest"),
      system: system_prompt,
      prompt: customizedPrompt
    });

    return text;
  } catch (error) {
    console.error('Error generating page:', error);
    throw error;
  }
} 