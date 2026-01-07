"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Star,
  Brain,
  Target,
  Zap,
  Play,
  BookOpen,
  Code,
  Video,
  FileText,
  Headphones,
  ExternalLink,
  ArrowRight,
  Lightbulb,
  Award,
  ChevronRight
} from "lucide-react";

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  type: "video" | "course" | "article" | "tutorial" | "practice";
  url: string;
  thumbnailUrl?: string;
  provider: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  rating: number;
  reasonForRecommendation: string;
  confidence: number; // 0-100
  learningPath: string[];
  skillsGained: string[];
  prerequisitesMet: string[];
  nextSteps: string[];
  aiInsights: {
    personalizedReason: string;
    learningStyle: string;
    timeOptimal: boolean;
    difficultyMatch: boolean;
    careerRelevance: number;
  };
}

interface LearningPersona {
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
  preferredDuration: "short" | "medium" | "long"; // <30min, 30-2h, >2h
  currentLevel: "beginner" | "intermediate" | "advanced";
  goals: string[];
  timeAvailable: number; // minutes per day
  completedTopics: string[];
  strugglingAreas: string[];
  preferredFormats: string[];
}

interface AIResourceRecommendationsProps {
  userId?: string;
  currentSkill?: string;
  roadmapId?: string;
  learningGoals?: string[];
}

export default function AIResourceRecommendations({
  userId,
  currentSkill,
  roadmapId,
  learningGoals = []
}: AIResourceRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [learningPersona, setLearningPersona] = useState<LearningPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "quick-wins" | "deep-dive" | "practice" | "trending">("all");

  // AI-Generated Recommendations based on user data
  useEffect(() => {
    const generatePersonalizedRecommendations = async () => {
      setIsLoading(true);
      
      // Simulate AI persona analysis
      const mockPersona: LearningPersona = {
        learningStyle: "visual",
        preferredDuration: "medium",
        currentLevel: "intermediate",
        goals: learningGoals.length > 0 ? learningGoals : ["Full Stack Development", "System Design", "Career Growth"],
        timeAvailable: 60,
        completedTopics: ["JavaScript Basics", "React Fundamentals", "CSS"],
        strugglingAreas: ["Algorithms", "System Design"],
        preferredFormats: ["video", "tutorial", "practice"]
      };

      setLearningPersona(mockPersona);

      // AI-curated recommendations with confidence scoring
      const aiRecommendations: AIRecommendation[] = [
        {
          id: "ai-rec-1",
          title: "Advanced React Patterns - 2024",
          description: "Master advanced React patterns like compound components, render props, and custom hooks. Build scalable applications with confidence.",
          type: "course",
          url: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
          thumbnailUrl: "https://i.ytimg.com/vi/Tn6-PIqc4UM/maxresdefault.jpg",
          provider: "React Conference",
          difficulty: "advanced",
          duration: "3 hours 15 min",
          rating: 4.9,
          reasonForRecommendation: "Based on your React experience and goal to become a senior developer",
          confidence: 95,
          learningPath: ["React Basics", "Hooks", "Advanced Patterns", "Architecture"],
          skillsGained: ["Advanced React", "Component Architecture", "Performance Optimization"],
          prerequisitesMet: ["React Fundamentals", "JavaScript ES6"],
          nextSteps: ["State Management", "Testing", "Performance"],
          aiInsights: {
            personalizedReason: "Your React skills are solid. Time to level up with advanced patterns that senior developers use daily.",
            learningStyle: "Perfect for visual learners with code examples",
            timeOptimal: true,
            difficultyMatch: true,
            careerRelevance: 98
          }
        },
        {
          id: "ai-rec-2",
          title: "System Design Fundamentals",
          description: "Learn how to design scalable systems. Perfect preparation for senior-level interviews and real-world architecture decisions.",
          type: "course",
          url: "https://www.youtube.com/watch?v=F2FmTdLtb_4",
          thumbnailUrl: "https://i.ytimg.com/vi/F2FmTdLtb_4/maxresdefault.jpg",
          provider: "Engineering Excellence",
          difficulty: "intermediate",
          duration: "2 hours 45 min",
          rating: 4.8,
          reasonForRecommendation: "System Design is in your struggling areas - this will bridge the gap",
          confidence: 92,
          learningPath: ["Basics", "Scalability", "Databases", "Architecture"],
          skillsGained: ["System Architecture", "Scalability", "Database Design"],
          prerequisitesMet: ["Backend Development"],
          nextSteps: ["Advanced System Design", "Microservices", "Cloud Architecture"],
          aiInsights: {
            personalizedReason: "System Design was flagged as challenging. This course uses visual diagrams perfect for your learning style.",
            learningStyle: "Diagram-heavy approach matches visual preference",
            timeOptimal: true,
            difficultyMatch: true,
            careerRelevance: 96
          }
        },
        {
          id: "ai-rec-3",
          title: "JavaScript Algorithms & Data Structures",
          description: "Master the algorithms and data structures that matter for coding interviews and better programming logic.",
          type: "practice",
          url: "https://www.youtube.com/watch?v=8hly31xKli0",
          thumbnailUrl: "https://i.ytimg.com/vi/8hly31xKli0/maxresdefault.jpg",
          provider: "freeCodeCamp",
          difficulty: "intermediate",
          duration: "5 hours",
          rating: 4.7,
          reasonForRecommendation: "Algorithms is a struggling area - structured practice will help",
          confidence: 88,
          learningPath: ["Basic Algorithms", "Data Structures", "Advanced Algorithms", "Problem Solving"],
          skillsGained: ["Algorithm Design", "Problem Solving", "Data Structures"],
          prerequisitesMet: ["JavaScript"],
          nextSteps: ["Advanced Algorithms", "Dynamic Programming", "System Design"],
          aiInsights: {
            personalizedReason: "Your algorithm skills need reinforcement. This practical approach with coding exercises suits your learning needs.",
            learningStyle: "Hands-on coding matches kinesthetic elements",
            timeOptimal: false,
            difficultyMatch: true,
            careerRelevance: 85
          }
        },
        {
          id: "ai-rec-4",
          title: "Quick Win: CSS Grid Mastery",
          description: "Master CSS Grid in 30 minutes. Immediately improve your frontend layouts with modern CSS techniques.",
          type: "tutorial",
          url: "https://www.youtube.com/watch?v=jV8B24rSN5o",
          thumbnailUrl: "https://i.ytimg.com/vi/jV8B24rSN5o/maxresdefault.jpg",
          provider: "Web Dev Simplified",
          difficulty: "beginner",
          duration: "32 min",
          rating: 4.9,
          reasonForRecommendation: "Quick skill boost that complements your React knowledge",
          confidence: 85,
          learningPath: ["CSS Basics", "Flexbox", "Grid", "Advanced Layouts"],
          skillsGained: ["CSS Grid", "Modern Layouts", "Responsive Design"],
          prerequisitesMet: ["Basic CSS"],
          nextSteps: ["CSS Animations", "Advanced Styling", "Design Systems"],
          aiInsights: {
            personalizedReason: "Quick 30-min skill boost that immediately improves your React components' styling.",
            learningStyle: "Visual demonstrations perfect for you",
            timeOptimal: true,
            difficultyMatch: true,
            careerRelevance: 75
          }
        },
        {
          id: "ai-rec-5",
          title: "Node.js Production Best Practices",
          description: "Learn how to deploy, monitor, and scale Node.js applications in production environments like a pro.",
          type: "course",
          url: "https://www.youtube.com/watch?v=YJdaBE5PzJU",
          thumbnailUrl: "https://i.ytimg.com/vi/YJdaBE5PzJU/maxresdefault.jpg",
          provider: "Node.js Foundation",
          difficulty: "advanced",
          duration: "4 hours 20 min",
          rating: 4.8,
          reasonForRecommendation: "Essential for full-stack development career goals",
          confidence: 91,
          learningPath: ["Node.js Basics", "Express.js", "Production", "DevOps"],
          skillsGained: ["Production Deployment", "Monitoring", "Performance"],
          prerequisitesMet: ["Node.js Basics"],
          nextSteps: ["Docker", "Kubernetes", "Cloud Deployment"],
          aiInsights: {
            personalizedReason: "Critical for your full-stack goals. Production skills separate juniors from seniors.",
            learningStyle: "Code-along format with real examples",
            timeOptimal: false,
            difficultyMatch: true,
            careerRelevance: 94
          }
        }
      ];

      setRecommendations(aiRecommendations);
      setIsLoading(false);
    };

    generatePersonalizedRecommendations();
  }, [userId, currentSkill, roadmapId, learningGoals]);

  const getFilteredRecommendations = () => {
    switch (selectedCategory) {
      case "quick-wins":
        return recommendations.filter(r => parseInt(r.duration) < 60);
      case "deep-dive":
        return recommendations.filter(r => parseInt(r.duration) > 120);
      case "practice":
        return recommendations.filter(r => r.type === "practice" || r.type === "tutorial");
      case "trending":
        return recommendations.filter(r => r.rating > 4.8);
      default:
        return recommendations;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "course": return BookOpen;
      case "tutorial": return Code;
      case "practice": return Target;
      case "article": return FileText;
      default: return Play;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600 bg-green-100";
    if (confidence >= 80) return "text-blue-600 bg-blue-100";
    if (confidence >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "text-green-700 bg-green-100";
      case "intermediate": return "text-yellow-700 bg-yellow-100";
      case "advanced": return "text-red-700 bg-red-100";
      default: return "text-gray-700 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI-Powered Recommendations
          </h2>
          <p className="text-neutral-600 mt-2">
            Personalized learning paths designed specifically for your goals and learning style
          </p>
        </div>
        
        {learningPersona && (
          <div className="text-right">
            <div className="text-sm text-neutral-500">Learning Style</div>
            <div className="font-medium text-neutral-900 capitalize">{learningPersona.learningStyle}</div>
          </div>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All Recommendations", icon: Sparkles },
          { id: "quick-wins", label: "Quick Wins", icon: Zap },
          { id: "deep-dive", label: "Deep Dive", icon: Brain },
          { id: "practice", label: "Hands-on", icon: Target },
          { id: "trending", label: "Trending", icon: TrendingUp }
        ].map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === category.id
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
            }`}
          >
            <category.icon className="w-4 h-4" />
            {category.label}
          </button>
        ))}
      </div>

      {/* AI Insights Summary */}
      {learningPersona && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <h3 className="font-semibold text-purple-900">AI Learning Insights</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-purple-700 font-medium">Optimal Study Time</div>
              <div className="text-purple-600">{learningPersona.timeAvailable} min/day</div>
            </div>
            <div>
              <div className="text-purple-700 font-medium">Focus Areas</div>
              <div className="text-purple-600">{learningPersona.strugglingAreas.join(", ")}</div>
            </div>
            <div>
              <div className="text-purple-700 font-medium">Preferred Formats</div>
              <div className="text-purple-600 capitalize">{learningPersona.preferredFormats.join(", ")}</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <div className="space-y-6">
        {getFilteredRecommendations().map((rec, index) => {
          const TypeIcon = getTypeIcon(rec.type);
          
          return (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-lg transition-all"
            >
              <div className="flex gap-6">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {rec.thumbnailUrl ? (
                    <img
                      src={rec.thumbnailUrl}
                      alt={rec.title}
                      className="w-32 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-32 h-20 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-8 h-8 text-neutral-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                        {rec.title}
                      </h3>
                      <p className="text-neutral-600 text-sm line-clamp-2 mb-3">
                        {rec.description}
                      </p>
                    </div>
                    
                    <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(rec.confidence)}`}>
                      {rec.confidence}% match
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                      {rec.duration}
                    </span>
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded text-xs">
                      {rec.provider}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {rec.rating}
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-purple-900 text-sm mb-1">Why this is perfect for you:</div>
                        <div className="text-purple-700 text-sm">
                          {rec.aiInsights.personalizedReason}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-purple-600">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Career Relevance: {rec.aiInsights.careerRelevance}%
                          </span>
                          {rec.aiInsights.timeOptimal && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Time Optimal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills & Next Steps */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Skills You'll Gain:</div>
                      <div className="flex flex-wrap gap-1">
                        {rec.skillsGained.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 mb-1">Next Steps:</div>
                      <div className="flex flex-wrap gap-1">
                        {rec.nextSteps.slice(0, 2).map(step => (
                          <span key={step} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {step}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <a
                      href={rec.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-medium rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start Learning
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    <button className="px-4 py-3 border border-neutral-200 hover:bg-neutral-50 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* No recommendations message */}
      {getFilteredRecommendations().length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No recommendations found</h3>
          <p className="text-neutral-600">Try selecting a different category or check back later for new suggestions.</p>
        </div>
      )}
    </div>
  );
}
