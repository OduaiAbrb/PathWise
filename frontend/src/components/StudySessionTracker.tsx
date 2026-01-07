"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Square,
  Clock,
  BookOpen,
  Target,
  CheckCircle,
  BarChart3,
  Plus,
  Timer
} from "lucide-react";

interface StudySession {
  id: string;
  subject: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  skillId?: string;
  roadmapId?: string;
  notes?: string;
  status: "active" | "completed" | "paused";
}

interface StudySessionTrackerProps {
  onSessionComplete?: (session: StudySession) => void;
  defaultSubject?: string;
  skillId?: string;
  roadmapId?: string;
}

export default function StudySessionTracker({ 
  onSessionComplete, 
  defaultSubject = "",
  skillId,
  roadmapId 
}: StudySessionTrackerProps) {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('study_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }));
      setSessions(parsed);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused]);

  const saveSession = (session: StudySession) => {
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    localStorage.setItem('study_sessions', JSON.stringify(updatedSessions));
  };

  const startSession = () => {
    if (!subject.trim()) return;

    const newSession: StudySession = {
      id: Date.now().toString(),
      subject: subject,
      startTime: new Date(),
      duration: 0,
      status: "active",
      skillId,
      roadmapId
    };

    setCurrentSession(newSession);
    setIsActive(true);
    setIsPaused(false);
    setSeconds(0);
    setShowSessionForm(false);
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        status: isPaused ? "active" : "paused"
      });
    }
  };

  const stopSession = () => {
    if (!currentSession) return;

    const completedSession: StudySession = {
      ...currentSession,
      endTime: new Date(),
      duration: Math.floor(seconds / 60),
      status: "completed"
    };

    saveSession(completedSession);
    onSessionComplete?.(completedSession);
    
    setCurrentSession(null);
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodaysStudyTime = () => {
    const today = new Date().toDateString();
    return sessions
      .filter(session => session.startTime.toDateString() === today)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getWeeklyStudyTime = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return sessions
      .filter(session => session.startTime >= oneWeekAgo)
      .reduce((total, session) => total + session.duration, 0);
  };

  return (
    <div className="space-y-4">
      {/* Active Session Display */}
      {currentSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6 border-2 border-blue-500 bg-blue-50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                {isPaused ? <Pause className="w-5 h-5 text-white" /> : <Timer className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">{currentSession.subject}</h3>
                <p className="text-sm text-blue-700">
                  {isPaused ? "Paused" : "Active"} Session
                </p>
              </div>
            </div>
            <div className="text-3xl font-mono font-bold text-blue-900">
              {formatTime(seconds)}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={pauseSession}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={stopSession}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              <Square className="w-4 h-4" />
              Complete
            </button>
          </div>
        </motion.div>
      )}

      {/* Start New Session */}
      {!currentSession && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Study Session
            </h3>
            <button
              onClick={() => setShowSessionForm(!showSessionForm)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>

          <AnimatePresence>
            {showSessionForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    What are you studying?
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., React Hooks, Data Structures, API Design"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={startSession}
                  disabled={!subject.trim()}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-neutral-300 text-white font-medium rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Start Studying
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Study Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-xl font-bold text-neutral-900">
                {getTodaysStudyTime()}m
              </div>
              <p className="text-xs text-neutral-500">Today</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-xl font-bold text-neutral-900">
                {getWeeklyStudyTime()}m
              </div>
              <p className="text-xs text-neutral-500">This Week</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="card p-6">
          <h4 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Sessions
          </h4>
          
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {sessions
              .slice(-5)
              .reverse()
              .map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{session.subject}</p>
                      <p className="text-xs text-neutral-500">
                        {session.startTime.toLocaleDateString()} • {session.duration}min
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-neutral-600">
                    +{Math.floor(session.duration * 1.5)} XP
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
