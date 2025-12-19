
import React, { useState, useEffect } from 'react';
import { Agent, AgentRole, Task, TaskPriority } from '../types';

interface SwarmManagerProps {
  agents: Agent[];
  onUpdateAgent: (agent: Agent) => void;
}

const SwarmManager: React.FC<SwarmManagerProps> = ({ agents, onUpdateAgent }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAgent, setDraftAgent] = useState<Agent | null>(null);
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskDepId, setNewTaskDepId] = useState<string | undefined>(undefined);

  // When editingId changes, initialize the draftAgent from the current agent state
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

  const getRoleIcon = (role: AgentRole) => {
    switch (role) {
      case 'RESEARCHER': return '🔍';
      case 'STRATEGIST': return '♟️';
      case 'COPYWRITER': return '✍️';
      case 'DESIGNER': return '🎨';
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

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-emerald-400';
      case 'IN_PROGRESS': return 'text-yellow-400';
      case 'PENDING': return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Active Swarm Configuration</h3>
        <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 font-mono">SOLO-BILLION MODEL V1.4</span>
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
              <div className="relative group/status flex items-center justify-center p-1">
                <div className={`w-2.5 h-2.5 rounded-full ${agent.status === 'ACTIVE' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-gray-600'}`}></div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-950/90 backdrop-blur-md border border-white/10 rounded-lg text-[10px] text-white whitespace-nowrap opacity-0 pointer-events-none group-hover/status:opacity-100 transition-all duration-200 shadow-2xl z-[60] font-mono translate-y-2 group-hover/status:translate-y-0">
                  <span className="text-gray-500 mr-2 uppercase">{agent.status}:</span>
                  {agent.statusMessage || (agent.status === 'ACTIVE' ? 'Processing Task...' : 'Idle')}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-950/90"></div>
                </div>
              </div>
            </div>
            <h4 className="font-bold text-white text-sm truncate">{agent.name}</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-tight">{agent.role}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-gray-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">{agent.tasks.length} Tasks</span>
              <span className="text-[10px] text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded border border-purple-400/20">{agent.tasks.filter(t => t.status === 'COMPLETED').length} Done</span>
            </div>
          </div>
        ))}
      </div>

      {/* Single Modal for the currently edited agent */}
      {editingId && draftAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setEditingId(null)}>
          <div className="glass-card w-full max-w-2xl rounded-3xl p-8 space-y-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl p-3 bg-white/5 rounded-2xl">{getRoleIcon(draftAgent.role)}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Swarm Agent: {draftAgent.role}</h2>
                  <p className="text-sm text-gray-400">Manage persona and directed task priorities.</p>
                </div>
              </div>
              <button onClick={() => setEditingId(null)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-purple-500 pl-3">Persona Configuration</h3>
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase">Identity</span>
                    <input 
                      type="text" 
                      value={draftAgent.name}
                      onChange={(e) => setDraftAgent({ ...draftAgent, name: e.target.value })}
                      className="mt-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase">Core Specialty</span>
                    <input 
                      type="text" 
                      value={draftAgent.specialty}
                      onChange={(e) => setDraftAgent({ ...draftAgent, specialty: e.target.value })}
                      className="mt-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-gray-400 uppercase">Base Instruction</span>
                    <textarea 
                      value={draftAgent.instruction}
                      onChange={(e) => setDraftAgent({ ...draftAgent, instruction: e.target.value })}
                      className="mt-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none h-32"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-l-2 border-pink-500 pl-3">Managed Task Swarm</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {draftAgent.tasks.map((task) => (
                    <div key={task.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center group/task">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-white truncate">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono ${getStatusColor(task.status)} uppercase`}>{task.status}</span>
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
                    placeholder="Define new agent task..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 pb-2 text-xs text-white placeholder:text-gray-600 focus:border-purple-500 outline-none"
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Priority</span>
                      <select 
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Dependency</span>
                      <select 
                        value={newTaskDepId || ''}
                        onChange={(e) => setNewTaskDepId(e.target.value || undefined)}
                        className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="">No Dependency</option>
                        {draftAgent.tasks.map(t => (
                          <option key={t.id} value={t.id}>{t.description.slice(0, 15)}...</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={addTask}
                    className="w-full py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-gray-300 hover:bg-white/10 transition-all uppercase tracking-widest"
                  >
                    Append Task to Swarm
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={handleCommit}
              className="w-full aura-gradient py-4 rounded-2xl font-bold text-white shadow-xl shadow-purple-500/20"
            >
              Commit Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SwarmManager;
