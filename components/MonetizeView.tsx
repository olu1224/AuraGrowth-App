
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { ClientProposal } from '../types';
import ProposalModal from './ProposalModal';

interface MonetizeViewProps {
  credits: number;
  onTopUp: () => void;
  onDeployToMarket?: (objective: string, audience: string) => void;
}

const MonetizeView: React.FC<MonetizeViewProps> = ({ credits, onTopUp, onDeployToMarket }) => {
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [activeProposal, setActiveProposal] = useState<ClientProposal | null>(null);

  const targetMarkets = [
    { 
      name: "SaaS Startups", 
      opportunity: "High", 
      price: "$2k - $5k", 
      icon: "🚀", 
      desc: "Founders need 'Launch Kits' for ProductHunt and cold outreach.",
      objective: "Full viral launch kit for a disruptive SaaS product",
      audience: "Early-stage tech founders and growth marketers"
    },
    { 
      name: "Local Luxury", 
      opportunity: "Medium", 
      price: "$1k - $3k", 
      icon: "💎", 
      desc: "Artisans and niche shops need 'Premium Aesthetic' rebrands.",
      objective: "Premium heritage-focused rebrand and local awareness campaign",
      audience: "High-net-worth local residents and luxury collectors"
    },
    { 
      name: "E-comm Brands", 
      opportunity: "Critical", 
      price: "$3k+ /mo", 
      icon: "🛒", 
      desc: "Constant need for fresh visual assets and high-converting ad copy.",
      objective: "High-frequency creative refresh for seasonal inventory",
      audience: "Impulse buyers and lifestyle-conscious consumers"
    },
    { 
      name: "Real Estate", 
      opportunity: "High", 
      price: "$1.5k /listing", 
      icon: "🏡", 
      desc: "Outcome-based storyboards for high-value properties.",
      objective: "Emotional storytelling narrative for a multi-million dollar listing",
      audience: "Luxury home buyers and real estate investors"
    }
  ];

  const pricingTiers = [
    { name: "Starter Swarm", credits: 5, price: "$99", best: false },
    { name: "Growth Engine", credits: 15, price: "$249", best: true },
    { name: "Enterprise Swarm", credits: 50, price: "$749", best: false },
  ];

  const comparisonData = [
    { label: "Monthly Overhead", human: "$10,000", swarm: "$249", better: "swarm" },
    { label: "Turnaround Time", human: "14 Days", swarm: "2 Mins", better: "swarm" },
    { label: "Daily Output", human: "1-2 Tasks", swarm: "∞ Outcomes", better: "swarm" },
    { label: "Emotional Management", human: "High", swarm: "Zero", better: "swarm" },
    { label: "Scalability", human: "Requires Hiring", swarm: "Instant", better: "swarm" },
  ];

  const handleGenerateProposal = async () => {
    setIsGeneratingProposal(true);
    try {
      // For the demo, we use a general high-growth market
      const proposal = await geminiService.generateClientProposal("High-Growth Startup");
      setActiveProposal(proposal);
    } catch (error) {
      console.error("Proposal generation failed", error);
      alert("Failed to generate proposal. Please check your connection.");
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-5xl md:text-6xl font-bold brand-font">Revenue <span className="text-emerald-500">Hub</span></h2>
        <p className="text-gray-500 text-lg">
          The manual for building your <span className="text-purple-500 font-bold underline italic">Solo Billion-Dollar Agency</span>. Sell the outcome, own the margin.
        </p>
      </div>

      {/* Comparison Section: The "Why they want this" Visualization */}
      <div className="glass-card rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold text-purple-500 uppercase tracking-[0.3em]">The Economic Inevitability</span>
              <h3 className="text-4xl font-bold brand-font text-black dark:text-white leading-tight">
                Why Clients Ditch <span className="text-red-500 line-through">Agencies</span> for Your Swarm.
              </h3>
              <p className="text-gray-500 leading-relaxed">
                A traditional marketing team costs $120,000/year and sleeps 16 hours a day. Your Aura Swarm costs $249/mo and generates 400x the output at peak efficiency.
              </p>
            </div>

            <div className="space-y-4">
              {comparisonData.map((row, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <span className="text-sm font-medium text-gray-500">{row.label}</span>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-red-500/50">{row.human}</span>
                    <div className="w-12 h-[1px] bg-gray-200 dark:bg-white/10"></div>
                    <span className="text-sm font-bold text-emerald-500 group-hover:scale-110 transition-transform">{row.swarm}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
               <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">📈</div>
                 <div className="space-y-1">
                   <h4 className="font-bold text-emerald-400 text-sm">97.5% Cost Reduction</h4>
                   <p className="text-[10px] text-gray-500 leading-relaxed">
                     By removing human labor from the "creation-to-outcome" loop, you capture the entire agency margin for yourself.
                   </p>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-[2.5rem] p-8 space-y-8 relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="text-center space-y-2">
               <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Client Presentation Mode</h4>
               <p className="text-2xl font-bold text-white">"The 24-Hour Blitz" Package</p>
             </div>

             <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <div className="space-y-1">
                     <span className="text-[10px] text-gray-400 uppercase">Agency Quote</span>
                     <div className="text-xl font-bold text-red-500/80 line-through">$10,000</div>
                   </div>
                   <div className="text-right space-y-1">
                     <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">Your ASB Price</span>
                     <div className="text-4xl font-bold text-white">$1,499</div>
                   </div>
                </div>

                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">Your Net Profit</div>
                      <div className="text-xl font-bold text-emerald-500">$1,480</div>
                   </div>
                   <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[8px] text-gray-500 uppercase font-bold mb-1">Human Labor</div>
                      <div className="text-xl font-bold text-blue-500">0.0 hrs</div>
                   </div>
                </div>
             </div>

             <button 
              onClick={handleGenerateProposal}
              disabled={isGeneratingProposal}
              className={`w-full py-4 rounded-2xl aura-gradient text-white font-bold text-sm shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 ${isGeneratingProposal ? 'opacity-70 cursor-not-allowed' : ''}`}
             >
               {isGeneratingProposal ? (
                 <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating Brief...
                 </>
               ) : 'Generate Client Proposal'}
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {targetMarkets.map((market, i) => (
          <div key={i} className="glass-card rounded-[2rem] p-8 border-t-4 border-emerald-500/20 group hover:border-emerald-500 transition-all cursor-pointer flex flex-col h-full">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{market.icon}</div>
            <h3 className="text-xl font-bold text-black dark:text-white">{market.name}</h3>
            <div className="flex justify-between items-center mt-2 mb-4">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Market Value</span>
              <span className="text-xs font-bold text-emerald-500">{market.price}</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed italic mb-8 flex-1">"{market.desc}"</p>
            <button 
              onClick={() => onDeployToMarket && onDeployToMarket(market.objective, market.audience)}
              className="w-full py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest hover:aura-gradient hover:text-white hover:border-transparent transition-all"
            >
              Deploy Swarm
            </button>
          </div>
        ))}
      </div>

      {/* Company Monetization: The Outcome Credit Store */}
      <div className="glass-card rounded-[2.5rem] p-10 bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/20">
         <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-8">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-3xl font-bold brand-font text-black dark:text-white">Refuel the Swarm</h3>
              <p className="text-gray-500 text-sm italic">AuraGrowth charges per outcome delivered. No seats, no waste.</p>
            </div>
            <div className="text-center bg-black/5 dark:bg-white/5 px-8 py-4 rounded-3xl border border-white/10">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Available Credits</div>
              <div className="text-4xl font-bold text-purple-500">{credits}</div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {pricingTiers.map((tier, i) => (
             <div key={i} className={`glass-card rounded-3xl p-8 flex flex-col items-center text-center space-y-6 relative border-t-4 ${tier.best ? 'border-purple-500 bg-purple-500/5 scale-105' : 'border-white/10'}`}>
                {tier.best && <span className="absolute -top-4 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</span>}
                <div>
                  <h4 className="font-bold text-black dark:text-white text-xl">{tier.name}</h4>
                  <div className="text-4xl font-bold text-black dark:text-white mt-2">{tier.price}</div>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">{tier.credits} Outcome Credits</p>
                </div>
                <ul className="text-xs text-gray-500 space-y-2 flex-1">
                  <li>• Complete Launch Kits</li>
                  <li>• High-Res Visual Assets</li>
                  <li>• Deployment Roadmaps</li>
                  {tier.credits >= 15 && <li>• Advanced Gemini Pro Reasoning</li>}
                </ul>
                <button 
                  onClick={onTopUp}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${tier.best ? 'aura-gradient text-white shadow-lg shadow-purple-500/20' : 'bg-black/5 dark:bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'}`}
                >
                  Purchase Pack
                </button>
             </div>
           ))}
         </div>
      </div>

      <div className="bg-black dark:bg-white rounded-[3rem] p-12 text-center space-y-8">
        <h3 className="text-4xl md:text-5xl font-bold brand-font text-white dark:text-black">
          Stop Buying <span className="text-gray-500">Hours.</span><br />
          Start Owning <span className="text-transparent bg-clip-text aura-gradient">Results.</span>
        </h3>
        <p className="text-gray-400 dark:text-gray-600 max-w-2xl mx-auto">
          The Solo Billion-Dollar Model isn't about working harder. It's about deploying more intelligent swarms. Every outcome you generate is a high-margin asset sold for pure profit.
        </p>
        <button 
          onClick={() => (window as any).scrollTo({ top: 0, behavior: 'smooth' })}
          className="px-12 py-5 rounded-2xl aura-gradient text-white font-bold text-xl shadow-2xl shadow-purple-500/40 hover:scale-105 transition-transform"
        >
          Initialize Your First Swarm
        </button>
      </div>

      {activeProposal && (
        <ProposalModal proposal={activeProposal} onClose={() => setActiveProposal(null)} />
      )}
    </div>
  );
};

export default MonetizeView;
