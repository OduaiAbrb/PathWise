"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Target,
  ArrowRight,
  Copy,
  RefreshCw,
  Zap,
  Shield,
  TrendingUp,
  Eye,
  Download,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface ATSAnalysis {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    issues: string[];
    suggestions: string[];
  }[];
  keywords: {
    found: string[];
    missing: string[];
    density: number;
  };
  formatting: {
    score: number;
    issues: string[];
  };
  optimizedBullets: {
    original: string;
    optimized: string;
    improvement: string;
  }[];
}

export default function ATSOptimizerPage() {
  const { data: session } = useSession();
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "bullets" | "formatting">("overview");
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const analyzeResume = async () => {
    if (!resumeText.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch(getApiUrl("/api/v1/resume/ats-optimize"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.data || data);
      } else {
        // Show error state when API not available
        setAnalysis(null);
      }
    } catch (error) {
      // Show error state on error
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMockAnalysis = (): ATSAnalysis => {
    const jdWords = jobDescription.toLowerCase().split(/\s+/);
    const resumeWords = resumeText.toLowerCase().split(/\s+/);
    
    const techKeywords = ["python", "javascript", "react", "sql", "docker", "aws", "kubernetes", "api", "git", "agile"];
    const foundKeywords = techKeywords.filter(k => resumeWords.includes(k));
    const missingKeywords = techKeywords.filter(k => jdWords.includes(k) && !resumeWords.includes(k));

    return {
      overallScore: 65 + Math.floor(Math.random() * 20),
      sections: [
        {
          name: "Contact Information",
          score: 90,
          issues: [],
          suggestions: ["Consider adding LinkedIn profile URL"],
        },
        {
          name: "Work Experience",
          score: 70,
          issues: ["Some bullet points lack quantifiable metrics", "Job titles could be more ATS-friendly"],
          suggestions: [
            "Add numbers to achievements (e.g., 'Increased sales by 25%')",
            "Use standard job titles recognized by ATS systems",
          ],
        },
        {
          name: "Skills Section",
          score: 75,
          issues: ["Skills section could be more comprehensive"],
          suggestions: [
            "Add a dedicated 'Technical Skills' section",
            "Match skill keywords exactly to job description",
          ],
        },
        {
          name: "Education",
          score: 95,
          issues: [],
          suggestions: [],
        },
      ],
      keywords: {
        found: foundKeywords.length > 0 ? foundKeywords : ["Python", "JavaScript", "React"],
        missing: missingKeywords.length > 0 ? missingKeywords : ["Docker", "Kubernetes", "AWS"],
        density: 3.2,
      },
      formatting: {
        score: 80,
        issues: [
          "Avoid tables - many ATS systems can't parse them",
          "Use standard section headers (e.g., 'Work Experience' not 'Career Journey')",
          "Stick to common fonts like Arial or Calibri",
        ],
      },
      optimizedBullets: [
        {
          original: "Worked on improving the website",
          optimized: "Redesigned company website using React.js, improving page load speed by 40% and increasing user engagement by 25%",
          improvement: "Added metrics, specific technology, and measurable outcomes",
        },
        {
          original: "Helped with database stuff",
          optimized: "Optimized PostgreSQL database queries, reducing API response time from 2s to 200ms and supporting 10,000+ daily active users",
          improvement: "Specified technology, quantified improvement, and added scale context",
        },
        {
          original: "Did some coding projects",
          optimized: "Developed and deployed 5 full-stack applications using Python/Django backend and React frontend, serving 50,000+ monthly users",
          improvement: "Quantified projects, specified tech stack, and added impact metrics",
        },
      ],
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-amber-100";
    return "bg-red-100";
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-neutral-900" />
          <h1 className="text-3xl font-bold text-neutral-900">ATS Resume Optimizer</h1>
        </div>
        <p className="text-neutral-600 max-w-2xl">
          Optimize your resume to pass Applicant Tracking Systems. Get keyword suggestions, 
          formatting fixes, and AI-rewritten bullet points.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Paste Your Resume</h2>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={10}
              className="w-full p-4 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Job Description (Optional)</h2>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description to optimize for specific keywords..."
              rows={6}
              className="w-full p-4 border border-neutral-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={analyzeResume}
            disabled={!resumeText.trim() || isAnalyzing}
            className="w-full py-4 bg-black text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Optimize Resume
              </>
            )}
          </button>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {analysis ? (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="bg-white border-2 border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-neutral-900">ATS Compatibility Score</h2>
                  <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}%
                  </div>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.overallScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      analysis.overallScore >= 80 ? "bg-green-500" :
                      analysis.overallScore >= 60 ? "bg-amber-500" : "bg-red-500"
                    }`}
                  />
                </div>
                <p className="text-sm text-neutral-600 mt-2">
                  {analysis.overallScore >= 80 
                    ? "Great! Your resume is well-optimized for ATS systems."
                    : analysis.overallScore >= 60
                    ? "Good start, but there's room for improvement."
                    : "Your resume needs significant optimization to pass ATS filters."}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: "overview", label: "Overview", icon: Eye },
                  { id: "keywords", label: "Keywords", icon: Target },
                  { id: "bullets", label: "Bullet Points", icon: Zap },
                  { id: "formatting", label: "Formatting", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white border-2 border-neutral-200 rounded-2xl p-6"
                >
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-neutral-900">Section Scores</h3>
                      {analysis.sections.map((section) => (
                        <div key={section.name} className="border border-neutral-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{section.name}</span>
                            <span className={`font-bold ${getScoreColor(section.score)}`}>
                              {section.score}%
                            </span>
                          </div>
                          {section.issues.length > 0 && (
                            <div className="mt-2">
                              {section.issues.map((issue, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-red-600">
                                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span>{issue}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {section.suggestions.length > 0 && (
                            <div className="mt-2">
                              {section.suggestions.map((suggestion, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-amber-600">
                                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  <span>{suggestion}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "keywords" && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-2">Found Keywords ✓</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.found.map((keyword) => (
                            <span
                              key={keyword}
                              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-2">Missing Keywords ✗</h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.missing.map((keyword) => (
                            <span
                              key={keyword}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800">
                          <strong>Tip:</strong> Add the missing keywords naturally in your experience 
                          section. Keyword density should be 2-4% for optimal ATS parsing.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "bullets" && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-neutral-900">AI-Optimized Bullet Points</h3>
                      {analysis.optimizedBullets.map((bullet, i) => (
                        <div key={i} className="border border-neutral-200 rounded-xl p-4">
                          <div className="mb-3">
                            <span className="text-xs font-medium text-red-600 uppercase">Original</span>
                            <p className="text-neutral-600 line-through">{bullet.original}</p>
                          </div>
                          <div className="mb-3">
                            <span className="text-xs font-medium text-green-600 uppercase">Optimized</span>
                            <p className="text-neutral-900 font-medium">{bullet.optimized}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-neutral-500">{bullet.improvement}</span>
                            <button
                              onClick={() => copyToClipboard(bullet.optimized)}
                              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4 text-neutral-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "formatting" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-neutral-900">Formatting Score</h3>
                        <span className={`text-2xl font-bold ${getScoreColor(analysis.formatting.score)}`}>
                          {analysis.formatting.score}%
                        </span>
                      </div>
                      {analysis.formatting.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <span className="text-sm text-amber-800">{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl p-12 text-center">
              <Shield className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                Ready to Optimize
              </h3>
              <p className="text-neutral-500">
                Paste your resume and click "Optimize Resume" to get ATS compatibility analysis.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
