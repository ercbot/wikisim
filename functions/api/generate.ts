import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

// functions/api/generate.ts
export async function onRequest(context) {
  const { env, request } = context;
  
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Log the incoming request
    console.log('Received request');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { prompt, systemPrompt } = body;
    
    // Log the API key existence (not the actual key!)
    console.log('API key exists:', !!env.GEMINI_API_KEY);

    const google = createGoogleGenerativeAI({
      apiKey: env.GEMINI_API_KEY,
    });
    
    const model = google("models/gemini-2.0-flash-exp");
    
    const { text } = await generateText({
      model: model,
      system: systemPrompt,
      prompt: prompt
    });

    // Log successful response
    console.log('Generated text successfully');

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Enhanced error logging
    console.error('Worker error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    const message = error.message || 'Unknown error';
    const status = message.includes('quota') ? 429 : 500;
    
    return new Response(JSON.stringify({ 
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}