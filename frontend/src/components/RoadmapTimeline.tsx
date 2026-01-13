"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  ChevronRight,
  Play,
  BookOpen,
  ExternalLink,
  Brain,
  Award,
  Lock,
  Sparkles,
  MessageCircle,
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  status: "completed" | "in_progress" | "not_started" | "locked";
  progress?: number;
  estimated_hours?: number;
  interview_frequency?: number;
  why_important?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
    why_chosen?: string;
  }>;
}

interface Phase {
  id: string;
  title: string;
  status: "completed" | "in_progress" | "not_started";
  description?: string;
  skills: Skill[];
  estimated_days?: number;
}

interface RoadmapTimelineProps {
  phases: Phase[];
  roadmapId: string;
  jobTitle: string;
  completionPercentage: number;
  onSkillComplete?: (skillId: string) => void;
  onAskAI?: (context: string) => void;
}

export default function RoadmapTimeline({
  phases,
  roadmapId,
  jobTitle,
  completionPercentage,
  onSkillComplete,
  onAskAI,
}: RoadmapTimelineProps) {
  const router = useRouter();
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Auto-select the current in-progress phase
  useEffect(() => {
    const currentPhase = phases.find(p => p.status === "in_progress") || phases[0];
    setSelectedPhase(currentPhase);
    
    // Auto-select first incomplete skill
    const currentSkill = currentPhase?.skills.find(s => s.status !== "completed");
    if (currentSkill) setSelectedSkill(currentSkill);
  }, [phases]);

  const getPhaseIcon = (status: string, index: number) => {
    if (status === "completed") {
      return <CheckCircle2 className="w-6 h-6 text-white" />;
    }
    if (status === "in_progress") {
      return <Play className="w-5 h-5 text-white" />;
    }
    return <span className="text-sm font-bold">{index + 1}</span>;
  };

  const getPhaseClasses = (phase: Phase) => {
    const isSelected = selectedPhase?.id === phase.id;
    const base = "relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-200";
    
    if (phase.status === "completed") {
      return `${base} ${isSelected ? "bg-green-50 border-l-4 border-green-600" : "hover:bg-green-50/50"}`;
    }
    if (phase.status === "in_progress") {
      return `${base} ${isSelected ? "bg-black text-white" : "hover:bg-neutral-100"}`;
    }
    return `${base} ${isSelected ? "bg-neutral-100" : "hover:bg-neutral-50"} opacity-60`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">{jobTitle}</h1>
            <p className="text-neutral-500 text-sm mt-1">
              {completionPercentage}% complete · {phases.length} phases
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4">
            <div className="w-48 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                className="h-full bg-black rounded-full"
              />
            </div>
            <span className="text-sm font-semibold">{completionPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left: Timeline */}
          <div className="lg:col-span-4 border-r border-neutral-200 min-h-[calc(100vh-80px)]">
            <div className="sticky top-20">
              <div className="p-4 border-b border-neutral-200">
                <h2 className="font-semibold text-neutral-900">Learning Phases</h2>
              </div>
              
              <div className="divide-y divide-neutral-100">
                {phases.map((phase, index) => (
                  <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedPhase(phase);
                      const firstSkill = phase.skills[0];
                      if (firstSkill) setSelectedSkill(firstSkill);
                    }}
                    className={getPhaseClasses(phase)}
                  >
                    {/* Timeline connector */}
                    {index < phases.length - 1 && (
                      <div className={`absolute left-7 top-16 w-0.5 h-8 ${
                        phase.status === "completed" ? "bg-green-600" : "bg-neutral-200"
                      }`} />
                    )}
                    
                    {/* Phase icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      phase.status === "completed" ? "bg-green-600" :
                      phase.status === "in_progress" ? "bg-black" :
                      "bg-neutral-200 text-neutral-500"
                    }`}>
                      {getPhaseIcon(phase.status, index)}
                    </div>
                    
                    {/* Phase info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${
                        phase.status === "in_progress" && selectedPhase?.id === phase.id 
                          ? "text-white" : ""
                      }`}>
                        {phase.title}
                      </h3>
                      <div className={`flex items-center gap-2 text-sm ${
                        phase.status === "in_progress" && selectedPhase?.id === phase.id 
                          ? "text-neutral-300" : "text-neutral-500"
                      }`}>
                        <span>{phase.skills.length} skills</span>
                        {phase.estimated_days && (
                          <>
                            <span>·</span>
                            <span>{phase.estimated_days} days</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                      selectedPhase?.id === phase.id ? "opacity-100" : "opacity-0"
                    }`} />
                  </motion.div>
                ))}
              </div>
              
              {/* Take Exam Button */}
              {selectedPhase && selectedPhase.status !== "not_started" && (
                <div className="p-4 border-t border-neutral-200">
                  <button
                    onClick={() => router.push(`/roadmap/${roadmapId}/exam/${selectedPhase.id}`)}
                    className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Award className="w-5 h-5" />
                    Take Phase Exam
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Phase Details */}
          <div className="lg:col-span-8 p-6">
            <AnimatePresence mode="wait">
              {selectedPhase && (
                <motion.div
                  key={selectedPhase.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Phase Header */}
                  <div className="border-b border-neutral-200 pb-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold text-black">
                          {selectedPhase.title}
                        </h2>
                        {selectedPhase.description && (
                          <p className="text-neutral-600 mt-2 max-w-2xl">
                            {selectedPhase.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Ask AI Button - Sticky */}
                      <button
                        onClick={() => onAskAI?.(`Help me with ${selectedPhase.title}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                      >
                        <Brain className="w-5 h-5" />
                        Ask AI
                      </button>
                    </div>
                    
                    {/* Phase Stats */}
                    <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-neutral-500" />
                        <span>{selectedPhase.skills.filter(s => s.status === "completed").length}/{selectedPhase.skills.length} completed</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span>~{selectedPhase.estimated_days || Math.ceil(selectedPhase.skills.length * 2)} days</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-neutral-900">Skills to Master</h3>
                    
                    {selectedPhase.skills.map((skill, index) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedSkill(skill)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedSkill?.id === skill.id 
                            ? "border-black bg-neutral-50" 
                            : "border-neutral-200 hover:border-neutral-300"
                        } ${skill.status === "locked" ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {skill.status === "completed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : skill.status === "locked" ? (
                              <Lock className="w-5 h-5 text-neutral-400" />
                            ) : skill.status === "in_progress" ? (
                              <div className="w-5 h-5 border-2 border-black rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-black rounded-full" />
                              </div>
                            ) : (
                              <Circle className="w-5 h-5 text-neutral-300" />
                            )}
                            
                            <div>
                              <h4 className="font-medium text-black">{skill.name}</h4>
                              {skill.interview_frequency && (
                                <p className="text-xs text-neutral-500">
                                  Asked in {skill.interview_frequency}% of interviews
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {skill.estimated_hours && (
                              <span className="text-sm text-neutral-500">
                                {skill.estimated_hours}h
                              </span>
                            )}
                            <ChevronRight className="w-5 h-5 text-neutral-400" />
                          </div>
                        </div>
                        
                        {/* Expanded Skill Details */}
                        <AnimatePresence>
                          {selectedSkill?.id === skill.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-4 pt-4 border-t border-neutral-200 space-y-4"
                            >
                              {/* Why Important */}
                              {skill.why_important && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <p className="text-sm text-blue-800">
                                    <strong>Why this matters:</strong> {skill.why_important}
                                  </p>
                                </div>
                              )}
                              
                              {/* Resources */}
                              {skill.resources && skill.resources.length > 0 && (
                                <div className="space-y-2">
                                  <h5 className="text-sm font-semibold text-neutral-700">Resources</h5>
                                  {skill.resources.slice(0, 3).map((resource, i) => (
                                    <a
                                      key={i}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg hover:border-black transition-colors group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center">
                                          {resource.type === "video" ? "📹" : "📄"}
                                        </div>
                                        <div>
                                          <p className="font-medium text-sm group-hover:text-black">
                                            {resource.title}
                                          </p>
                                          {resource.why_chosen && (
                                            <p className="text-xs text-neutral-500">
                                              {resource.why_chosen}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-black" />
                                    </a>
                                  ))}
                                </div>
                              )}
                              
                              {/* Actions */}
                              <div className="flex gap-2">
                                {skill.status !== "completed" && skill.status !== "locked" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSkillComplete?.(skill.id);
                                    }}
                                    className="flex-1 py-2 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
                                  >
                                    Mark Complete
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAskAI?.(`Explain ${skill.name} for a ${jobTitle} role`);
                                  }}
                                  className="px-4 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-neutral-100 transition-colors flex items-center gap-2"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  Ask AI
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
