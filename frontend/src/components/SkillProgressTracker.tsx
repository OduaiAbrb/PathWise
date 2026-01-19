"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Play, Clock, Target, Zap } from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface SkillProgressTrackerProps {
  skillId: string;
  skillName: string;
  currentProgress: number;
  estimatedHours: number;
  onProgressUpdate?: (newProgress: number) => void;
}

export default function SkillProgressTracker({
  skillId,
  skillName,
  currentProgress,
  estimatedHours,
  onProgressUpdate
}: SkillProgressTrackerProps) {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const [progress, setProgress] = useState(currentProgress);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const updateProgress = async (newProgress: number) => {
    if (!accessToken) return;

    setIsUpdating(true);
    try {
      const response = await fetch(getApiUrl(`/api/v1/skills/${skillId}/progress`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress_percentage: newProgress,
          session_time_minutes: sessionTime,
        }),
      });

      if (response.ok) {
        setProgress(newProgress);
        onProgressUpdate?.(newProgress);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const startSession = () => {
    setIsActive(true);
    setSessionTime(0);
    // Start timer
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 60000); // Update every minute

    // Store interval ID for cleanup
    (window as any).progressTimer = interval;
  };

  const endSession = () => {
    setIsActive(false);
    if ((window as any).progressTimer) {
      clearInterval((window as any).progressTimer);
    }
    
    // Automatically increment progress based on session time
    const progressIncrement = Math.min(10, Math.floor(sessionTime / 30)); // 10% max per session, 1% per 30 min
    const newProgress = Math.min(100, progress + progressIncrement);
    
    if (newProgress > progress) {
      updateProgress(newProgress);
    }
  };

  const markComplete = () => {
    updateProgress(100);
  };

  const progressSteps = [
    { value: 0, label: "Not Started" },
    { value: 25, label: "Basics" },
    { value: 50, label: "Practicing" },
    { value: 75, label: "Proficient" },
    { value: 100, label: "Mastered" },
  ];

  return (
    <div className="bg-white border-3 border-black p-6 rounded-2xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-black">{skillName}</h3>
          <span className="text-2xl font-black text-black">{progress}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
          <motion.div
            initial={{ width: `${currentProgress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-black"
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between mb-6">
        {progressSteps.map((step) => (
          <button
            key={step.value}
            onClick={() => updateProgress(step.value)}
            disabled={isUpdating}
            className={`flex flex-col items-center p-2 rounded-lg transition-all ${
              progress >= step.value
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {progress >= step.value ? (
              <CheckCircle2 className="w-4 h-4 mb-1" />
            ) : (
              <Circle className="w-4 h-4 mb-1" />
            )}
            <span className="text-xs font-medium">{step.label}</span>
          </button>
        ))}
      </div>

      {/* Study Session Controls */}
      <div className="flex items-center gap-4">
        {!isActive ? (
          <button
            onClick={startSession}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            <Play className="w-4 h-4" />
            Start Learning
          </button>
        ) : (
          <button
            onClick={endSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
          >
            <Clock className="w-4 h-4" />
            End Session ({sessionTime}m)
          </button>
        )}

        {progress < 100 && (
          <button
            onClick={markComplete}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
          >
            <Target className="w-4 h-4" />
            Mark Complete
          </button>
        )}

        {progress === 100 && (
          <div className="flex items-center gap-2 text-green-600 font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            Skill Mastered!
          </div>
        )}
      </div>

      {/* Estimated Time Remaining */}
      {progress < 100 && (
        <div className="mt-4 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Est. {Math.round(estimatedHours * (100 - progress) / 100)} hours remaining
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
