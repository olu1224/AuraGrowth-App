
export type AgentRole = 'RESEARCHER' | 'STRATEGIST' | 'COPYWRITER' | 'DESIGNER' | 'QUALITY_MANAGER';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: string;
  description: string;
  priority: TaskPriority;
  dependencyId?: string;
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

export interface SwarmConfig {
  id: string;
  name: string;
  agents: Agent[];
  timestamp: number;
}

export interface CampaignOutcome {
  id: string;
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  isActivated?: boolean;
  objective: string;
  targetAudience: string;
  timestamp: number;
  results?: CampaignResults;
}

export interface CommunityOutcome extends CampaignOutcome {
  author: string;
  revenue: string;
  likes: number;
}

export interface CampaignResults {
  strategy: string;
  copy: {
    headline: string;
    body: string;
    cta: string;
    socialPosts: string[];
    emailSubject: string;
    emailBody: string;
  };
  distribution: {
    channel: string;
    action: string;
  }[];
  visualPrompt: string;
  videoPrompt: string;
  visualUrl?: string;
  videoUrl?: string;
  campaignAsset?: string; // Base64 of logo or reference image
}

export interface AgentActivity {
  id: string;
  role: AgentRole;
  message: string;
  timestamp: number;
  isLog?: boolean;
}

export interface ClientProposal {
  clientName: string;
  executiveSummary: string;
  swarmBenefits: string[];
  pricingComparison: {
    traditional: string;
    asb: string;
    savings: string;
  };
  deliveryTimeline: string;
}
