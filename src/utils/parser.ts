import { WikiNode } from './wiki-types';

export class WikiParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WikiParseError';
  }
}

// Parser for single Wiki XML article to WikiNode class
export function parseWikiNode(xmlString: string): WikiNode {
  // Create a DOMParser instance
  const parser = new DOMParser();
 
  // First, try to parse as-is
  let xmlDoc = parser.parseFromString(xmlString, 'text/xml');
 
  // Check if parsing was successful and articles are present
  let articles = xmlDoc.getElementsByTagName('article');
 
  // If no articles found, try wrapping in a root element
  if (articles.length === 0) {
    xmlString = `<root>${xmlString}</root>`;
    xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    articles = xmlDoc.getElementsByTagName('article');
  }

  // Validate article count
  if (articles.length === 0) {
    throw new WikiParseError('No articles found in generated text');
  }
  if (articles.length > 1) {
    throw new WikiParseError('Multiple articles found in generated text. Expected exactly one article.');
  }

  // Function to extract links and return both links and preserved content
  function processContent(content: string): { links: string[], processedContent: string } {
    const links: string[] = [];
    let processedContent = content;
    
    // Use positive lookbehind to ensure we don't match already processed links
    const linkRegex = /<link to="([^"]+)">([^<]+)<\/link>/g;
    let match: RegExpExecArray | null;
   
    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[1]);
    }
   
    return {
      links,
      processedContent: processedContent.trim().replace(/\s+/g, ' ')
    };
  }
 
  // Process the single article
  const articleElement = articles[0];
 
  // Get basic elements
  const id = articleElement.getAttribute('id');
  if (!id) {
    throw new WikiParseError('Article found without ID');
  }
   
  const titleElement = articleElement.querySelector('title');
  const contentElement = articleElement.querySelector('content');
   
  if (!titleElement || !contentElement) {
    throw new WikiParseError(`Article ${id} missing required elements`);
  }
   
  const title = titleElement.textContent?.trim() || '';
  const rawContent = contentElement.innerHTML || '';
   
  // Process content to extract links while preserving the content
  const { links, processedContent } = processContent(rawContent);
   
  // Create and return new WikiNode instance
  return new WikiNode(id, title, processedContent, links);
}