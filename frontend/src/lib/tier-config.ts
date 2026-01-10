/**
 * PathWise Tier Configuration
 * 
 * Defines feature access for each subscription tier:
 * - FREE: Basic features, limited usage
 * - STANDARD: More features, higher limits
 * - PREMIUM: Full access, unlimited usage
 */

export type UserTier = "free" | "standard" | "premium";

export interface TierFeature {
  id: string;
  name: string;
  description: string;
  free: boolean | number | string;
  standard: boolean | number | string;
  premium: boolean | number | string;
}

export interface TierConfig {
  name: string;
  price: number;
  priceYearly: number;
  description: string;
  features: string[];
  limits: {
    roadmaps: number;
    aiMentorMessages: number;
    interviewSessions: number;
    portfolioGenerations: number;
    projectGenerations: number;
    studyGroups: number;
    resourcesPerSkill: number;
  };
}

// Tier configurations
export const TIER_CONFIGS: Record<UserTier, TierConfig> = {
  free: {
    name: "Free",
    price: 0,
    priceYearly: 0,
    description: "Get started with the basics",
    features: [
      "1 active roadmap",
      "10 AI Mentor messages/day",
      "3 interview sessions/month",
      "1 portfolio generation/month",
      "Basic resources (3 per skill)",
      "Community study groups",
    ],
    limits: {
      roadmaps: 1,
      aiMentorMessages: 10,
      interviewSessions: 3,
      portfolioGenerations: 1,
      projectGenerations: 2,
      studyGroups: 2,
      resourcesPerSkill: 3,
    },
  },
  standard: {
    name: "Standard",
    price: 9.99,
    priceYearly: 99,
    description: "For serious learners",
    features: [
      "3 active roadmaps",
      "50 AI Mentor messages/day",
      "15 interview sessions/month",
      "5 portfolio generations/month",
      "Premium resources (8 per skill)",
      "Create & join unlimited groups",
      "Interview pressure mode",
      "Progress analytics",
    ],
    limits: {
      roadmaps: 3,
      aiMentorMessages: 50,
      interviewSessions: 15,
      portfolioGenerations: 5,
      projectGenerations: 10,
      studyGroups: -1, // unlimited
      resourcesPerSkill: 8,
    },
  },
  premium: {
    name: "Premium",
    price: 19.99,
    priceYearly: 199,
    description: "Maximum career acceleration",
    features: [
      "Unlimited roadmaps",
      "Unlimited AI Mentor",
      "Unlimited interview sessions",
      "Unlimited portfolio generations",
      "All resources (15+ per skill)",
      "Priority support",
      "1-on-1 career coaching session",
      "Resume review by experts",
      "Job application tracking",
      "Salary negotiation guide",
    ],
    limits: {
      roadmaps: -1, // unlimited
      aiMentorMessages: -1,
      interviewSessions: -1,
      portfolioGenerations: -1,
      projectGenerations: -1,
      studyGroups: -1,
      resourcesPerSkill: 15,
    },
  },
};

// Feature matrix for display
export const FEATURE_MATRIX: TierFeature[] = [
  {
    id: "roadmaps",
    name: "Active Roadmaps",
    description: "Number of learning roadmaps you can have active",
    free: 1,
    standard: 3,
    premium: "Unlimited",
  },
  {
    id: "ai_mentor",
    name: "AI Mentor Messages",
    description: "Daily AI mentor conversations",
    free: "10/day",
    standard: "50/day",
    premium: "Unlimited",
  },
  {
    id: "interview_sessions",
    name: "Interview Practice",
    description: "Monthly mock interview sessions",
    free: "3/month",
    standard: "15/month",
    premium: "Unlimited",
  },
  {
    id: "portfolio",
    name: "Portfolio Generation",
    description: "AI-generated portfolio content",
    free: "1/month",
    standard: "5/month",
    premium: "Unlimited",
  },
  {
    id: "resources",
    name: "Learning Resources",
    description: "Curated resources per skill",
    free: "3 per skill",
    standard: "8 per skill",
    premium: "15+ per skill",
  },
  {
    id: "study_groups",
    name: "Study Groups",
    description: "Create and join study groups",
    free: "Join 2",
    standard: "Unlimited",
    premium: "Unlimited",
  },
  {
    id: "interview_pressure",
    name: "Interview Pressure Mode",
    description: "Timed, high-pressure interview simulation",
    free: false,
    standard: true,
    premium: true,
  },
  {
    id: "analytics",
    name: "Progress Analytics",
    description: "Detailed learning analytics and insights",
    free: false,
    standard: true,
    premium: true,
  },
  {
    id: "career_coaching",
    name: "1-on-1 Career Coaching",
    description: "Personal session with career expert",
    free: false,
    standard: false,
    premium: "1 session/month",
  },
  {
    id: "resume_review",
    name: "Expert Resume Review",
    description: "Professional resume feedback",
    free: false,
    standard: false,
    premium: true,
  },
  {
    id: "job_tracking",
    name: "Job Application Tracking",
    description: "Track your job applications",
    free: false,
    standard: false,
    premium: true,
  },
  {
    id: "priority_support",
    name: "Priority Support",
    description: "Fast response from support team",
    free: false,
    standard: false,
    premium: true,
  },
];

// Helper functions
export function getTierConfig(tier: UserTier): TierConfig {
  return TIER_CONFIGS[tier] || TIER_CONFIGS.free;
}

export function canAccessFeature(
  userTier: UserTier,
  featureId: string
): boolean {
  const feature = FEATURE_MATRIX.find((f) => f.id === featureId);
  if (!feature) return false;

  const value = feature[userTier];
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") return value !== "0" && value !== "";
  return false;
}

export function getFeatureLimit(
  userTier: UserTier,
  limitKey: keyof TierConfig["limits"]
): number {
  const config = getTierConfig(userTier);
  return config.limits[limitKey];
}

export function isWithinLimit(
  userTier: UserTier,
  limitKey: keyof TierConfig["limits"],
  currentUsage: number
): boolean {
  const limit = getFeatureLimit(userTier, limitKey);
  if (limit === -1) return true; // Unlimited
  return currentUsage < limit;
}

export function getUpgradeMessage(
  userTier: UserTier,
  featureId: string
): string {
  if (userTier === "premium") return "";

  const feature = FEATURE_MATRIX.find((f) => f.id === featureId);
  if (!feature) return "";

  if (userTier === "free") {
    return `Upgrade to Standard or Premium to unlock ${feature.name}`;
  }
  return `Upgrade to Premium to unlock ${feature.name}`;
}

export function getNextTier(currentTier: UserTier): UserTier | null {
  if (currentTier === "free") return "standard";
  if (currentTier === "standard") return "premium";
  return null;
}
