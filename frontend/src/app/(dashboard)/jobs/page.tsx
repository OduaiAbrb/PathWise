"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Filter,
  Search,
  Bookmark,
  Clock,
  Building,
  Users,
  TrendingUp,
  Star,
  CheckCircle2
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  posted: string;
  description: string;
  requirements: string[];
  skills: string[];
  matchScore: number;
  url: string;
  logo?: string;
  isBookmarked: boolean;
  applied: boolean;
}

export default function JobsPage() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (accessToken) {
      fetchJobs();
      fetchUserSkills();
    }
  }, [accessToken]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, locationFilter, typeFilter]);

  const fetchUserSkills = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/skills/current"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserSkills(data.data?.map((s: any) => s.name) || []);
      }
    } catch (error) {
      setUserSkills(["JavaScript", "React", "Node.js", "Python", "SQL"]);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/jobs/matching"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.data || []);
      } else {
        // If API not available, show empty state instead of mock data
        setJobs([]);
      }
    } catch (error) {
      // No fallback to mock data - show empty state
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };


  const filterJobs = () => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    setFilteredJobs(filtered.sort((a, b) => b.matchScore - a.matchScore));
  };

  const toggleBookmark = async (jobId: string) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));

    try {
      await fetch(getApiUrl(`/api/v1/jobs/${jobId}/bookmark`), {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    } catch (error) {
      // Optimistic update already applied
    }
  };

  const applyToJob = async (job: Job) => {
    setJobs(prev => prev.map(j => 
      j.id === job.id ? { ...j, applied: true } : j
    ));

    try {
      await fetch(getApiUrl("/api/v1/applications"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({
          jobId: job.id,
          company: job.company,
          position: job.title,
          status: "applied",
          appliedDate: new Date().toISOString()
        })
      });

      // Open job URL in new tab
      window.open(job.url, '_blank');
    } catch (error) {
      window.open(job.url, '_blank');
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Job Board</h1>
        <p className="body-large">Find opportunities matching your skills</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6"
      >
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            {filteredJobs.length} jobs found
          </div>
        </div>
      </motion.div>

      {/* Skills Match Banner */}
      {userSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Matching Your Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {userSkills.slice(0, 8).map((skill) => (
              <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full mb-4" />
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                        <p className="text-gray-600 font-medium">{job.company}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {job.posted}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(job.matchScore)}`}>
                          {job.matchScore}% match
                        </div>
                        
                        <button
                          onClick={() => toggleBookmark(job.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            job.isBookmarked 
                              ? "bg-yellow-100 text-yellow-600" 
                              : "bg-gray-100 text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className={`px-2 py-1 text-xs rounded-full ${
                        userSkills.includes(skill)
                          ? "bg-green-100 text-green-800 font-medium"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {skill}
                      {userSkills.includes(skill) && (
                        <CheckCircle2 className="w-3 h-3 inline ml-1" />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="capitalize">{job.type}</span>
                  <span>•</span>
                  <span>{job.skills.length} required skills</span>
                </div>

                <div className="flex items-center gap-2">
                  {job.applied ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                      <CheckCircle2 className="w-4 h-4" />
                      Applied
                    </div>
                  ) : (
                    <button
                      onClick={() => applyToJob(job)}
                      className="btn-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
}
