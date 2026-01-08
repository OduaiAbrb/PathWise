"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target,
  Clock,
  Star,
  BookOpen,
  Code,
  Video,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Trophy,
  Users,
  Calendar,
  Zap,
  TrendingUp,
  Settings
} from "lucide-react";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  modules: LearningModule[];
  prerequisites: string[];
  outcomes: string[];
  estimatedTime: number;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: "video" | "reading" | "practice" | "quiz" | "project";
  duration: number;
  difficulty: number;
  resources: Resource[];
  completed: boolean;
}

interface Resource {
  id: string;
  title: string;
  type: "video" | "article" | "exercise" | "documentation";
  url: string;
  duration: string;
  rating: number;
}

export default function LearningPathGenerator() {
  const [selectedGoal, setSelectedGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [generatedPath, setGeneratedPath] = useState<LearningPath | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const goals = [
    { id: "fullstack", label: "Full-Stack Developer", icon: Code, desc: "Build complete web applications" },
    { id: "frontend", label: "Frontend Specialist", icon: Sparkles, desc: "Master modern UI/UX development" },
    { id: "backend", label: "Backend Engineer", icon: Brain, desc: "Build scalable server systems" },
    { id: "mobile", label: "Mobile Developer", icon: Target, desc: "Create native and cross-platform apps" },
    { id: "data", label: "Data Scientist", icon: TrendingUp, desc: "Analyze and model data insights" },
    { id: "devops", label: "DevOps Engineer", icon: Zap, desc: "Automate and scale infrastructure" }
  ];

  const generatePath = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const samplePath: LearningPath = {
        id: "fullstack-path",
        title: "Full-Stack JavaScript Developer",
        description: "Master modern web development with React, Node.js, and MongoDB",
        difficulty: experience as any,
        duration: "12-16 weeks",
        estimatedTime: 180, // hours
        prerequisites: ["Basic HTML/CSS", "Programming fundamentals"],
        outcomes: [
          "Build full-stack web applications",
          "Deploy applications to cloud platforms", 
          "Work with databases and APIs",
          "Implement authentication and security"
        ],
        modules: [
          {
            id: "1",
            title: "JavaScript Fundamentals",
            description: "Master ES6+ features, async programming, and DOM manipulation",
            type: "video",
            duration: 25,
            difficulty: 2,
            completed: false,
            resources: [
              { id: "r1", title: "Modern JavaScript Course", type: "video", url: "#", duration: "8 hours", rating: 4.8 },
              { id: "r2", title: "JavaScript Exercises", type: "exercise", url: "#", duration: "5 hours", rating: 4.6 }
            ]
          },
          {
            id: "2", 
            title: "React Development",
            description: "Build interactive UIs with React hooks and state management",
            type: "practice",
            duration: 35,
            difficulty: 3,
            completed: false,
            resources: [
              { id: "r3", title: "React Complete Guide", type: "video", url: "#", duration: "12 hours", rating: 4.9 },
              { id: "r4", title: "React Projects", type: "exercise", url: "#", duration: "15 hours", rating: 4.7 }
            ]
          },
          {
            id: "3",
            title: "Node.js & Express",
            description: "Create REST APIs and handle server-side logic",
            type: "project",
            duration: 30,
            difficulty: 3,
            completed: false,
            resources: [
              { id: "r5", title: "Node.js Backend Development", type: "video", url: "#", duration: "10 hours", rating: 4.8 },
              { id: "r6", title: "API Building Workshop", type: "exercise", url: "#", duration: "12 hours", rating: 4.6 }
            ]
          },
          {
            id: "4",
            title: "Database Design",
            description: "Work with MongoDB and design efficient schemas",
            type: "reading",
            duration: 20,
            difficulty: 2,
            completed: false,
            resources: [
              { id: "r7", title: "MongoDB Essentials", type: "documentation", url: "#", duration: "6 hours", rating: 4.7 },
              { id: "r8", title: "Database Design Patterns", type: "article", url: "#", duration: "4 hours", rating: 4.5 }
            ]
          },
          {
            id: "5",
            title: "Full-Stack Project",
            description: "Build and deploy a complete web application",
            type: "project",
            duration: 40,
            difficulty: 4,
            completed: false,
            resources: [
              { id: "r9", title: "Portfolio Project Guide", type: "video", url: "#", duration: "8 hours", rating: 4.9 },
              { id: "r10", title: "Deployment Tutorial", type: "video", url: "#", duration: "3 hours", rating: 4.8 }
            ]
          }
        ]
      };
      
      setGeneratedPath(samplePath);
      setIsGenerating(false);
    }, 2000);
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "reading": return BookOpen;
      case "practice": return Code;
      case "quiz": return Brain;
      case "project": return Trophy;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600 bg-green-100";
    if (difficulty <= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (generatedPath) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{generatedPath.title}</h1>
                <p className="text-blue-100 text-lg mb-4">{generatedPath.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {generatedPath.duration}
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {generatedPath.difficulty}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {generatedPath.modules.length} modules
                  </div>
                </div>
              </div>
              <button
                onClick={() => setGeneratedPath(null)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Generate New Path
              </button>
            </div>
          </div>

          <div className="p-8">
            {/* Learning Modules */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Modules</h2>
              <div className="space-y-4">
                {generatedPath.modules.map((module, index) => {
                  const IconComponent = getModuleIcon(module.type);
                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{module.title}</h3>
                            <p className="text-gray-600 mt-1">{module.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(module.difficulty)}`}>
                            Level {module.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">{module.duration}h</span>
                        </div>
                      </div>

                      {/* Resources */}
                      <div className="grid md:grid-cols-2 gap-3">
                        {module.resources.map((resource) => (
                          <div key={resource.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`p-2 rounded ${
                                resource.type === "video" ? "bg-red-100 text-red-600" :
                                resource.type === "article" ? "bg-blue-100 text-blue-600" :
                                resource.type === "exercise" ? "bg-green-100 text-green-600" :
                                "bg-purple-100 text-purple-600"
                              }`}>
                                {resource.type === "video" ? <Video className="w-4 h-4" /> :
                                 resource.type === "article" ? <FileText className="w-4 h-4" /> :
                                 resource.type === "exercise" ? <Code className="w-4 h-4" /> :
                                 <BookOpen className="w-4 h-4" />}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{resource.title}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span>{resource.duration}</span>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    {resource.rating}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {generatedPath.outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Learning Path Generator</h1>
          <p className="text-gray-600 text-lg">Create a personalized learning journey tailored to your goals</p>
        </div>

        <div className="space-y-8">
          {/* Goal Selection */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What's your learning goal?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const IconComponent = goal.icon;
                return (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`p-6 text-left border-2 rounded-xl transition-all ${
                      selectedGoal === goal.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className={`w-8 h-8 mb-3 ${
                      selectedGoal === goal.id ? "text-blue-600" : "text-gray-600"
                    }`} />
                    <h3 className="font-semibold text-gray-900 mb-1">{goal.label}</h3>
                    <p className="text-sm text-gray-600">{goal.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What's your experience level?</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { id: "beginner", label: "Beginner", desc: "New to programming" },
                { id: "intermediate", label: "Intermediate", desc: "Some coding experience" },
                { id: "advanced", label: "Advanced", desc: "Experienced developer" }
              ].map((level) => (
                <button
                  key={level.id}
                  onClick={() => setExperience(level.id)}
                  className={`p-6 text-center border-2 rounded-xl transition-all ${
                    experience === level.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{level.label}</h3>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Commitment */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How much time can you dedicate per week?</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { id: "5", label: "5 hours", desc: "Casual learning" },
                { id: "10", label: "10 hours", desc: "Regular practice" },
                { id: "20", label: "20 hours", desc: "Intensive study" },
                { id: "40", label: "40+ hours", desc: "Full commitment" }
              ].map((time) => (
                <button
                  key={time.id}
                  onClick={() => setTimeCommitment(time.id)}
                  className={`p-6 text-center border-2 rounded-xl transition-all ${
                    timeCommitment === time.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{time.label}</h3>
                  <p className="text-sm text-gray-600">{time.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center pt-6">
            <button
              onClick={generatePath}
              disabled={!selectedGoal || !experience || !timeCommitment || isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold px-8 py-4 rounded-xl transition-colors flex items-center gap-3 mx-auto"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Your Path...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate My Learning Path
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
