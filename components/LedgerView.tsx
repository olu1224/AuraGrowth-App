
import React from 'react';
import { CampaignOutcome } from '../types';

interface LedgerViewProps {
  history: CampaignOutcome[];
  onSelectOutcome: (outcome: CampaignOutcome) => void;
}

const LedgerView: React.FC<LedgerViewProps> = ({ history, onSelectOutcome }) => {
  if (history.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 glass-card rounded-3xl border-dashed border-2 border-white/10 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-300">The Ledger is Empty</h3>
        <p className="text-gray-500 max-w-sm">
          Run your first swarm execution in the Engine view to record business outcomes here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold brand-font">Outcome <span className="text-emerald-400">Ledger</span></h2>
          <p className="text-gray-500 mt-2">A verifiable history of autonomous business results.</p>
        </div>
        <div className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          TOTAL LEDGER SIZE: {history.length} ENTRIES
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {history.map((item) => (
          <div 
            key={item.id} 
            onClick={() => onSelectOutcome(item)}
            className="glass-card rounded-3xl overflow-hidden hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="h-40 w-full relative overflow-hidden">
              {item.results?.visualUrl ? (
                <img src={item.results.visualUrl} alt={item.name} className={`w-full h-full object-cover transition-all duration-500 ${item.isActivated ? '' : 'grayscale group-hover:grayscale-0'}`} />
              ) : (
                <div className="w-full h-full bg-white/5 animate-pulse"></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent"></div>
              
              {item.isActivated && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500 px-3 py-1 rounded-full text-white text-[8px] font-bold shadow-lg animate-pulse">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  LIVE IN MARKET
                </div>
              )}

              <div className="absolute bottom-4 left-4 right-4">
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${item.isActivated ? 'text-emerald-400' : 'text-gray-400'}`}>
                  {item.isActivated ? 'VERIFIED OUTCOME' : 'DRAFT ASSET'}
                </div>
                <h4 className="text-lg font-bold text-white truncate">{item.name}</h4>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-600 uppercase">Objective Snippet</div>
                <p className="text-xs text-gray-400 line-clamp-2 italic">"{item.objective}"</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <div className="text-[10px] text-gray-600 font-mono">
                  {new Date(item.timestamp).toLocaleDateString()} @ {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <button className={`text-[10px] font-bold uppercase tracking-widest group-hover:underline ${item.isActivated ? 'text-emerald-400' : 'text-purple-400'}`}>
                  {item.isActivated ? 'Inspect Stats' : 'Inspect Result'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LedgerView;
