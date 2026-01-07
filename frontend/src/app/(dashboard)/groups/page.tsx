"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  Calendar,
  UserPlus,
  Globe,
  Lock,
} from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  maxMembers: number;
  topic: string;
  isPrivate: boolean;
  nextSession?: string;
  joined: boolean;
}

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "joined" | "discover">("all");
  const [groups] = useState<StudyGroup[]>([
    {
      id: "1",
      name: "Backend Engineers Hub",
      description: "Weekly discussions on system design, APIs, and databases",
      members: 24,
      maxMembers: 30,
      topic: "Backend Development",
      isPrivate: false,
      nextSession: "Tomorrow, 7 PM",
      joined: true,
    },
    {
      id: "2",
      name: "Python Mastery",
      description: "From basics to advanced Python concepts and best practices",
      members: 18,
      maxMembers: 25,
      topic: "Python",
      isPrivate: false,
      nextSession: "Friday, 6 PM",
      joined: true,
    },
    {
      id: "3",
      name: "Interview Prep Squad",
      description: "Mock interviews and coding challenges practice",
      members: 12,
      maxMembers: 15,
      topic: "Interview Prep",
      isPrivate: true,
      joined: false,
    },
    {
      id: "4",
      name: "Cloud & DevOps",
      description: "AWS, Docker, Kubernetes, and CI/CD pipelines",
      members: 31,
      maxMembers: 40,
      topic: "DevOps",
      isPrivate: false,
      joined: false,
    },
  ]);

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.topic.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "joined") return matchesSearch && group.joined;
    if (filter === "discover") return matchesSearch && !group.joined;
    return matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-2 mb-2">Study Groups</h1>
            <p className="body-large">Learn together with peers on the same journey</p>
          </div>
          <button className="btn-primary">
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="input pl-12"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "joined", label: "My Groups" },
            { value: "discover", label: "Discover" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.value
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredGroups.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="card-hover"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-neutral-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{group.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    {group.isPrivate ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      <Globe className="w-3 h-3" />
                    )}
                    {group.isPrivate ? "Private" : "Public"}
                  </div>
                </div>
              </div>
              {group.joined && (
                <span className="badge-success text-xs">Joined</span>
              )}
            </div>

            <p className="text-sm text-neutral-600 mb-4">{group.description}</p>

            <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.members}/{group.maxMembers}
              </span>
              <span className="badge-neutral text-xs">{group.topic}</span>
            </div>

            {group.nextSession && (
              <div className="flex items-center gap-2 text-sm text-neutral-600 mb-4 p-3 bg-neutral-50 rounded-lg">
                <Calendar className="w-4 h-4" />
                Next session: {group.nextSession}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-neutral-200">
              {group.joined ? (
                <>
                  <button className="btn-primary flex-1 justify-center text-sm py-2">
                    <MessageSquare className="w-4 h-4" />
                    Open Chat
                  </button>
                  <button className="btn-secondary text-sm py-2">
                    Leave
                  </button>
                </>
              ) : (
                <button className="btn-primary flex-1 justify-center text-sm py-2">
                  <UserPlus className="w-4 h-4" />
                  Join Group
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-16"
        >
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-900 mb-2">No groups found</h3>
          <p className="text-neutral-500 mb-6">
            Try a different search or create your own group
          </p>
          <button className="btn-primary inline-flex">
            <Plus className="w-5 h-5" />
            Create Group
          </button>
        </motion.div>
      )}
    </div>
  );
}
