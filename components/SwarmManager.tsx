
import React, { useState, useEffect } from 'react';
import { Agent, AgentRole, Task, TaskPriority, SwarmConfig } from '../types';

interface SwarmManagerProps {
  agents: Agent[];
  onUpdateAgent: (agent: Agent) => void;
  onUpdateAllAgents: (agents: Agent[]) => void;
}

const SwarmManager: React.FC<SwarmManagerProps> = ({ agents, onUpdateAgent, onUpdateAllAgents }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAgent, setDraftAgent] = useState<Agent | null>(null);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskDepId, setNewTaskDepId] = useState<string | undefined>(undefined);
  
  // Library State
  const [savedConfigs, setSavedConfigs] = useState<SwarmConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Load saved configs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('aura_swarm_library');
    if (stored) {
      try {
        setSavedConfigs(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse swarm library", e);
      }
    }
  }, []);

  // Save to localStorage whenever savedConfigs change
  useEffect(() => {
    localStorage.setItem('aura_swarm_library', JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  useEffect(() => {
    if (editingId) {
      const agent = agents.find(a => a.id === editingId);
      if (agent) {
        setDraftAgent(JSON.parse(JSON.stringify(agent)));
      }
    } else {
      setDraftAgent(null);
    }
  }, [editingId, agents]);

  const handleSaveCurrentSwarm = () => {
    if (!saveName.trim()) return;
    const newConfig: SwarmConfig = {
      id: `swarm-${Date.now()}`,
      name: saveName.trim(),
      agents: JSON.parse(JSON.stringify(agents)),
      timestamp: Date.now()
    };
    setSavedConfigs(prev => [newConfig, ...prev]);
    setSaveName('');
    setIsSaving(false);
  };

  const handleLoadSwarm = (config: SwarmConfig) => {
    onUpdateAllAgents(config.agents);
  };

  const handleDeleteSwarm = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedConfigs(prev => prev.filter(c => c.id !== id));
  };

  const getRoleIcon = (role: AgentRole) => {
    switch (role) {
      case 'RESEARCHER': return '🔍';
      case 'STRATEGIST': return '♟️';
      case 'COPYWRITER': return '✍️';
      case 'DESIGNER': return '🎨';
    }
  };

  const getRoleDesc = (role: AgentRole) => {
    switch (role) {
      case 'RESEARCHER': return 'Analyzes trends & competitors';
      case 'STRATEGIST': return 'Builds conversion blueprints';
      case 'COPYWRITER': return 'Writes persuasive narratives';
      case 'DESIGNER': return 'Crafts high-end visuals';
    }
  };

  const getRoleColor = (role: AgentRole) => {
    switch (role) {
      case 'RESEARCHER': return 'from-blue-500/20 to-blue-600/5 border-blue-500/30';
      case 'STRATEGIST': return 'from-purple-500/20 to-purple-600/5 border-purple-500/30';
      case 'COPYWRITER': return 'from-pink-500/20 to-pink-600/5 border-pink-500/30';
      case 'DESIGNER': return 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30';
    }
  };

  const addTask = () => {
    if (!draftAgent || !newTaskDesc.trim()) return;
    const newTask: Task = {
      id: `t-${Date.now()}`,
      description: newTaskDesc,
      priority: newTaskPriority,
      dependencyId: newTaskDepId,
      status: 'PENDING'
    };
    setDraftAgent({
      ...draftAgent,
      tasks: [...draftAgent.tasks, newTask]
    });
    setNewTaskDesc('');
    setNewTaskDepId(undefined);
  };

  const deleteTask = (taskId: string) => {
    if (!draftAgent) return;
    setDraftAgent({
      ...draftAgent,
      tasks: draftAgent.tasks.filter(t => t.id !== taskId)
    });
  };

  const handleCommit = () => {
    if (draftAgent) {
      onUpdateAgent(draftAgent);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Saving Tray */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Swarm Configuration</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSaving(!isSaving)}
              className="text-[10px] font-bold text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
              Save Library
            </button>
            <div className="group relative">
              <svg className="w-3 h-3 text-gray-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-950 text-[8px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                Agents work together to deliver your outcome. Save custom setups to reuse for different client types.
              </div>
            </div>
          </div>
        </div>

        {isSaving && (
          <div className="glass-card p-4 rounded-2xl flex gap-2 animate-in slide-in-from-top-2 duration-300">
             <input 
              type="text" 
              placeholder="Swarm Name (e.g. Luxury E-comm V1)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="flex-1 bg-black/10 dark:bg-black/40 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2 text-xs text-black dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
             />
             <button 
              onClick={handleSaveCurrentSwarm}
              className="px-4 py-2 aura-gradient text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform"
             >
               Confirm Save
             </button>
          </div>
        )}

        {/* Saved Library Cards */}
        {savedConfigs.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {savedConfigs.map((config) => (
              <div 
                key={config.id}
                onClick={() => handleLoadSwarm(config)}
                className="flex-shrink-0 group relative bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 px-4 py-3 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-all flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-lg aura-gradient flex items-center justify-center text-[10px] text-white font-bold">
                  {config.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[10px] font-bold text-black dark:text-white truncate max-w-[100px]">{config.name}</div>
                  <div className="text-[8px] text-gray-500 uppercase tracking-tighter">Saved {new Date(config.timestamp).toLocaleDateString()}</div>
                </div>
                <button 
                  onClick={(e) => handleDeleteSwarm(config.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all ml-1"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            onClick={() => setEditingId(agent.id)}
            className={`cursor-pointer group relative bg-gradient-to-br ${getRoleColor(agent.role)} border rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-95 ${editingId === agent.id ? 'ring-2 ring-white/20' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl">{getRoleIcon(agent.role)}</span>
              <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-gray-600'}`}></div>
            </div>
            <h4 className="font-bold text-white text-sm truncate">{agent.name}</h4>
            <p className="text-[9px] text-gray-400 uppercase tracking-tight mb-1">{agent.role}</p>
            <p className="text-[8px] text-gray-500 italic line-clamp-1">{getRoleDesc(agent.role)}</p>
          </div>
        ))}
      </div>

      {editingId && draftAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setEditingId(null)}>
          <div className="glass-card w-full max-w-2xl rounded-3xl p-8 space-y-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl p-3 bg-white/5 rounded-2xl">{getRoleIcon(draftAgent.role)}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{draftAgent.role} Settings</h2>
                  <p className="text-sm text-gray-400">{getRoleDesc(draftAgent.role)}</p>
                </div>
              </div>
              <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">Persona</h3>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase">Agent Identity</span>
                    <input 
                      type="text" 
                      value={draftAgent.name}
                      onChange={(e) => setDraftAgent({ ...draftAgent, name: e.target.value })}
                      className="mt-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase">Specialty</span>
                    <input 
                      type="text" 
                      value={draftAgent.specialty}
                      onChange={(e) => setDraftAgent({ ...draftAgent, specialty: e.target.value })}
                      className="mt-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase">Base Instruction</span>
                    <textarea 
                      value={draftAgent.instruction}
                      onChange={(e) => setDraftAgent({ ...draftAgent, instruction: e.target.value })}
                      className="mt-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none h-32"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-pink-500 pl-3">Neural Tasks</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {draftAgent.tasks.map((task) => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center group/task">
                      <div className="flex-1 min-w-0 mr-3">
                        <p className="text-xs text-white truncate">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="text-gray-600 hover:text-red-400 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-4">
                  <input 
                    type="text" 
                    placeholder="Add a custom behavior task..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 pb-2 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                  />
                  <button 
                    onClick={addTask}
                    className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300 hover:bg-white/10 transition-all uppercase"
                  >
                    Add Task
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCommit}
              className="w-full aura-gradient py-4 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/20"
            >
              Update Agent Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwarmManager;
