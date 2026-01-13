"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/fetch-api";
import {
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  CheckCircle2,
  Zap,
  AlertTriangle,
  Flame,
  BookOpen,
  Code,
  Brain,
  Video,
  FileText,
  Layers,
} from "lucide-react";

/**
 * Roadmap Generation Page
 * 
 * ADAPTIVE ROADMAP SYSTEM:
 * - personalized
 * - non-static
 * - interview-oriented
 * - adaptive over time
 * 
 * Each skill explains:
 * - why this skill matters
 * - why this order exists
 * - what happens if skipped
 */

function RoadmapNewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  
  // Roadmap V2 Preferences
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pace, setPace] = useState("standard");
  const [timePerDay, setTimePerDay] = useState(60);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [depth, setDepth] = useState("interview_ready");
  const [learningStyle, setLearningStyle] = useState("mixed");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [constraints, setConstraints] = useState("");
  
  // REQUIRED: Resource Type Preference (visual/reading/hybrid)
  const [resourcePreference, setResourcePreference] = useState<string | null>(null);

  // Load saved data from onboarding
  useEffect(() => {
    const savedRole = localStorage.getItem("pathwise_target_role");
    const savedJD = localStorage.getItem("pathwise_jd");
    const savedExp = localStorage.getItem("pathwise_experience");

    if (savedRole) setTargetRole(savedRole);
    if (savedJD) setJobDescription(savedJD);
    if (savedExp) setExperienceLevel(savedExp);

    // If coming from onboarding with data, auto-generate
    if (savedRole && !savedJD) {
      setJobDescription(`I want to become a ${savedRole}. Create a comprehensive learning roadmap for this role.`);
    }
  }, []);

  const generateRoadmap = async () => {
    if (!accessToken || (!jobDescription && !targetRole)) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/api/v1/roadmaps/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          job_description: jobDescription || `I want to become a ${targetRole}`,
          skill_level: experienceLevel,
          industry: "technology",
          preferences: {
            pace,
            time_per_day_minutes: timePerDay,
            days_per_week: daysPerWeek,
            depth,
            learning_style: learningStyle,
            resource_preference: resourcePreference, // visual | reading | hybrid
            focus_areas: focusAreas,
            constraints: constraints || null,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to generate roadmap");
      }

      const data = await response.json();
      
      // Clear localStorage
      localStorage.removeItem("pathwise_target_role");
      localStorage.removeItem("pathwise_jd");
      localStorage.removeItem("pathwise_experience");

      // Redirect to the roadmap view
      router.push(`/roadmap/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsGenerating(false);
    }
  };

  // Note: Auto-generate is disabled - users must select learning style first
  // The learning style (resourcePreference) is now required before generation

  if (status === "loading" || isGenerating) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-2">
            Building Your Roadmap
          </h2>
          <p className="text-slate-600 max-w-md mx-auto">
            Our AI is analyzing {targetRole || "your role"}, extracting skills ranked by interview frequency, and creating your personalized path...
          </p>
          
          <div className="mt-8 space-y-3 max-w-sm mx-auto text-left">
            {[
              { icon: Target, text: "Identifying critical skills", delay: 0 },
              { icon: Flame, text: "Ranking by interview frequency", delay: 0.5 },
              { icon: BookOpen, text: "Curating learning resources", delay: 1 },
              { icon: Code, text: "Designing portfolio projects", delay: 1.5 },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay }}
                className="flex items-center gap-3 text-slate-700"
              >
                <item.icon className="w-5 h-5 text-blue-600" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Create Your Roadmap
          </h1>
          <p className="text-slate-600">
            Paste a job description or describe your target role. We'll create a personalized, interview-focused learning path.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Generation Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          {/* Target Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Target Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Backend Engineer, Data Scientist, DevOps Engineer"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-0"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Description (Optional - for more precise roadmap)
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a real job posting to get skills ranked by interview frequency..."
              className="w-full h-40 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-0 resize-none"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "beginner", label: "Beginner" },
                { id: "some", label: "Some Experience" },
                { id: "intermediate", label: "Intermediate" },
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setExperienceLevel(level.id)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    experienceLevel === level.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* REQUIRED: How Do You Learn Best? */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
            <label className="block text-lg font-bold text-slate-900 mb-1">
              How Do You Learn Best? <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-slate-600 mb-4">
              This determines the type of resources in your roadmap
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { 
                  id: "visual", 
                  label: "Visual Learner", 
                  desc: "Videos & tutorials",
                  icon: Video,
                  color: "rose"
                },
                { 
                  id: "reading", 
                  label: "Reading Learner", 
                  desc: "Docs & articles",
                  icon: FileText,
                  color: "emerald"
                },
                { 
                  id: "hybrid", 
                  label: "Hybrid", 
                  desc: "Mix of both",
                  icon: Layers,
                  color: "violet"
                },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setResourcePreference(option.id)}
                  className={`relative py-5 px-4 rounded-xl border-2 text-center transition-all ${
                    resourcePreference === option.id
                      ? `border-${option.color}-500 bg-white shadow-lg ring-2 ring-${option.color}-200`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <option.icon className={`w-8 h-8 mx-auto mb-2 ${
                    resourcePreference === option.id 
                      ? `text-${option.color}-600` 
                      : "text-slate-400"
                  }`} />
                  <div className={`font-semibold ${
                    resourcePreference === option.id 
                      ? `text-${option.color}-700` 
                      : "text-slate-700"
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{option.desc}</div>
                  {resourcePreference === option.id && (
                    <div className={`absolute -top-2 -right-2 w-6 h-6 bg-${option.color}-500 rounded-full flex items-center justify-center`}>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            {!resourcePreference && (
              <p className="text-sm text-amber-600 mt-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Please select your preferred learning style to continue
              </p>
            )}
          </div>

          {/* Advanced Preferences Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full py-3 text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {showAdvanced ? "Hide" : "Show"} Advanced Preferences
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-6 pt-2"
            >
              {/* Pace */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Learning Pace
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "relaxed", label: "Relaxed", desc: "Take your time" },
                    { id: "standard", label: "Standard", desc: "Balanced" },
                    { id: "intense", label: "Intense", desc: "Fast-track" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPace(option.id)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${pace === option.id ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 hover:border-slate-300 text-slate-700"}`}
                    >
                      <div>{option.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Per Day */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Time per day: <strong>{timePerDay} minutes</strong>
                </label>
                <input
                  type="range"
                  min="30"
                  max="180"
                  step="15"
                  value={timePerDay}
                  onChange={(e) => setTimePerDay(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>30 min</span>
                  <span>1 hr</span>
                  <span>2 hrs</span>
                  <span>3 hrs</span>
                </div>
              </div>

              {/* Days Per Week */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Days per week
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysPerWeek(d)}
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${daysPerWeek === d ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 hover:border-slate-300 text-slate-700"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Depth */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Learning Depth
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "overview", label: "Overview", desc: "Surface level" },
                    { id: "interview_ready", label: "Interview Ready", desc: "Focused prep" },
                    { id: "deep", label: "Deep Dive", desc: "Comprehensive" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDepth(option.id)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${depth === option.id ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 hover:border-slate-300 text-slate-700"}`}
                    >
                      <div>{option.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Style */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Learning Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "theory_first", label: "Theory First", desc: "Concepts → Practice" },
                    { id: "mixed", label: "Mixed", desc: "Balanced approach" },
                    { id: "project_first", label: "Project First", desc: "Learn by building" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setLearningStyle(option.id)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${learningStyle === option.id ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 hover:border-slate-300 text-slate-700"}`}
                    >
                      <div>{option.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Constraints (optional)
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g., No paid courses, prefer Python, avoid Java"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-0"
                />
              </div>
            </motion.div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateRoadmap}
            disabled={(!targetRole && !jobDescription) || !resourcePreference}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate My Roadmap
          </button>
          {!resourcePreference && (targetRole || jobDescription) && (
            <p className="text-center text-sm text-amber-600 mt-2">
              ↑ Select your learning style above to enable generation
            </p>
          )}
        </div>

        {/* What to expect */}
        <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
          <h3 className="font-semibold text-slate-900 mb-4">What you'll get:</h3>
          <div className="space-y-3">
            {[
              { icon: Target, text: "Skills ranked by interview frequency and job demand" },
              { icon: Zap, text: "Clear explanation of why each skill matters" },
              { icon: Clock, text: "Realistic time estimates for each phase" },
              { icon: AlertTriangle, text: "Honest feedback on what happens if you skip skills" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-slate-700">
                <item.icon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RoadmapNewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RoadmapNewContent />
    </Suspense>
  );
}
