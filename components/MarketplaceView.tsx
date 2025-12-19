
import React, { useState } from 'react';
import { CommunityOutcome } from '../types';

interface MarketplaceViewProps {
  onDeployToMarket: (objective: string, audience: string) => void;
}

const COMMUNITY_OUTCOMES: CommunityOutcome[] = [
  {
    id: 'm1',
    name: 'NeuroFitness Ad Swarm',
    objective: 'Promote a brain-training app using biofeedback visuals',
    targetAudience: 'Health-conscious tech professionals',
    author: 'Alex G.',
    revenue: '$42k',
    likes: 124,
    status: 'COMPLETED',
    timestamp: Date.now()
  },
  {
    id: 'm2',
    name: 'Artisan Coffee Rebrand',
    objective: 'Local coffee shop expansion strategy with social hook library',
    targetAudience: 'Urban remote workers',
    author: 'Sarah M.',
    revenue: '$12k',
    likes: 89,
    status: 'COMPLETED',
    timestamp: Date.now() - 86400000
  },
  {
    id: 'm3',
    name: 'Luxury Yacht Charter',
    objective: 'High-ticket lead generation for coastal yacht experiences',
    targetAudience: 'Ultra-high-net-worth travellers',
    author: 'Venture Capitalist',
    revenue: '$180k',
    likes: 256,
    status: 'COMPLETED',
    timestamp: Date.now() - 172800000
  }
];

const MarketplaceView: React.FC<MarketplaceViewProps> = ({ onDeployToMarket }) => {
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitApplication = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-xl space-y-4">
          <h2 className="text-5xl font-bold brand-font">Swarm <span className="text-purple-400">Marketplace</span></h2>
          <p className="text-gray-500 text-lg">
            Discover pre-validated outcomes built by the AuraGrowth community. One-click deploy to your own cluster.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-4 bg-black/5 dark:bg-white/5 border border-white/10 rounded-3xl text-center">
            <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Total Community Rev</div>
            <div className="text-2xl font-bold text-emerald-400">$2.4M</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COMMUNITY_OUTCOMES.map((item) => (
          <div key={item.id} className="glass-card rounded-[2.5rem] p-8 space-y-6 group hover:border-purple-500/50 transition-all border border-transparent">
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl aura-gradient flex items-center justify-center text-xl text-white shadow-lg">
                  {item.likes > 200 ? '🔥' : '⭐'}
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-500 uppercase">Author</div>
                  <div className="text-xs font-bold text-white">{item.author}</div>
                </div>
             </div>
             
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{item.name}</h3>
                <p className="text-xs text-gray-500 italic line-clamp-2">"{item.objective}"</p>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                   <div className="text-[8px] text-gray-500 uppercase font-bold">Outcome Revenue</div>
                   <div className="text-lg font-bold text-emerald-400">{item.revenue}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                   <div className="text-[8px] text-gray-500 uppercase font-bold">Community Likes</div>
                   <div className="text-lg font-bold text-pink-400">{item.likes}</div>
                </div>
             </div>

             <button 
               onClick={() => onDeployToMarket(item.objective, item.targetAudience)}
               className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:aura-gradient hover:text-white transition-all"
             >
               Deploy to My Swarm
             </button>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-[3rem] p-12 text-center space-y-6 relative overflow-hidden group">
         <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
         <h3 className="text-3xl font-bold brand-font text-white">Share Your Success</h3>
         <p className="text-gray-400 max-w-xl mx-auto">
           Top-performing swarms can be monetized in the marketplace. Earn a 10% commission on every deployment of your unique outcome logic.
         </p>
         <button 
          onClick={() => setShowAuthorModal(true)}
          className="px-8 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-all active:scale-95"
         >
           Apply for Author Status
         </button>
      </div>

      {/* Author Enrollment Modal */}
      {showAuthorModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
           <div className="bg-gray-950 w-full max-w-2xl rounded-[3rem] border border-white/10 p-10 space-y-8 relative overflow-hidden shadow-2xl shadow-emerald-500/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
              
              <div className="flex justify-between items-start relative z-10">
                 <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Enrollment Portal</span>
                    <h2 className="text-4xl font-bold text-white brand-font">Swarm Author Status</h2>
                 </div>
                 <button onClick={() => { setShowAuthorModal(false); setSubmitted(false); }} className="text-gray-500 hover:text-white transition-colors">✕</button>
              </div>

              {!submitted ? (
                <div className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                       <h4 className="font-bold text-white text-sm">Automated Payments</h4>
                       <p className="text-[10px] text-gray-500 leading-relaxed">
                         Earnings are tracked in the <strong>Aura Ledger</strong>. When a user deploys your swarm, 10% of the credit value is instantly credited to your account. Payouts are made weekly in USD or Stablecoins.
                       </p>
                    </div>
                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                       <h4 className="font-bold text-white text-sm">Validation Loop</h4>
                       <p className="text-[10px] text-gray-500 leading-relaxed">
                         Before your swarm goes live, it's audited by our <strong>Guardian Agents</strong> to ensure 99%+ outcome success rates and context safety.
                       </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block space-y-2">
                       <span className="text-[10px] font-bold text-gray-500 uppercase">Primary Niche</span>
                       <input type="text" placeholder="e.g. Luxury Real Estate, AI SaaS" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500" />
                    </label>
                    <label className="block space-y-2">
                       <span className="text-[10px] font-bold text-gray-500 uppercase">Why should your swarm be public?</span>
                       <textarea placeholder="Tell us about the outcomes you've achieved..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 h-24 resize-none" />
                    </label>
                  </div>

                  <button 
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting}
                    className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
                  >
                    {isSubmitting ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Processing Application...</>
                    ) : 'Submit Application'}
                  </button>
                  <p className="text-center text-[8px] text-gray-600 uppercase tracking-widest">By submitting, you agree to the 10% Royalty Protocol.</p>
                </div>
              ) : (
                <div className="text-center space-y-6 py-10 animate-in zoom-in-95 duration-500 relative z-10">
                   <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 shadow-xl shadow-emerald-500/10">✨</div>
                   <h3 className="text-2xl font-bold text-white">Application Received!</h3>
                   <p className="text-gray-400 text-sm max-w-sm mx-auto">
                     Our Guardian Agents are now reviewing your profile and swarm history. You will receive an update in the <strong>Neural Terminal</strong> within 24 hours.
                   </p>
                   <button 
                    onClick={() => { setShowAuthorModal(false); setSubmitted(false); }}
                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10"
                   >
                     Back to Marketplace
                   </button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceView;
