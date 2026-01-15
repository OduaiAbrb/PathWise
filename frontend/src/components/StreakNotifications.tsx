"use client";

import { useEffect, useState } from "react";
import { Bell, X, Flame, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StreakNotificationsProps {
  currentStreak: number;
  onNotificationClick?: () => void;
}

export function StreakNotifications({ currentStreak, onNotificationClick }: StreakNotificationsProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [showBrowserPrompt, setShowBrowserPrompt] = useState(false);
  const [lastNotificationDate, setLastNotificationDate] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      setLastNotificationDate(localStorage.getItem("lastStreakNotification"));
    }
  }, []);

  useEffect(() => {
    if (permission === "granted") {
      scheduleNotifications();
    }
  }, [permission, currentStreak]);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser notifications are not supported");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    setShowBrowserPrompt(false);

    if (result === "granted") {
      sendTestNotification();
      scheduleNotifications();
    }
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("🔥 PathWise Notifications Enabled!", {
        body: "We'll remind you to keep your streak alive!",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  };

  const sendStreakReminder = (streakCount: number, type: "danger" | "maintenance" | "motivation") => {
    if (permission !== "granted") return;

    const today = new Date().toDateString();
    if (lastNotificationDate === today) return; // Don't spam

    let title = "";
    let body = "";
    let icon = "🔥";

    switch (type) {
      case "danger":
        title = "⚠️ Streak in Danger!";
        body = `Your ${streakCount}-day streak will break in 2 hours. Complete today's mission now!`;
        icon = "⚠️";
        break;
      case "maintenance":
        title = "🔥 Keep the Fire Burning!";
        body = `Day ${streakCount + 1} awaits! What will you learn today?`;
        icon = "🔥";
        break;
      case "motivation":
        title = "💪 You're On Fire!";
        body = `${streakCount} days strong! You're building unstoppable momentum.`;
        icon = "💪";
        break;
    }

    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "streak-reminder",
      requireInteraction: type === "danger",
    });

    notification.onclick = () => {
      window.focus();
      onNotificationClick?.();
      notification.close();
    };

    localStorage.setItem("lastStreakNotification", today);
    setLastNotificationDate(today);
  };

  const scheduleNotifications = () => {
    // Clear existing timeouts
    const existingTimeouts = JSON.parse(localStorage.getItem("notificationTimeouts") || "[]");
    existingTimeouts.forEach((id: number) => clearTimeout(id));

    const timeouts: number[] = [];
    const now = new Date();
    
    // Daily reminder at 8 AM
    const morningReminder = new Date();
    morningReminder.setHours(8, 0, 0, 0);
    if (morningReminder <= now) {
      morningReminder.setDate(morningReminder.getDate() + 1);
    }
    
    const morningTimeout = window.setTimeout(() => {
      sendStreakReminder(currentStreak, "maintenance");
    }, morningReminder.getTime() - now.getTime());
    timeouts.push(morningTimeout);

    // Danger reminder at 10 PM (if no activity today)
    const eveningReminder = new Date();
    eveningReminder.setHours(22, 0, 0, 0);
    if (eveningReminder <= now) {
      eveningReminder.setDate(eveningReminder.getDate() + 1);
    }

    const eveningTimeout = window.setTimeout(() => {
      // Check if user was active today before sending danger alert
      const lastActivity = localStorage.getItem("lastActivity");
      const today = new Date().toDateString();
      if (!lastActivity || new Date(lastActivity).toDateString() !== today) {
        sendStreakReminder(currentStreak, "danger");
      }
    }, eveningReminder.getTime() - now.getTime());
    timeouts.push(eveningTimeout);

    // Milestone celebration (every 7 days)
    if (currentStreak > 0 && currentStreak % 7 === 0) {
      setTimeout(() => {
        sendStreakReminder(currentStreak, "motivation");
      }, 1000); // Immediate for milestone
    }

    localStorage.setItem("notificationTimeouts", JSON.stringify(timeouts));
  };

  const enableNotifications = () => {
    if (permission === "default") {
      setShowBrowserPrompt(true);
    } else if (permission === "denied") {
      alert("Please enable notifications in your browser settings to receive streak reminders.");
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Bell className="w-5 h-5 text-orange-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Daily Streak Reminders</h3>
          <p className="text-sm text-gray-600">
            {permission === "granted" 
              ? `Notifications enabled • ${currentStreak} day streak` 
              : "Get reminded to maintain your learning streak"
            }
          </p>
        </div>

        {permission !== "granted" && (
          <button
            onClick={enableNotifications}
            className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            Enable
          </button>
        )}
      </div>

      <AnimatePresence>
        {showBrowserPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 m-4 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900">Stay Consistent</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    We'll send you gentle reminders to maintain your learning streak and build lasting habits.
                  </p>
                </div>
                <button
                  onClick={() => setShowBrowserPrompt(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Morning motivation (8:00 AM)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Streak protection (10:00 PM)</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowBrowserPrompt(false)}
                  className="flex-1 px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={requestPermission}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Enable Notifications
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
