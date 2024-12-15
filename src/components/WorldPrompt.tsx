import { useState } from 'react';
import TextArea from './srcl/TextArea';
import Button from './srcl/Button';
import Card from './srcl/Card';
import MatrixLoader from './srcl/MatrixLoader';

interface WorldPromptProps {
  onSubmit: (prompt: string) => void;
  onExampleSelect: (title: string, content: string) => void;
  loading?: boolean;
}

const EXAMPLE_FIRST_ARTICLES = {
  "Fantasy city that towers above a sea of toxic fog": {
    "Carmine": `Carmine, the majestic capital of the <link>Mistlands</link>, stands as a testament to human ingenuity amidst the perpetual crimson fog that gives the city its name. Founded in 847 AE by the <link>Mistwalker clans</link>, the city is built upon massive bronze pillars that elevate it above the toxic mists that plague the lowlands. Its distinctive architecture features spiraling copper spires and interconnected skyways, while the famous <link>Oxidation Gardens</link> showcase plants that have evolved to thrive in the metallic atmosphere. The city serves as both the political and spiritual center of the Mistlands, housing both the <link>Chamber of Atmospheric Sciences</link> and the ancient <link>Temple of the Copper Moon</link>, where the enigmatic <link>Mistpriests</link> conduct their arcane studies of the region's unique weather patterns.`
  },
  "What if a scientist invented AGI in the 1980s": {
    "Grace Mitchell": `Grace Mitchell (1947-2018) revolutionized early <link>neural network architecture</link> through her groundbreaking work at <link>Threshold Labs</link> during the crucial period of 1982-1989. While her contemporaries focused on supervised learning, Mitchell's controversial <link>Autonomous Pattern Theory</link> proposed that truly intelligent systems would need to develop without human-labeled training data. Though initially dismissed by the academic establishment, her theories gained recognition after the success of the <link>Phoenix Project</link> in 1986, which demonstrated the first examples of genuine emergent behavior in artificial networks. Mitchell's later career was devoted to studying the ethical implications of machine consciousness, leading to her founding of the influential <link>Coalition for Responsible Intelligence</link>.`
  },
  "Time goes topsy turvy at a small town diner": {
    "Temporal Resonance": `<link>Temporal Resonance</link> refers to the peculiar phenomenon observed at <link>Murphy's All-Night Diner</link> in Millbrook, Kansas, where patrons occasionally experience overlapping moments from different time periods while seated in specific booths. First documented by regular customer <link>Sarah Chen</link> in her viral TikTok series in 2021, the resonance manifests as brief glimpses of past and future versions of the diner, with sounds and smells from different eras bleeding through. The <link>Department of Temporal Affairs</link> has classified the phenomenon as a Class-3 Stable Time Anomaly, theorizing it may be connected to the diner's location atop a suspected quantum faultline. While mostly harmless, the resonance has turned Murphy's into a popular destination for amateur chronology enthusiasts and paranormal researchers.`
  },
  "Turning point in an alternate WW2": {
    "The Baltic Offensive": `The <link>Baltic Offensive</link> (August 12-September 28, 1944) marked the unexpected turning point of the <link>Second World War</link> following <link>Tesla-Szilard Resonator</link> deployment by Polish-Lithuanian forces. Under the command of General <link>Kazimierz Tabor</link>, the Allied Baltic Fleet used the experimental weapon to disable German mechanized divisions across a 300-mile front, leading to the collapse of Army Group North. The offensive's success prompted <link>Operation Amber Dawn</link>, which saw the rapid liberation of Eastern Europe through widespread deployment of resonator technology. Modern historians consider this campaign the key catalyst for the war's early conclusion in March 1945, though debate continues over the ethical implications of using Tesla-derived weapons against human targets.`
  }
};

function WorldPrompt({ onSubmit, onExampleSelect, loading = false }: WorldPromptProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleExampleClick = (promptTitle: string, article: Record<string, string>) => {
    const [title, content] = Object.entries(article)[0];
    onExampleSelect(title, content);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Create Your World</h1>
          <p className="text-lg text-gray-600 mb-8">
            Imagine a world where...
          </p>
        </div>
        
        {loading ? (
          <div className="h-64">
            <MatrixLoader rows={15} direction="left-to-right" mode="katakana" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Example worlds (click to use):</p>
              <div className="grid gap-2">
                {Object.entries(EXAMPLE_FIRST_ARTICLES).map(([promptTitle, article]) => (
                  <Button
                    key={promptTitle}
                    onClick={() => handleExampleClick(promptTitle, article)}
                    theme="SECONDARY"
                    className="text-left h-auto whitespace-normal"
                  >
                    {promptTitle}
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or create your own</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card>
                <TextArea
                  placeholder="Describe your world's first location..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
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