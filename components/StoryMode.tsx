
import React, { useState } from 'react';
import { generateScienceStory } from '../geminiService';

interface StoryModeProps {
  childName: string;
  onStoryGenerated: () => void;
  onBack: () => void;
}

const StoryMode: React.FC<StoryModeProps> = ({ childName, onStoryGenerated, onBack }) => {
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const predefinedTopics = [
    { title: 'The Secret Life of Plants', icon: '🌱' },
    { title: 'Journey to the Red Planet', icon: '🚀' },
    { title: 'Deep Sea Discovery', icon: '🌊' },
    { title: 'The World of Tiny Bugs', icon: '🐜' },
  ];

  const handleGenerate = async (selectedTopic: string) => {
    setLoading(true);
    setStory(null);
    try {
      const generatedStory = await generateScienceStory(selectedTopic, childName);
      setStory(generatedStory);
      onStoryGenerated();
    } catch (error) {
      setStory("Oh no! The storybook pages got all mixed up. Let's try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-2xl bg-white w-10 h-10 rounded-full shadow-sm flex items-center justify-center">⬅️</button>
        <h2 className="text-2xl font-bold text-gray-800">Story Time 📖</h2>
      </div>

      {!story && !loading && (
        <div className="space-y-6">
          <div className="bg-purple-500 rounded-3xl p-6 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">Pick an Adventure!</h3>
            <p className="opacity-90">Choose a topic and Professor Spark will write a story just for you.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {predefinedTopics.map((t) => (
              <button
                key={t.title}
                onClick={() => handleGenerate(t.title)}
                className="bg-white p-4 rounded-3xl shadow-md border-2 border-purple-100 hover:border-purple-300 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-4xl">{t.icon}</span>
                <span className="text-sm font-bold text-gray-700 text-center">{t.title}</span>
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
            <h4 className="font-bold text-gray-700">Or type your own topic:</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Volcanoes, Black Holes..."
                className="flex-1 p-3 rounded-xl border-2 border-purple-100 focus:outline-none focus:border-purple-300"
              />
              <button
                onClick={() => handleGenerate(topic)}
                disabled={!topic.trim()}
                className="bg-purple-500 text-white px-4 rounded-xl font-bold disabled:opacity-50"
              >
                Go!
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-6xl animate-spin mb-4">🌀</div>
          <h3 className="text-2xl font-bold text-purple-600">Writing your story...</h3>
          <p className="text-gray-500">Mixing facts with fun!</p>
        </div>
      )}

      {story && !loading && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-t-8 border-purple-400 animate-in zoom-in duration-300">
          <div className="prose prose-purple max-w-none">
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700 font-medium italic">
              {story}
            </div>
          </div>
          <button
            onClick={() => setStory(null)}
            className="mt-8 w-full bg-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg"
          >
            Write Another Story! ✍️
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryMode;
