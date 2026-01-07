"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Search, Star, Calendar, DollarSign, Video, CheckCircle } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface Mentor {
  id: string;
  user_id: string;
  expertise: string[];
  bio: string;
  hourly_rate: number;
  rating: number;
  total_sessions: number;
  is_verified: boolean;
}

export default function MentorsPage() {
  const { data: session } = useSession();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    fetchMentors();
  }, [accessToken]);

  const fetchMentors = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("/api/v1/mentors/search", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMentors(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const bookSession = async (mentorId: string) => {
    toast.success("Booking feature coming soon!");
  };

  const filteredMentors = mentors.filter((mentor) =>
    mentor.expertise.some((skill) =>
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    ) || mentor.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Mentor Marketplace</h1>
          <p className="text-dark-400">Connect with expert mentors to accelerate your learning</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-500 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skills or keywords..."
              className="w-full bg-dark-900 text-white rounded-lg pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </motion.div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-dark-900/50 border-dark-800 h-full hover:border-primary-500/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">Expert Mentor</h3>
                        {mentor.is_verified && (
                          <CheckCircle className="w-4 h-4 text-primary-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white font-medium">{mentor.rating.toFixed(1)}</span>
                        <span className="text-dark-500 text-sm">
                          ({mentor.total_sessions} sessions)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary-400">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{mentor.hourly_rate}</span>
                      </div>
                      <span className="text-dark-500 text-xs">/hour</span>
                    </div>
                  </div>

                  <p className="text-dark-300 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {mentor.expertise.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{mentor.expertise.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => bookSession(mentor.id)}
                      className="flex-1"
                      size="sm"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Session
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredMentors.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-dark-700 mx-auto mb-4" />
            <p className="text-dark-400">No mentors found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
