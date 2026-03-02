"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Quote,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Search,
  Plus,
  CheckCircle2,
  Award,
  Target,
  Briefcase
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface SuccessStory {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  title: string;
  company: string;
  previousRole: string;
  newRole: string;
  salary: {
    before: number;
    after: number;
    increase: number;
  };
  timeToJob: number; // days
  location: string;
  skills: string[];
  roadmapUsed: string;
  story: string;
  tips: string[];
  timeline: TimelineEvent[];
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  verified: boolean;
}

interface TimelineEvent {
  date: string;
  milestone: string;
  description: string;
  type: "learning" | "project" | "interview" | "offer";
}

export default function SuccessStoriesPage() {
  const { data: session } = useSession();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [filteredStories, setFilteredStories] = useState<SuccessStory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "salary" | "time" | "likes">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddStory, setShowAddStory] = useState(false);
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (accessToken) {
      fetchSuccessStories();
    }
  }, [accessToken]);

  useEffect(() => {
    filterAndSortStories();
  }, [stories, searchQuery, selectedRole, selectedCompany, sortBy]);

  const fetchSuccessStories = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/success-stories"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStories(data.data || []);
      } else {
        // Show empty state when API not available
        setStories([]);
      }
    } catch (error) {
      // Show empty state on error
      setStories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockStories = (): SuccessStory[] => [
    {
      id: "1",
      userId: "u1",
      username: "Alex Chen",
      title: "From Bootcamp Grad to Senior Developer",
      company: "Netflix",
      previousRole: "Restaurant Manager",
      newRole: "Senior Frontend Developer",
      salary: {
        before: 45000,
        after: 130000,
        increase: 188
      },
      timeToJob: 180,
      location: "San Francisco, CA",
      skills: ["React", "TypeScript", "Node.js", "System Design", "AWS"],
      roadmapUsed: "Frontend Developer",
      story: "After 8 years in restaurant management, I decided to make a career change. PathWise's structured roadmap helped me learn systematically. The projects section was game-changing - I built 5 portfolio projects that directly led to interview opportunities. The key was consistency - 2 hours every day for 6 months.",
      tips: [
        "Build projects that solve real problems, not just tutorials",
        "Network early and often - join tech meetups",
        "Practice system design interviews even for frontend roles",
        "Don't neglect the soft skills - communication is crucial"
      ],
      timeline: [
        {
          date: "2023-06-01",
          milestone: "Started Learning",
          description: "Enrolled in PathWise Frontend roadmap",
          type: "learning"
        },
        {
          date: "2023-08-15",
          milestone: "First Project",
          description: "Built a task management app with React",
          type: "project"
        },
        {
          date: "2023-10-01",
          milestone: "Job Applications",
          description: "Applied to 50+ companies",
          type: "interview"
        },
        {
          date: "2023-11-28",
          milestone: "Got the Offer!",
          description: "Received offer from Netflix",
          type: "offer"
        }
      ],
      createdAt: "2024-01-10",
      likes: 234,
      comments: 18,
      isLiked: false,
      verified: true
    },
    {
      id: "2",
      userId: "u2", 
      username: "Maria Rodriguez",
      title: "Self-Taught to Staff Engineer",
      company: "Stripe",
      previousRole: "Customer Support",
      newRole: "Staff Backend Engineer",
      salary: {
        before: 38000,
        after: 180000,
        increase: 373
      },
      timeToJob: 365,
      location: "Remote",
      skills: ["Python", "Django", "PostgreSQL", "Kubernetes", "System Design"],
      roadmapUsed: "Backend Developer",
      story: "Started learning programming while working customer support. PathWise's backend roadmap was comprehensive but not overwhelming. The skill decay system kept me honest about maintaining knowledge. Took a full year but landed a staff-level role directly - skipped the junior years entirely through strong fundamentals and projects.",
      tips: [
        "Focus on fundamentals over flashy frameworks",
        "Contribute to open source projects",
        "Build something people actually use",
        "Study system design religiously"
      ],
      timeline: [
        {
          date: "2022-12-01",
          milestone: "Started Journey",
          description: "Began Python fundamentals",
          type: "learning"
        },
        {
          date: "2023-04-01",
          milestone: "First Contribution",
          description: "Contributed to Django open source",
          type: "project"
        },
        {
          date: "2023-09-01",
          milestone: "Interview Prep",
          description: "Started applying to senior roles",
          type: "interview"
        },
        {
          date: "2023-12-01",
          milestone: "Staff Offer",
          description: "Got staff engineer offer at Stripe",
          type: "offer"
        }
      ],
      createdAt: "2024-01-08",
      likes: 189,
      comments: 31,
      isLiked: true,
      verified: true
    },
    {
      id: "3",
      userId: "u3",
      username: "David Kim",
      title: "Career Pivot: Teacher to Tech Lead",
      company: "GitHub",
      previousRole: "High School Teacher",
      newRole: "Engineering Manager",
      salary: {
        before: 52000,
        after: 145000,
        increase: 178
      },
      timeToJob: 270,
      location: "Austin, TX",
      skills: ["JavaScript", "React", "Node.js", "Leadership", "Team Management"],
      roadmapUsed: "Full Stack Developer",
      story: "Teaching gave me great communication skills but I wanted a new challenge. PathWise's full-stack roadmap was perfect. The interview prep and talking points for projects were invaluable. My teaching background actually became a huge asset in the manager role.",
      tips: [
        "Your previous career isn't wasted - find the transferable skills",
        "Practice explaining technical concepts simply",
        "Leadership skills matter more than you think",
        "Take time to understand the business side"
      ],
      timeline: [
        {
          date: "2023-03-01",
          milestone: "Started Learning",
          description: "Began full-stack development journey",
          type: "learning"
        },
        {
          date: "2023-07-01",
          milestone: "Portfolio Projects",
          description: "Built 3 full-stack applications",
          type: "project"
        },
        {
          date: "2023-10-15",
          milestone: "Technical Interviews",
          description: "Passed technical rounds at multiple companies",
          type: "interview"
        },
        {
          date: "2023-11-27",
          milestone: "Manager Role",
          description: "Joined GitHub as Engineering Manager",
          type: "offer"
        }
      ],
      createdAt: "2024-01-05",
      likes: 156,
      comments: 22,
      isLiked: false,
      verified: true
    }
  ];

  const filterAndSortStories = () => {
    let filtered = stories;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.newRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter(story => 
        story.newRole.toLowerCase().includes(selectedRole.toLowerCase())
      );
    }

    // Company filter  
    if (selectedCompany !== "all") {
      filtered = filtered.filter(story => story.company === selectedCompany);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "salary":
          return b.salary.after - a.salary.after;
        case "time":
          return a.timeToJob - b.timeToJob;
        case "likes":
          return b.likes - a.likes;
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredStories(filtered);
  };

  const toggleLike = async (storyId: string) => {
    setStories(prev => prev.map(story => 
      story.id === storyId 
        ? { 
            ...story, 
            isLiked: !story.isLiked,
            likes: story.isLiked ? story.likes - 1 : story.likes + 1
          }
        : story
    ));

    try {
      await fetch(getApiUrl(`/api/v1/success-stories/${storyId}/like`), {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (error) {
      // Optimistic update already applied
    }
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 mb-2">Success Stories</h1>
            <p className="body-large">Real career transformations from the PathWise community</p>
          </div>
          <button 
            onClick={() => setShowAddStory(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Share Your Story
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <div className="grid md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="input"
          >
            <option value="all">All Roles</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="fullstack">Full Stack</option>
            <option value="manager">Manager</option>
            <option value="senior">Senior</option>
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="input"
          >
            <option value="all">All Companies</option>
            <option value="Netflix">Netflix</option>
            <option value="Stripe">Stripe</option>
            <option value="GitHub">GitHub</option>
            <option value="Google">Google</option>
            <option value="Meta">Meta</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="input"
          >
            <option value="recent">Most Recent</option>
            <option value="salary">Highest Salary</option>
            <option value="time">Fastest Journey</option>
            <option value="likes">Most Liked</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            {filteredStories.length} stories
          </div>
        </div>
      </motion.div>

      {/* Success Stories */}
      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-6 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredStories.length > 0 ? (
        <div className="space-y-6">
          {filteredStories.map((story, i) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {story.username.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">{story.title}</h3>
                      {story.verified && (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 font-medium">{story.username}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {story.previousRole} → {story.newRole}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {story.company} • {story.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {Math.round(story.timeToJob / 30)} months
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary & Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatSalary(story.salary.after)}
                  </div>
                  <div className="text-sm text-green-800">New Salary</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    +{story.salary.increase}%
                  </div>
                  <div className="text-sm text-green-800">Salary Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(story.timeToJob / 30)}
                  </div>
                  <div className="text-sm text-green-800">Months to Job</div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Skills Learned
                </h4>
                <div className="flex flex-wrap gap-2">
                  {story.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Story */}
              <div className="mb-4">
                <div className="relative p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                  <Quote className="absolute top-2 left-2 w-6 h-6 text-purple-500 opacity-20" />
                  <p className="text-gray-700 italic pl-6">{story.story}</p>
                </div>
              </div>

              {/* Tips */}
              {story.tips.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    Tips for Success
                  </h4>
                  <ul className="space-y-2">
                    {story.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(story.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                      story.isLiked 
                        ? "bg-red-100 text-red-600" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${story.isLiked ? 'fill-current' : ''}`} />
                    {story.likes}
                  </button>
                  
                  <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    {story.comments}
                  </button>
                  
                  <button className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                <div className="text-sm text-gray-500">
                  {new Date(story.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stories found</h3>
          <p className="text-gray-600">Be the first to share your success story!</p>
        </div>
      )}
    </div>
  );
}
