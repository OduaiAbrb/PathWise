"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  UserCircle,
  Star,
  Calendar,
  MessageSquare,
  Search,
  Filter,
  ExternalLink,
  Clock,
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  rating: number;
  reviews: number;
  hourlyRate: number;
  available: boolean;
  bio: string;
  image?: string;
}

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string | null>(null);
  const [mentors] = useState<Mentor[]>([
    {
      id: "1",
      name: "Sarah Chen",
      title: "Senior Software Engineer",
      company: "Google",
      expertise: ["System Design", "Backend", "Python"],
      rating: 4.9,
      reviews: 47,
      hourlyRate: 120,
      available: true,
      bio: "10+ years building scalable systems. I help engineers prepare for FAANG interviews.",
    },
    {
      id: "2",
      name: "Marcus Johnson",
      title: "Engineering Manager",
      company: "Stripe",
      expertise: ["Career Growth", "Leadership", "Backend"],
      rating: 4.8,
      reviews: 32,
      hourlyRate: 150,
      available: true,
      bio: "Former IC turned manager. I coach engineers on career transitions and leadership.",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      title: "Staff Engineer",
      company: "Netflix",
      expertise: ["Frontend", "React", "TypeScript"],
      rating: 4.9,
      reviews: 58,
      hourlyRate: 100,
      available: false,
      bio: "Passionate about frontend architecture and mentoring junior developers.",
    },
    {
      id: "4",
      name: "David Kim",
      title: "Principal Engineer",
      company: "Amazon",
      expertise: ["AWS", "DevOps", "System Design"],
      rating: 4.7,
      reviews: 24,
      hourlyRate: 140,
      available: true,
      bio: "Cloud architecture expert. I help teams design and scale their infrastructure.",
    },
  ]);

  const expertiseOptions = ["System Design", "Backend", "Frontend", "DevOps", "Career Growth", "Leadership"];

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesExpertise = !selectedExpertise || mentor.expertise.includes(selectedExpertise);
    return matchesSearch && matchesExpertise;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Find a Mentor</h1>
        <p className="body-large">Get personalized guidance from industry experts</p>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or expertise..."
              className="input pl-12"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedExpertise(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !selectedExpertise
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            All
          </button>
          {expertiseOptions.map((exp) => (
            <button
              key={exp}
              onClick={() => setSelectedExpertise(exp)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedExpertise === exp
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Mentors Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor, i) => (
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card-hover"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCircle className="w-10 h-10 text-neutral-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{mentor.name}</h3>
                    <p className="text-sm text-neutral-600">{mentor.title}</p>
                    <p className="text-sm text-neutral-500">{mentor.company}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mentor.available
                      ? "bg-green-100 text-green-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}>
                    {mentor.available ? "Available" : "Busy"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-4">{mentor.bio}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {mentor.expertise.map((exp) => (
                <span key={exp} className="badge-neutral text-xs">
                  {exp}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                {mentor.rating} ({mentor.reviews})
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                ${mentor.hourlyRate}/hr
              </span>
            </div>

            <div className="flex gap-2 pt-4 border-t border-neutral-200">
              <button
                disabled={!mentor.available}
                className="btn-primary flex-1 justify-center text-sm py-2"
              >
                <Calendar className="w-4 h-4" />
                Book Session
              </button>
              <button className="btn-secondary text-sm py-2">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">No mentors found</h3>
          <p className="text-neutral-500">Try adjusting your search or filters</p>
        </motion.div>
      )}

      {/* Become a Mentor CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-6 bg-neutral-900 text-white rounded-2xl text-center"
      >
        <h3 className="text-xl font-semibold mb-2">Want to become a mentor?</h3>
        <p className="text-neutral-400 mb-4">
          Share your expertise and help others grow in their careers
        </p>
        <button className="btn bg-white text-neutral-900 hover:bg-neutral-100">
          Apply to Mentor
          <ExternalLink className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
}
