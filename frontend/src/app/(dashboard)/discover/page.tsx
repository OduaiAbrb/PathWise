"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Code,
  Database,
  Cloud,
  Palette,
  BarChart3,
  Shield,
  Smartphone,
  Brain,
  Gamepad2,
  Building2,
  Heart,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Interest {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface CareerPath {
  title: string;
  description: string;
  avgSalary: string;
  demandLevel: "High" | "Very High" | "Moderate";
  skills: string[];
  timeToJob: string;
}

const interests: Interest[] = [
  { id: "problem_solving", label: "Problem Solving", icon: Brain, description: "Love tackling complex challenges" },
  { id: "building", label: "Building Things", icon: Code, description: "Enjoy creating from scratch" },
  { id: "data", label: "Working with Data", icon: Database, description: "Finding patterns and insights" },
  { id: "design", label: "Visual Design", icon: Palette, description: "Making things look beautiful" },
  { id: "security", label: "Security & Privacy", icon: Shield, description: "Protecting systems and data" },
  { id: "mobile", label: "Mobile Apps", icon: Smartphone, description: "Apps people use daily" },
  { id: "cloud", label: "Cloud & Infrastructure", icon: Cloud, description: "Scalable systems at scale" },
  { id: "analytics", label: "Analytics & Insights", icon: BarChart3, description: "Data-driven decisions" },
  { id: "gaming", label: "Gaming & Interactive", icon: Gamepad2, description: "Games and experiences" },
  { id: "enterprise", label: "Enterprise Software", icon: Building2, description: "Business solutions" },
  { id: "health", label: "Healthcare Tech", icon: Heart, description: "Improving lives with tech" },
];

const workStyles = [
  { id: "remote", label: "Remote Work", description: "Work from anywhere" },
  { id: "startup", label: "Startup Environment", description: "Fast-paced, wear many hats" },
  { id: "corporate", label: "Corporate/Enterprise", description: "Structured, stable growth" },
  { id: "freelance", label: "Freelance/Contract", description: "Independence and variety" },
];

const experienceLevels = [
  { id: "none", label: "Complete Beginner", description: "No coding experience" },
  { id: "some", label: "Some Experience", description: "Built a few projects" },
  { id: "bootcamp", label: "Bootcamp Graduate", description: "Formal training completed" },
  { id: "switching", label: "Career Switcher", description: "Professional in another field" },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string>("");
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<CareerPath | null>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 0) return selectedInterests.length >= 2;
    if (step === 1) return selectedWorkStyle !== "";
    if (step === 2) return selectedExperience !== "";
    return true;
  };

  const generateCareerPaths = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(getApiUrl("/api/v1/career/discover"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          interests: selectedInterests,
          work_style: selectedWorkStyle,
          experience_level: selectedExperience,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCareerPaths(data.paths || []);
      } else {
        // Generate mock paths based on interests
        const mockPaths = generateMockPaths();
        setCareerPaths(mockPaths);
      }
    } catch (error) {
      const mockPaths = generateMockPaths();
      setCareerPaths(mockPaths);
    } finally {
      setIsGenerating(false);
      setStep(3);
    }
  };

  const generateMockPaths = (): CareerPath[] => {
    const paths: CareerPath[] = [];
    
    if (selectedInterests.includes("building") || selectedInterests.includes("problem_solving")) {
      paths.push({
        title: "Full Stack Developer",
        description: "Build complete web applications from frontend to backend. High demand across all industries.",
        avgSalary: "$95,000 - $150,000",
        demandLevel: "Very High",
        skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "REST APIs"],
        timeToJob: "4-6 months",
      });
    }
    
    if (selectedInterests.includes("data") || selectedInterests.includes("analytics")) {
      paths.push({
        title: "Data Engineer",
        description: "Design and build data pipelines that power analytics and machine learning systems.",
        avgSalary: "$110,000 - $160,000",
        demandLevel: "Very High",
        skills: ["Python", "SQL", "Apache Spark", "AWS/GCP", "ETL Pipelines"],
        timeToJob: "5-8 months",
      });
    }
    
    if (selectedInterests.includes("cloud") || selectedInterests.includes("security")) {
      paths.push({
        title: "DevOps Engineer",
        description: "Automate infrastructure and ensure reliable, scalable deployments.",
        avgSalary: "$100,000 - $155,000",
        demandLevel: "High",
        skills: ["Docker", "Kubernetes", "Terraform", "CI/CD", "AWS"],
        timeToJob: "4-7 months",
      });
    }
    
    if (selectedInterests.includes("design") || selectedInterests.includes("mobile")) {
      paths.push({
        title: "Frontend Developer",
        description: "Create beautiful, responsive user interfaces that delight users.",
        avgSalary: "$85,000 - $140,000",
        demandLevel: "High",
        skills: ["React", "TypeScript", "CSS/Tailwind", "Figma", "Testing"],
        timeToJob: "3-5 months",
      });
    }
    
    if (selectedInterests.includes("security")) {
      paths.push({
        title: "Security Engineer",
        description: "Protect systems and data from threats. Critical role in every organization.",
        avgSalary: "$120,000 - $180,000",
        demandLevel: "Very High",
        skills: ["Network Security", "Penetration Testing", "SIEM", "Cloud Security", "Python"],
        timeToJob: "6-9 months",
      });
    }

    // Always include at least 2 paths
    if (paths.length < 2) {
      paths.push({
        title: "Backend Developer",
        description: "Build robust APIs and server-side logic that powers applications.",
        avgSalary: "$90,000 - $145,000",
        demandLevel: "High",
        skills: ["Python/Node.js", "REST APIs", "Databases", "Docker", "Testing"],
        timeToJob: "4-6 months",
      });
    }

    return paths.slice(0, 3);
  };

  const handleSelectPath = (path: CareerPath) => {
    setSelectedPath(path);
    // Store the selected path and redirect to roadmap creation
    localStorage.setItem("selectedCareerPath", JSON.stringify(path));
    router.push("/roadmap/new?from=discover");
  };

  const steps = [
    { title: "Your Interests", description: "What excites you? (Select at least 2)" },
    { title: "Work Style", description: "What environment suits you best?" },
    { title: "Experience Level", description: "Where are you starting from?" },
    { title: "Your Career Paths", description: "Personalized recommendations" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-2xl mb-4">
          <Compass className="w-8 h-8 text-neutral-700" />
        </div>
        <h1 className="heading-2 mb-2">Discover Your Path</h1>
        <p className="body-large max-w-xl mx-auto">
          Not sure where to start? Answer a few questions and we'll recommend career paths tailored to you.
        </p>
      </motion.div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 text-center ${i < steps.length - 1 ? "relative" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all ${
                  i <= step
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {i < step ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <p className={`text-xs ${i <= step ? "text-neutral-900" : "text-neutral-400"}`}>
                {s.title}
              </p>
              {i < steps.length - 1 && (
                <div
                  className={`absolute top-5 left-1/2 w-full h-0.5 ${
                    i < step ? "bg-neutral-900" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Step 0: Interests */}
        {step === 0 && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">{steps[0].title}</h2>
            <p className="text-neutral-500 mb-6">{steps[0].description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedInterests.includes(interest.id)
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <interest.icon className={`w-6 h-6 mb-2 ${
                    selectedInterests.includes(interest.id) ? "text-neutral-900" : "text-neutral-400"
                  }`} />
                  <p className="font-medium text-neutral-900 text-sm">{interest.label}</p>
                  <p className="text-xs text-neutral-500">{interest.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Work Style */}
        {step === 1 && (
          <motion.div
            key="workstyle"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">{steps[1].title}</h2>
            <p className="text-neutral-500 mb-6">{steps[1].description}</p>
            
            <div className="space-y-3">
              {workStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedWorkStyle(style.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedWorkStyle === style.id
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <p className="font-medium text-neutral-900">{style.label}</p>
                  <p className="text-sm text-neutral-500">{style.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <motion.div
            key="experience"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="card"
          >
            <h2 className="text-lg font-semibold text-neutral-900 mb-2">{steps[2].title}</h2>
            <p className="text-neutral-500 mb-6">{steps[2].description}</p>
            
            <div className="space-y-3">
              {experienceLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedExperience(level.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedExperience === level.id
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <p className="font-medium text-neutral-900">{level.label}</p>
                  <p className="text-sm text-neutral-500">{level.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">
                Based on your interests, here are your top career paths
              </h2>
              <p className="text-neutral-500">Click on a path to start your personalized roadmap</p>
            </div>
            
            <div className="space-y-4">
              {careerPaths.map((path, i) => (
                <motion.div
                  key={path.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-hover cursor-pointer"
                  onClick={() => handleSelectPath(path)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-neutral-900">{path.title}</h3>
                      <p className="text-neutral-600 mt-1">{path.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      path.demandLevel === "Very High"
                        ? "bg-green-100 text-green-700"
                        : path.demandLevel === "High"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {path.demandLevel} Demand
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-neutral-500">Average Salary</p>
                      <p className="font-semibold text-neutral-900">{path.avgSalary}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">Time to Job-Ready</p>
                      <p className="font-semibold text-neutral-900">{path.timeToJob}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Key Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {path.skills.map((skill) => (
                        <span key={skill} className="badge-neutral text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Click to create your roadmap</span>
                    <ArrowRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      {step < 3 && (
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step === 2) {
                generateCareerPaths();
              } else {
                setStep(step + 1);
              }
            }}
            disabled={!canProceed() || isGenerating}
            className="btn-primary flex-1 justify-center"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Finding Your Paths...
              </>
            ) : step === 2 ? (
              <>
                <Sparkles className="w-5 h-5" />
                Discover My Paths
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Start Over */}
      {step === 3 && (
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setStep(0);
              setSelectedInterests([]);
              setSelectedWorkStyle("");
              setSelectedExperience("");
              setCareerPaths([]);
            }}
            className="text-neutral-500 hover:text-neutral-700 text-sm"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
