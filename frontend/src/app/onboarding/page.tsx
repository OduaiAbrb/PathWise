"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Clock, 
  CheckCircle2,
  Code,
  TrendingUp,
  Zap,
  Award,
  DollarSign,
  Users,
  BarChart3,
  Brain,
  Heart,
  Wrench,
  Sparkles,
  FileText,
  Eye,
  AlertTriangle
} from "lucide-react";
import { useStore } from "@/lib/store";

// Career Discovery Questions - Short, intelligent, not surveys
const discoveryQuestions = [
  {
    id: "enjoy",
    question: "What do you enjoy more?",
    subtitle: "Pick what energizes you the most",
    options: [
      { id: "building", label: "Building", description: "Creating products, systems, features", icon: Code },
      { id: "analyzing", label: "Analyzing", description: "Finding patterns, insights, optimization", icon: BarChart3 },
      { id: "designing", label: "Designing", description: "UX, interfaces, user journeys", icon: Sparkles },
      { id: "optimizing", label: "Optimizing", description: "Performance, infrastructure, reliability", icon: Wrench },
    ]
  },
  {
    id: "preference",
    question: "Do you prefer:",
    subtitle: "How you like to work matters",
    options: [
      { id: "fast_feedback", label: "Fast feedback", description: "See results quickly, iterate often", icon: Zap },
      { id: "deep_focus", label: "Deep focus", description: "Complex problems, long-term projects", icon: Brain },
      { id: "collaboration", label: "Collaboration", description: "Working with teams, pair programming", icon: Users },
      { id: "autonomy", label: "Autonomy", description: "Independent work, self-directed", icon: Target },
    ]
  },
  {
    id: "priority",
    question: "What matters most to you?",
    subtitle: "Be honest - this affects your path",
    options: [
      { id: "salary", label: "High salary", description: "Maximize earning potential", icon: DollarSign },
      { id: "passion", label: "Passion", description: "Love what you do daily", icon: Heart },
      { id: "stability", label: "Stability", description: "Job security, predictable growth", icon: CheckCircle2 },
      { id: "impact", label: "Impact", description: "Make meaningful difference", icon: TrendingUp },
    ]
  },
];

// Role recommendations with comprehensive matching
const careerRoles = [
  {
    id: "backend_engineer",
    title: "Backend Engineer",
    description: "Build scalable server-side systems, APIs, and databases that power applications.",
    whyFits: "You enjoy building complex systems with deep technical challenges.",
    difficulty: "Intermediate",
    marketDemand: 95,
    avgSalary: "$95K - $150K",
    timeToReady: "6-9 months",
    matchProfiles: ["building", "deep_focus", "salary", "autonomy"],
    icon: Code,
    skills: ["Python/Node.js", "SQL/NoSQL", "REST APIs", "System Design"],
  },
  {
    id: "frontend_engineer",
    title: "Frontend Engineer",
    description: "Create beautiful, responsive user interfaces that millions of people interact with.",
    whyFits: "You love fast feedback and creating experiences users can see.",
    difficulty: "Beginner-Intermediate",
    marketDemand: 92,
    avgSalary: "$85K - $135K",
    timeToReady: "4-7 months",
    matchProfiles: ["building", "designing", "fast_feedback", "passion"],
    icon: Sparkles,
    skills: ["React/Vue", "TypeScript", "CSS/Tailwind", "Web Performance"],
  },
  {
    id: "data_engineer",
    title: "Data Engineer",
    description: "Design and build data pipelines that power analytics and machine learning.",
    whyFits: "You're fascinated by data and building systems that process massive scale.",
    difficulty: "Intermediate",
    marketDemand: 94,
    avgSalary: "$100K - $160K",
    timeToReady: "5-8 months",
    matchProfiles: ["analyzing", "building", "deep_focus", "salary"],
    icon: BarChart3,
    skills: ["Python/SQL", "Apache Spark", "ETL Pipelines", "Cloud (AWS/GCP)"],
  },
  {
    id: "fullstack_engineer",
    title: "Full Stack Engineer",
    description: "Master both frontend and backend. Build complete products end-to-end.",
    whyFits: "You want versatility and the ability to ship complete features.",
    difficulty: "Intermediate-Advanced",
    marketDemand: 96,
    avgSalary: "$100K - $160K",
    timeToReady: "8-12 months",
    matchProfiles: ["building", "fast_feedback", "salary", "autonomy"],
    icon: Code,
    skills: ["React", "Node.js/Python", "Databases", "DevOps Basics"],
  },
  {
    id: "devops_engineer",
    title: "DevOps Engineer",
    description: "Automate infrastructure, deployments, and ensure system reliability.",
    whyFits: "You love optimizing systems and making things run smoothly.",
    difficulty: "Advanced",
    marketDemand: 90,
    avgSalary: "$105K - $170K",
    timeToReady: "7-10 months",
    matchProfiles: ["optimizing", "deep_focus", "stability", "autonomy"],
    icon: Wrench,
    skills: ["Docker/Kubernetes", "CI/CD", "Cloud Platforms", "Terraform"],
  },
  {
    id: "data_scientist",
    title: "Data Scientist",
    description: "Extract insights from data using statistics and machine learning.",
    whyFits: "You're curious about patterns and enjoy analytical challenges.",
    difficulty: "Advanced",
    marketDemand: 88,
    avgSalary: "$95K - $155K",
    timeToReady: "8-12 months",
    matchProfiles: ["analyzing", "deep_focus", "impact", "passion"],
    icon: Brain,
    skills: ["Python", "Machine Learning", "Statistics", "SQL"],
  },
];

const experienceLevels = [
  { id: "beginner", label: "Complete Beginner", description: "New to tech/IT, starting fresh", adjustment: 3 },
  { id: "some", label: "Some Experience", description: "Know basics, have built small projects", adjustment: 0 },
  { id: "intermediate", label: "Intermediate", description: "Working in related field, switching roles", adjustment: -2 },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setHasCompletedOnboarding } = useStore();
  
  const flowType = searchParams.get("flow") as "knows" | "discovery" | null;
  const [currentStep, setCurrentStep] = useState(0);
  
  // Flow A data
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [inputMethod, setInputMethod] = useState<"paste" | "select" | null>(null);
  const [experienceLevel, setExperienceLevel] = useState("");
  
  // Flow B data
  const [discoveryData, setDiscoveryData] = useState<Record<string, string>>({});
  const [recommendedRoles, setRecommendedRoles] = useState<typeof careerRoles>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Redirect if no flow selected
  useEffect(() => {
    if (!flowType) {
      router.push("/");
    }
  }, [flowType, router]);

  // Calculate role matches for career discovery
  const calculateRoleMatches = () => {
    const answers = Object.values(discoveryData);
    const scored = careerRoles.map(role => {
      const matches = role.matchProfiles.filter(profile => answers.includes(profile)).length;
      return { ...role, matchScore: matches };
    });
    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
    setRecommendedRoles(sorted.slice(0, 4));
  };

  const handleNext = () => {
    if (flowType === "knows") {
      if (currentStep === 0 && inputMethod) {
        setCurrentStep(1);
      } else if (currentStep === 1 && (targetRole || jobDescription.length > 50)) {
        setCurrentStep(2);
      } else if (currentStep === 2 && experienceLevel) {
        // Complete - go to roadmap generation
        setHasCompletedOnboarding(true);
        const roleData = targetRole || "Software Engineer";
        localStorage.setItem("pathwise_target_role", roleData);
        localStorage.setItem("pathwise_experience", experienceLevel);
        if (jobDescription) {
          localStorage.setItem("pathwise_jd", jobDescription);
        }
        router.push("/roadmap/new");
      }
    } else if (flowType === "discovery") {
      if (currentStep < discoveryQuestions.length) {
        if (discoveryData[discoveryQuestions[currentStep].id]) {
          setCurrentStep(currentStep + 1);
          if (currentStep === discoveryQuestions.length - 1) {
            calculateRoleMatches();
          }
        }
      } else if (currentStep === discoveryQuestions.length && selectedRole) {
        // Role selected
        setCurrentStep(currentStep + 1);
      } else if (currentStep === discoveryQuestions.length + 1 && experienceLevel) {
        // Complete
        setHasCompletedOnboarding(true);
        const role = careerRoles.find(r => r.id === selectedRole);
        localStorage.setItem("pathwise_target_role", role?.title || "Software Engineer");
        localStorage.setItem("pathwise_experience", experienceLevel);
        router.push("/roadmap/new");
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/");
    }
  };

  const canProceed = () => {
    if (flowType === "knows") {
      if (currentStep === 0) return !!inputMethod;
      if (currentStep === 1) return inputMethod === "select" ? !!targetRole : jobDescription.length > 50;
      if (currentStep === 2) return !!experienceLevel;
    } else if (flowType === "discovery") {
      if (currentStep < discoveryQuestions.length) {
        return !!discoveryData[discoveryQuestions[currentStep]?.id];
      }
      if (currentStep === discoveryQuestions.length) return !!selectedRole;
      if (currentStep === discoveryQuestions.length + 1) return !!experienceLevel;
    }
    return false;
  };

  const totalSteps = flowType === "knows" ? 3 : discoveryQuestions.length + 2;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  if (!flowType) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <motion.div
          className="h-full bg-blue-600"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Start over
        </button>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${flowType}-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* FLOW A: USER KNOWS WHAT THEY WANT */}
            {flowType === "knows" && (
              <>
                {/* Step 0: Choose input method */}
                {currentStep === 0 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <Target className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        How do you want to define your target role?
                      </h1>
                      <p className="text-slate-600">
                        We'll extract the exact skills employers want and build your roadmap.
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setInputMethod("paste")}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          inputMethod === "paste"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <FileText className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Paste a Job Description
                        </h3>
                        <p className="text-sm text-slate-600">
                          Paste a real job posting. We'll extract skills ranked by interview frequency and job demand.
                        </p>
                      </button>

                      <button
                        onClick={() => setInputMethod("select")}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${
                          inputMethod === "select"
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <Target className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          Select a Role
                        </h3>
                        <p className="text-sm text-slate-600">
                          Choose from curated tech roles with pre-built skill requirements.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 1: Job Definition */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        {inputMethod === "paste" ? "Paste the job description" : "Select your target role"}
                      </h1>
                      <p className="text-slate-600">
                        {inputMethod === "paste" 
                          ? "We'll extract and rank every skill by interview importance."
                          : "Choose the role you want to become job-ready for."}
                      </p>
                    </div>

                    {inputMethod === "paste" ? (
                      <div>
                        <textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the full job description here...\n\nExample: We're looking for a Backend Engineer with experience in Python, REST APIs, PostgreSQL..."
                          className="w-full h-64 p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 resize-none text-slate-900"
                          data-testid="job-description-input"
                        />
                        <p className="text-sm text-slate-500 mt-2">
                          {jobDescription.length} characters {jobDescription.length < 50 && "(minimum 50)"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {careerRoles.slice(0, 6).map((role) => {
                          const Icon = role.icon;
                          return (
                            <button
                              key={role.id}
                              onClick={() => setTargetRole(role.title)}
                              className={`p-5 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                                targetRole === role.title
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <Icon className="w-6 h-6 text-slate-700 flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">{role.title}</h3>
                                <p className="text-sm text-slate-600 mt-1">{role.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {role.skills.slice(0, 3).map((skill) => (
                                    <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <p className="text-emerald-600 font-medium">{role.avgSalary}</p>
                                <p className="text-slate-500">{role.timeToReady}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Experience Level */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Where are you starting from?
                      </h1>
                      <p className="text-slate-600">
                        Be honest. We'll calibrate your roadmap so you're challenged but not overwhelmed.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setExperienceLevel(level.id)}
                          className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                            experienceLevel === level.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <h3 className="font-semibold text-slate-900">{level.label}</h3>
                          <p className="text-sm text-slate-600 mt-1">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* FLOW B: CAREER DISCOVERY */}
            {flowType === "discovery" && (
              <>
                {/* Discovery Questions */}
                {currentStep < discoveryQuestions.length && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        {discoveryQuestions[currentStep].question}
                      </h1>
                      <p className="text-slate-600">
                        {discoveryQuestions[currentStep].subtitle}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {discoveryQuestions[currentStep].options.map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.id}
                            onClick={() => setDiscoveryData({ 
                              ...discoveryData, 
                              [discoveryQuestions[currentStep].id]: option.id 
                            })}
                            className={`p-6 rounded-xl border-2 text-left transition-all ${
                              discoveryData[discoveryQuestions[currentStep].id] === option.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <Icon className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">
                              {option.label}
                            </h3>
                            <p className="text-sm text-slate-600">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Role Recommendations */}
                {currentStep === discoveryQuestions.length && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Based on your answers, here are your top matches:
                      </h1>
                      <p className="text-slate-600">
                        Each role is tailored to YOUR preferences. Click "Preview" to explore before committing.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {recommendedRoles.map((role, index) => {
                        const Icon = role.icon;
                        return (
                          <div
                            key={role.id}
                            className={`p-6 rounded-xl border-2 transition-all ${
                              selectedRole === role.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Icon className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-xl font-bold text-slate-900">
                                    {index === 0 && "🥇 "}{role.title}
                                  </h3>
                                  <span className="text-emerald-600 font-semibold">
                                    {role.avgSalary}
                                  </span>
                                </div>
                                <p className="text-slate-600 mt-1">{role.description}</p>
                                
                                {/* Why it fits */}
                                <div className="mt-3 p-3 bg-emerald-50 rounded-lg">
                                  <p className="text-sm text-emerald-700">
                                    <strong>Why it fits you:</strong> {role.whyFits}
                                  </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                                  <div>
                                    <p className="text-slate-500">Difficulty</p>
                                    <p className="font-medium text-slate-900">{role.difficulty}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Market Demand</p>
                                    <p className="font-medium text-slate-900">{role.marketDemand}%</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500">Time to Ready</p>
                                    <p className="font-medium text-slate-900">{role.timeToReady}</p>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-4">
                                  <button
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                      selectedRole === role.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                    }`}
                                  >
                                    {selectedRole === role.id ? "✓ Selected" : "Select this role"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedRole(role.id);
                                      setPreviewMode(true);
                                    }}
                                    className="py-2 px-4 rounded-lg border-2 border-slate-200 text-slate-700 hover:border-slate-300 flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Experience Level (Discovery Flow) */}
                {currentStep === discoveryQuestions.length + 1 && (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-slate-900 mb-3">
                        Where are you starting from?
                      </h1>
                      <p className="text-slate-600">
                        We'll adjust your {careerRoles.find(r => r.id === selectedRole)?.title} roadmap accordingly.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setExperienceLevel(level.id)}
                          className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                            experienceLevel === level.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <h3 className="font-semibold text-slate-900">{level.label}</h3>
                          <p className="text-sm text-slate-600 mt-1">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors flex items-center justify-center gap-2"
            data-testid="next-button"
          >
            {(flowType === "knows" && currentStep === 2) || 
             (flowType === "discovery" && currentStep === discoveryQuestions.length + 1)
              ? "Create My Roadmap"
              : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewMode && selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setPreviewMode(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const role = careerRoles.find(r => r.id === selectedRole);
                if (!role) return null;
                const Icon = role.icon;
                return (
                  <>
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{role.title}</h2>
                        <p className="text-slate-600">{role.description}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Skills Preview */}
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Skills You'll Master</h3>
                        <div className="flex flex-wrap gap-2">
                          {role.skills.map((skill) => (
                            <span key={skill} className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* What to expect */}
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">What to Expect</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-500">Time to Job-Ready</p>
                            <p className="text-xl font-bold text-slate-900">{role.timeToReady}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-500">Average Salary</p>
                            <p className="text-xl font-bold text-emerald-600">{role.avgSalary}</p>
                          </div>
                        </div>
                      </div>

                      {/* Interview Focus */}
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-amber-800">Interview Focus Areas</h4>
                            <p className="text-sm text-amber-700 mt-1">
                              Most {role.title} interviews focus heavily on system design, coding challenges, and behavioral questions. Our roadmap prepares you for all three.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setPreviewMode(false)}
                        className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                      >
                        Close Preview
                      </button>
                      <button
                        onClick={() => {
                          setPreviewMode(false);
                          handleNext();
                        }}
                        className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
                      >
                        Choose This Role
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
