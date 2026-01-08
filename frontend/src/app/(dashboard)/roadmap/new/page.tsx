"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Target,
  Clock,
  BookOpen,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

const skillLevels = [
  { id: "beginner", label: "Beginner", description: "New to this field" },
  { id: "intermediate", label: "Intermediate", description: "Some experience" },
  { id: "advanced", label: "Advanced", description: "Looking to specialize" },
];

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Gaming",
  "Media",
  "Other",
];

export default function NewRoadmapPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [jobDescription, setJobDescription] = useState("");
  const [skillLevel, setSkillLevel] = useState("intermediate");
  const [industry, setIndustry] = useState("Technology");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState("");
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [selectedCareerPath, setSelectedCareerPath] = useState<any>(null);

  const generationSteps = [
    "Analyzing job description...",
    "Extracting required skills...",
    "Building curriculum...",
    "Finding best resources...",
    "Finalizing your roadmap...",
  ];

  // Check for pending JD from landing page or career discovery
  useState(() => {
    const pending = localStorage.getItem("pendingJobDescription");
    if (pending) {
      setJobDescription(pending);
      localStorage.removeItem("pendingJobDescription");
    }
    
    const careerPath = localStorage.getItem("selectedCareerPath");
    if (careerPath) {
      try {
        const path = JSON.parse(careerPath);
        setSelectedCareerPath(path);
        // Pre-fill with career path info
        const jd = `Looking for a ${path.title}\n\nRequired Skills:\n${path.skills.join(", ")}\n\nThis role involves ${path.description}`;
        setJobDescription(jd);
        handleJobDescriptionChange(jd);
        localStorage.removeItem("selectedCareerPath");
      } catch (e) {
        console.error("Failed to parse career path");
      }
    }
  });

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description");
      return;
    }

    if (jobDescription.length < 100) {
      setError("Job description seems too short. Please paste the full description.");
      return;
    }

    if (!accessToken) {
      setError("Please sign in to generate a roadmap");
      return;
    }

    setError("");
    setIsGenerating(true);
    setGenerationStep(0);

    // Progress through steps with timeout protection
    const stepInterval = setInterval(() => {
      setGenerationStep((prev) => {
        if (prev < generationSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 1500);

    // Add timeout protection (30 seconds max)
    const timeoutId = setTimeout(() => {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep(0);
      setError("Roadmap generation timed out. Please try again with a shorter job description.");
    }, 30000);

    try {
      const response = await fetch(getApiUrl("/api/v1/roadmaps/generate"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          job_description: jobDescription,
          skill_level: skillLevel,
          industry: industry,
        }),
      });

      clearTimeout(timeoutId); // Clear timeout on response

      if (response.ok) {
        const data = await response.json();
        router.push(`/roadmap/${data.data?.id || data.id}`);
      } else if (response.status === 401 || response.status === 403) {
        setError("Please sign in to generate roadmaps. If you're already signed in, try refreshing the page.");
      } else if (response.status === 429) {
        setError("Free accounts are limited to 3 roadmaps. Upgrade to create more.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.detail || errorData.message || `Server error (${response.status}). Please try again.`);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Roadmap generation error:", err);
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  // Simulate skill extraction as user types
  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    setError("");

    if (value.length > 200) {
      // Simple keyword extraction for preview
      const keywords = [
        "Python", "JavaScript", "TypeScript", "React", "Node.js", "SQL",
        "AWS", "Docker", "Kubernetes", "REST", "GraphQL", "Git",
        "PostgreSQL", "MongoDB", "Redis", "CI/CD", "Agile", "Scrum"
      ];
      const found = keywords.filter(k => 
        value.toLowerCase().includes(k.toLowerCase())
      );
      setExtractedSkills(found.slice(0, 8));
    } else {
      setExtractedSkills([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Create Your Learning Roadmap</h1>
        <p className="body-large">
          Paste a job description and we'll create a personalized learning path.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        {/* Job Description Input */}
        <div className="mb-6">
          <label className="label">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => handleJobDescriptionChange(e.target.value)}
            placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications for best results..."
            rows={8}
            className="input resize-none"
          />
          <p className="text-sm text-neutral-500 mt-2">
            {jobDescription.length} characters
            {jobDescription.length < 100 && jobDescription.length > 0 && (
              <span className="text-amber-600"> • Add more details for better results</span>
            )}
          </p>
        </div>

        {/* Extracted Skills Preview */}
        {extractedSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-neutral-50 rounded-xl"
          >
            <p className="text-sm font-medium text-neutral-700 mb-3">
              Skills detected:
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill) => (
                <span key={skill} className="badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skill Level */}
        <div className="mb-6">
          <label className="label">Your Current Level</label>
          <div className="grid grid-cols-3 gap-3">
            {skillLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSkillLevel(level.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  skillLevel === level.id
                    ? "border-neutral-900 bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <p className="font-medium text-neutral-900">{level.label}</p>
                <p className="text-sm text-neutral-500">{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Industry */}
        <div className="mb-6">
          <label className="label">Target Industry</label>
          <div className="relative">
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="input appearance-none pr-10"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !jobDescription.trim()}
          className="btn-primary w-full justify-center"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {generationSteps[generationStep]}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Roadmap
            </>
          )}
        </button>

        {/* What You'll Get */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-700 mb-4">What you'll get:</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-600">Skill-by-skill breakdown</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-600">Curated resources</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-600">Time estimates</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
