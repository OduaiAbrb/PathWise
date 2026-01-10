"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface ReadinessMeterProps {
  technicalReadiness: number; // 0-100
  interviewConfidence: number; // 0-100
  trend: "up" | "down" | "stable";
  weeklyChange: number;
  onAction?: () => void;
}

export default function ReadinessMeter({
  technicalReadiness,
  interviewConfidence,
  trend,
  weeklyChange,
  onAction
}: ReadinessMeterProps) {
  
  const gap = Math.abs(technicalReadiness - interviewConfidence);
  const isOverconfident = interviewConfidence > technicalReadiness + 10;
  const isUnderconfident = technicalReadiness > interviewConfidence + 15;
  
  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };
  
  const getReadinessLabel = (score: number) => {
    if (score >= 80) return "Interview Ready";
    if (score >= 60) return "Good Progress";
    if (score >= 40) return "Building Skills";
    return "Early Stage";
  };
  
  const getMessage = () => {
    if (isOverconfident) {
      return {
        icon: AlertTriangle,
        color: "text-amber-600 bg-amber-50 border-amber-200",
        title: "⚠️ Overconfident",
        message: "Your confidence is higher than your actual readiness. Practice more before interviewing.",
        action: "Fill Skill Gaps"
      };
    }
    
    if (isUnderconfident) {
      return {
        icon: TrendingUp,
        color: "text-blue-600 bg-blue-50 border-blue-200",
        title: "💪 Underconfident",
        message: "You're more ready than you think! Start interview practice to build confidence.",
        action: "Start Mock Interviews"
      };
    }
    
    if (technicalReadiness >= 75 && interviewConfidence >= 75) {
      return {
        icon: CheckCircle2,
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        title: "🎯 Ready to Interview",
        message: "Great balance! You have the skills AND confidence. Time to apply.",
        action: "View Job Matches"
      };
    }
    
    return {
      icon: TrendingUp,
      color: "text-slate-600 bg-slate-50 border-slate-200",
      title: "📈 Keep Building",
      message: "Focus on your daily missions. Consistency is key.",
      action: "See Today's Mission"
    };
  };
  
  const status = getMessage();
  const StatusIcon = status.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Readiness Check</h3>
          <p className="text-sm text-slate-500">Technical vs Confidence</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {trend === "up" && <TrendingUp className="w-4 h-4 text-emerald-600" />}
          {trend === "down" && <TrendingDown className="w-4 h-4 text-red-600" />}
          <span className={trend === "up" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
            {weeklyChange > 0 ? "+" : ""}{weeklyChange}% this week
          </span>
        </div>
      </div>

      {/* Meters */}
      <div className="space-y-4 mb-6">
        {/* Technical Readiness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Technical Readiness</span>
            <span className={`text-lg font-bold ${getReadinessColor(technicalReadiness)}`}>
              {technicalReadiness}%
            </span>
          </div>
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${technicalReadiness}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute left-0 top-0 h-full rounded-full ${
                technicalReadiness >= 80 ? "bg-emerald-500" :
                technicalReadiness >= 60 ? "bg-blue-500" :
                technicalReadiness >= 40 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on skills completed, projects built, practice done
          </p>
        </div>

        {/* Interview Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Interview Confidence</span>
            <span className={`text-lg font-bold ${getReadinessColor(interviewConfidence)}`}>
              {interviewConfidence}%
            </span>
          </div>
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${interviewConfidence}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className={`absolute left-0 top-0 h-full rounded-full ${
                interviewConfidence >= 80 ? "bg-emerald-500" :
                interviewConfidence >= 60 ? "bg-blue-500" :
                interviewConfidence >= 40 ? "bg-amber-500" : "bg-red-500"
              }`}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on mock interviews, questions answered, feedback received
          </p>
        </div>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className={`border rounded-xl p-4 ${status.color}`}
      >
        <div className="flex items-start gap-3">
          <StatusIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold mb-1">{status.title}</h4>
            <p className="text-sm opacity-90 mb-3">{status.message}</p>
            {onAction && (
              <button
                onClick={onAction}
                className="text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {status.action}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Gap Warning */}
      {gap > 20 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.6 }}
          className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Large gap detected:</span> Your scores are {gap}% apart. 
            Focus on {technicalReadiness > interviewConfidence ? "interview practice" : "skill building"} to balance them.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
