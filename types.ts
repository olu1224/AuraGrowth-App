
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

export interface ICP {
  personaName: string;
  painPoints: string[];
  motivations: string[];
}

export interface StrategicPhase {
  phaseName: string;
  objective: string;
  actions: string[];
  kpis: string[];
}

export interface CampaignResults {
  executiveSummary: string;
  marketIntelligence: {
    swotAnalysis: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    competitorVulnerabilities: string[];
  };
  audienceDossier: {
    icps: ICP[];
    psychographics: string;
  };
  coreOfferArchitecture: {
    hook: string;
    transformation: string;
    guarantee: string;
  };
  copy: {
    headline: string;
    body: string;
    cta: string;
    socialPosts: string[];
    emailSubject: string;
    emailBody: string;
    brandVoiceRules: string[];
  };
  phasedRoadmap: StrategicPhase[];
  visualPrompt: string;
  videoPrompt: string;
  visualUrl?: string;
  videoUrl?: string;
  campaignAsset?: string;
  auditCertificate: {
    score: number;
    guardianNotes: string;
    readinessStatus: 'ALPHA' | 'BETA' | 'MARKET_READY';
  };
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
