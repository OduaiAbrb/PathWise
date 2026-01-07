"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Target, Clock, Rocket } from "lucide-react";
import { useStore } from "@/lib/store";

const steps = [
  {
    id: 1,
    title: "What role are you targeting?",
    description: "Tell us about your dream job so we can personalize your roadmap.",
    icon: Target,
  },
  {
    id: 2,
    title: "What's your experience level?",
    description: "This helps us calibrate the difficulty of your learning path.",
    icon: Sparkles,
  },
  {
    id: 3,
    title: "How much time can you dedicate?",
    description: "We'll create a realistic schedule based on your availability.",
    icon: Clock,
  },
  {
    id: 4,
    title: "You're all set!",
    description: "Let's start your career transformation journey.",
    icon: Rocket,
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
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    targetRole: "",
    experienceLevel: "",
    timeCommitment: "",
    industry: "",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
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
    if (currentStep === 0) return formData.targetRole.trim().length > 0;
    if (currentStep === 1) return formData.experienceLevel.length > 0;
    if (currentStep === 2) return formData.timeCommitment.length > 0;
    return true;
  };

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  index <= currentStep
                    ? "bg-neutral-900 border-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-400"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <div className="progress-bar h-2">
            <motion.div
              className="progress-fill"
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-2xl mb-4">
                <CurrentIcon className="w-8 h-8 text-neutral-700" />
              </div>
              <h1 className="heading-3 mb-2">{steps[currentStep].title}</h1>
              <p className="text-neutral-500">{steps[currentStep].description}</p>
            </div>

            {/* Step 1: Target Role */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="label">Target Role / Job Title</label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Industry (optional)</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Fintech, Healthcare, E-commerce"
                    className="input"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Experience Level */}
            {currentStep === 1 && (
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setFormData({ ...formData, experienceLevel: level.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.experienceLevel === level.id
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <p className="font-medium text-neutral-900">{level.label}</p>
                    <p className="text-sm text-neutral-500">{level.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Time Commitment */}
            {currentStep === 2 && (
              <div className="space-y-3">
                {timeCommitments.map((time) => (
                  <button
                    key={time.id}
                    onClick={() => setFormData({ ...formData, timeCommitment: time.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.timeCommitment === time.id
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <p className="font-medium text-neutral-900">{time.label}</p>
                    <p className="text-sm text-neutral-500">{time.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Ready */}
            {currentStep === 3 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  Your profile is ready!
                </h3>
                <p className="text-neutral-500 mb-6">
                  We'll create a personalized roadmap for your journey to becoming a{" "}
                  <span className="font-medium text-neutral-900">{formData.targetRole}</span>.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500">Level</p>
                    <p className="font-medium text-neutral-900 capitalize">{formData.experienceLevel}</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500">Time</p>
                    <p className="font-medium text-neutral-900">
                      {timeCommitments.find(t => t.id === formData.timeCommitment)?.label || "-"}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl">
                    <p className="text-sm text-neutral-500">Industry</p>
                    <p className="font-medium text-neutral-900">{formData.industry || "General"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <button onClick={handleBack} className="btn-secondary">
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary flex-1 justify-center"
              >
                {currentStep === steps.length - 1 ? "Go to Dashboard" : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
