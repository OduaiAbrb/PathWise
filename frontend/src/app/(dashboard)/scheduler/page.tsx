"use client";

import { useState } from "react";
import { getApiUrl } from "@/lib/fetch-api";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/fetch-api";
import { Calendar, Clock, Zap, TrendingUp } from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import { getApiUrl } from "@/lib/fetch-api";
import toast from "react-hot-toast";
import { getApiUrl } from "@/lib/fetch-api";

interface TimeSlot {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  score: number;
  day_of_week: string;
}

export default function SchedulerPage() {
  const { data: session } = useSession();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [studyDuration, setStudyDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [pomodoroSchedule, setPomodoroSchedule] = useState<any>(null);
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const findOptimalSlots = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/v1/scheduler/find-slots"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          calendar_events: [],
          study_duration_minutes: studyDuration,
          days_ahead: 7,
        }),
      });

      if (!response.ok) throw new Error("Failed to find slots");

      const data = await response.json();
      setTimeSlots(data.data);
      toast.success("Found optimal study times!");
    } catch (error) {
      toast.error("Failed to find time slots");
    } finally {
      setIsLoading(false);
    }
  };

  const generatePomodoro = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/scheduler/pomodoro"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          total_minutes: 120,
          work_interval: 25,
          short_break: 5,
          long_break: 15,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate schedule");

      const data = await response.json();
      setPomodoroSchedule(data.data);
      toast.success("Pomodoro schedule generated!");
    } catch (error) {
      toast.error("Failed to generate Pomodoro schedule");
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Smart Scheduler</h1>
          <p className="text-dark-400">AI-powered study time optimization</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Find Study Times</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-dark-400 text-sm mb-2 block">
                      Study Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={studyDuration}
                      onChange={(e) => setStudyDuration(parseInt(e.target.value))}
                      className="w-full bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <Button onClick={findOptimalSlots} disabled={isLoading} className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    {isLoading ? "Finding..." : "Find Optimal Times"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Pomodoro Timer</h3>
                <p className="text-dark-400 text-sm mb-4">
                  Generate a Pomodoro schedule for focused study sessions
                </p>
                <Button onClick={generatePomodoro} variant="secondary" className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Generate Schedule
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {timeSlots.length > 0 && (
              <Card className="bg-dark-900/50 border-dark-800">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4">Optimal Study Times</h3>
                  <div className="space-y-3">
                    {timeSlots.slice(0, 10).map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg hover:bg-dark-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Calendar className="w-5 h-5 text-primary-400" />
                          <div>
                            <p className="text-white font-medium">{slot.day_of_week}</p>
                            <p className="text-dark-400 text-sm">
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 text-sm font-medium">
                              {slot.score.toFixed(0)}%
                            </span>
                          </div>
                          <Button size="sm">Schedule</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {pomodoroSchedule && (
              <Card className="bg-dark-900/50 border-dark-800">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4">Pomodoro Schedule</h3>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="bg-dark-800/50 p-4 rounded-lg">
                      <p className="text-dark-400 text-sm mb-1">Total Work Time</p>
                      <p className="text-white text-2xl font-bold">
                        {pomodoroSchedule.total_work_time} min
                      </p>
                    </div>
                    <div className="bg-dark-800/50 p-4 rounded-lg">
                      <p className="text-dark-400 text-sm mb-1">Total Breaks</p>
                      <p className="text-white text-2xl font-bold">
                        {pomodoroSchedule.total_break_time} min
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {pomodoroSchedule.intervals?.map((interval: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          interval.type === "work"
                            ? "bg-primary-500/10 border border-primary-500/20"
                            : "bg-green-500/10 border border-green-500/20"
                        }`}
                      >
                        <Clock
                          className={`w-4 h-4 ${
                            interval.type === "work" ? "text-primary-400" : "text-green-400"
                          }`}
                        />
                        <span className="text-white text-sm font-medium">
                          {interval.type === "work" ? "Work" : "Break"}
                        </span>
                        <span className="text-dark-400 text-sm">
                          {interval.duration_minutes} minutes
                        </span>
                        <Badge
                          variant={interval.type === "work" ? "primary" : "success"}
                          className="ml-auto text-xs"
                        >
                          {interval.start_minute} min
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {timeSlots.length === 0 && !pomodoroSchedule && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-dark-700 mx-auto mb-4" />
                <p className="text-dark-400">
                  Use the tools on the left to find optimal study times
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
