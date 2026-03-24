'use client';

const defaultPrompts = [
  'Plot sin(x) vs cos(x)',
  'Solve x² - 5x + 6 = 0',
  'What is the determinant of [[1,2],[3,4]]?',
  'Convert 100 joules to eV',
  'Graph a 3D saddle surface',
  'Show me a butterfly curve',
  'Calculate the integral of x² from 0 to 5',
  'Compare x² and x³',
];

interface Props {
  onSelect: (prompt: string) => void;
}

export default function SuggestedPrompts({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-lg">
      {defaultPrompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-xs px-3 py-2 bg-surface rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-primary/50 transition-all hover:scale-105"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
