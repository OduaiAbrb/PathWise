"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  UserTier, 
  canAccessFeature, 
  isWithinLimit, 
  getUpgradeMessage,
  getTierConfig,
  TierConfig
} from "@/lib/tier-config";

interface FeatureGateProps {
  children: ReactNode;
  userTier: UserTier;
  featureId: string;
  currentUsage?: number;
  limitKey?: "roadmaps" | "aiMentorMessages" | "interviewSessions" | "portfolioGenerations" | "projectGenerations" | "studyGroups" | "resourcesPerSkill";
  showUpgradePrompt?: boolean;
  fallback?: ReactNode;
}

/**
 * FeatureGate - Conditionally render content based on user tier
 * 
 * Usage:
 * <FeatureGate userTier="free" featureId="interview_pressure">
 *   <InterviewPressureMode />
 * </FeatureGate>
 * 
 * With limits:
 * <FeatureGate userTier="free" limitKey="roadmaps" currentUsage={1}>
 *   <CreateRoadmapButton />
 * </FeatureGate>
 */
export default function FeatureGate({
  children,
  userTier,
  featureId,
  currentUsage,
  limitKey,
  showUpgradePrompt = true,
  fallback,
}: FeatureGateProps) {
  const router = useRouter();

  // Check feature access
  const hasAccess = canAccessFeature(userTier, featureId);
  
  // Check usage limits if provided
  const withinLimit = limitKey && currentUsage !== undefined
    ? isWithinLimit(userTier, limitKey, currentUsage)
    : true;

  // If user has access and within limits, render children
  if (hasAccess && withinLimit) {
    return <>{children}</>;
  }

  // If fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (!showUpgradePrompt) {
    return null;
  }

  const upgradeMessage = getUpgradeMessage(userTier, featureId);
  const nextTier = userTier === "free" ? "standard" : "premium";
  const tierConfig = getTierConfig(nextTier as UserTier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Blurred/locked content preview */}
      <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="bg-black text-white p-3 rounded-full mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-black mb-2">
            {userTier === "free" ? "Upgrade Required" : "Premium Feature"}
          </h3>
          <p className="text-gray-600 text-center max-w-xs mb-4">
            {upgradeMessage}
          </p>
          <button
            onClick={() => router.push("/pricing")}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors"
          >
            <Crown className="w-5 h-5" />
            Upgrade to {tierConfig.name}
          </button>
        </div>
        
        {/* Placeholder content */}
        <div className="opacity-30 pointer-events-none">
          <div className="h-32 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * UpgradeBanner - Show upgrade prompt inline
 */
export function UpgradeBanner({ 
  userTier, 
  targetTier = "premium",
  message 
}: { 
  userTier: UserTier; 
  targetTier?: UserTier;
  message?: string;
}) {
  const router = useRouter();
  const tierConfig = getTierConfig(targetTier);

  if (userTier === "premium") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-gray-900 to-black text-white p-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5 text-yellow-400" />
        <span>
          {message || `Unlock all features with ${tierConfig.name}`}
        </span>
      </div>
      <button
        onClick={() => router.push("/pricing")}
        className="bg-white text-black px-4 py-2 font-semibold hover:bg-gray-100 transition-colors"
      >
        Upgrade Now
      </button>
    </motion.div>
  );
}

/**
 * LimitIndicator - Show usage vs limit
 */
export function LimitIndicator({
  userTier,
  limitKey,
  currentUsage,
  label,
}: {
  userTier: UserTier;
  limitKey: keyof TierConfig["limits"];
  currentUsage: number;
  label: string;
}) {
  const tierConfig = getTierConfig(userTier);
  const limit = tierConfig.limits[limitKey];
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : (currentUsage / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className={`font-medium ${isAtLimit ? "text-red-600" : isNearLimit ? "text-yellow-600" : "text-gray-900"}`}>
          {currentUsage} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              isAtLimit ? "bg-red-500" : isNearLimit ? "bg-yellow-500" : "bg-black"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * TierBadge - Display user's current tier
 */
export function TierBadge({ tier }: { tier: UserTier }) {
  const config = getTierConfig(tier);
  
  const styles = {
    free: "bg-gray-100 text-gray-700 border-gray-300",
    standard: "bg-blue-50 text-blue-700 border-blue-300",
    premium: "bg-yellow-50 text-yellow-700 border-yellow-300",
  };

  const icons = {
    free: null,
    standard: <Zap className="w-3 h-3" />,
    premium: <Crown className="w-3 h-3" />,
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border rounded-full ${styles[tier]}`}>
      {icons[tier]}
      {config.name}
    </span>
  );
}
