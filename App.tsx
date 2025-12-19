
import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import AgentTerminal from './components/AgentTerminal';
import OutcomeView from './components/OutcomeView';
import SwarmManager from './components/SwarmManager';
import SwarmGraph from './components/SwarmGraph';
import AnalyticsView from './components/AnalyticsView';
import LedgerView from './components/LedgerView';
import BillionDashboard from './components/BillionDashboard';
import { CampaignOutcome, AgentActivity, AgentRole, Agent, Task } from './types';
import { geminiService } from './services/geminiService';

const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent-1',
    role: 'RESEARCHER',
    name: 'Aura-Scan V1',
    specialty: 'Quantitative Market Analysis',
    instruction: 'Look for untapped market gaps and viral social triggers in the coffee niche.',
    status: 'IDLE',
    statusMessage: 'Ready for analysis',
    tasks: [
      { id: 't1-1', description: 'Analyze market competitors', priority: 'HIGH', status: 'PENDING' },
      { id: 't1-2', description: 'Identify audience pain points', priority: 'MEDIUM', dependencyId: 't1-1', status: 'PENDING' }
    ]
  },
  {
    id: 'agent-2',
    role: 'STRATEGIST',
    name: 'Nexus Prime',
    specialty: 'Growth Hacking & LTV Optimization',
    instruction: 'Focus on direct-to-consumer high-conversion funnels.',
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
    instruction: 'Use a sophisticated yet approachable tone that appeals to luxury-seeking professionals.',
    status: 'IDLE',
    statusMessage: 'Ready to write',
    tasks: [
      { id: 't3-1', description: 'Create 3 social hooks', priority: 'MEDIUM', status: 'PENDING' }
    ]
  },
  {
    id: 'agent-4',
    role: 'DESIGNER',
    name: 'Chromax-AI',
    specialty: 'Cinematic Brand Visuals',
    instruction: 'Focus on minimalist, high-contrast, and premium aesthetic styles.',
    status: 'IDLE',
    statusMessage: 'Engines initialized',
    tasks: [
      { id: 't4-1', description: 'Generate high-res hero image', priority: 'HIGH', status: 'PENDING' }
    ]
  }
];

type ActiveTab = 'ENGINE' | 'ANALYTICS' | 'LEDGER' | 'DASHBOARD';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ENGINE');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRole, setActiveRole] = useState<AgentRole | null>(null);
  const [outcome, setOutcome] = useState<CampaignOutcome | null>(null);
  const [history, setHistory] = useState<CampaignOutcome[]>([]);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [isRefiningVisual, setIsRefiningVisual] = useState(false);

  // Stats tracking for analytics
  const [totalTasksCompleted, setTotalTasksCompleted] = useState(0);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const addActivity = (role: AgentRole, message: string) => {
    setActivities(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        role,
        message,
        timestamp: Date.now()
      }
    ]);
  };

  const updateAgent = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
  };

  const updateAgentState = (role: AgentRole, status: Agent['status'], message: string, taskUpdates?: Partial<Task>[]) => {
    setAgents(prev => prev.map(a => {
      if (a.role === role) {
        let updatedTasks = a.tasks;
        if (taskUpdates) {
          updatedTasks = a.tasks.map(t => {
            const foundUpdate = taskUpdates.find(u => u.id === t.id);
            if (foundUpdate?.status === 'COMPLETED' && t.status !== 'COMPLETED') {
               setTotalTasksCompleted(c => c + 1);
            }
            return foundUpdate ? { ...t, ...foundUpdate } : t;
          });
        }
        return { ...a, status, statusMessage: message, tasks: updatedTasks };
      }
      return a;
    }));
  };

  const resetAllTasks = () => {
    setAgents(prev => prev.map(a => ({
      ...a,
      tasks: a.tasks.map(t => ({ ...t, status: 'PENDING' }))
    })));
  };

  const setAllAgentsStatus = (status: Agent['status'], message?: string) => {
    setAgents(prev => prev.map(a => ({ ...a, status, statusMessage: message || (status === 'IDLE' ? 'Standing by' : 'Initializing...') })));
  };

  const handleRefineVisual = async (description: string) => {
    if (!outcome) return;
    setIsRefiningVisual(true);
    setActiveRole('DESIGNER');
    updateAgentState('DESIGNER', 'ACTIVE', 'Refining campaign visual...');
    addActivity('DESIGNER', `Visual refinement initiated: "${description}"`);

    try {
      const newImageUrl = await geminiService.generateCampaignImage(description);
      if (newImageUrl) {
        setOutcome(prev => {
          if (!prev || !prev.results) return prev;
          const updated = {
            ...prev,
            results: {
              ...prev.results,
              visualUrl: newImageUrl
            }
          };
          setHistory(h => h.map(item => item.id === prev.id ? updated : item));
          return updated;
        });
        addActivity('DESIGNER', 'Visual refinement completed successfully.');
      }
    } catch (error) {
      console.error(error);
      addActivity('DESIGNER', 'Error during visual refinement.');
      updateAgentState('DESIGNER', 'IDLE', 'Refinement failed');
    } finally {
      setIsRefiningVisual(false);
      setActiveRole(null);
      if (!isProcessing) updateAgentState('DESIGNER', 'IDLE', 'Assets generated');
    }
  };

  const runCampaignOutcomeProcess = async () => {
    if (!objective || !audience) return;

    setIsProcessing(true);
    setActivities([]);
    setOutcome(null);
    resetAllTasks();
    setAllAgentsStatus('ACTIVE');

    try {
      const currentAgentsSnapshot = JSON.parse(JSON.stringify(agents));
      const activeResearcher = currentAgentsSnapshot.find((a: Agent) => a.role === 'RESEARCHER')!;
      const activeStrategist = currentAgentsSnapshot.find((a: Agent) => a.role === 'STRATEGIST')!;
      const activeCopywriter = currentAgentsSnapshot.find((a: Agent) => a.role === 'COPYWRITER')!;
      const activeDesigner = currentAgentsSnapshot.find((a: Agent) => a.role === 'DESIGNER')!;

      setActiveRole('RESEARCHER');
      updateAgentState('RESEARCHER', 'ACTIVE', 'Analyzing market trends...', activeResearcher.tasks.map((t: Task) => ({ id: t.id, status: 'IN_PROGRESS' })));
      addActivity('RESEARCHER', `${activeResearcher.name} is scanning data for: "${objective}"`);
      await new Promise(r => setTimeout(r, 1500));
      updateAgentState('RESEARCHER', 'IDLE', 'Research complete', activeResearcher.tasks.map((t: Task) => ({ id: t.id, status: 'COMPLETED' })));
      addActivity('RESEARCHER', `Segments identified based on ${activeResearcher.specialty}.`);
      
      setActiveRole('STRATEGIST');
      updateAgentState('STRATEGIST', 'ACTIVE', 'Calculating growth trajectory...', activeStrategist.tasks.map((t: Task) => ({ id: t.id, status: 'IN_PROGRESS' })));
      addActivity('STRATEGIST', `${activeStrategist.name} is calculating outcome trajectory...`);
      const results = await geminiService.generateMarketingOutcome(objective, audience, currentAgentsSnapshot);
      await new Promise(r => setTimeout(r, 1000));
      updateAgentState('STRATEGIST', 'ACTIVE', 'Finalizing blueprint...');
      addActivity('STRATEGIST', `Blueprint locked: ${results.strategy.substring(0, 40)}...`);

      setActiveRole('COPYWRITER');
      updateAgentState('COPYWRITER', 'ACTIVE', 'Synthesizing persuasive copy...', activeCopywriter.tasks.map((t: Task) => ({ id: t.id, status: 'IN_PROGRESS' })));
      addActivity('COPYWRITER', `${activeCopywriter.name} generating narratives for "${activeCopywriter.specialty}"...`);
      await new Promise(r => setTimeout(r, 1200));
      updateAgentState('COPYWRITER', 'IDLE', 'Copy package ready', activeCopywriter.tasks.map((t: Task) => ({ id: t.id, status: 'COMPLETED' })));
      addActivity('COPYWRITER', `Headline synthesized: "${results.copy.headline}"`);

      setActiveRole('DESIGNER');
      updateAgentState('DESIGNER', 'ACTIVE', 'Rendering cinematic assets...', activeDesigner.tasks.map((t: Task) => ({ id: t.id, status: 'IN_PROGRESS' })));
      addActivity('DESIGNER', `${activeDesigner.name} rendering high-fidelity visual outcome...`);
      const imageUrl = await geminiService.generateCampaignImage(results.visualPrompt);
      updateAgentState('DESIGNER', 'IDLE', 'Assets generated', activeDesigner.tasks.map((t: Task) => ({ id: t.id, status: 'COMPLETED' })));
      addActivity('DESIGNER', `Asset generation finalized.`);

      const finalOutcome: CampaignOutcome = {
        id: Date.now().toString(),
        name: `Outcome: ${objective.substring(0, 30)}...`,
        status: 'COMPLETED',
        objective,
        targetAudience: audience,
        timestamp: Date.now(),
        results: {
          ...results,
          visualUrl: imageUrl
        }
      };

      setOutcome(finalOutcome);
      setHistory(prev => [finalOutcome, ...prev]);
      setActiveRole(null);
      updateAgentState('STRATEGIST', 'IDLE', 'Outcome delivered', activeStrategist.tasks.map((t: Task) => ({ id: t.id, status: 'COMPLETED' })));
      addActivity('STRATEGIST', `Process complete. Outcome fully delivered.`);
    } catch (error) {
      console.error(error);
      setActiveRole(null);
      setAllAgentsStatus('IDLE', 'Execution failed');
      addActivity('RESEARCHER', 'CRITICAL ERROR: Swarm connection interrupted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      <header className="border-b border-black/5 dark:border-white/5 py-6 px-8 flex justify-between items-center glass-card sticky top-0 z-50">
        <button onClick={() => setActiveTab('ENGINE')} className="hover:opacity-80 transition-opacity">
          <Logo />
        </button>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('ANALYTICS')}
              className={`transition-colors ${activeTab === 'ANALYTICS' ? 'text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Swarm Analytics
            </button>
            <button 
              onClick={() => setActiveTab('LEDGER')}
              className={`transition-colors ${activeTab === 'LEDGER' ? 'text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
            >
              Outcome Ledger
            </button>
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-5 py-2 rounded-full border border-black/10 dark:border-white/10 transition-all text-xs font-bold tracking-widest uppercase ${activeTab === 'DASHBOARD' ? 'aura-gradient text-white' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'}`}
            >
              Solo-Billion Dashboard
            </button>
          </nav>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"/></svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-12">
        {activeTab === 'ENGINE' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-5 space-y-8">
              <section>
                <h2 className="text-4xl font-bold mb-4 brand-font leading-tight">
                  Agentic <span className="text-transparent bg-clip-text aura-gradient">Swarm Control.</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  Configure specialized agents and their managed tasks. Results are outcome-driven, not seat-based.
                </p>
              </section>

              <SwarmManager agents={agents} onUpdateAgent={updateAgent} />

              <div className="glass-card rounded-3xl p-8 space-y-6">
                <div className="space-y-4">
                  <label className="block">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Business Objective</span>
                      <span className="text-[10px] text-purple-400 font-mono">STEP 01</span>
                    </div>
                    <textarea 
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      placeholder="e.g. Disrupt the luxury watches market with a story-first Instagram campaign"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none h-24"
                    />
                  </label>
                  <label className="block">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Target Audience</span>
                      <span className="text-[10px] text-purple-400 font-mono">STEP 02</span>
                    </div>
                    <input 
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      type="text"
                      placeholder="e.g. Gen-Z entrepreneurs interested in sustainable luxury"
                      className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </label>
                </div>

                <button 
                  onClick={runCampaignOutcomeProcess}
                  disabled={isProcessing || !objective || !audience}
                  className={`w-full aura-gradient p-5 rounded-2xl font-bold text-xl text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"></div>
                      Swarm Processing...
                    </>
                  ) : (
                    'Execute Outcome Swarm'
                  )}
                </button>
              </div>

              <AgentTerminal activities={activities} />
            </div>

            <div className="lg:col-span-7 space-y-8">
              <SwarmGraph 
                activeRole={activeRole} 
                isProcessing={isProcessing || isRefiningVisual} 
                agents={agents}
              />

              {!outcome && !isProcessing && (
                <div className="h-full min-h-[400px] glass-card rounded-3xl border-dashed border-2 border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center p-12 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                    <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-700 dark:text-gray-300">Swarm Ready for Deployment</h3>
                  <p className="text-gray-500 max-w-sm">
                    The solo-billion engine is optimized for high-performance marketing. Defined agent tasks will be processed in priority sequence.
                  </p>
                </div>
              )}

              {isProcessing && !outcome && (
                <div className="h-full min-h-[400px] glass-card rounded-3xl flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 aura-gradient"></div>
                  <h3 className="text-3xl font-bold mb-4 brand-font text-black dark:text-white">
                    Active Swarm Execution
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md italic">
                    Current Active: <span className="text-purple-400 font-bold">{activeRole || 'Initializing...'}</span>
                  </p>
                  <div className="mt-8 w-64 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full aura-gradient w-1/3"></div>
                  </div>
                </div>
              )}

              {outcome && outcome.results && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-3xl font-bold brand-font">Outcome <span className="text-emerald-500">Ledger</span></h2>
                     <div className="flex items-center gap-2">
                       <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Hash: {outcome.id.substring(0,8)}</span>
                       <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-bold uppercase tracking-tighter">Verified Result</span>
                     </div>
                  </div>
                  <OutcomeView 
                    results={outcome.results} 
                    onRefineVisual={handleRefineVisual} 
                    isRefiningVisual={isRefiningVisual}
                  />
                  <div className="flex gap-4 mt-8">
                     <button className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-black/10 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                       Asset Bundle
                     </button>
                     <button 
                      onClick={() => setActiveTab('LEDGER')}
                      className="flex-1 bg-black dark:bg-white text-white dark:text-black p-4 rounded-2xl font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                     >
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                       View in Ledger
                     </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ANALYTICS' && <AnalyticsView agents={agents} totalTasksCompleted={totalTasksCompleted} />}
        {activeTab === 'LEDGER' && <LedgerView history={history} onSelectOutcome={(o) => { setOutcome(o); setActiveTab('ENGINE'); }} />}
        {activeTab === 'DASHBOARD' && <BillionDashboard history={history} agents={agents} totalTasks={totalTasksCompleted} />}
      </main>

      <footer className="border-t border-black/5 dark:border-white/5 py-8 px-12 glass-card text-center text-gray-500 text-sm">
        <p>&copy; 2025 AuraGrowth ASB. Powered by the Solo Billion-Dollar Architecture. Results-Oriented Agency of the Future.</p>
      </footer>
    </div>
  );
};

export default App;
