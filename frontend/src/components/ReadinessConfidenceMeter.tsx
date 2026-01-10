"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, Target, Brain, Award } from "lucide-react";

interface ReadinessConfidenceMeterProps {
  technicalReadiness: number; // 0-100
  interviewConfidence: number; // 0-100
  targetRole: string;
}

/**
 * Readiness vs Confidence Meter
 * Shows the gap between technical skills and interview confidence
 * Highlights overconfidence or underconfidence
 */
export default function ReadinessConfidenceMeter({
  technicalReadiness,
  interviewConfidence,
  targetRole,
}: ReadinessConfidenceMeterProps) {
  const gap = Math.abs(technicalReadiness - interviewConfidence);
  const isOverconfident = interviewConfidence > technicalReadiness + 10;
  const isUnderconfident = technicalReadiness > interviewConfidence + 10;
  const isBalanced = gap <= 10;

  const getStatusColor = () => {
    if (isBalanced) return "text-emerald-600";
    if (isOverconfident) return "text-red-600";
    if (isUnderconfident) return "text-amber-600";
    return "text-slate-600";
  };

  const getStatusMessage = () => {
    if (isBalanced) return "Balanced - You're ready to apply!";
    if (isOverconfident)
      return "⚠️ Overconfident - You may struggle in interviews";
    if (isUnderconfident)
      return "💪 Underconfident - You're more ready than you think!";
    return "Keep building skills";
  };

  const getRecommendation = () => {
    if (isBalanced) {
      return "Your technical skills match your confidence. Start applying to jobs and doing mock interviews.";
    }
    if (isOverconfident) {
      return "Your confidence is higher than your technical skills. Focus on building more projects and mastering core concepts before applying.";
    }
    if (isUnderconfident) {
      return "You have strong technical skills but lack interview confidence. Practice mock interviews and talking about your projects.";
    }
    return "";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Readiness vs Confidence
          </h3>
          <p className="text-sm text-slate-600">
            Are you over or underconfident for {targetRole}?
          </p>
        </div>
        <div className={`flex items-center gap-2 ${getStatusColor()}`}>
          {isBalanced && <Award className="w-5 h-5" />}
          {isOverconfident && <AlertTriangle className="w-5 h-5" />}
          {isUnderconfident && <Brain className="w-5 h-5" />}
          <span className="text-sm font-semibold">{gap}% gap</span>
        </div>
      </div>

      {/* Dual Meter */}
      <div className="space-y-6 mb-6">
        {/* Technical Readiness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-700">
                Technical Readiness
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {technicalReadiness}%
            </span>
          </div>
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${technicalReadiness}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on completed skills, projects, and practice
          </p>
        </div>

        {/* Interview Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-slate-700">
                Interview Confidence
              </span>
            </div>
            <span className="text-lg font-bold text-slate-900">
              {interviewConfidence}%
            </span>
          </div>
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${interviewConfidence}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="absolute h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Based on mock interviews and self-assessment
          </p>
        </div>
      </div>

      {/* Status Alert */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-4 rounded-xl border-2 ${
          isBalanced
            ? "bg-emerald-50 border-emerald-200"
            : isOverconfident
            ? "bg-red-50 border-red-200"
            : "bg-amber-50 border-amber-200"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isBalanced && <Award className="w-5 h-5 text-emerald-600" />}
            {isOverconfident && (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            {isUnderconfident && <TrendingUp className="w-5 h-5 text-amber-600" />}
          </div>
          <div className="flex-1">
            <p
              className={`font-semibold mb-1 ${
                isBalanced
                  ? "text-emerald-900"
                  : isOverconfident
                  ? "text-red-900"
                  : "text-amber-900"
              }`}
            >
              {getStatusMessage()}
            </p>
            <p
              className={`text-sm ${
                isBalanced
                  ? "text-emerald-700"
                  : isOverconfident
                  ? "text-red-700"
                  : "text-amber-700"
              }`}
            >
              {getRecommendation()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Gap Visualization */}
      {!isBalanced && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 p-3 bg-slate-50 rounded-lg"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span>Technical</span>
            <span className="font-semibold">{gap}% gap</span>
            <span>Confidence</span>
          </div>
          <div className="relative h-1 bg-slate-200 rounded-full">
            <div
              className={`absolute h-full rounded-full ${
                isOverconfident ? "bg-red-500" : "bg-amber-500"
              }`}
              style={{
                left: isOverconfident
                  ? `${technicalReadiness}%`
                  : `${interviewConfidence}%`,
                width: `${gap}%`,
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
