"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, ChevronRight, Target, Zap } from "lucide-react";
import { useState } from "react";

interface Skill {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "not_started" | "locked";
  progress?: number;
  estimated_hours?: number;
  interview_frequency?: number;
}

interface Phase {
  id: string;
  title: string;
  skills: Skill[];
  status: "completed" | "in_progress" | "not_started";
}

interface RoadmapFlowchartProps {
  roadmap: {
    id: string;
    job_title: string;
    phases: Phase[];
    completion_percentage: number;
  };
  onSkillClick?: (skill: Skill, phaseId: string) => void;
}

/**
 * Roadmap Flowchart - Tree Visualization
 * Black & White Theme
 * Displays roadmap as a vertical tree with connecting lines
 */
export default function RoadmapFlowchart({ roadmap, onSkillClick }: RoadmapFlowchartProps) {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(
    roadmap.phases.map(p => p.id) // All expanded by default
  );

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev =>
      prev.includes(phaseId)
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const getSkillIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-black" />;
      case "in_progress":
        return <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full" />
        </div>;
      case "locked":
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="bg-white border-2 border-black p-8">
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-black">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-black" />
              <h2 className="text-2xl font-bold text-black">Your Roadmap</h2>
            </div>
            <p className="text-xl font-semibold text-gray-800">{roadmap.job_title}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-black">{roadmap.completion_percentage}%</div>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-3 bg-gray-200 border border-black">
          <div
            className="h-full bg-black transition-all duration-500"
            style={{ width: `${roadmap.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* Flowchart Tree */}
      <div className="space-y-8">
        {roadmap.phases.map((phase, phaseIndex) => {
          const isExpanded = expandedPhases.includes(phase.id);
          const isLastPhase = phaseIndex === roadmap.phases.length - 1;

          return (
            <div key={phase.id} className="relative">
              {/* Connecting Line to Next Phase */}
              {!isLastPhase && (
                <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-300 -z-10" />
              )}

              {/* Phase Header */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: phaseIndex * 0.1 }}
                className="relative"
              >
                <button
                  onClick={() => togglePhase(phase.id)}
                  className="w-full flex items-center gap-4 p-4 bg-white border-2 border-black hover:bg-gray-50 transition-colors"
                >
                  {/* Phase Icon */}
                  <div className="w-12 h-12 bg-black text-white font-bold text-xl flex items-center justify-center">
                    {phaseIndex + 1}
                  </div>

                  {/* Phase Info */}
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-black">{phase.title}</h3>
                    <p className="text-sm text-gray-600">
                      {phase.skills.filter(s => s.status === "completed").length} / {phase.skills.length} skills completed
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`px-3 py-1 border-2 text-xs font-bold uppercase ${
                    phase.status === "completed"
                      ? "bg-black text-white border-black"
                      : phase.status === "in_progress"
                      ? "bg-white text-black border-black"
                      : "bg-gray-100 text-gray-500 border-gray-300"
                  }`}>
                    {phase.status.replace("_", " ")}
                  </div>

                  {/* Expand Icon */}
                  <ChevronRight className={`w-5 h-5 text-black transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`} />
                </button>

                {/* Skills Tree */}
                {isExpanded && (
                  <div className="mt-4 ml-16 space-y-3">
                    {phase.skills.map((skill, skillIndex) => {
                      const isLastSkill = skillIndex === phase.skills.length - 1;

                      return (
                        <div key={skill.id} className="relative">
                          {/* Connecting Line */}
                          <div className="absolute -left-8 top-0 w-8 h-1/2 border-l-2 border-b-2 border-gray-300" />
                          {!isLastSkill && (
                            <div className="absolute -left-8 top-1/2 w-0.5 h-full bg-gray-300" />
                          )}

                          {/* Skill Card */}
                          <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: phaseIndex * 0.1 + skillIndex * 0.05 }}
                            onClick={() => onSkillClick && onSkillClick(skill, phase.id)}
                            disabled={skill.status === "locked"}
                            className={`w-full flex items-center gap-3 p-4 border-2 transition-all ${
                              skill.status === "completed"
                                ? "bg-black text-white border-black"
                                : skill.status === "in_progress"
                                ? "bg-white text-black border-black hover:bg-gray-50"
                                : skill.status === "locked"
                                ? "bg-gray-50 text-gray-400 border-gray-300 cursor-not-allowed"
                                : "bg-white text-black border-gray-300 hover:border-black"
                            }`}
                          >
                            {/* Icon */}
                            <div className="flex-shrink-0">
                              {getSkillIcon(skill.status)}
                            </div>

                            {/* Skill Info */}
                            <div className="flex-1 text-left">
                              <p className={`font-semibold ${
                                skill.status === "completed" ? "text-white" : "text-black"
                              }`}>
                                {skill.name}
                              </p>
                              {skill.estimated_hours && (
                                <p className={`text-xs ${
                                  skill.status === "completed" ? "text-gray-300" : "text-gray-600"
                                }`}>
                                  {skill.estimated_hours}h · {skill.interview_frequency}% interview frequency
                                </p>
                              )}
                            </div>

                            {/* Progress Indicator */}
                            {skill.status === "in_progress" && skill.progress !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 border border-black">
                                  <div
                                    className="h-full bg-black"
                                    style={{ width: `${skill.progress}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold">{skill.progress}%</span>
                              </div>
                            )}

                            {/* High Priority Indicator */}
                            {skill.interview_frequency && skill.interview_frequency > 70 && (
                              <Zap className="w-4 h-4 text-black" />
                            )}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-8 pt-6 border-t-2 border-black grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-black">
            {roadmap.phases.filter(p => p.status === "completed").length}
          </div>
          <div className="text-xs text-gray-600 uppercase">Phases Done</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-black">
            {roadmap.phases.flatMap(p => p.skills).filter(s => s.status === "completed").length}
          </div>
          <div className="text-xs text-gray-600 uppercase">Skills Mastered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-black">
            {roadmap.phases.flatMap(p => p.skills).filter(s => s.status === "in_progress").length}
          </div>
          <div className="text-xs text-gray-600 uppercase">In Progress</div>
        </div>
      </div>
    </div>
  );
}
