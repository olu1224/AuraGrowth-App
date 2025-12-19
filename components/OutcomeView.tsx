
import React, { useState } from 'react';
import { CampaignResults } from '../types';

interface OutcomeViewProps {
  results: CampaignResults;
  onRefineVisual?: (description: string) => void;
  isRefiningVisual?: boolean;
}

const OutcomeView: React.FC<OutcomeViewProps> = ({ results, onRefineVisual, isRefiningVisual }) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleRefine = () => {
    if (refinementPrompt.trim() && onRefineVisual) {
      onRefineVisual(refinementPrompt);
      setRefinementPrompt('');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-purple-500">
            <h3 className="text-xl font-bold mb-3 text-purple-600 dark:text-purple-300">Campaign Strategy</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{results.strategy}</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 text-pink-600 dark:text-pink-300">Ad Copy & Hook</h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase text-gray-500 font-bold tracking-widest">Headline</span>
                <p className="text-2xl font-bold text-black dark:text-white mt-1">{results.copy.headline}</p>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500 font-bold tracking-widest">Body Text</span>
                <p className="text-gray-700 dark:text-gray-300 mt-1">{results.copy.body}</p>
              </div>
              <button className="aura-gradient px-6 py-2 rounded-lg font-bold text-sm text-white shadow-lg shadow-purple-500/20">
                {results.copy.cta}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl overflow-hidden group relative">
            {results.visualUrl && (
              <div className={`relative h-64 lg:h-80 w-full overflow-hidden transition-all duration-500 ${isRefiningVisual ? 'blur-sm grayscale opacity-50' : ''}`}>
                <img src={results.visualUrl} alt="Campaign Visual" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                  <span className="text-xs text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">AI Generated Visual Outcome</span>
                </div>
              </div>
            )}
            
            {isRefiningVisual && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-white dark:text-white uppercase tracking-widest">Rendering New Outcome...</span>
                </div>
              </div>
            )}

            {/* AI Visual Refiner UI */}
            <div className="p-5 bg-black/5 dark:bg-black/40 border-t border-black/5 dark:border-white/5 backdrop-blur-md">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-3 h-3 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11l-8 8-4-4 8-8 4 4z" /></svg>
                    AI Visual Refiner
                  </span>
                  {isRefiningVisual && <span className="text-[9px] text-purple-600 dark:text-purple-400 font-mono">GENERATING...</span>}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefine()}
                    disabled={isRefiningVisual}
                    placeholder="e.g. 'Add cinematic lighting' or 'Make it more minimalist'"
                    className="flex-1 bg-white/60 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all disabled:opacity-50"
                  />
                  <button 
                    onClick={handleRefine}
                    disabled={isRefiningVisual || !refinementPrompt.trim()}
                    className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-xl text-[10px] font-bold text-gray-600 dark:text-gray-300 transition-all uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Refine
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-300">Social Amplification Snippets</h3>
            <div className="space-y-3">
              {results.copy.socialPosts.map((post, idx) => (
                <div key={idx} className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-xl text-sm text-gray-600 dark:text-gray-400 italic">
                   "{post}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutcomeView;