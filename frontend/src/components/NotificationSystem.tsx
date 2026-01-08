"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  Mail,
  MessageSquare,
  Calendar,
  Trophy,
  Users,
  BookOpen,
  Clock,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Filter,
  MoreHorizontal,
  Star,
  AlertCircle,
  Info
} from "lucide-react";

interface Notification {
  id: string;
  type: "achievement" | "reminder" | "message" | "system" | "social" | "quiz";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
  quietHours: { start: string; end: string };
  categories: {
    achievements: boolean;
    reminders: boolean;
    messages: boolean;
    system: boolean;
    social: boolean;
  };
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    soundEnabled: true,
    quietHours: { start: "22:00", end: "07:00" },
    categories: {
      achievements: true,
      reminders: true,
      messages: true,
      system: false,
      social: true
    }
  });

  useEffect(() => {
    // Initialize with sample notifications
    const sampleNotifications: Notification[] = [
      {
        id: "1",
        type: "achievement",
        title: "🏆 Achievement Unlocked!",
        message: "Congratulations! You've completed your first React course and earned the 'React Rookie' badge.",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: "medium"
      },
      {
        id: "2",
        type: "reminder",
        title: "📚 Study Reminder",
        message: "Time for your JavaScript fundamentals session. You have 'Async/Await' scheduled in 15 minutes.",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
        priority: "high"
      },
      {
        id: "3",
        type: "social",
        title: "👥 New Study Group Invite",
        message: "Sarah Chen invited you to join the 'Backend Engineers Hub' study group. 24 members are already participating!",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        read: true,
        priority: "medium"
      },
      {
        id: "4",
        type: "quiz",
        title: "🧠 Quiz Results Available",
        message: "Your 'React Hooks Quiz' results are ready! You scored 87% - Great job!",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        priority: "low"
      },
      {
        id: "5",
        type: "system",
        title: "🔄 Platform Update",
        message: "New features available: Advanced code editor with real-time collaboration is now live!",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true,
        priority: "low"
      }
    ];

    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (id: string) => {
    const notification = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "achievement": return Trophy;
      case "reminder": return Clock;
      case "message": return MessageSquare;
      case "social": return Users;
      case "quiz": return BookOpen;
      case "system": return Settings;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-500 bg-red-50 border-red-200";
      case "high": return "text-orange-500 bg-orange-50 border-orange-200";
      case "medium": return "text-blue-500 bg-blue-50 border-blue-200";
      case "low": return "text-gray-500 bg-gray-50 border-gray-200";
      default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    if (filter !== "all") return notification.type === filter;
    return true;
  });

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  // Simulate receiving new notification
  const addTestNotification = () => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type: "message",
      title: "💬 New Message",
      message: "Mike Rodriguez sent you a message about the upcoming study session.",
      timestamp: new Date(),
      read: false,
      priority: "medium"
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Play notification sound if enabled
    if (settings.soundEnabled) {
      // In a real app, play actual notification sound
      console.log("🔔 Notification sound played");
    }
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.div>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-12 right-0 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 text-sm">
                {[
                  { id: "all", label: "All" },
                  { id: "unread", label: "Unread" },
                  { id: "achievement", label: "Achievements" },
                  { id: "reminder", label: "Reminders" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      filter === tab.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? "text-gray-900" : "text-gray-600"
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-xs text-gray-400">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-gray-400 hover:text-gray-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Test Button for Demo */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={addTestNotification}
                className="w-full px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                + Add Test Notification
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Delivery Methods */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Delivery Methods</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.pushEnabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, pushEnabled: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Push Notifications</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.emailEnabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </label>

                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-gray-500" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
                      <span className="text-sm text-gray-700">Sound Alerts</span>
                    </label>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-3">
                    {Object.entries(settings.categories).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            categories: { ...prev.categories, [key]: e.target.checked }
                          }))}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quiet Hours */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Quiet Hours</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Start</label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">End</label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
