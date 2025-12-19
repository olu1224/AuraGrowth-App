
import React from 'react';
import { ClientProposal } from '../types';
import Logo from './Logo';

interface ProposalModalProps {
  proposal: ClientProposal;
  onClose: () => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ proposal, onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-950 w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl shadow-purple-500/20 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-black/40">
           <Logo className="scale-75 origin-left" />
           <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-gray-500">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-xl mx-auto space-y-12">
            <header className="space-y-4">
              <span className="text-xs font-bold text-purple-500 uppercase tracking-widest">Client Strategic Brief</span>
              <h2 className="text-4xl font-bold text-black dark:text-white brand-font">Proposal for {proposal.clientName}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 italic">"The Future of High-Velocity Agency Operations."</p>
            </header>

            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/10 pb-2">Executive Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {proposal.executiveSummary}
              </p>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/10 pb-2">Swarm Integration Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {proposal.swarmBenefits.map((benefit, i) => (
                  <div key={i} className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/10 pb-2">Economics of Efficiency</h3>
              <div className="bg-black text-white p-8 rounded-[2rem] space-y-8">
                 <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 uppercase">Legacy Agency Cost</span>
                      <div className="text-xl font-bold text-red-500/80 line-through">{proposal.pricingComparison.traditional}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">ASB Swarm Subscription</span>
                      <div className="text-4xl font-bold text-white">{proposal.pricingComparison.asb}</div>
                    </div>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center">
                    <span className="text-xs text-gray-400">Monthly Client Savings</span>
                    <span className="text-xl font-bold text-emerald-400">{proposal.pricingComparison.savings}</span>
                 </div>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-white/10 pb-2">Execution Timeline</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">First outcome cluster delivered within <span className="text-purple-500 font-bold">{proposal.deliveryTimeline}</span>.</p>
            </section>
          </div>
        </div>

        <div className="p-8 bg-gray-50 dark:bg-black/60 border-t border-gray-100 dark:border-white/10 flex gap-4">
           <button className="flex-1 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm hover:opacity-90 transition-opacity">
             Download Proposal PDF
           </button>
           <button className="flex-1 py-4 aura-gradient text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform">
             Send to Client via AuraLink
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalModal;
