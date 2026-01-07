"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  X,
  TrendingUp,
  AlertTriangle,
  Target,
  Sparkles,
  BarChart3,
  CheckCircle2,
  DollarSign,
  Trash2,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface SkillFrequency {
  skill: string;
  frequency: number;
  percentage: number;
  category: string;
}

interface AnalysisResult {
  total_jds: number;
  common_skills: SkillFrequency[];
  rare_high_value_skills: SkillFrequency[];
  universal_roadmap_suggestion: string;
  industry_insights: {
    "Must-Have Skills": string[];
    "Competitive Edge Skills": string[];
    "Skill Categories": string[];
  };
  red_flags: string[];
  salary_insights: Array<{ skill: string; impact: string }>;
}

export default function JDAnalyzerPage() {
  const { data: session } = useSession();
  const [jobDescriptions, setJobDescriptions] = useState<string[]>(["", ""]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const addJDField = () => {
    if (jobDescriptions.length < 20) {
      setJobDescriptions([...jobDescriptions, ""]);
    }
  };

  const removeJDField = (index: number) => {
    if (jobDescriptions.length > 2) {
      setJobDescriptions(jobDescriptions.filter((_, i) => i !== index));
    }
  };

  const updateJD = (index: number, value: string) => {
    const updated = [...jobDescriptions];
    updated[index] = value;
    setJobDescriptions(updated);
  };

  const analyzeJDs = async () => {
    const filledJDs = jobDescriptions.filter(jd => jd.trim().length > 50);
    
    if (filledJDs.length < 2) {
      alert("Please provide at least 2 job descriptions (minimum 50 characters each)");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/jd-aggregator/analyze"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ job_descriptions: filledJDs }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        alert("Failed to analyze job descriptions");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      alert("An error occurred during analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Programming Languages": "bg-blue-100 text-blue-700",
      "Frontend": "bg-purple-100 text-purple-700",
      "Backend": "bg-green-100 text-green-700",
      "Databases": "bg-amber-100 text-amber-700",
      "Cloud & DevOps": "bg-red-100 text-red-700",
      "Data & ML": "bg-pink-100 text-pink-700",
      "Tools & Practices": "bg-neutral-100 text-neutral-700",
    };
    return colors[category] || "bg-neutral-100 text-neutral-700";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">JD Aggregator</h1>
        <p className="body-large">
          Analyze multiple job descriptions to find common skills and patterns
        </p>
      </motion.div>

      {!result ? (
        <>
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-neutral-900">
                Paste Job Descriptions ({jobDescriptions.filter(jd => jd.trim()).length}/{jobDescriptions.length})
              </h2>
              <button
                onClick={addJDField}
                disabled={jobDescriptions.length >= 20}
                className="btn-ghost text-sm"
              >
                <Plus className="w-4 h-4" />
                Add More
              </button>
            </div>

            <div className="space-y-4">
              {jobDescriptions.map((jd, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Job Description {index + 1}
                      </label>
                      <textarea
                        value={jd}
                        onChange={(e) => updateJD(index, e.target.value)}
                        placeholder="Paste the full job description here..."
                        rows={6}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                      />
                    </div>
                    {jobDescriptions.length > 2 && (
                      <button
                        onClick={() => removeJDField(index)}
                        className="mt-8 p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={analyzeJDs}
              disabled={isAnalyzing || jobDescriptions.filter(jd => jd.trim().length > 50).length < 2}
              className="btn-primary w-full mt-6"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Job Descriptions
                </>
              )}
            </button>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-blue-50 border-blue-200"
          >
            <h3 className="font-semibold text-neutral-900 mb-3">💡 Tips for Best Results</h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                Paste 5-10 job descriptions for the most accurate analysis
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                Include the full job description, not just requirements
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                Target similar roles for better skill pattern detection
              </li>
            </ul>
          </motion.div>
        </>
      ) : (
        <>
          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Card */}
            <div className="card bg-gradient-to-br from-neutral-900 to-neutral-800 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
                  <p className="text-neutral-300">
                    Analyzed {result.total_jds} job descriptions
                  </p>
                </div>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium"
                >
                  New Analysis
                </button>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                <p className="text-lg">{result.universal_roadmap_suggestion}</p>
              </div>
            </div>

            {/* Red Flags */}
            {result.red_flags.length > 0 && (
              <div className="card border-red-200 bg-red-50">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Red Flags Detected
                </h3>
                <ul className="space-y-2">
                  {result.red_flags.map((flag, i) => (
                    <li key={i} className="text-sm text-neutral-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Common Skills */}
            <div className="card">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Must-Have Skills (60%+ frequency)
              </h3>
              <div className="space-y-3">
                {result.common_skills.slice(0, 10).map((skill) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-medium text-neutral-900">{skill.skill}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(skill.category)}`}>
                        {skill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-neutral-600 w-12 text-right">
                        {skill.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rare High-Value Skills */}
            {result.rare_high_value_skills.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Competitive Edge Skills (20-60% frequency)
                </h3>
                <p className="text-sm text-neutral-600 mb-4">
                  These skills are less common but can set you apart from other candidates
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.rare_high_value_skills.map((skill) => (
                    <div
                      key={skill.skill}
                      className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-neutral-900">{skill.skill}</p>
                        <p className="text-xs text-neutral-500">{skill.category}</p>
                      </div>
                      <span className="text-sm font-medium text-blue-600">
                        {skill.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Salary Insights */}
            {result.salary_insights.length > 0 && (
              <div className="card bg-green-50 border-green-200">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Salary Impact
                </h3>
                <div className="space-y-2">
                  {result.salary_insights.map((insight, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <span className="font-medium text-neutral-900">{insight.skill}</span>
                      <span className="text-sm text-green-600">{insight.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-neutral-900 mb-4">Must-Have Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.industry_insights["Must-Have Skills"].map((skill) => (
                    <span key={skill} className="badge-success">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold text-neutral-900 mb-4">Competitive Edge</h3>
                <div className="flex flex-wrap gap-2">
                  {result.industry_insights["Competitive Edge Skills"].map((skill) => (
                    <span key={skill} className="badge-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="card bg-neutral-900 text-white text-center">
              <h3 className="text-xl font-semibold mb-2">Ready to Build Your Roadmap?</h3>
              <p className="text-neutral-300 mb-6">
                Use these insights to create a targeted learning path
              </p>
              <a href="/roadmap/new" className="btn-primary inline-flex bg-white text-neutral-900 hover:bg-neutral-100">
                <Sparkles className="w-5 h-5" />
                Create Roadmap
              </a>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
