// User types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  tier: "free" | "pro" | "enterprise";
  createdAt: string;
  lastLogin: string;
}

// Skill types
export interface Skill {
  id: string;
  name: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  importance: "critical" | "important" | "optional";
  estimatedHours: number;
  description: string;
  resources: Resource[];
}

// Resource types
export interface Resource {
  id: string;
  title: string;
  url: string;
  type: "video" | "article" | "course" | "documentation" | "book";
  difficulty: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  qualityScore: number;
  tags: string[];
}

// Phase types
export interface Phase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedWeeks: number;
  skills: Skill[];
}

// Roadmap types
export interface Roadmap {
  id: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  industry: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  generatedAt: string;
  completionPercentage: number;
  estimatedWeeks: number;
  phases: Phase[];
  projects: Project[];
  status: "active" | "completed" | "archived";
}

// Progress types
export interface Progress {
  id: string;
  roadmapId: string;
  skillId: string;
  skillName: string;
  status: "not_started" | "in_progress" | "completed";
  timeSpentMinutes: number;
  completedAt?: string;
  notes?: string;
}

// Project types
export interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  skills: string[];
  steps: string[];
  assessmentRubric: AssessmentItem[];
}

export interface AssessmentItem {
  criteria: string;
  description: string;
  points: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

// Job match types
export interface JobMatch {
  id: string;
  roadmapId: string;
  jobTitle: string;
  company: string;
  jobUrl: string;
  matchPercentage: number;
  missingSkills: string[];
  scrapedAt: string;
}

// Resume analysis types
export interface ResumeAnalysis {
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  suggestions: ResumeSuggestion[];
  overallScore: number;
}

export interface ResumeSuggestion {
  type: "add" | "remove" | "emphasize" | "rewrite";
  content: string;
  priority: "high" | "medium" | "low";
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Form types
export interface RoadmapGenerationInput {
  jobDescription: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  industry: string;
  resumeFile?: File;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
