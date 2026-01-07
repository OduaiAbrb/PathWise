"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/fetch-api";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/fetch-api";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/fetch-api";
import {
  Sparkles,
  FileText,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { getApiUrl } from "@/lib/fetch-api";
import toast from "react-hot-toast";
import { getApiUrl } from "@/lib/fetch-api";

const skillLevels = [
  {
    id: "beginner",
    label: "Beginner",
    description: "New to this field, learning fundamentals",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Some experience, looking to level up",
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Experienced, targeting senior roles",
  },
];

export default function NewRoadmapPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [jobDescription, setJobDescription] = useState("");
  const [skillLevel, setSkillLevel] = useState("beginner");
  const [industry, setIndustry] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  
  // Get access token from session
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    if (jobDescription.length < 100) {
      setError("Job description should be at least 100 characters for best results");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/roadmap/generate"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: JSON.stringify({
          job_description: jobDescription,
          skill_level: skillLevel,
          industry: industry || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to generate roadmap");
      }

      const data = await response.json();
      toast.success("Roadmap generated successfully!");
      router.push(`/roadmap/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      toast.error("Failed to generate roadmap");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Your Learning Roadmap
          </h1>
          <p className="text-dark-400">
            Paste a job description and let AI create your personalized path
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-dark-900/50 border-dark-800 mb-6">
            <CardContent className="p-6">
              {/* Job Description */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Job Description <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-dark-500" />
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here... Include requirements, responsibilities, and desired qualifications for the best results."
                    rows={10}
                    className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
                  />
                </div>
                <p className="text-dark-500 text-sm mt-2">
                  {jobDescription.length} characters
                  {jobDescription.length > 0 && jobDescription.length < 100 && (
                    <span className="text-yellow-400">
                      {" "}
                      (minimum 100 recommended)
                    </span>
                  )}
                </p>
              </div>

              {/* Skill Level */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">
                  Your Current Skill Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {skillLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setSkillLevel(level.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        skillLevel === level.id
                          ? "bg-primary-500/10 border-primary-500 text-white"
                          : "bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600"
                      }`}
                    >
                      <p className="font-medium mb-1">{level.label}</p>
                      <p className="text-sm text-dark-400">
                        {level.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry (Optional) */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Industry <span className="text-dark-500">(optional)</span>
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Fintech, Healthcare, E-commerce"
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <motion.div
              className="flex items-center gap-2 text-red-400 mb-6 p-4 bg-red-500/10 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isGenerating}
            disabled={isGenerating}
            rightIcon={
              isGenerating ? undefined : <ArrowRight className="w-5 h-5" />
            }
          >
            {isGenerating ? "Generating Your Roadmap..." : "Generate Roadmap"}
          </Button>

          {/* Info */}
          <p className="text-center text-dark-500 text-sm mt-4">
            Generation typically takes 15-30 seconds
          </p>
        </motion.form>

        {/* Tips */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-white font-medium mb-4">
            Tips for better results:
          </h3>
          <ul className="space-y-2 text-dark-400">
            <li className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              Include the complete job description with all requirements
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              Keep technical requirements and soft skills mentioned
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              Specify the industry for more relevant resources
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-400">•</span>
              Be honest about your skill level for accurate pacing
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
