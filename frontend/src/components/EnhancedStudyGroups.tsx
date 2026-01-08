"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Video,
  Calendar,
  BookOpen,
  Award,
  Clock,
  Share2,
  Download,
  Link,
  FileText,
  PlayCircle,
  Star,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  Camera,
  Mic,
  ScreenShare,
  Settings,
  Bell,
  Filter
} from "lucide-react";

interface StudySession {
  id: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number; // minutes
  type: "video_call" | "screen_share" | "study_together" | "discussion";
  status: "upcoming" | "live" | "completed";
  participants: number;
  maxParticipants: number;
  host: string;
  resources?: StudyResource[];
}

interface StudyResource {
  id: string;
  title: string;
  type: "pdf" | "video" | "link" | "notes" | "code";
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  size?: string;
  downloads: number;
  rating: number;
}

interface GroupAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface GroupAnalytics {
  totalStudyTime: number; // hours
  sessionsAttended: number;
  resourcesShared: number;
  averageRating: number;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export default function EnhancedStudyGroups({ groupId }: { groupId: string }) {
  const [activeTab, setActiveTab] = useState<"sessions" | "resources" | "achievements" | "analytics">("sessions");
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [achievements, setAchievements] = useState<GroupAchievement[]>([]);
  const [analytics, setAnalytics] = useState<GroupAnalytics | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceFilter, setResourceFilter] = useState<string>("all");

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = () => {
    // Load mock data - in real app, these would be API calls
    setStudySessions([
      {
        id: "1",
        title: "React Hooks Deep Dive",
        description: "Interactive session covering useState, useEffect, and custom hooks with live coding examples",
        scheduledTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        duration: 90,
        type: "video_call",
        status: "upcoming",
        participants: 8,
        maxParticipants: 15,
        host: "Sarah Chen"
      },
      {
        id: "2",
        title: "System Design Mock Interview",
        description: "Practice system design problems with peer feedback and expert guidance",
        scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        duration: 120,
        type: "screen_share",
        status: "upcoming",
        participants: 12,
        maxParticipants: 20,
        host: "Michael Rodriguez"
      },
      {
        id: "3",
        title: "JavaScript Fundamentals Review",
        description: "Completed session reviewing closures, prototypes, and async programming",
        scheduledTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        duration: 75,
        type: "discussion",
        status: "completed",
        participants: 14,
        maxParticipants: 15,
        host: "Emily Watson"
      }
    ]);

    setResources([
      {
        id: "1",
        title: "React Hooks Cheat Sheet",
        type: "pdf",
        url: "#",
        uploadedBy: "Sarah Chen",
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        size: "2.4 MB",
        downloads: 28,
        rating: 4.8
      },
      {
        id: "2",
        title: "Advanced JavaScript Patterns Course",
        type: "video",
        url: "#",
        uploadedBy: "Michael Rodriguez",
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        size: "1.2 GB",
        downloads: 45,
        rating: 4.9
      },
      {
        id: "3",
        title: "System Design Interview Guide",
        type: "link",
        url: "https://github.com/donnemartin/system-design-primer",
        uploadedBy: "Alex Kim",
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        downloads: 67,
        rating: 4.7
      }
    ]);

    setAchievements([
      {
        id: "1",
        title: "Study Streak Master",
        description: "Attend 5 consecutive study sessions",
        icon: "🔥",
        earnedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        progress: 5,
        maxProgress: 5
      },
      {
        id: "2",
        title: "Resource Contributor",
        description: "Share 10 helpful resources with the group",
        icon: "📚",
        progress: 7,
        maxProgress: 10
      },
      {
        id: "3",
        title: "Discussion Leader",
        description: "Lead 3 study sessions",
        icon: "🎯",
        progress: 1,
        maxProgress: 3
      }
    ]);

    setAnalytics({
      totalStudyTime: 24.5,
      sessionsAttended: 12,
      resourcesShared: 7,
      averageRating: 4.6,
      streakDays: 14,
      weeklyGoal: 8,
      weeklyProgress: 6
    });
  };

  const joinSession = (sessionId: string) => {
    setStudySessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, participants: Math.min(session.participants + 1, session.maxParticipants) }
        : session
    ));
  };

  const getSessionIcon = (type: StudySession['type']) => {
    switch (type) {
      case 'video_call': return <Video className="w-5 h-5" />;
      case 'screen_share': return <Screen className="w-5 h-5" />;
      case 'study_together': return <BookOpen className="w-5 h-5" />;
      case 'discussion': return <Users className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getResourceIcon = (type: StudyResource['type']) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'link': return <Link className="w-5 h-5 text-green-500" />;
      case 'notes': return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'code': return <Zap className="w-5 h-5 text-yellow-500" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredResources = resources.filter(resource => {
    if (resourceFilter === "all") return true;
    return resource.type === resourceFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Analytics Summary */}
      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-4"
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <div>
                <p className="text-blue-100 text-sm">Study Time</p>
                <p className="text-2xl font-bold">{analytics.totalStudyTime}h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <p className="text-green-100 text-sm">Sessions</p>
                <p className="text-2xl font-bold">{analytics.sessionsAttended}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Share2 className="w-6 h-6" />
              <div>
                <p className="text-purple-100 text-sm">Resources</p>
                <p className="text-2xl font-bold">{analytics.resourcesShared}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6" />
              <div>
                <p className="text-orange-100 text-sm">Streak</p>
                <p className="text-2xl font-bold">{analytics.streakDays} days</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-neutral-100 rounded-xl p-1">
        {[
          { id: "sessions", label: "Study Sessions", icon: Calendar },
          { id: "resources", label: "Resources", icon: BookOpen },
          { id: "achievements", label: "Achievements", icon: Award },
          { id: "analytics", label: "Analytics", icon: TrendingUp }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "sessions" && (
          <motion.div
            key="sessions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-900">Study Sessions</h2>
              <button 
                onClick={() => setShowSessionModal(true)}
                className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule Session
              </button>
            </div>

            <div className="grid gap-4">
              {studySessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-white rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                    session.status === "live" 
                      ? "border-green-200 bg-green-50" 
                      : session.status === "upcoming"
                      ? "border-blue-200"
                      : "border-neutral-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        session.status === "live" ? "bg-green-100" : "bg-neutral-100"
                      }`}>
                        {getSessionIcon(session.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                          {session.title}
                        </h3>
                        <p className="text-neutral-600 mb-2">{session.description}</p>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(session.scheduledTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.participants}/{session.maxParticipants}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {session.status === "live" && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                          🔴 LIVE
                        </span>
                      )}
                      {session.status === "completed" && (
                        <span className="bg-neutral-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      )}
                      {session.status === "upcoming" && session.participants < session.maxParticipants && (
                        <button
                          onClick={() => joinSession(session.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Join Session
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <span>Hosted by <strong>{session.host}</strong></span>
                    <div className="flex items-center gap-2">
                      {session.type === "video_call" && <Video className="w-4 h-4" />}
                      {session.type === "screen_share" && <Screen className="w-4 h-4" />}
                      <span className="capitalize">{session.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "resources" && (
          <motion.div
            key="resources"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-900">Shared Resources</h2>
              <div className="flex items-center gap-3">
                <select
                  value={resourceFilter}
                  onChange={(e) => setResourceFilter(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="pdf">PDFs</option>
                  <option value="video">Videos</option>
                  <option value="link">Links</option>
                  <option value="notes">Notes</option>
                  <option value="code">Code</option>
                </select>
                <button 
                  onClick={() => setShowResourceModal(true)}
                  className="bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Resource
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl p-6 border border-neutral-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      {getResourceIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900 mb-1">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-3">
                        Shared by <strong>{resource.uploadedBy}</strong> • {resource.uploadedAt.toLocaleDateString()}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        {resource.size && (
                          <span className="text-xs text-neutral-500">{resource.size}</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3 text-neutral-400" />
                          <span className="text-xs text-neutral-500">{resource.downloads}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-neutral-500">{resource.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        {resource.type === "link" && (
                          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                            <Link className="w-4 h-4" />
                            Open Link
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "achievements" && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-neutral-900">Group Achievements</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const isEarned = achievement.earnedAt !== undefined;
                const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-white rounded-xl p-6 border-2 transition-all ${
                      isEarned 
                        ? "border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50" 
                        : "border-neutral-200"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-4xl mb-3 ${isEarned ? "animate-bounce" : "opacity-50"}`}>
                        {achievement.icon}
                      </div>
                      <h3 className={`font-semibold mb-2 ${isEarned ? "text-yellow-800" : "text-neutral-700"}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-neutral-600 mb-4">
                        {achievement.description}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isEarned ? "bg-gradient-to-r from-yellow-400 to-orange-400" : "bg-blue-400"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>{achievement.progress}/{achievement.maxProgress}</span>
                        {isEarned && (
                          <span className="text-yellow-600 font-medium">
                            Earned {achievement.earnedAt!.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === "analytics" && analytics && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-neutral-900">Your Performance Analytics</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weekly Goal Progress */}
              <div className="bg-white rounded-xl p-6 border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Weekly Study Goal
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{analytics.weeklyProgress}/{analytics.weeklyGoal} hours</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-3">
                    <div 
                      className="h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((analytics.weeklyProgress / analytics.weeklyGoal) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-600">
                    {analytics.weeklyGoal - analytics.weeklyProgress > 0 
                      ? `${analytics.weeklyGoal - analytics.weeklyProgress} hours remaining this week`
                      : "🎉 Weekly goal completed!"}
                  </p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-xl p-6 border border-neutral-200">
                <h3 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Average Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{analytics.averageRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Study Streak</span>
                    <span className="font-medium flex items-center gap-1">
                      🔥 {analytics.streakDays} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">Resources Shared</span>
                    <span className="font-medium">{analytics.resourcesShared}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
