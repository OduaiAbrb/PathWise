"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Users, Briefcase, AlertCircle, ExternalLink, Clock } from "lucide-react";
import { useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  category: "hiring" | "layoffs" | "salary" | "tech_trend" | "skills" | "companies";
  sentiment: "positive" | "negative" | "neutral";
  source: string;
  publishedAt: string;
  relevance: number; // 0-100 how relevant to user's target role
  impact: "high" | "medium" | "low";
  actionable?: string; // What user should do about this
  url?: string;
}

interface JobMarketNewsFeedProps {
  targetRole: string;
  news: NewsItem[];
  onRefresh?: () => void;
}

export default function JobMarketNewsFeed({
  targetRole,
  news,
  onRefresh
}: JobMarketNewsFeedProps) {
  
  const [filter, setFilter] = useState<string>("all");
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hiring": return Users;
      case "layoffs": return AlertCircle;
      case "salary": return DollarSign;
      case "tech_trend": return TrendingUp;
      case "skills": return Briefcase;
      case "companies": return Briefcase;
      default: return Briefcase;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "hiring": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "layoffs": return "text-red-600 bg-red-50 border-red-200";
      case "salary": return "text-blue-600 bg-blue-50 border-blue-200";
      case "tech_trend": return "text-purple-600 bg-purple-50 border-purple-200";
      case "skills": return "text-amber-600 bg-amber-50 border-amber-200";
      case "companies": return "text-slate-600 bg-slate-50 border-slate-200";
      default: return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return TrendingUp;
      case "negative": return TrendingDown;
      default: return null;
    }
  };
  
  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high": return { text: "High Impact", color: "bg-red-100 text-red-700" };
      case "medium": return { text: "Medium", color: "bg-amber-100 text-amber-700" };
      case "low": return { text: "Low Impact", color: "bg-slate-100 text-slate-600" };
      default: return { text: "", color: "" };
    }
  };
  
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  const filteredNews = filter === "all" 
    ? news 
    : news.filter(item => item.category === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Job Market Intelligence</h3>
            <p className="text-sm text-slate-600">Latest news relevant to {targetRole} roles</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {["all", "hiring", "layoffs", "salary", "tech_trend", "skills"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "All" : cat.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* News List */}
      <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
        {filteredNews.map((item, index) => {
          const CategoryIcon = getCategoryIcon(item.category);
          const SentimentIcon = getSentimentIcon(item.sentiment);
          const impact = getImpactBadge(item.impact);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${getCategoryColor(item.category)}`}>
                  <CategoryIcon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                        {item.impact !== "low" && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${impact.color}`}>
                            {impact.text}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 line-clamp-2">{item.summary}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {SentimentIcon && (
                        <SentimentIcon className={`w-4 h-4 ${
                          item.sentiment === "positive" ? "text-emerald-600" : "text-red-600"
                        }`} />
                      )}
                      <div className="text-xs text-slate-500">{item.relevance}% match</div>
                    </div>
                  </div>
                  
                  {/* Actionable Insight */}
                  {item.actionable && (
                    <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">💡 Action:</span> {item.actionable}
                      </p>
                    </div>
                  )}
                  
                  {/* Footer */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(item.publishedAt)}
                    </div>
                    <span>•</span>
                    <span>{item.source}</span>
                    {item.url && (
                      <>
                        <span>•</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Read more
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {filteredNews.length === 0 && (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-900 mb-2">No news in this category</h4>
            <p className="text-sm text-slate-600">Try a different filter or check back later.</p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Updated every 6 hours from trusted sources</span>
          <span>{news.length} articles analyzed</span>
        </div>
      </div>
    </motion.div>
  );
}
