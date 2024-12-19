import React, { useState } from 'react';
import TextArea from './srcl/TextArea';
import Button from './srcl/Button';
import Card from './srcl/Card';
import MatrixLoader from './srcl/MatrixLoader';
import ExamplesCarousel from './ExamplesCarousel';
import { QuotaExceededError } from '../utils/wikiGenerator';

interface WorldPromptProps {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
  error?: Error | null;
}

const EXAMPLE_PROMPTS = {
  "Sentient Weather Patterns": "A civilization of conscious weather systems that communicate through storms and pressure changes",
  "Library of Lost Time": "A library where each book contains a timeline that never happened in our universe",
  "Dream Commerce City": "A metropolis where merchants trade in bottled dreams and filtered nightmares",
  "Digital Forest Evolution": "A computer virus that evolved into a complex digital ecosystem inside abandoned server farms",
  "Quantum Tea Ceremony": "A tea master who can split reality into parallel timelines with each pour of tea",
  "Underground Color Mining": "A world where colors must be mined from deep underground and refined before they can be used",
  "Memory Weaving Spiders": "Spider-like creatures that build webs from people's memories, creating vast architectural networks",
  "Gravity-Bending Monks": "An order of monks who learned to manipulate local gravity through ancient breathing techniques",
  "Living Architecture": "A city where buildings grow, reproduce, and compete for resources like living organisms",
  "Time-Twisted Market": "A bazaar where the same object can be bought at different points in its timeline",
  "Musical Mathematics": "A universe where mathematical equations express themselves as musical compositions",
  "Emotional Alchemy": "Scientists who discovered how to distill and transform human emotions into physical substances",
  "Cloud People Migration": "Nomadic societies living in floating cities who follow the patterns of wind currents",
  "Light-Eating Trees": "Trees that consume light instead of water, creating zones of permanent darkness",
  "Mechanical Evolution": "A planet where all evolution produced mechanical rather than biological life",
  "Neural Constellation": "Stars that form a vast cosmic neural network, processing thoughts across light-years",
  "Forbidden Frequencies": "A world where certain sound frequencies are outlawed for their reality-altering properties",
  "Data Ocean Depths": "An ocean made entirely of living data streams with various ecological layers",
  "Crystal Memory Empire": "A civilization that stores memories and knowledge in naturally growing crystals",
  "Shadow Economics": "A society that uses captured shadows as their primary form of currency",
  "Quantum Postal Service": "Mail carriers who deliver packages through quantum tunneling across probability spaces",
  "Language Ecosystems": "Words that evolved into living organisms, forming complex linguistic ecosystems",
  "Recursive Dreamlands": "A dream world where each dream contains another complete universe",
  "Time-Fermented Magic": "Spells that must be aged like wine before they can be cast",
  "Probability Farmers": "Farmers who cultivate and harvest probable futures from quantum fields",
  "Mirror World Commerce": "Merchants who trade goods between our world and mirror dimensions",
  "Thought Architecture": "Buildings constructed from solidified thoughts and memories",
  "Void Salt Merchants": "Traders who harvest crystallized nothingness from the spaces between worlds",
  "Sympathetic Stars": "A galaxy where stars influence each other's life cycles through cosmic empathy",
  "Reality Radio Waves": "Radio waves that broadcast alternative versions of reality when tuned correctly"
};

function WorldPrompt({ onSubmit, loading = false, error }: WorldPromptProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !loading) {
        onSubmit(prompt.trim());
      }
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    onSubmit(examplePrompt);
  };

  const examples = Object.entries(EXAMPLE_PROMPTS).map(([promptTitle, examplePrompt]) => {
    return {
      title: promptTitle,
      onClick: () => handleExampleClick(examplePrompt)
    };
  });

  return (
    <div className="flex items-center justify-center p-4 pt-24">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl mb-4 sm:font-bold">Infinite World Sim</h1>
          <p className="text-lg text-gray-600 mb-8">
            {loading ? prompt : "Imagine a world with..."}
          </p>
        </div>
        
        {loading ? (
          <div>
            <MatrixLoader rows={15}/>
          </div>
        ) : (
          <>
            {error && (
              <Card className="w-full bg-red-50 mb-4">
                <div className="text-red-700">
                  {error instanceof QuotaExceededError 
                    ? "API quota exceeded. Please try again later."
                    : "An error occurred. Please try again."}
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <ExamplesCarousel examples={examples} />
            </div>

  

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card>
                <TextArea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                  onKeyDown={handleKeyDown}
                />
              </Card>
              
              <Button
                type="submit"
                isDisabled={loading || !prompt.trim()}
                theme="PRIMARY"
              >
                Create World
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default WorldPrompt; 