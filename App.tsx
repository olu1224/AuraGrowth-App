
import React, { useState, useEffect, useRef } from 'react';
import Logo from './components/Logo';
import AgentTerminal from './components/AgentTerminal';
import OutcomeView from './components/OutcomeView';
import SwarmGraph from './components/SwarmGraph';
import AnalyticsView from './components/AnalyticsView';
import LedgerView from './components/LedgerView';
import BillionDashboard from './components/BillionDashboard';
import MonetizeView from './components/MonetizeView';
import ArchitectureView from './components/ArchitectureView';
import MarketplaceView from './components/MarketplaceView';
import LiveSupportAgent from './components/LiveSupportAgent';
import { CampaignOutcome, AgentActivity, AgentRole, Agent } from './types';
import { geminiService } from './services/geminiService';

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    role: 'RESEARCHER',
    name: 'Aura-Scan V1',
    specialty: 'Quantitative Market Analysis',
    instruction: 'Extract competitor data and high-intent audience keywords.',
    status: 'IDLE',
    statusMessage: 'Ready for analysis',
    tasks: [
      { id: 't1-1', description: 'Analyze market competitors', priority: 'HIGH', status: 'PENDING' },
      { id: 't1-2', description: 'Identify audience pain points', priority: 'MEDIUM', status: 'PENDING' }
    ]
  },
  {
    id: 'agent-2',
    role: 'STRATEGIST',
    name: 'Nexus Prime',
    specialty: 'Growth Hacking & LTV Optimization',
    instruction: 'Focus on direct-to-consumer high-conversion funnels and multi-channel plans.',
    status: 'IDLE',
    statusMessage: 'Standing by for blueprinting',
    tasks: [
      { id: 't2-1', description: 'Draft conversion funnel', priority: 'HIGH', status: 'PENDING' }
    ]
  },
  {
    id: 'agent-3',
    role: 'COPYWRITER',
    name: 'Vox-Elite',
    specialty: 'Persuasive Storytelling',
    instruction: 'Generate segmented copy for Social, Email, and SMS campaigns.',
    status: 'IDLE',
    statusMessage: 'Ready to write',
    tasks: [
      { id: 't3-1', description: 'Create multi-channel messaging', priority: 'MEDIUM', status: 'PENDING' }
    ]
  },
  {
    id: 'agent-4',
    role: 'DESIGNER',
    name: 'Chromax-AI',
    specialty: 'Cinematic Brand Visuals',
    instruction: 'Create cinematic 1080p video prompts and high-res hero images.',
    status: 'IDLE',
    statusMessage: 'Engines initialized',
    tasks: [
      { id: 't4-1', description: 'Generate high-res hero asset', priority: 'HIGH', status: 'PENDING' },
      { id: 't4-2', description: 'Synthesize AI brand reel', priority: 'HIGH', status: 'PENDING' }
    ]
  }
];

const MAGIC_TEMPLATES = [
  { label: "🚀 SAAS LAUNCH", obj: "Viral kit for a disruptive AI tool.", aud: "Tech Founders." },
  { label: "💎 LUXURY BRAND", obj: "High-ticket lead generation for luxury experiences.", aud: "Ultra-high-net-worth travellers" },
  { label: "☕ COFFEE SHOP", obj: "Local coffee shop expansion strategy.", aud: "Urban remote workers." },
  { label: "🏡 REAL ESTATE", obj: "Emotional narrative for coastal listing.", aud: "HNW Investors." },
];

type ActiveTab = 'Engine' | 'Marketplace' | 'Architecture' | 'Analytics' | 'Ledger' | 'Monetize' | 'Executive';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Engine');
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [campaignAsset, setCampaignAsset] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRole, setActiveRole] = useState<AgentRole | null>(null);
  const [outcome, setOutcome] = useState<CampaignOutcome | null>(null);
  const [history, setHistory] = useState<CampaignOutcome[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [credits, setCredits] = useState(3);
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isTurboMode, setIsTurboMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCampaignAsset(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTemplate = (t: typeof MAGIC_TEMPLATES[0]) => {
    setObjective(t.obj);
    setAudience(t.aud);
  };

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleMonitorPerformance = () => {
    setActiveTab('Analytics');
  };

  const updateAgentState = (role: AgentRole, status: Agent['status'], message: string, isLog: boolean = true) => {
    setAgents(prev => prev.map(a => (a.role === role ? { ...a, status, statusMessage: message } : a)));
    setActivities(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      role,
      message,
      timestamp: Date.now(),
      isLog
    }]);
  };

  const runCampaignOutcomeProcess = async () => {
    if (!objective || !audience) return;
    if (!hasApiKey) { handleSelectKey(); return; }
    
    setIsProcessing(true);
    setOutcome(null);
    setAgents(prev => prev.map(a => ({ ...a, status: 'ACTIVE', statusMessage: 'Initializing swarm...' })));

    try {
      setCredits(prev => prev - 1);
      setActiveRole('RESEARCHER');
      updateAgentState('RESEARCHER', 'ACTIVE', 'Scanning market niches...');
      await new Promise(r => setTimeout(r, isTurboMode ? 200 : 800));
      
      setActiveRole('STRATEGIST');
      updateAgentState('STRATEGIST', 'ACTIVE', isTurboMode ? 'Turbo Synthesis Initiated...' : 'Synthesizing blueprint...');
      const results = await geminiService.generateMarketingOutcome(objective, audience, agents, isTurboMode);
      
      setActiveRole('COPYWRITER');
      updateAgentState('COPYWRITER', 'ACTIVE', 'Drafting multi-channel narrative...');
      await new Promise(r => setTimeout(r, isTurboMode ? 200 : 800));

      setActiveRole('DESIGNER');
      updateAgentState('DESIGNER', 'ACTIVE', 'Rendering visuals...');
      const imageUrl = await geminiService.generateCampaignImage(results.visualPrompt, campaignAsset || undefined);
      
      const finalOutcome: CampaignOutcome = {
        id: Date.now().toString(),
        name: `Outcome: ${objective.substring(0, 25)}...`,
        status: 'COMPLETED',
        objective,
        targetAudience: audience,
        timestamp: Date.now(),
        isActivated: true,
        results: { ...results, visualUrl: imageUrl, campaignAsset: campaignAsset || undefined }
      };

      setOutcome(finalOutcome);
      setHistory(prev => [finalOutcome, ...prev]);
      setActiveRole(null);
      setAgents(prev => prev.map(a => ({ ...a, status: 'IDLE', statusMessage: 'Standing by' })));
      setTotalTasksCompleted(c => c + 4);
      
      setActivities(prev => [...prev, {
        id: 'complete-' + Date.now(),
        role: 'STRATEGIST',
        message: `Outcome synthesized successfully ${isTurboMode ? '(Fast AI Enabled)' : ''}.`,
        timestamp: Date.now(),
        isLog: false
      }]);

    } catch (error) {
      console.error(error);
      setActivities(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'STRATEGIST',
        message: 'Critical failure in swarm synchronization.',
        timestamp: Date.now(),
        isLog: false
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-[#020617]">
      {/* ASB Protocol Ticker Bar */}
      <div className="ticker-bar">
        <div className="ticker-animate flex whitespace-nowrap">
           <span className="ticker-content">ASB PROTOCOL | AURAGROWTH: SOLO BILLION-DOLLAR MODEL IS ONLINE. RESULTS-ORIENTED AGENCY OF THE FUTURE. | </span>
           <span className="ticker-content">ASB PROTOCOL | AURAGROWTH: SOLO BILLION-DOLLAR MODEL IS ONLINE. RESULTS-ORIENTED AGENCY OF THE FUTURE. | </span>
        </div>
      </div>

      <header className="py-4 px-10 flex justify-between items-center bg-[#020617] border-b border-white/5">
        <div className="flex items-center gap-10">
          <button onClick={() => setActiveTab('Engine')} className="hover:opacity-80 transition-opacity focus:outline-none"><Logo className="scale-75 origin-left" /></button>
          <div className="hidden xl:flex items-center gap-8 text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em]">
             <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>GLOBAL SWARM CAPACITY: <span className="text-white">94%</span></div>
             <div className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>ACTIVE OUTCOMES: <span className="text-white">1.2K</span></div>
          </div>
        </div>
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 bg-[#111827] border border-white/10 rounded-full pl-5 pr-1 py-1">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CREDITS:</span>
             <div className="bg-[#1E293B] px-4 py-1.5 rounded-full text-xs font-bold text-emerald-400 min-w-[32px] text-center border border-white/5">{credits}</div>
          </div>
          <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
            {['Engine', 'Marketplace', 'Architecture', 'Analytics', 'Ledger', 'Monetize', 'Executive'].map((id) => (
              <button key={id} onClick={() => setActiveTab(id as ActiveTab)} className={`transition-all relative py-1 ${activeTab === id ? 'text-purple-400' : 'text-slate-500 hover:text-white'}`}>
                {id}{activeTab === id && <span className="absolute -bottom-[21px] left-0 right-0 h-[3px] bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"></span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full p-8 max-w-[1600px] mx-auto">
        {activeTab === 'Engine' && (
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <section className="space-y-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 bg-purple-500 rounded-full"></span><span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Outcome Engine Active</span></div>
                <h1 className="text-4xl font-extrabold brand-font text-white tracking-tighter">Magic <span className="text-purple-500">Swarm Control.</span></h1>
                <p className="text-sm text-slate-500 max-w-sm">Launch end-to-end service outcomes in minutes. Powered by autonomous agentic clusters.</p>
                <div className="space-y-3 pt-2">
                  <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest block">Pre-Validated Templates</span>
                  <div className="flex flex-wrap gap-2">
                    {MAGIC_TEMPLATES.map((t, idx) => (
                      <button key={idx} onClick={() => applyTemplate(t)} className="px-4 py-2 bg-slate-900 border border-white/5 rounded-full text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all">{t.label}</button>
                    ))}
                  </div>
                </div>
              </section>

              <div className="glass-card rounded-3xl p-8 space-y-6 border-white/10 shadow-2xl bg-[#0F172A]/50">
                <div className="space-y-5">
                  <label className="block">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">1. Business Objective</span>
                      <button onClick={() => setIsTurboMode(!isTurboMode)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${isTurboMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-800/50 border-white/5 text-slate-500'}`}>
                         <span className="text-[8px] font-black uppercase tracking-tighter">{isTurboMode ? 'Turbo (Flash Lite)' : 'Standard (Pro)'}</span>
                         <span className="text-xs">⚡</span>
                      </button>
                    </div>
                    <textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="e.g. High-ticket lead generation for coastal yacht experiences..." className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:ring-1 focus:ring-purple-500 h-24 resize-none transition-all placeholder:text-slate-700 font-medium" />
                  </label>
                  
                  <label className="block">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">2. Target Audience</span>
                    <input value={audience} onChange={(e) => setAudience(e.target.value)} type="text" placeholder="e.g. Ultra-high-net-worth travellers" className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-700 font-medium" />
                  </label>

                  {/* New Asset Upload Section */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">3. Brand Assets (Optional)</span>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group"
                    >
                      {campaignAsset ? (
                        <>
                          <img src={campaignAsset} alt="Preview" className="w-full h-full object-contain opacity-40" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest bg-black/60 px-3 py-1 rounded-full">Change Logo/Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-xl mb-1">📁</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-purple-400">Attach Logo or Visual Ref</span>
                        </>
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </div>
                  </div>
                </div>
                <button onClick={runCampaignOutcomeProcess} disabled={isProcessing || !objective || !audience} className="w-full aura-gradient p-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white transition-all transform hover:brightness-110 active:scale-[0.98] shadow-2xl shadow-purple-600/20">
                  {isProcessing ? 'Synthesizing Swarm...' : 'Generate Outcome'}
                </button>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center"><span className="text-[9px] font-extrabold text-slate-600 uppercase tracking-widest">Swarm Configuration</span></div>
                 <div className="grid grid-cols-2 gap-3">
                    {agents.map(agent => (
                      <div key={agent.id} className={`p-4 rounded-2xl border border-white/10 flex items-start gap-3 bg-[#0F172A]/30 hover:border-white/20 transition-all cursor-pointer ${activeRole === agent.role ? 'ring-1 ring-purple-500' : ''}`}>
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">{agent.role === 'RESEARCHER' ? '🔍' : agent.role === 'STRATEGIST' ? '♟️' : agent.role === 'COPYWRITER' ? '✍️' : '🎨'}</div>
                         <div className="min-w-0"><h4 className="text-[11px] font-bold text-white truncate">{agent.name}</h4><p className="text-[9px] text-slate-500 uppercase font-black">{agent.role}</p></div>
                      </div>
                    ))}
                 </div>
              </div>

              <AgentTerminal activities={activities} />
            </div>

            <div className="col-span-12 lg:col-span-8 space-y-8">
              <SwarmGraph activeRole={activeRole} isProcessing={isProcessing} agents={agents} />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h2 className="text-4xl font-extrabold brand-font text-white flex items-center gap-4">Market <span className="text-emerald-500">Outcome.</span></h2>
                   <div className="px-5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">Ready for Launch</div>
                </div>
                <div className="min-h-[600px] relative">
                  {outcome ? (
                    <OutcomeView results={outcome.results!} onMonitorPerformance={handleMonitorPerformance} isActivated={outcome.isActivated} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-start pt-32 text-center p-16 bg-slate-900/20 backdrop-blur-md rounded-[3rem] border border-white/5 shadow-inner">
                      <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-8 border border-white/10">
                        <svg className="w-10 h-10 text-slate-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" /></svg>
                      </div>
                      <h3 className="text-4xl font-black text-white mb-4 brand-font uppercase tracking-tighter">System Ready</h3>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">Configure your parameters to generate a marketplace-ready business outcome bundle.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'Analytics' && <AnalyticsView agents={agents} totalTasksCompleted={totalTasksCompleted} activeCampaign={outcome || undefined} />}
        {activeTab === 'Marketplace' && <MarketplaceView onDeployToMarket={(obj, aud) => { setObjective(obj); setAudience(aud); setActiveTab('Engine'); }} />}
        {activeTab === 'Architecture' && <ArchitectureView />}
        {activeTab === 'Ledger' && <LedgerView history={history} onSelectOutcome={(o) => setOutcome(o)} />}
        {activeTab === 'Monetize' && <MonetizeView credits={credits} onTopUp={() => setCredits(c => c + 10)} />}
        {activeTab === 'Executive' && <BillionDashboard history={history} agents={agents} totalTasks={totalTasksCompleted} />}
      </main>

      <LiveSupportAgent />
    </div>
  );
};

export default App;
