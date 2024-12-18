import React, { useState } from 'react';
import TextArea from './srcl/TextArea';
import Button from './srcl/Button';
import Card from './srcl/Card';
import MatrixLoader from './srcl/MatrixLoader';
import ExamplesCarousel from './ExamplesCarousel';
import { QuotaExceededError } from '../utils/wikiGenerator';

interface WorldPromptProps {
  onSubmit: (prompt: string) => void;
  onExampleSelect: (title: string, content: string) => void;
  loading?: boolean;
  error?: Error | null;
}

const EXAMPLE_FIRST_ARTICLES = {
  "we build cities on stilts to escape a sea of toxic mist": {
    "Carmine": `Carmine, the majestic capital of the <link>Mistlands</link>, stands as a testament to human ingenuity amidst the perpetual crimson fog that gives the city its name. Founded in 847 AE by the <link>Mistwalker clans</link>, the city is built upon massive bronze pillars that elevate it above the toxic mists that plague the lowlands. Its distinctive architecture features spiraling copper spires and interconnected skyways, while the famous <link>Oxidation Gardens</link> showcase plants that have evolved to thrive in the metallic atmosphere. The city serves as both the political and spiritual center of the Mistlands, housing both the <link>Chamber of Atmospheric Sciences</link> and the ancient <link>Temple of the Copper Moon</link>, where the enigmatic <link>Mistpriests</link> conduct their arcane studies of the region's unique weather patterns.`
  },
  "a scientist invents AGI in the 1980s": {
    "Grace Mitchell": `Grace Mitchell (1947-2018) revolutionized early <link>neural network architecture</link> through her groundbreaking work at <link>Threshold Labs</link> during the crucial period of 1982-1989. While her contemporaries focused on supervised learning, Mitchell's controversial <link>Autonomous Pattern Theory</link> proposed that truly intelligent systems would need to develop without human-labeled training data. Though initially dismissed by the academic establishment, her theories gained recognition after the success of the <link>Phoenix Project</link> in 1986, which demonstrated the first examples of genuine emergent behavior in artificial networks. Mitchell's later career was devoted to studying the ethical implications of machine consciousness, leading to her founding of the influential <link>Coalition for Responsible Intelligence</link>.`
  },
  "time goes topsy turvy at a small town diner": {
    "Temporal Resonance": `<link>Temporal Resonance</link> refers to the peculiar phenomenon observed at <link>Murphy's All-Night Diner</link> in Millbrook, Kansas, where patrons occasionally experience overlapping moments from different time periods while seated in specific booths. First documented by regular customer <link>Sarah Chen</link> in her viral TikTok series in 2021, the resonance manifests as brief glimpses of past and future versions of the diner, with sounds and smells from different eras bleeding through. The <link>Department of Temporal Affairs</link> has classified the phenomenon as a Class-3 Stable Time Anomaly, theorizing it may be connected to the diner's location atop a suspected quantum faultline. While mostly harmless, the resonance has turned Murphy's into a popular destination for amateur chronology enthusiasts and paranormal researchers.`
  },
  "Tesla's work leads to a weapon that turns the tide of WW2": {
    "The Baltic Offensive": `The <link>Baltic Offensive</link> (August 12-September 28, 1944) marked the unexpected turning point of the <link>Second World War</link> following <link>Tesla-Szilard Resonator</link> deployment by Polish-Lithuanian forces. Under the command of General <link>Kazimierz Tabor</link>, the Allied Baltic Fleet used the experimental weapon to disable German mechanized divisions across a 300-mile front, leading to the collapse of Army Group North. The offensive's success prompted <link>Operation Amber Dawn</link>, which saw the rapid liberation of Eastern Europe through widespread deployment of resonator technology. Modern historians consider this campaign the key catalyst for the war's early conclusion in March 1945, though debate continues over the ethical implications of using Tesla-derived weapons against human targets.`
  }
};

function WorldPrompt({ onSubmit, onExampleSelect, loading = false, error }: WorldPromptProps) {
  const [prompt, setPrompt] = useState('');
  const [exampleLoading, setExampleLoading] = useState(false);

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

  const handleExampleClick = async (promptTitle: string, article: Record<string, string>) => {
    setExampleLoading(true);
    const [title, content] = Object.entries(article)[0];
    
    // Simulate loading delay when clicking an example
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onExampleSelect(title, content);
    setExampleLoading(false);
  };

  const examples = Object.entries(EXAMPLE_FIRST_ARTICLES).map(([promptTitle, article]) => {
    const [title, content] = Object.entries(article)[0];
    return {
      title: promptTitle,
      content: content,
      onClick: () => handleExampleClick(promptTitle, article)
    };
  });

  return (
    <div className="flex items-center justify-center p-4 pt-24">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl mb-4 sm:font-bold">Infinite World Sim</h1>
          <p className="text-lg text-gray-600 mb-8">
            {loading || exampleLoading ? prompt : "Imagine a world where..."}
          </p>
        </div>
        
        {loading || exampleLoading ? (
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