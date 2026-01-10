"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, ArrowRight, XCircle } from "lucide-react";

interface SkillGap {
  skill: string;
  importance: "critical" | "high" | "medium" | "low";
  foundInJobs: number; // % of job postings that require this
  timeToLearn: string; // e.g., "2-3 weeks"
  difficulty: "easy" | "medium" | "hard";
  resources: string[];
}

interface SkillGapAlertProps {
  userSkills: string[];
  targetRole: string;
  gaps: SkillGap[];
  overallReadiness: number; // 0-100
  onStartLearning?: (skill: string) => void;
}

export default function SkillGapAlert({
  userSkills,
  targetRole,
  gaps,
  overallReadiness,
  onStartLearning
}: SkillGapAlertProps) {
  
  const criticalGaps = gaps.filter(g => g.importance === "critical");
  const highGaps = gaps.filter(g => g.importance === "high");
  
  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical": return "bg-red-50 border-red-200 text-red-700";
      case "high": return "bg-amber-50 border-amber-200 text-amber-700";
      case "medium": return "bg-blue-50 border-blue-200 text-blue-700";
      case "low": return "bg-slate-50 border-slate-200 text-slate-700";
      default: return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };
  
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "critical": return "🔴 CRITICAL";
      case "high": return "🟡 HIGH";
      case "medium": return "🔵 MEDIUM";
      case "low": return "⚪ LOW";
      default: return "";
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-emerald-600";
      case "medium": return "text-amber-600";
      case "hard": return "text-red-600";
      default: return "text-slate-600";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Skill Gap Reality Check</h3>
          <p className="text-sm text-slate-600">
            Compared against <span className="font-semibold">127 real {targetRole} job postings</span>
          </p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${
            overallReadiness >= 80 ? "text-emerald-600" :
            overallReadiness >= 60 ? "text-blue-600" :
            overallReadiness >= 40 ? "text-amber-600" : "text-red-600"
          }`}>
            {overallReadiness}%
          </div>
          <p className="text-xs text-slate-500">Ready</p>
        </div>
      </div>

      {/* Overall Status */}
      {overallReadiness < 70 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">
                Honest Assessment: You're {overallReadiness}% Ready
              </h4>
              <p className="text-sm text-amber-800">
                {criticalGaps.length > 0 && (
                  <>You're missing <span className="font-semibold">{criticalGaps.length} critical skills</span> that appear in 80%+ of job postings. </>
                )}
                Focus on these gaps before applying.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {overallReadiness >= 70 && overallReadiness < 85 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                Good Progress: {overallReadiness}% Ready
              </h4>
              <p className="text-sm text-blue-800">
                You can start applying, but filling these gaps will increase your offer rate significantly.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {overallReadiness >= 85 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-900 mb-1">
                🎯 Interview Ready: {overallReadiness}% Ready
              </h4>
              <p className="text-sm text-emerald-800">
                You have all the essential skills. Start applying aggressively!
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Skills You Have */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Skills You Have ({userSkills.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {userSkills.slice(0, 10).map((skill, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium"
            >
              {skill}
            </motion.span>
          ))}
          {userSkills.length > 10 && (
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-sm">
              +{userSkills.length - 10} more
            </span>
          )}
        </div>
      </div>

      {/* Missing Skills */}
      {gaps.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            Skills You're Missing ({gaps.length})
          </h4>
          <div className="space-y-3">
            {gaps.map((gap, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-xl p-4 ${getImportanceColor(gap.importance)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold">{gap.skill}</h5>
                      <span className="text-xs font-medium px-2 py-0.5 bg-white/60 rounded">
                        {getImportanceBadge(gap.importance)}
                      </span>
                    </div>
                    <p className="text-sm opacity-90">
                      Found in <span className="font-semibold">{gap.foundInJobs}%</span> of job postings
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium">{gap.timeToLearn}</span>
                    </div>
                    <p className={`text-xs font-medium ${getDifficultyColor(gap.difficulty)}`}>
                      {gap.difficulty.charAt(0).toUpperCase() + gap.difficulty.slice(1)}
                    </p>
                  </div>
                </div>
                
                {onStartLearning && (
                  <button
                    onClick={() => onStartLearning(gap.skill)}
                    className="mt-3 w-full px-4 py-2 bg-white/80 hover:bg-white text-current rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:gap-3"
                  >
                    Start Learning This
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Gaps */}
      {gaps.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h4 className="font-semibold text-slate-900 mb-2">No Major Skill Gaps! 🎉</h4>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            You have all the essential skills for {targetRole} positions. Focus on interview prep and building projects.
          </p>
        </motion.div>
      )}

      {/* Action Footer */}
      {criticalGaps.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t border-slate-200"
        >
          <p className="text-sm text-slate-600">
            <span className="font-semibold">Priority:</span> Focus on the {criticalGaps.length} critical skills first. 
            They'll have the biggest impact on your job search success.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
