"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Target, BookOpen, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";

const steps = [
  {
    id: 1,
    title: "Welcome to PathWise",
    description: "Your AI-powered career acceleration platform. Let's personalize your learning journey.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "What's your goal?",
    description: "Tell us about the role you're targeting so we can create a personalized roadmap.",
    icon: Target,
  },
  {
    id: 3,
    title: "Your experience level",
    description: "Help us understand where you're starting from.",
    icon: BookOpen,
  },
  {
    id: 4,
    title: "Ready to launch!",
    description: "You're all set to begin your career transformation journey.",
    icon: Rocket,
  },
];

const experienceLevels = [
  { id: "beginner", label: "Beginner", description: "Just starting out, little to no experience" },
  { id: "intermediate", label: "Intermediate", description: "Some experience, looking to level up" },
  { id: "advanced", label: "Advanced", description: "Experienced, seeking specialized skills" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setHasCompletedOnboarding } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    targetRole: "",
    experienceLevel: "",
    industry: "",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      setHasCompletedOnboarding(true);
      router.push("/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.targetRole.trim().length > 0;
    if (currentStep === 2) return formData.experienceLevel.length > 0;
    return true;
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  index <= currentStep
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "border-dark-700 text-dark-500"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="card p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/10 text-primary-400 mb-4">
                <CurrentIcon className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {steps[currentStep].title}
              </h1>
              <p className="text-dark-400">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Step-specific content */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Target Role / Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Industry (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Fintech, Healthcare, E-commerce"
                    className="input w-full"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setFormData({ ...formData, experienceLevel: level.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.experienceLevel === level.id
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-dark-700 hover:border-dark-600"
                    }`}
                  >
                    <div className="font-medium text-white">{level.label}</div>
                    <div className="text-sm text-dark-400">{level.description}</div>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 text-accent-400 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Your personalized roadmap is ready!</span>
                </div>
                <p className="text-dark-400">
                  Click &quot;Get Started&quot; to view your AI-generated learning path and begin your journey.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 0}
                className={currentStep === 0 ? "invisible" : ""}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed()}
              >
                {currentStep === steps.length - 1 ? "Get Started" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
