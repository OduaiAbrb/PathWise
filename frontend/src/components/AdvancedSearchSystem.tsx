"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  SlidersHorizontal,
  BookOpen,
  Video,
  Users,
  Code,
  Trophy,
  Clock,
  Star,
  TrendingUp,
  Sparkles,
  Tag,
  Calendar,
  MapPin,
  Eye,
  Download,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  X,
  ChevronDown,
  ArrowUpRight,
  Zap
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "course" | "video" | "article" | "quiz" | "project" | "group" | "mentor";
  title: string;
  description: string;
  author: string;
  rating: number;
  reviews: number;
  duration?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  thumbnail?: string;
  createdAt: Date;
  popularity: number;
  relevance: number;
}

interface SearchFilters {
  type: string[];
  difficulty: string[];
  duration: string[];
  rating: number;
  dateRange: string;
  tags: string[];
  sortBy: "relevance" | "rating" | "popularity" | "recent" | "duration";
}

interface AIRecommendation {
  id: string;
  title: string;
  reason: string;
  confidence: number;
  type: "trending" | "personalized" | "similar" | "complementary";
}

export default function AdvancedSearchSystem() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    difficulty: [],
    duration: [],
    rating: 0,
    dateRange: "all",
    tags: [],
    sortBy: "relevance"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize with sample data
    setPopularTags([
      "JavaScript", "React", "Node.js", "Python", "Machine Learning",
      "Web Development", "Data Science", "Mobile Development", "DevOps"
    ]);

    setAiRecommendations([
      {
        id: "1",
        title: "Advanced React Patterns",
        reason: "Based on your recent React course completion",
        confidence: 0.92,
        type: "personalized"
      },
      {
        id: "2",
        title: "Full-Stack JavaScript Bootcamp",
        reason: "Trending among developers with similar interests",
        confidence: 0.87,
        type: "trending"
      },
      {
        id: "3",
        title: "API Design Workshop",
        reason: "Complements your backend development skills",
        confidence: 0.81,
        type: "complementary"
      }
    ]);

    setSearchHistory(["React hooks", "Node.js authentication", "JavaScript async"]);
  }, []);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Simulate API search
    setTimeout(() => {
      const mockResults: SearchResult[] = [
        {
          id: "1",
          type: "course",
          title: "Complete React Developer Course 2024",
          description: "Learn React from scratch with hooks, context, routing, and state management. Build real-world projects and master modern React development.",
          author: "Sarah Johnson",
          rating: 4.8,
          reviews: 2341,
          duration: "40 hours",
          difficulty: "intermediate",
          tags: ["React", "JavaScript", "Web Development", "Frontend"],
          createdAt: new Date(2024, 0, 15),
          popularity: 95,
          relevance: 98
        },
        {
          id: "2",
          type: "video",
          title: "React Hooks Explained in 20 Minutes",
          description: "Quick and comprehensive guide to understanding React hooks with practical examples and best practices.",
          author: "Tech Academy",
          rating: 4.6,
          reviews: 1205,
          duration: "20 min",
          difficulty: "beginner",
          tags: ["React", "Hooks", "Tutorial"],
          createdAt: new Date(2024, 1, 20),
          popularity: 88,
          relevance: 92
        },
        {
          id: "3",
          type: "project",
          title: "Build a React E-commerce Site",
          description: "Step-by-step project to create a fully functional e-commerce website using React, Redux, and Stripe integration.",
          author: "Code Masters",
          rating: 4.9,
          reviews: 856,
          duration: "8 hours",
          difficulty: "advanced",
          tags: ["React", "Redux", "E-commerce", "Project"],
          createdAt: new Date(2024, 2, 5),
          popularity: 91,
          relevance: 89
        },
        {
          id: "4",
          type: "quiz",
          title: "React Fundamentals Quiz",
          description: "Test your React knowledge with 50 carefully crafted questions covering components, props, state, and lifecycle methods.",
          author: "QuizMaster Pro",
          rating: 4.4,
          reviews: 634,
          duration: "30 min",
          difficulty: "intermediate",
          tags: ["React", "Quiz", "Assessment"],
          createdAt: new Date(2024, 1, 10),
          popularity: 76,
          relevance: 85
        },
        {
          id: "5",
          type: "group",
          title: "React Developers Study Group",
          description: "Join 2,500+ React developers sharing knowledge, solving challenges, and building projects together.",
          author: "React Community",
          rating: 4.7,
          reviews: 412,
          difficulty: "beginner",
          tags: ["React", "Community", "Study Group", "Networking"],
          createdAt: new Date(2024, 0, 1),
          popularity: 94,
          relevance: 78
        }
      ].filter(result => 
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      setSearchResults(mockResults);
      setIsSearching(false);
      
      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev.slice(0, 4)]);
      }
    }, 1200);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course": return BookOpen;
      case "video": return Video;
      case "article": return BookOpen;
      case "quiz": return Trophy;
      case "project": return Code;
      case "group": return Users;
      case "mentor": return Star;
      default: return BookOpen;
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

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case "trending": return TrendingUp;
      case "personalized": return Sparkles;
      case "similar": return Eye;
      case "complementary": return Zap;
      default: return Sparkles;
    }
  };

  const filterResults = (results: SearchResult[]) => {
    let filtered = [...results];

    if (filters.type.length > 0) {
      filtered = filtered.filter(result => filters.type.includes(result.type));
    }

    if (filters.difficulty.length > 0) {
      filtered = filtered.filter(result => filters.difficulty.includes(result.difficulty));
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(result => result.rating >= filters.rating);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "popularity":
          return b.popularity - a.popularity;
        case "recent":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "duration":
          const aDuration = a.duration ? parseInt(a.duration) : 0;
          const bDuration = b.duration ? parseInt(b.duration) : 0;
          return aDuration - bDuration;
        default: // relevance
          return b.relevance - a.relevance;
      }
    });

    return filtered;
  };

  const filteredResults = filterResults(searchResults);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Learning Resources</h1>
        <p className="text-gray-600">AI-powered search to find the perfect learning materials for your journey</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && performSearch()}
            placeholder="Search courses, videos, projects, and more..."
            className="w-full pl-12 pr-20 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={performSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Search Suggestions */}
        {searchQuery.length > 0 && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 mt-1">
            <div className="p-3 border-b border-gray-100">
              <p className="text-xs text-gray-500 font-medium">Recent Searches</p>
            </div>
            {searchHistory.slice(0, 3).map((query, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(query);
                  performSearch();
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
              >
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{query}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border border-gray-200 rounded-xl p-6 mb-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Content Type */}
                  <div>
                    <label className="font-medium text-gray-700 text-sm mb-3 block">Content Type</label>
                    <div className="space-y-2">
                      {["course", "video", "article", "quiz", "project", "group"].map((type) => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.type.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, type: [...prev.type, type] }));
                              } else {
                                setFilters(prev => ({ ...prev, type: prev.type.filter(t => t !== type) }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="font-medium text-gray-700 text-sm mb-3 block">Difficulty</label>
                    <div className="space-y-2">
                      {["beginner", "intermediate", "advanced"].map((difficulty) => (
                        <label key={difficulty} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={filters.difficulty.includes(difficulty)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters(prev => ({ ...prev, difficulty: [...prev.difficulty, difficulty] }));
                              } else {
                                setFilters(prev => ({ ...prev, difficulty: prev.difficulty.filter(d => d !== difficulty) }));
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-600 capitalize">{difficulty}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="font-medium text-gray-700 text-sm mb-3 block">Minimum Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value={0}>Any Rating</option>
                      <option value={4}>4+ Stars</option>
                      <option value={4.5}>4.5+ Stars</option>
                      <option value={4.8}>4.8+ Stars</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="font-medium text-gray-700 text-sm mb-3 block">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="rating">Rating</option>
                      <option value="popularity">Popularity</option>
                      <option value="recent">Most Recent</option>
                      <option value="duration">Duration</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  Found {filteredResults.length} results for "{searchQuery}"
                </p>
              </div>

              <div className="space-y-4">
                {filteredResults.map((result) => {
                  const IconComponent = getTypeIcon(result.type);
                  return (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedResult(result)}
                    >
                      <div className="flex gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                          <IconComponent className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {result.title}
                            </h3>
                            <ArrowUpRight className="w-4 h-4 text-gray-400" />
                          </div>

                          <p className="text-gray-600 mb-3 line-clamp-2">{result.description}</p>

                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm text-gray-500">by {result.author}</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{result.rating}</span>
                              <span className="text-sm text-gray-500">({result.reviews})</span>
                            </div>
                            {result.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{result.duration}</span>
                              </div>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(result.difficulty)}`}>
                              {result.difficulty}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-2">
                              {result.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <Bookmark className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <Share2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* AI Recommendations */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              {aiRecommendations.map((recommendation) => {
                const IconComponent = getRecommendationIcon(recommendation.type);
                return (
                  <div key={recommendation.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{recommendation.title}</h4>
                        <p className="text-xs text-gray-600 mb-2">{recommendation.reason}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-purple-500 h-1 rounded-full"
                              style={{ width: `${recommendation.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(recommendation.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Popular Topics</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSearchQuery(tag);
                    performSearch();
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 text-gray-600 rounded-full text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
