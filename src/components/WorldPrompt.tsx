import { useState } from 'react';
import TextArea from './srcl/TextArea';
import Button from './srcl/Button';
import Card from './srcl/Card';

interface WorldPromptProps {
  onSubmit: (prompt: string) => void;
  loading?: boolean;
}

function WorldPrompt({ onSubmit, loading = false }: WorldPromptProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Create Your World</h1>
          <p className="text-lg text-gray-600">
            Describe the first location in your world. This will be the starting point of your wiki.
          </p>
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
            {loading ? 'Generating...' : 'Create World'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default WorldPrompt; 