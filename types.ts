
export type AgentRole = 'RESEARCHER' | 'STRATEGIST' | 'COPYWRITER' | 'DESIGNER';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  description: string;
  priority: TaskPriority;
  dependencyId?: string; // ID of another task that must be completed first
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  specialty: string;
  instruction: string;
  status: 'IDLE' | 'ACTIVE' | 'BUSY';
  statusMessage?: string;
  tasks: Task[];
}

export interface CampaignOutcome {
  id: string;
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  objective: string;
  targetAudience: string;
  timestamp: number;
  results?: CampaignResults;
}

export interface CampaignResults {
  strategy: string;
  copy: {
    headline: string;
    body: string;
    cta: string;
    socialPosts: string[];
  };
  visualPrompt: string;
  visualUrl?: string;
}

export interface AgentActivity {
  id: string;
  role: AgentRole;
  message: string;
  timestamp: number;
}
