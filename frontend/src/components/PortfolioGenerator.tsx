"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Linkedin,
  Github,
  Copy,
  Check,
  Download,
  Eye,
  Share2,
  Award,
  Briefcase,
  Code,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

export default function PortfolioGenerator() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [error, setError] = useState("");

  const generatePortfolio = async () => {
    if (!accessToken) return;

    setIsGenerating(true);
    setError("");

    try {
      // First, fetch user's roadmap progress and skills
      const roadmapResponse = await fetch(getApiUrl("/api/v1/roadmaps?limit=1"), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!roadmapResponse.ok) {
        throw new Error("Please create a roadmap first before generating your portfolio");
      }

      const roadmapData = await roadmapResponse.json();
      const roadmap = roadmapData.data?.[0];

      if (!roadmap) {
        throw new Error("No roadmap found. Create a roadmap to generate your portfolio");
      }

      // Extract completed skills and progress
      const completedSkills = roadmap.phases
        ?.flatMap((phase: any) => phase.skills || [])
        .filter((skill: any) => skill.status === "completed")
        .map((skill: any) => skill.name) || [];

      const inProgressSkills = roadmap.phases
        ?.flatMap((phase: any) => phase.skills || [])
        .filter((skill: any) => skill.status === "in_progress")
        .map((skill: any) => skill.name) || [];

      const overallProgress = roadmap.overall_progress || 0;

      // Generate portfolio with realistic context
      const response = await fetch(getApiUrl("/api/v1/portfolio/generate"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_role: roadmap.job_title,
          completed_skills: completedSkills,
          in_progress_skills: inProgressSkills,
          overall_progress: overallProgress,
          experience_level: roadmap.experience_level || "beginner",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate portfolio based on your progress");
      }

      const data = await response.json();
      setPortfolio(data.data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Portfolio Generator</h1>
        <p className="text-slate-600">
          AI-powered portfolio content to showcase your skills and land interviews
        </p>
      </div>

      {/* Generate Button */}
      {!portfolio && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 p-12 text-center"
        >
          <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Generate Your Professional Portfolio
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            AI will analyze your roadmap progress and generate professional bio, resume bullets,
            LinkedIn posts, project descriptions, and skill certificates.
          </p>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={generatePortfolio}
            disabled={isGenerating}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-colors flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Portfolio
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Portfolio Content */}
      {portfolio && (
        <div className="space-y-6">
          {/* Bio Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Professional Bio
              </h2>
              <button
                onClick={() => copyToClipboard(portfolio.bio, "bio")}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {copiedItem === "bio" ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
            <p className="text-lg text-slate-700">{portfolio.tagline}</p>
            <p className="text-slate-600 mt-3">{portfolio.bio}</p>
          </motion.div>

          {/* Resume Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Resume Bullet Points
              </h2>
            </div>
            <div className="space-y-3">
              {portfolio.resume_bullets?.map((bullet: string, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-slate-50 rounded-xl flex items-start gap-3 group"
                >
                  <span className="text-blue-600 font-bold">•</span>
                  <p className="text-slate-700 flex-1">{bullet}</p>
                  <button
                    onClick={() => copyToClipboard(bullet, `bullet-${index}`)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-200 rounded-lg"
                  >
                    {copiedItem === `bullet-${index}` ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* LinkedIn Posts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Linkedin className="w-6 h-6 text-blue-600" />
                LinkedIn Post Ideas
              </h2>
            </div>
            <div className="space-y-4">
              {portfolio.linkedin_posts?.map((post: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">{post.title}</h3>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{post.content}</p>
                  <button
                    onClick={() => copyToClipboard(post.content, `post-${index}`)}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    {copiedItem === `post-${index}` ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Post
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Portfolio Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-6 h-6 text-blue-600" />
                Portfolio Project Ideas
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {portfolio.projects?.map((project: any, index: number) => (
                <div
                  key={index}
                  className="p-5 border-2 border-slate-200 rounded-xl hover:border-blue-300 transition-colors"
                >
                  <h3 className="font-bold text-slate-900 mb-2">{project.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Skill Certificates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                Skill Certificates
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {portfolio.certificates?.map((cert: string, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl text-center"
                >
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-900">{cert}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={generatePortfolio}
              className="px-6 py-3 border-2 border-slate-200 hover:border-slate-300 rounded-xl font-medium text-slate-700 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Regenerate
            </button>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Publish Portfolio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
