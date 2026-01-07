"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Target,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Star,
  Zap,
  Trophy,
  Brain,
  Code,
  Briefcase,
  GraduationCap,
  MapPin,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
}

interface UserProfile {
  name: string;
  email: string;
  role: "student" | "professional" | "career_changer" | "freelancer";
  experience: "beginner" | "intermediate" | "advanced";
  goals: string[];
  interests: string[];
  availableTime: number; // hours per week
  preferredLearningStyle: "visual" | "hands_on" | "reading" | "mixed";
  timeline: "3_months" | "6_months" | "1_year" | "flexible";
}

const LEARNING_GOALS = [
  { id: "web_dev", label: "Web Development", icon: Code },
  { id: "data_science", label: "Data Science", icon: Brain },
  { id: "mobile_dev", label: "Mobile Development", icon: Zap },
  { id: "ai_ml", label: "AI/Machine Learning", icon: Sparkles },
  { id: "cybersecurity", label: "Cybersecurity", icon: Trophy },
  { id: "cloud", label: "Cloud Computing", icon: Target },
  { id: "devops", label: "DevOps", icon: Star },
  { id: "ui_ux", label: "UI/UX Design", icon: User }
];

const INTERESTS = [
  "Frontend Development", "Backend Development", "Full Stack", "React", "Node.js", 
  "Python", "JavaScript", "TypeScript", "Database Design", "API Development",
  "Mobile Apps", "Machine Learning", "Data Analysis", "System Design", "Testing"
];

// Personal Information Step
const PersonalInfoStep = ({ profile, updateProfile, onNext }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-6"
  >
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">Welcome to PathWise! 👋</h2>
      <p className="text-lg text-neutral-600">Let's personalize your learning journey</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => updateProfile({ name: e.target.value })}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
        <input
          type="email"
          value={profile.email}
          onChange={(e) => updateProfile({ email: e.target.value })}
          placeholder="your.email@example.com"
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-3">What describes you best?</label>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { id: "student", label: "Student", desc: "Currently enrolled in education" },
          { id: "professional", label: "Working Professional", desc: "Employed and looking to upskill" },
          { id: "career_changer", label: "Career Changer", desc: "Transitioning to tech" },
          { id: "freelancer", label: "Freelancer", desc: "Independent contractor" }
        ].map((role) => (
          <button
            key={role.id}
            onClick={() => updateProfile({ role: role.id })}
            className={`p-4 text-left border rounded-xl transition-all ${
              profile.role === role.id
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <div className="font-medium">{role.label}</div>
            <div className="text-sm text-neutral-600">{role.desc}</div>
          </button>
        ))}
      </div>
    </div>

    <div className="flex justify-center pt-6">
      <button
        onClick={onNext}
        disabled={!profile.name || !profile.email || !profile.role}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
      >
        Continue <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
);

// Experience & Goals Step
const ExperienceGoalsStep = ({ profile, updateProfile, onNext, onPrev }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-8"
  >
    <div className="text-center">
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">Your Learning Profile</h2>
      <p className="text-lg text-neutral-600">Help us understand your experience and goals</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-3">Your current experience level?</label>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { id: "beginner", label: "Beginner", desc: "New to programming" },
          { id: "intermediate", label: "Intermediate", desc: "Some coding experience" },
          { id: "advanced", label: "Advanced", desc: "Experienced developer" }
        ].map((level) => (
          <button
            key={level.id}
            onClick={() => updateProfile({ experience: level.id })}
            className={`p-4 text-center border rounded-xl transition-all ${
              profile.experience === level.id
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <div className="font-medium">{level.label}</div>
            <div className="text-sm text-neutral-600">{level.desc}</div>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-3">
        What are your learning goals? (Select all that apply)
      </label>
      <div className="grid md:grid-cols-4 gap-3">
        {LEARNING_GOALS.map((goal) => {
          const IconComponent = goal.icon;
          const isSelected = profile.goals?.includes(goal.id) || false;
          return (
            <button
              key={goal.id}
              onClick={() => {
                const currentGoals = profile.goals || [];
                const newGoals = isSelected
                  ? currentGoals.filter((g: string) => g !== goal.id)
                  : [...currentGoals, goal.id];
                updateProfile({ goals: newGoals });
              }}
              className={`p-4 text-center border rounded-xl transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <IconComponent className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">{goal.label}</div>
            </button>
          );
        })}
      </div>
    </div>

    <div className="flex justify-between pt-6">
      <button
        onClick={onPrev}
        className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-5 h-5" /> Back
      </button>
      <button
        onClick={onNext}
        disabled={!profile.experience || !profile.goals?.length}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
      >
        Continue <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
);

// Learning Preferences Step
const LearningPreferencesStep = ({ profile, updateProfile, onNext, onPrev }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-8"
  >
    <div className="text-center">
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">Learning Preferences</h2>
      <p className="text-lg text-neutral-600">Customize your learning experience</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-3">
        How many hours can you dedicate to learning per week?
      </label>
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { hours: 2, label: "2-5 hours", desc: "Casual learning" },
          { hours: 8, label: "6-10 hours", desc: "Regular practice" },
          { hours: 15, label: "11-20 hours", desc: "Intensive learning" },
          { hours: 25, label: "20+ hours", desc: "Full commitment" }
        ].map((option) => (
          <button
            key={option.hours}
            onClick={() => updateProfile({ availableTime: option.hours })}
            className={`p-4 text-center border rounded-xl transition-all ${
              profile.availableTime === option.hours
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <div className="text-2xl font-bold text-blue-600 mb-1">{option.hours}</div>
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-neutral-600">{option.desc}</div>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-3">Preferred learning style?</label>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { id: "visual", label: "Visual Learning", desc: "Videos, diagrams, and visual content", icon: "📊" },
          { id: "hands_on", label: "Hands-on Practice", desc: "Coding exercises and projects", icon: "⌨️" },
          { id: "reading", label: "Reading & Research", desc: "Articles, documentation, and books", icon: "📚" },
          { id: "mixed", label: "Mixed Approach", desc: "Combination of all methods", icon: "🎯" }
        ].map((style) => (
          <button
            key={style.id}
            onClick={() => updateProfile({ preferredLearningStyle: style.id })}
            className={`p-4 text-left border rounded-xl transition-all ${
              profile.preferredLearningStyle === style.id
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{style.icon}</span>
              <div>
                <div className="font-medium">{style.label}</div>
                <div className="text-sm text-neutral-600">{style.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-3">Your target timeline?</label>
      <div className="grid md:grid-cols-4 gap-3">
        {[
          { id: "3_months", label: "3 months", desc: "Quick skill building" },
          { id: "6_months", label: "6 months", desc: "Comprehensive learning" },
          { id: "1_year", label: "1 year", desc: "Complete mastery" },
          { id: "flexible", label: "Flexible", desc: "Learn at my own pace" }
        ].map((timeline) => (
          <button
            key={timeline.id}
            onClick={() => updateProfile({ timeline: timeline.id })}
            className={`p-3 text-center border rounded-xl transition-all ${
              profile.timeline === timeline.id
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-neutral-200 hover:border-neutral-300"
            }`}
          >
            <div className="font-medium">{timeline.label}</div>
            <div className="text-xs text-neutral-600">{timeline.desc}</div>
          </button>
        ))}
      </div>
    </div>

    <div className="flex justify-between pt-6">
      <button
        onClick={onPrev}
        className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-colors flex items-center gap-2"
      >
        <ChevronLeft className="w-5 h-5" /> Back
      </button>
      <button
        onClick={onNext}
        disabled={!profile.availableTime || !profile.preferredLearningStyle || !profile.timeline}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
      >
        Continue <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </motion.div>
);

// Completion Step
const CompletionStep = ({ profile, onComplete }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center space-y-8"
  >
    <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
      <Check className="w-12 h-12 text-white" />
    </div>

    <div>
      <h2 className="text-4xl font-bold text-neutral-900 mb-4">You're All Set! 🎉</h2>
      <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
        Welcome to PathWise, {profile.name}! We've created a personalized learning experience just for you.
      </p>
    </div>

    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Learning Plan Summary</h3>
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <div><span className="font-medium">Role:</span> {profile.role?.replace('_', ' ')}</div>
          <div><span className="font-medium">Experience:</span> {profile.experience}</div>
          <div><span className="font-medium">Weekly Time:</span> {profile.availableTime} hours</div>
        </div>
        <div className="space-y-2">
          <div><span className="font-medium">Learning Style:</span> {profile.preferredLearningStyle?.replace('_', ' ')}</div>
          <div><span className="font-medium">Timeline:</span> {profile.timeline?.replace('_', ' ')}</div>
          <div><span className="font-medium">Goals:</span> {profile.goals?.length || 0} selected</div>
        </div>
      </div>
    </div>

    <button
      onClick={onComplete}
      className="px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-colors flex items-center gap-3 mx-auto text-lg"
    >
      Start My Learning Journey <ArrowRight className="w-6 h-6" />
    </button>
  </motion.div>
);

export default function EnhancedOnboardingFlow({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});

  const steps: OnboardingStep[] = [
    {
      id: "personal",
      title: "Personal Information",
      description: "Tell us about yourself",
      icon: User,
      component: PersonalInfoStep
    },
    {
      id: "experience",
      title: "Experience & Goals",
      description: "Your background and objectives",
      icon: Target,
      component: ExperienceGoalsStep
    },
    {
      id: "preferences",
      title: "Learning Preferences",
      description: "How you like to learn",
      icon: BookOpen,
      component: LearningPreferencesStep
    },
    {
      id: "completion",
      title: "All Set!",
      description: "Ready to start learning",
      icon: Check,
      component: CompletionStep
    }
  ];

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(profile as UserProfile);
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        index <= currentStep
                          ? "bg-blue-500 text-white"
                          : "bg-neutral-200 text-neutral-400"
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-16 h-1 mx-2 rounded transition-all ${
                          index < currentStep ? "bg-blue-500" : "bg-neutral-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-1">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h1 className="text-2xl font-bold text-neutral-900">
              {steps[currentStep].title}
            </h1>
            <p className="text-neutral-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            <CurrentStepComponent
              key={currentStep}
              profile={profile}
              updateProfile={updateProfile}
              onNext={nextStep}
              onPrev={prevStep}
              onComplete={handleComplete}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
