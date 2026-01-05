"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Plus,
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { formatDate, calculateProgress } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { roadmaps, setRoadmaps } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        const response = await fetch("/api/v1/roadmap/list");
        if (response.ok) {
          const data = await response.json();
          setRoadmaps(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch roadmaps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoadmaps();
  }, [setRoadmaps]);

  const stats = [
    {
      label: "Active Roadmaps",
      value: roadmaps.filter((r) => r.status === "active").length,
      icon: Target,
      color: "text-primary-400",
    },
    {
      label: "Skills Completed",
      value: roadmaps.reduce((acc, r) => {
        const totalSkills = r.phases?.reduce(
          (s, p) => s + (p.skills?.length || 0),
          0
        ) || 0;
        return acc + Math.floor((totalSkills * r.completion_percentage) / 100);
      }, 0),
      icon: BookOpen,
      color: "text-accent-400",
    },
    {
      label: "Hours Learned",
      value: "12.5",
      icon: Clock,
      color: "text-secondary-400",
    },
    {
      label: "Current Streak",
      value: "5 days",
      icon: TrendingUp,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {session?.user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-dark-400">
              Track your progress and continue your learning journey.
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {stats.map((stat, index) => (
            <Card key={stat.label} className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-dark-800 ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-dark-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-wrap gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/roadmap/new">
            <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
              Create New Roadmap
            </Button>
          </Link>
          <Link href="/chat">
            <Button
              variant="secondary"
              leftIcon={<Sparkles className="w-5 h-5" />}
            >
              Ask AI Assistant
            </Button>
          </Link>
        </motion.div>

        {/* Roadmaps List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Your Roadmaps
          </h2>

          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="bg-dark-900/50 border-dark-800 animate-pulse"
                >
                  <CardContent className="p-6">
                    <div className="h-6 bg-dark-800 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-dark-800 rounded w-2/3 mb-4" />
                    <div className="h-2 bg-dark-800 rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : roadmaps.length === 0 ? (
            <Card className="bg-dark-900/50 border-dark-800 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-dark-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No roadmaps yet
                </h3>
                <p className="text-dark-400 mb-6">
                  Create your first roadmap to start your learning journey.
                </p>
                <Link href="/roadmap/new">
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="w-5 h-5" />}
                  >
                    Create Roadmap
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {roadmaps.map((roadmap) => (
                <Link key={roadmap.id} href={`/roadmap/${roadmap.id}`}>
                  <Card className="bg-dark-900/50 border-dark-800 hover:border-dark-700 transition-colors cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {roadmap.job_title}
                          </h3>
                          <p className="text-dark-400 text-sm">
                            {roadmap.industry || "General"} •{" "}
                            {roadmap.skill_level}
                          </p>
                        </div>
                        <Badge
                          variant={
                            roadmap.status === "active" ? "primary" : "default"
                          }
                        >
                          {roadmap.status}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-dark-400">Progress</span>
                          <span className="text-white font-medium">
                            {roadmap.completion_percentage}%
                          </span>
                        </div>
                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${roadmap.completion_percentage}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-dark-500 text-sm">
                          Created {formatDate(roadmap.generated_at)}
                        </span>
                        <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
