"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Book,
  FileText,
  Code,
  Globe,
  Search,
  Filter,
  Star,
  Clock,
  Users,
  CheckCircle,
  ExternalLink,
  Bookmark,
  Share2,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Zap,
  Trophy,
  Target,
  Lightbulb,
  BookOpen,
  Video,
  Headphones,
  FileCode,
  Image as ImageIcon,
  Link,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";
import Link from "next/link";

interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: "video" | "article" | "course" | "tutorial" | "documentation" | "interactive" | "podcast" | "book";
  url: string;
  thumbnailUrl?: string;
  provider: "youtube" | "coursera" | "udemy" | "freeCodeCamp" | "mdn" | "medium" | "dev.to" | "github" | "custom";
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string; // "10 min", "2 hours", "5 days"
  rating: number;
  reviewCount: number;
  tags: string[];
  author: string;
  publishedDate: string;
  language: string;
  isBookmarked: boolean;
  completionStatus: "not_started" | "in_progress" | "completed";
  estimatedXP: number;
  prerequisites: string[];
  learningObjectives: string[];
  relatedSkills: string[];
}

interface LearningResourcesEngineProps {
  skillName?: string;
  roadmapId?: string;
  userLevel?: string;
  onResourceComplete?: (resourceId: string) => void;
}

// WORLD'S BEST CURATED LEARNING RESOURCES DATABASE
const CURATED_RESOURCES: LearningResource[] = [
  // JavaScript Resources
  {
    id: "js-fundamentals-1",
    title: "JavaScript Fundamentals - Complete Course",
    description: "Master JavaScript from basics to advanced concepts with hands-on examples and real projects.",
    type: "video",
    url: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
    thumbnailUrl: "https://i.ytimg.com/vi/PkZNo7MFNFg/maxresdefault.jpg",
    provider: "freeCodeCamp",
    difficulty: "beginner",
    duration: "3 hours 26 min",
    rating: 4.9,
    reviewCount: 15420,
    tags: ["javascript", "fundamentals", "programming", "web-development"],
    author: "freeCodeCamp",
    publishedDate: "2023-01-15",
    language: "English",
    isBookmarked: false,
    completionStatus: "not_started",
    estimatedXP: 250,
    prerequisites: ["Basic HTML", "Basic CSS"],
    learningObjectives: ["Variables and Data Types", "Functions", "Objects", "DOM Manipulation"],
    relatedSkills: ["Web Development", "Frontend", "ES6"]
  },
  {
    id: "react-complete-guide",
    title: "React - The Complete Guide 2024",
    description: "Dive deep into React with hooks, context, routing, and modern patterns. Build real applications.",
    type: "course",
    url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
    thumbnailUrl: "https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg",
    provider: "youtube",
    difficulty: "intermediate",
    duration: "11 hours 47 min",
    rating: 4.8,
    reviewCount: 8934,
    tags: ["react", "frontend", "components", "hooks", "javascript"],
    author: "React Mastery",
    publishedDate: "2024-01-10",
    language: "English",
    isBookmarked: false,
    completionStatus: "not_started",
    estimatedXP: 500,
    prerequisites: ["JavaScript ES6", "HTML", "CSS"],
    learningObjectives: ["React Components", "State Management", "React Hooks", "React Router"],
    relatedSkills: ["Frontend Development", "Single Page Applications", "Component Architecture"]
  },
  {
    id: "node-api-masterclass",
    title: "Node.js API Masterclass with Express & MongoDB",
    description: "Build professional RESTful APIs with Node.js, Express, and MongoDB. Includes authentication and deployment.",
    type: "course",
    url: "https://www.youtube.com/watch?v=L72fhGm1tfE",
    thumbnailUrl: "https://i.ytimg.com/vi/L72fhGm1tfE/maxresdefault.jpg",
    provider: "freeCodeCamp",
    difficulty: "intermediate",
    duration: "12 hours",
    rating: 4.9,
    reviewCount: 12567,
    tags: ["nodejs", "express", "mongodb", "api", "backend"],
    author: "Traversy Media",
    publishedDate: "2023-11-20",
    language: "English",
    isBookmarked: false,
    completionStatus: "not_started",
    estimatedXP: 600,
    prerequisites: ["JavaScript", "Basic Node.js"],
    learningObjectives: ["RESTful API Design", "Authentication", "Database Integration", "Error Handling"],
    relatedSkills: ["Backend Development", "Database Design", "API Development"]
  },
  {
    id: "python-complete-course",
    title: "Python for Everybody - Complete Course",
    description: "Learn Python programming from scratch. Perfect for beginners with no programming experience.",
    type: "video",
    url: "https://www.youtube.com/watch?v=8DvywoWv6fI",
    thumbnailUrl: "https://i.ytimg.com/vi/8DvywoWv6fI/maxresdefault.jpg",
    provider: "freeCodeCamp",
    difficulty: "beginner",
    duration: "14 hours",
    rating: 4.9,
    reviewCount: 23451,
    tags: ["python", "programming", "data-science", "automation"],
    author: "Dr. Charles Severance",
    publishedDate: "2023-03-10",
    language: "English",
    isBookmarked: false,
    completionStatus: "not_started",
    estimatedXP: 400,
    prerequisites: [],
    learningObjectives: ["Python Syntax", "Data Structures", "Functions", "File Handling"],
    relatedSkills: ["Programming Fundamentals", "Data Analysis", "Automation"]
  },
  {
    id: "system-design-primer",
    title: "System Design Interview Preparation",
    description: "Master system design concepts for technical interviews. Learn scalability, databases, and architecture patterns.",
    type: "course",
    url: "https://www.youtube.com/watch?v=bUHFg8CZFws",
    thumbnailUrl: "https://i.ytimg.com/vi/bUHFg8CZFws/maxresdefault.jpg",
    provider: "youtube",
    difficulty: "advanced",
    duration: "8 hours 30 min",
    rating: 4.8,
    reviewCount: 7892,
    tags: ["system-design", "scalability", "architecture", "interviews"],
    author: "System Design Interview",
    publishedDate: "2023-09-15",
    language: "English",
    isBookmarked: false,
    completionStatus: "not_started",
    estimatedXP: 750,
    prerequisites: ["Backend Development", "Database Knowledge", "Networking Basics"],
    learningObjectives: ["Scalability Patterns", "Database Design", "Caching Strategies", "Microservices"],
    relatedSkills: ["Software Architecture", "Technical Leadership", "Performance Optimization"]
  },
  {
    id: "docker-kubernetes-course",
    title: "Docker and Kubernetes - Complete Guide",
    description: "Learn containerization with Docker and orchestration with Kubernetes. From basics to production deployment.",
    type: "course",
    url: "https://www.youtube.com/watch?v=3c-iBn73dDE",
    thumbnailUrl: "https://i.ytimg.com/vi/3c-iBn73dDE/maxresdefault.jpg",
    provider: "freeCodeCamp",
    difficulty: "intermediate",
    duration: "6 hours 20 min",
    rating: 4.7,
    reviewCount: 9876,
    tags: ["docker", "kubernetes", "devops", "containerization"],
    author: "TechWorld with Nana",
    publishedDate: "2023-08-05",
    language: "English",
    isBookmarked: false,
    completionStatus: "not_started",
    estimatedXP: 550,
    prerequisites: ["Linux Basics", "Command Line"],
    learningObjectives: ["Docker Fundamentals", "Container Orchestration", "Kubernetes Deployment", "DevOps Practices"],
    relatedSkills: ["DevOps", "Cloud Computing", "Infrastructure Management"]
  }
];

export default function LearningResourcesEngine({
  skillName,
  roadmapId,
  userLevel,
  onResourceComplete
}: LearningResourcesEngineProps) {
  const [resources, setResources] = useState<LearningResource[]>(CURATED_RESOURCES);
  const [filteredResources, setFilteredResources] = useState<LearningResource[]>(CURATED_RESOURCES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);

  // Filter and search logic
  useEffect(() => {
    let filtered = resources;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        resource.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== "all") {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(resource => resource.difficulty === selectedDifficulty);
    }

    // Provider filter
    if (selectedProvider !== "all") {
      filtered = filtered.filter(resource => resource.provider === selectedProvider);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "duration":
          return parseInt(a.duration) - parseInt(b.duration);
        case "date":
          return new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime();
        case "xp":
          return b.estimatedXP - a.estimatedXP;
        default:
          return 0;
      }
    });

    setFilteredResources(filtered);
  }, [resources, searchQuery, selectedType, selectedDifficulty, selectedProvider, sortBy]);

  // Enhanced search with AI recommendations (future feature)
  const searchWithAI = useCallback(async (query: string) => {
    setIsLoading(true);
    // TODO: Implement AI-powered resource search
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const toggleBookmark = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId
        ? { ...resource, isBookmarked: !resource.isBookmarked }
        : resource
    ));
  };

  const markAsCompleted = (resourceId: string) => {
    setResources(prev => prev.map(resource =>
      resource.id === resourceId
        ? { ...resource, completionStatus: "completed" }
        : resource
    ));
    onResourceComplete?.(resourceId);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return Video;
      case "course": return BookOpen;
      case "article": return FileText;
      case "tutorial": return Code;
      case "documentation": return Book;
      case "interactive": return Zap;
      case "podcast": return Headphones;
      case "book": return Book;
      default: return FileText;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700";
      case "intermediate": return "bg-yellow-100 text-yellow-700";
      case "advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getProviderLogo = (provider: string) => {
    // In production, these would be actual logo components
    switch (provider) {
      case "youtube": return "🎥";
      case "coursera": return "🎓";
      case "udemy": return "🎯";
      case "freeCodeCamp": return "💻";
      case "mdn": return "🌐";
      case "medium": return "📝";
      case "dev.to": return "🔥";
      case "github": return "🐙";
      default: return "📚";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">
            Learning Resources
          </h1>
          <p className="text-neutral-600 mt-2">
            Curated, high-quality resources to accelerate your learning journey
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            {viewMode === "grid" ? "List View" : "Grid View"}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="grid lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search resources, topics, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchWithAI(searchQuery);
                }
              }}
              className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">All Types</option>
            <option value="video">Videos</option>
            <option value="course">Courses</option>
            <option value="article">Articles</option>
            <option value="tutorial">Tutorials</option>
            <option value="documentation">Documentation</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900"
          >
            <option value="rating">Highest Rated</option>
            <option value="date">Newest</option>
            <option value="duration">Shortest First</option>
            <option value="xp">Most XP</option>
          </select>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["JavaScript", "React", "Python", "Node.js", "System Design", "Docker"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag.toLowerCase())}
              className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-sm rounded-full transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-neutral-200 border-t-neutral-900 rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Finding the best resources for you...</p>
        </div>
      )}

      {/* Resources Grid/List */}
      <AnimatePresence>
        <div className={`grid gap-6 ${viewMode === "grid" ? "lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
          {filteredResources.map((resource, index) => {
            const TypeIcon = getTypeIcon(resource.type);
            
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail & Type */}
                <div className="relative mb-4">
                  {resource.thumbnailUrl ? (
                    <img
                      src={resource.thumbnailUrl}
                      alt={resource.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-40 bg-neutral-100 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-12 h-12 text-neutral-400" />
                    </div>
                  )}
                  
                  {/* Provider Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full text-xs font-medium">
                    <span>{getProviderLogo(resource.provider)}</span>
                    <span className="capitalize">{resource.provider}</span>
                  </div>

                  {/* Difficulty Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </div>

                  {/* Bookmark */}
                  <button
                    onClick={() => toggleBookmark(resource.id)}
                    className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-400'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-2 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-3">
                      {resource.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{resource.rating}</span>
                      <span>({resource.reviewCount.toLocaleString()})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{resource.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span>{resource.estimatedXP} XP</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-neutral-100 text-xs text-neutral-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start Learning
                    </a>
                    
                    {resource.completionStatus !== "completed" && (
                      <button
                        onClick={() => markAsCompleted(resource.id)}
                        className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-sm font-medium rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    
                    {resource.completionStatus === "completed" && (
                      <div className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {/* No Results */}
      {filteredResources.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No resources found</h3>
          <p className="text-neutral-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
