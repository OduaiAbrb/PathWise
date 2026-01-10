"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, TrendingUp, Zap, Target, AlertTriangle } from "lucide-react";

interface TimeToJobEstimatorProps {
  targetRole: string;
  currentProgress: number; // 0-100
  weeklyHours: number;
  consistencyScore: number; // 0-100, based on streak
}

/**
 * Time-to-Job Estimator
 * Dynamically calculates weeks until job-ready based on:
 * - Current progress
 * - Weekly effort
 * - Consistency
 */
export default function TimeToJobEstimator({
  targetRole,
  currentProgress,
  weeklyHours,
  consistencyScore,
}: TimeToJobEstimatorProps) {
  const [estimatedWeeks, setEstimatedWeeks] = useState(0);
  const [fastTrackWeeks, setFastTrackWeeks] = useState(0);
  const [slowTrackWeeks, setSlowTrackWeeks] = useState(0);

  useEffect(() => {
    // Calculate base weeks remaining
    const remainingProgress = 100 - currentProgress;
    const progressPerWeek = (weeklyHours / 10) * (consistencyScore / 100);
    const baseWeeks = Math.ceil(remainingProgress / progressPerWeek);

    setEstimatedWeeks(Math.max(1, baseWeeks));
    setFastTrackWeeks(Math.max(1, Math.ceil(baseWeeks * 0.7))); // If they increase effort
    setSlowTrackWeeks(Math.ceil(baseWeeks * 1.5)); // If consistency drops
  }, [currentProgress, weeklyHours, consistencyScore]);

  const getEstimatedDate = (weeks: number) => {
    const date = new Date();
    date.setDate(date.getDate() + weeks * 7);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getUrgencyLevel = () => {
    if (estimatedWeeks <= 4) return { color: "emerald", label: "Very Close!" };
    if (estimatedWeeks <= 8) return { color: "blue", label: "On Track" };
    if (estimatedWeeks <= 12) return { color: "amber", label: "Need Focus" };
    return { color: "red", label: "Long Journey" };
  };

  const urgency = getUrgencyLevel();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            Time to Job-Ready
          </h3>
          <p className="text-sm text-slate-600">
            Est. for {targetRole} at current pace
          </p>
        </div>
        <div className={`px-3 py-1.5 bg-${urgency.color}-100 text-${urgency.color}-700 rounded-full text-sm font-semibold`}>
          {urgency.label}
        </div>
      </div>

      {/* Main Estimate */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-blue-600" />
          <span className="text-5xl font-bold text-slate-900">
            {estimatedWeeks}
          </span>
          <span className="text-2xl text-slate-600">weeks</span>
        </div>
        <p className="text-slate-600 mb-1">at current pace</p>
        <p className="text-sm font-medium text-blue-600">
          Est. ready by {getEstimatedDate(estimatedWeeks)}
        </p>
      </motion.div>

      {/* Scenarios */}
      <div className="space-y-3 mb-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-900">
              Fast Track (15+ hrs/week)
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-600">{fastTrackWeeks} weeks</p>
            <p className="text-xs text-emerald-700">
              {getEstimatedDate(fastTrackWeeks)}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-900">
              If consistency drops
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-amber-600">{slowTrackWeeks} weeks</p>
            <p className="text-xs text-amber-700">
              {getEstimatedDate(slowTrackWeeks)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Progress Factors */}
      <div className="border-t border-slate-200 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
          Based On
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{currentProgress}%</p>
            <p className="text-xs text-slate-600">Progress</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{weeklyHours}h</p>
            <p className="text-xs text-slate-600">Per Week</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{consistencyScore}%</p>
            <p className="text-xs text-slate-600">Consistency</p>
          </div>
        </div>
      </div>

      {/* Dynamic Motivation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg"
      >
        <p className="text-sm text-blue-900">
          {estimatedWeeks <= 4 && "🔥 You're almost there! Keep pushing!"}
          {estimatedWeeks > 4 && estimatedWeeks <= 8 && "💪 Stay consistent and you'll hit your goal!"}
          {estimatedWeeks > 8 && estimatedWeeks <= 12 && "⚡ Increase your weekly hours to speed up!"}
          {estimatedWeeks > 12 && "🎯 Break it into smaller milestones. One day at a time."}
        </p>
      </motion.div>
    </div>
  );
}
