"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Target, 
  Clock, 
  Rocket, 
  HelpCircle,
  CheckCircle2,
  Code,
  TrendingUp,
  Zap,
  Award,
  DollarSign,
  Users,
  BarChart3,
  FileText,
  Brain,
  Heart,
  Wrench
} from "lucide-react";
import { useStore } from "@/lib/store";

// Career Discovery Questions (Flow B)
const discoveryQuestions = [
  {
    id: "work_style",
    question: "What do you enjoy more?",
    options: [
      { id: "building", label: "Building things", description: "Creating products, features, systems", icon: Code },
      { id: "analyzing", label: "Analyzing data", description: "Finding patterns, insights, optimization", icon: BarChart3 },
      { id: "designing", label: "Designing experiences", description: "UX, interfaces, user journeys", icon: Sparkles },
      { id: "connecting", label: "Connecting people", description: "Communication, coordination, community", icon: Users },
    ]
  },
  {
    id: "preference",
    question: "You prefer work that gives you...",
    options: [
      { id: "fast_feedback", label: "Fast feedback", description: "See results quickly, iterate often", icon: Zap },
      { id: "deep_thinking", label: "Deep thinking", description: "Complex problems, long-term projects", icon: Brain },
      { id: "variety", label: "Variety", description: "Different tasks, diverse challenges", icon: Sparkles },
      { id: "mastery", label: "Mastery", description: "Become expert in specific domain", icon: Award },
    ]
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      { id: "salary", label: "High salary", description: "Maximize earning potential", icon: DollarSign },
      { id: "passion", label: "Passion", description: "Love what you do daily", icon: Heart },
      { id: "stability", label: "Stability", description: "Job security, predictable growth", icon: CheckCircle2 },
      { id: "impact", label: "Impact", description: "Make meaningful difference", icon: TrendingUp },
    ]
  },
];

// Role recommendations with matching logic
const careerRoles = [
  {
    id: "backend_engineer",
    title: "Backend Engineer",
    description: "Build scalable server-side systems, APIs, and databases",
    difficulty: "Intermediate",
    marketDemand: 95,
    avgSalary: "$95k - $150k",
    timeToReady: "6-9 months",
    matchProfiles: ["building", "deep_thinking", "salary"],
    icon: Code,
  },
  {
    id: "frontend_engineer",
    title: "Frontend Engineer",
    description: "Create beautiful, responsive user interfaces and experiences",
    difficulty: "Beginner-Intermediate",
    marketDemand: 92,
    avgSalary: "$85k - $135k",
    timeToReady: "4-7 months",
    matchProfiles: ["building", "designing", "fast_feedback", "passion"],
    icon: Sparkles,
  },
  {
    id: "data_analyst",
    title: "Data Analyst",
    description: "Extract insights from data to drive business decisions",
    difficulty: "Beginner-Intermediate",
    marketDemand: 88,
    avgSalary: "$70k - $110k",
    timeToReady: "3-5 months",
    matchProfiles: ["analyzing", "deep_thinking", "impact"],
    icon: BarChart3,
  },
  {
    id: "fullstack_engineer",
    title: "Full Stack Engineer",
    description: "Master both frontend and backend development",
    difficulty: "Intermediate-Advanced",
    marketDemand: 96,
    avgSalary: "$100k - $160k",
    timeToReady: "9-12 months",
    matchProfiles: ["building", "variety", "salary"],
    icon: Code,
  },
  {
    id: "devops_engineer",
    title: "DevOps Engineer",
    description: "Automate infrastructure, deployments, and system reliability",
    difficulty: "Advanced",
    marketDemand: 90,
    avgSalary: "$105k - $170k",
    timeToReady: "8-11 months",
    matchProfiles: ["building", "mastery", "stability"],
    icon: Wrench,
  },
];

const experienceLevels = [
  { id: "beginner", label: "Beginner", description: "New to this field, starting fresh" },
  { id: "intermediate", label: "Intermediate", description: "Some experience, looking to level up" },
  { id: "advanced", label: "Advanced", description: "Experienced, seeking specialization" },
];

const timeCommitments = [
  { id: "light", label: "5-10 hours/week", description: "Part-time learning" },
  { id: "moderate", label: "10-20 hours/week", description: "Dedicated learner" },
  { id: "intensive", label: "20+ hours/week", description: "Full-time focus" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setHasCompletedOnboarding } = useStore();
  
  // Main state
  const [flowType, setFlowType] = useState<null | "knows" | "discovery">(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Flow A data (user knows what they want)
  const [knownRoleData, setKnownRoleData] = useState({
    targetRole: "",
    experienceLevel: "",
    timeCommitment: "",
  });
  
  // Flow B data (career discovery)
  const [discoveryData, setDiscoveryData] = useState<Record<string, string>>({});
  const [recommendedRoles, setRecommendedRoles] = useState<typeof careerRoles>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Calculate role matches for career discovery
  const calculateRoleMatches = () => {
    const answers = Object.values(discoveryData);
    const scored = careerRoles.map(role => {
      const matches = role.matchProfiles.filter(profile => answers.includes(profile)).length;
      return { ...role, matchScore: matches };
    });
    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
    setRecommendedRoles(sorted.slice(0, 3));
  };

  const handleFlowSelection = (type: "knows" | "discovery") => {
    setFlowType(type);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (flowType === "knows") {
      if (currentStep === 3) {
        // Complete onboarding
        setHasCompletedOnboarding(true);
        router.push("/roadmap/new");
      } else {
        setCurrentStep(currentStep + 1);
      }
    } else if (flowType === "discovery") {
      if (currentStep === discoveryQuestions.length) {
        // Show recommendations
        calculateRoleMatches();
        setCurrentStep(currentStep + 1);
      } else if (currentStep === discoveryQuestions.length + 1) {
        // Role selected, go to experience level
        setCurrentStep(currentStep + 1);
      } else if (currentStep === discoveryQuestions.length + 2) {
        // Complete onboarding
        setHasCompletedOnboarding(true);
        router.push("/roadmap/new");
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setFlowType(null);
      setCurrentStep(0);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (flowType === "knows") {
      if (currentStep === 1) return knownRoleData.targetRole.trim().length > 0;
      if (currentStep === 2) return knownRoleData.experienceLevel.length > 0;
      if (currentStep === 3) return knownRoleData.timeCommitment.length > 0;
    } else if (flowType === "discovery") {
      if (currentStep <= discoveryQuestions.length) {
        const currentQuestion = discoveryQuestions[currentStep - 1];
        return currentQuestion ? !!discoveryData[currentQuestion.id] : false;
      }
      if (currentStep === discoveryQuestions.length + 1) return !!selectedRole;
      if (currentStep === discoveryQuestions.length + 2) return knownRoleData.experienceLevel.length > 0;
    }
    return true;
  };

  // Entry screen (step 0)
  if (flowType === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-neutral-900 mb-4">
              Let's Get You Job-Ready
            </h1>
            <p className="text-xl text-neutral-600">
              PathWise is a career outcome machine, not a learning platform.
            </p>
            <p className="text-lg text-neutral-500 mt-2">
              We focus on one thing: getting you hired, fast and with confidence.
            </p>
          </div>

          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-6 text-center">
              First, let's understand where you are:
            </h2>
            <p className="text-lg text-neutral-700 mb-8 text-center font-medium">
              Do you already have a job role in mind?
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Flow A: User knows */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFlowSelection("knows")}
                className="p-8 rounded-2xl border-2 border-neutral-900 bg-white hover:bg-neutral-50 text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <h3 className="text-2xl font-bold text-neutral-900">Yes, I know</h3>
                </div>
                <p className="text-neutral-600 mb-4">
                  I have a specific role in mind and want to get job-ready for it.
                </p>
                <p className="text-sm text-neutral-500">
                  <strong>Example:</strong> "I want to become a Backend Engineer"
                </p>
                <div className="mt-6 flex items-center text-neutral-900 font-medium group-hover:gap-3 gap-2 transition-all">
                  Let's build your roadmap
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>

              {/* Flow B: Career discovery */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFlowSelection("discovery")}
                className="p-8 rounded-2xl border-2 border-blue-600 bg-blue-50 hover:bg-blue-100 text-left transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="w-8 h-8 text-blue-600" />
                  <h3 className="text-2xl font-bold text-neutral-900">No, I need guidance</h3>
                </div>
                <p className="text-neutral-700 mb-4">
                  I'm in tech/IT but unsure which role fits me best.
                </p>
                <p className="text-sm text-neutral-600">
                  <strong>We'll help you discover:</strong> 3-5 roles that match your preferences
                </p>
                <div className="mt-6 flex items-center text-neutral-900 font-medium group-hover:gap-3 gap-2 transition-all">
                  Help me find my path
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.button>
            </div>
          </div>

          <p className="text-center text-neutral-500 text-sm">
            This decision doesn't lock you in. You can always explore other roles later.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => {
                setFlowType(null);
                setCurrentStep(0);
              }}
              className="text-sm text-neutral-500 hover:text-neutral-700"
            >
              ← Change path
            </button>
            <span className="text-sm text-neutral-500">
              {flowType === "knows" ? "Building Your Roadmap" : "Career Discovery"}
            </span>
          </div>
          <div className="progress-bar h-2">
            <motion.div
              className="progress-fill"
              animate={{ 
                width: flowType === "knows" 
                  ? `${(currentStep / 3) * 100}%`
                  : `${(currentStep / (discoveryQuestions.length + 2)) * 100}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${flowType}-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card p-8"
          >

            {/* FLOW A: USER KNOWS WHAT THEY WANT */}
            {flowType === "knows" && (
              <>
                {/* Step 1: Target Role */}
                {currentStep === 1 && (
                  <div>
                    <div className="text-center mb-8">
                      <Target className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                        What role are you targeting?
                      </h2>
                      <p className="text-neutral-600">
                        Be specific. This will determine everything: skills to learn, projects to build, interviews to prepare for.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="label font-semibold">Target Job Title</label>
                        <input
                          type="text"
                          value={knownRoleData.targetRole}
                          onChange={(e) => setKnownRoleData({ ...knownRoleData, targetRole: e.target.value })}
                          placeholder="e.g., Backend Engineer, Frontend Developer, Data Analyst"
                          className="input text-lg"
                          autoFocus
                        />
                        <p className="text-sm text-neutral-500 mt-2">
                          Tip: Use exact job titles from job postings you're interested in
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Experience Level */}
                {currentStep === 2 && (
                  <div>
                    <div className="text-center mb-8">
                      <Sparkles className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                        Where are you now?
                      </h2>
                      <p className="text-neutral-600">
                        Be honest. We'll calibrate difficulty so you're challenged but not overwhelmed.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setKnownRoleData({ ...knownRoleData, experienceLevel: level.id })}
                          className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                            knownRoleData.experienceLevel === level.id
                              ? "border-neutral-900 bg-neutral-50"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <p className="font-semibold text-lg text-neutral-900">{level.label}</p>
                          <p className="text-sm text-neutral-600">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Time Commitment */}
                {currentStep === 3 && (
                  <div>
                    <div className="text-center mb-8">
                      <Clock className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                        How much time can you commit?
                      </h2>
                      <p className="text-neutral-600">
                        We'll build a realistic roadmap. Overcommitting leads to burnout and quitting.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {timeCommitments.map((time) => (
                        <button
                          key={time.id}
                          onClick={() => setKnownRoleData({ ...knownRoleData, timeCommitment: time.id })}
                          className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                            knownRoleData.timeCommitment === time.id
                              ? "border-neutral-900 bg-neutral-50"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <p className="font-semibold text-lg text-neutral-900">{time.label}</p>
                          <p className="text-sm text-neutral-600">{time.description}</p>
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
                {/* Discovery questions */}
                {currentStep >= 1 && currentStep <= discoveryQuestions.length && (
                  <div>
                    {(() => {
                      const question = discoveryQuestions[currentStep - 1];
                      return (
                        <>
                          <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
                              {question.question}
                            </h2>
                            <p className="text-neutral-600">Choose the option that resonates most with you</p>
                          </div>
                          <div className="space-y-3">
                            {question.options.map((option) => {
                              const Icon = option.icon;
                              return (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    setDiscoveryData({ ...discoveryData, [question.id]: option.id });
                                  }}
                                  className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                                    discoveryData[question.id] === option.id
                                      ? "border-blue-600 bg-blue-50"
                                      : "border-neutral-200 hover:border-neutral-300"
                                  }`}
                                >
                                  <div className="flex items-start gap-4">
                                    <Icon className="w-6 h-6 text-neutral-700 flex-shrink-0 mt-1" />
                                    <div>
                                      <p className="font-semibold text-lg text-neutral-900 mb-1">{option.label}</p>
                                      <p className="text-sm text-neutral-600">{option.description}</p>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Role recommendations */}
                {currentStep === discoveryQuestions.length + 1 && (
                  <div>
                    <div className="text-center mb-8">
                      <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                        Based on your answers, here are your top matches:
                      </h2>
                      <p className="text-neutral-600">
                        Each role is tailored to your preferences. Click to explore, then select one to continue.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {recommendedRoles.map((role) => {
                        const Icon = role.icon;
                        return (
                          <button
                            key={role.id}
                            onClick={() => {
                              setSelectedRole(role.id);
                              setKnownRoleData({ ...knownRoleData, targetRole: role.title });
                            }}
                            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                              selectedRole === role.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-neutral-200 hover:border-neutral-300"
                            }`}
                          >
                            <div className="flex items-start gap-4 mb-4">
                              <Icon className="w-8 h-8 text-neutral-700 flex-shrink-0" />
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-neutral-900 mb-1">{role.title}</h3>
                                <p className="text-neutral-700 mb-3">{role.description}</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <p className="text-neutral-500">Market Demand</p>
                                    <p className="font-semibold text-neutral-900">{role.marketDemand}%</p>
                                  </div>
                                  <div>
                                    <p className="text-neutral-500">Avg. Salary</p>
                                    <p className="font-semibold text-neutral-900">{role.avgSalary}</p>
                                  </div>
                                  <div>
                                    <p className="text-neutral-500">Difficulty</p>
                                    <p className="font-semibold text-neutral-900">{role.difficulty}</p>
                                  </div>
                                  <div>
                                    <p className="text-neutral-500">Time to Ready</p>
                                    <p className="font-semibold text-neutral-900">{role.timeToReady}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {selectedRole === role.id && (
                              <div className="pt-4 border-t border-neutral-200">
                                <p className="text-sm font-medium text-blue-600">✓ Selected - Click Continue to proceed</p>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Experience level (for discovery flow) */}
                {currentStep === discoveryQuestions.length + 2 && (
                  <div>
                    <div className="text-center mb-8">
                      <Sparkles className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                        What's your experience with {knownRoleData.targetRole}?
                      </h2>
                      <p className="text-neutral-600">
                        Be honest. We'll tailor the roadmap to your current level.
                      </p>
                    </div>
                    <div className="space-y-3">
                      {experienceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => setKnownRoleData({ ...knownRoleData, experienceLevel: level.id, timeCommitment: "moderate" })}
                          className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                            knownRoleData.experienceLevel === level.id
                              ? "border-neutral-900 bg-neutral-50"
                              : "border-neutral-200 hover:border-neutral-300"
                          }`}
                        >
                          <p className="font-semibold text-lg text-neutral-900">{level.label}</p>
                          <p className="text-sm text-neutral-600">{level.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              <button onClick={handleBack} className="btn-secondary">
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary flex-1 justify-center"
              >
                {((flowType === "knows" && currentStep === 3) || 
                  (flowType === "discovery" && currentStep === discoveryQuestions.length + 2))
                  ? "Create My Roadmap"
                  : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
