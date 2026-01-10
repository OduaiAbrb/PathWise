"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Search,
  ExternalLink,
  Clock,
  Star,
  Filter,
  Video,
  FileText,
  Code,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";
import ReportBrokenLink from "@/components/ReportBrokenLink";

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  provider: string;
  difficulty: string;
  duration_minutes: number;
  quality_score: number;
  tier_required: string;
  is_official?: boolean;
  verified?: boolean;
  category?: string;
}

interface Category {
  id: string;
  name: string;
  resource_count: number;
  has_official_docs: boolean;
}

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  documentation: FileText,
  article: FileText,
  course: BookOpen,
  interactive: Code,
  book: BookOpen,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchCategories();
    }
  }, [accessToken]);

  useEffect(() => {
    if (selectedCategory && accessToken) {
      fetchResourcesForCategory(selectedCategory);
    }
  }, [selectedCategory, accessToken]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/resources/categories"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
        if (data.data?.length > 0) {
          setSelectedCategory(data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResourcesForCategory = async (category: string) => {
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/resources/skill/${category}`),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setResources(data.data?.resources || []);
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        getApiUrl(`/api/v1/resources/search?query=${encodeURIComponent(searchQuery)}`),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data?.results || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => {
    const TypeIcon = TYPE_ICONS[resource.type] || Globe;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-gray-200 p-4 hover:border-black transition-colors bg-white"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <TypeIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black">{resource.title}</h3>
              <p className="text-sm text-gray-500">{resource.provider}</p>
            </div>
          </div>
          {resource.is_official && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Official
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${DIFFICULTY_COLORS[resource.difficulty] || "bg-gray-100 text-gray-700"}`}>
            {resource.difficulty}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {resource.duration_minutes < 60
              ? `${resource.duration_minutes} min`
              : `${Math.round(resource.duration_minutes / 60)} hrs`}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            {(resource.quality_score * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-black font-medium hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Open Resource
          </a>
          {accessToken && (
            <ReportBrokenLink
              resourceId={resource.id}
              resourceUrl={resource.url}
              resourceTitle={resource.title}
              accessToken={accessToken}
            />
          )}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Learning Resources</h1>
          <p className="text-gray-600">
            Curated, verified resources to accelerate your learning
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-black outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-black text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-black">
                Search Results ({searchResults.length})
              </h2>
              <button
                onClick={() => {
                  setSearchResults([]);
                  setSearchQuery("");
                }}
                className="text-sm text-gray-500 hover:text-black"
              >
                Clear
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {searchResults.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-70">
                ({category.resource_count})
              </span>
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        {resources.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No resources found
            </h3>
            <p className="text-gray-500">
              Select a category or search for resources
            </p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-gray-50 border-2 border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black mb-1">
                Found a broken link?
              </h3>
              <p className="text-gray-600 text-sm">
                Click "Report Issue" on any resource to let us know. We verify
                all resources regularly and appreciate your help keeping them
                up-to-date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
