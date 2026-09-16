export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  year?: string;
  role?: string; // Optional backwards compatibility
}

export interface ProblemAnalysisSolution {
  name: string;
  description: string;
  cost: 'Low' | 'Medium' | 'High';
  complexity: 'Low' | 'Medium' | 'High';
  efficiency: 'Low' | 'Medium' | 'High' | 'Very High';
  pros: string[];
  cons: string[];
}

export interface ProblemAnalysis {
  id: string;
  originalProblem: string;
  domain: string;
  category: string;
  mainCause: string;
  impact: string;
  usersAffected: string;
  solutions: ProblemAnalysisSolution[];
  recommendedSolution: {
    title: string;
    rationale: string;
  };
  implementationPlan: string[];
  timestamp: string;
}

export interface ProjectIdea {
  id: string;
  title: string;
  tagline: string;
  domain: string;
  problemStatement: string;
  innovation: string;
  techStack: {
    frontend?: string[];
    backend?: string[];
    hardware?: string[];
    database?: string[];
    apisAndTools?: string[];
  };
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTimeline: string;
  keyFeatures: string[];
  futureScope: string;
  sourceProblemId?: string;
  timestamp: string;
}

export interface SmartNote {
  id: string;
  title: string;
  problemTitle: string;
  domain: string;
  subject?: string; // Legacy subject/domain compatibility
  problemAnalysis?: string;
  projectIdeaTitle?: string;
  projectDescription?: string;
  keyFeatures?: string[];
  suggestedTechnologies?: {
    frontend?: string[];
    backend?: string[];
    hardware?: string[];
    database?: string[];
    apisAndTools?: string[];
  };
  expectedImpact?: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  aiInsights?: {
    type: 'explain' | 'summarize' | 'questions' | 'expand';
    content: string;
    timestamp: string;
  }[];
  associatedProjectId?: string;
  sourceType?: 'problem_analysis' | 'project_idea' | 'workflow';
}

export interface ChatMessage {
  id: string;
  classroomId: string;
  senderId: string;
  senderName: string;
  senderRole?: 'student' | 'teacher' | 'ai' | 'user';
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isAiPrompt?: boolean;
  replyToId?: string;
  attachedItem?: {
    type: 'note' | 'project' | 'problem';
    id: string;
    title: string;
    summary?: string;
  };
  // Server-compat aliases
  userId?: string;
  userName?: string;
  userRole?: string;
  message?: string;
  isAi?: boolean;
  attachments?: {
    type: 'note' | 'project' | 'solution';
    id: string;
    title: string;
    snippet?: string;
  }[];
}

export interface ClassroomAnnouncement {
  id: string;
  authorName: string;
  authorRole?: string;
  title: string;
  content: string;
  timestamp: string;
  tag?: string;
}

export interface ClassroomResource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'code' | 'link';
  url: string;
  category: string;
  uploader: string;
  uploadedAt: string;
  size?: string;
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  department: string;
  teacherName: string;
  membersCount: number;
  description: string;
  createdAt: string;
  announcements: ClassroomAnnouncement[];
  resources: ClassroomResource[];
}

export type ActiveModule =
  | 'dashboard'
  | 'solver'
  | 'ideator'
  | 'notes'
  | 'classroom'
  | 'chat';
