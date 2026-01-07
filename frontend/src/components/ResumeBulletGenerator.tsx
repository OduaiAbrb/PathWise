"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Wand2,
  Target,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  Lightbulb,
  RefreshCw,
  Download,
  Save,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";

interface BulletPoint {
  id: string;
  original: string;
  enhanced: string;
  impact: number; // 1-100 score
  category: "achievement" | "responsibility" | "skill" | "project";
  keywords: string[];
  metrics: {
    quantified: boolean;
    actionVerb: boolean;
    impact: boolean;
    relevance: number;
  };
}

interface JobRole {
  title: string;
  company: string;
  duration: string;
  bullets: BulletPoint[];
}

const POWER_VERBS = [
  "Accelerated", "Achieved", "Analyzed", "Built", "Created", "Delivered",
  "Developed", "Drove", "Enhanced", "Executed", "Generated", "Implemented",
  "Improved", "Increased", "Led", "Managed", "Optimized", "Orchestrated",
  "Pioneered", "Reduced", "Scaled", "Spearheaded", "Streamlined", "Transformed"
];

const METRICS_SUGGESTIONS = [
  "% increase/decrease", "$ amount saved/generated", "Time reduced by X",
  "Team size managed", "Users/customers impacted", "Projects completed",
  "Revenue generated", "Efficiency improved by X%", "Cost reduced by $X",
  "Performance increased by X%"
];

export default function ResumeBulletGenerator() {
  const [currentRole, setCurrentRole] = useState<JobRole>({
    title: "",
    company: "",
    duration: "",
    bullets: []
  });
  const [inputBullet, setInputBullet] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<BulletPoint["category"]>("achievement");

  const generateEnhancedBullet = async (originalBullet: string): Promise<BulletPoint> => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const enhanced = enhanceBulletWithAI(originalBullet);
    const keywords = extractKeywords(enhanced);
    const metrics = analyzeBullet(enhanced);
    
    const bulletPoint: BulletPoint = {
      id: Date.now().toString(),
      original: originalBullet,
      enhanced,
      impact: calculateImpactScore(enhanced, metrics),
      category: selectedCategory,
      keywords,
      metrics
    };
    
    setIsGenerating(false);
    return bulletPoint;
  };

  const enhanceBulletWithAI = (bullet: string): string => {
    // AI-powered bullet enhancement logic
    const powerVerb = POWER_VERBS[Math.floor(Math.random() * POWER_VERBS.length)];
    
    // Sample enhanced bullets based on common patterns
    const enhancements = [
      `${powerVerb} ${bullet.toLowerCase()} resulting in 25% improvement in team productivity and $50K annual cost savings`,
      `${powerVerb} ${bullet.toLowerCase()} for 500+ users, increasing customer satisfaction by 30% and reducing support tickets by 40%`,
      `${powerVerb} ${bullet.toLowerCase()} across 3 departments, streamlining processes and reducing project delivery time by 2 weeks`,
      `${powerVerb} ${bullet.toLowerCase()} using modern technologies, improving system performance by 45% and user engagement by 60%`
    ];
    
    return enhancements[Math.floor(Math.random() * enhancements.length)];
  };

  const extractKeywords = (bullet: string): string[] => {
    const techKeywords = ["JavaScript", "Python", "React", "Node.js", "AWS", "Docker", "MongoDB", "SQL"];
    const skillKeywords = ["leadership", "collaboration", "optimization", "automation", "scalability"];
    
    return [...techKeywords, ...skillKeywords].filter(keyword => 
      bullet.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, 5);
  };

  const analyzeBullet = (bullet: string) => {
    return {
      quantified: /\d+[%$]?|\$\d+/.test(bullet),
      actionVerb: POWER_VERBS.some(verb => bullet.toLowerCase().includes(verb.toLowerCase())),
      impact: bullet.toLowerCase().includes("increased") || bullet.toLowerCase().includes("improved") || bullet.toLowerCase().includes("reduced"),
      relevance: Math.floor(Math.random() * 30) + 70 // 70-100
    };
  };

  const calculateImpactScore = (bullet: string, metrics: any): number => {
    let score = 60; // Base score
    
    if (metrics.quantified) score += 15;
    if (metrics.actionVerb) score += 10;
    if (metrics.impact) score += 10;
    score += Math.floor(metrics.relevance * 0.05);
    
    return Math.min(score, 100);
  };

  const addBulletPoint = async () => {
    if (!inputBullet.trim()) return;
    
    const bulletPoint = await generateEnhancedBullet(inputBullet);
    setCurrentRole(prev => ({
      ...prev,
      bullets: [...prev.bullets, bulletPoint]
    }));
    setInputBullet("");
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerateBullet = async (bulletId: string) => {
    const bullet = currentRole.bullets.find(b => b.id === bulletId);
    if (!bullet) return;
    
    const regenerated = await generateEnhancedBullet(bullet.original);
    setCurrentRole(prev => ({
      ...prev,
      bullets: prev.bullets.map(b => b.id === bulletId ? { ...regenerated, id: bulletId } : b)
    }));
  };

  const deleteBullet = (bulletId: string) => {
    setCurrentRole(prev => ({
      ...prev,
      bullets: prev.bullets.filter(b => b.id !== bulletId)
    }));
  };

  const getImpactColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 75) return "text-blue-600 bg-blue-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const exportBullets = () => {
    const text = currentRole.bullets.map(bullet => `• ${bullet.enhanced}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRole.title || 'resume'}-bullets.txt`;
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900">AI Resume Bullet Generator</h1>
        </motion.div>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
          Transform ordinary resume bullets into powerful, quantified achievements that get you noticed by recruiters and ATS systems.
        </p>
      </div>

      {/* Role Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Position Details</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Job Title (e.g., Software Engineer)"
            value={currentRole.title}
            onChange={(e) => setCurrentRole(prev => ({ ...prev, title: e.target.value }))}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Company Name"
            value={currentRole.company}
            onChange={(e) => setCurrentRole(prev => ({ ...prev, company: e.target.value }))}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Duration (e.g., Jan 2023 - Present)"
            value={currentRole.duration}
            onChange={(e) => setCurrentRole(prev => ({ ...prev, duration: e.target.value }))}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Bullet Generator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Create Powerful Bullet Points</h2>
        
        <div className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Bullet Type</label>
            <div className="flex gap-2">
              {(["achievement", "responsibility", "skill", "project"] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Experience (describe what you did)
            </label>
            <div className="flex gap-4">
              <textarea
                value={inputBullet}
                onChange={(e) => setInputBullet(e.target.value)}
                placeholder="e.g., Worked on improving the website performance and user experience"
                className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
                rows={3}
              />
              <button
                onClick={addBulletPoint}
                disabled={!inputBullet.trim() || isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Enhance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Pro Tips for Better Results
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include specific technologies, tools, or methodologies you used</li>
              <li>• Mention team size, project scope, or timeframes when relevant</li>
              <li>• Focus on outcomes and impact rather than just tasks</li>
              <li>• Be specific about your role and contributions</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Generated Bullets */}
      <AnimatePresence>
        {currentRole.bullets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Enhanced Resume Bullets ({currentRole.bullets.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={exportBullets}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {currentRole.bullets.map((bullet, index) => (
                <motion.div
                  key={bullet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-neutral-200 rounded-xl p-6"
                >
                  {/* Original vs Enhanced */}
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-2">Original</label>
                      <p className="text-neutral-600 bg-neutral-50 p-3 rounded-lg">
                        {bullet.original}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-500 mb-2">AI Enhanced</label>
                      <div className="relative">
                        <p className="text-neutral-900 bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                          • {bullet.enhanced}
                        </p>
                        <button
                          onClick={() => copyToClipboard(bullet.enhanced, bullet.id)}
                          className="absolute top-2 right-2 p-2 hover:bg-white/80 rounded-lg transition-colors"
                        >
                          {copiedId === bullet.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-neutral-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metrics and Analysis */}
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className={`p-3 rounded-lg text-center ${getImpactColor(bullet.impact)}`}>
                      <div className="font-bold text-lg">{bullet.impact}%</div>
                      <div className="text-sm">Impact Score</div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg text-center">
                      <div className="font-bold text-lg">{bullet.metrics.quantified ? '✓' : '✗'}</div>
                      <div className="text-sm">Quantified</div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg text-center">
                      <div className="font-bold text-lg">{bullet.metrics.actionVerb ? '✓' : '✗'}</div>
                      <div className="text-sm">Action Verb</div>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-lg text-center">
                      <div className="font-bold text-lg">{bullet.metrics.relevance}%</div>
                      <div className="text-sm">Relevance</div>
                    </div>
                  </div>

                  {/* Keywords */}
                  {bullet.keywords.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-500 mb-2">Keywords Detected</label>
                      <div className="flex flex-wrap gap-1">
                        {bullet.keywords.map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bullet.category === 'achievement' ? 'bg-green-100 text-green-700' :
                      bullet.category === 'project' ? 'bg-blue-100 text-blue-700' :
                      bullet.category === 'skill' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {bullet.category}
                    </span>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => regenerateBullet(bullet.id)}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-4 h-4 text-neutral-600" />
                      </button>
                      <button
                        onClick={() => deleteBullet(bullet.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Writing Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Resume Writing Best Practices</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Power Verbs to Use
            </h3>
            <div className="flex flex-wrap gap-1">
              {POWER_VERBS.slice(0, 12).map((verb, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                  {verb}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Metrics to Include
            </h3>
            <div className="space-y-1">
              {METRICS_SUGGESTIONS.slice(0, 5).map((metric, idx) => (
                <div key={idx} className="text-sm text-neutral-600 flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  {metric}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
