"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Calendar,
  Clock,
  Target,
  Zap,
  Plus,
  X,
  Edit3,
  Check,
  AlertTriangle,
  BookOpen,
  Brain,
  Trophy,
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Mail
} from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  description: string;
  type: "study" | "quiz" | "milestone" | "custom";
  priority: "low" | "medium" | "high" | "urgent";
  scheduledTime: Date;
  frequency: "once" | "daily" | "weekly" | "monthly";
  isActive: boolean;
  completed: boolean;
  notificationMethods: ("browser" | "email" | "sound")[];
  tags: string[];
  estimatedDuration?: number;
  relatedSkill?: string;
}

interface NotificationSettings {
  browserNotifications: boolean;
  emailNotifications: boolean;
  soundNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  advanceNotice: number; // minutes
}

export default function SmartReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "settings">("upcoming");
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    browserNotifications: true,
    emailNotifications: false,
    soundNotifications: true,
    quietHours: {
      enabled: true,
      start: "22:00",
      end: "08:00"
    },
    advanceNotice: 15
  });

  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    title: "",
    description: "",
    type: "study",
    priority: "medium",
    frequency: "once",
    notificationMethods: ["browser", "sound"],
    tags: [],
    isActive: true,
    completed: false
  });

  // Sample reminders for demo
  useEffect(() => {
    const sampleReminders: Reminder[] = [
      {
        id: "1",
        title: "Review JavaScript Fundamentals",
        description: "Complete the async/await chapter and practice exercises",
        type: "study",
        priority: "high",
        scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        frequency: "once",
        isActive: true,
        completed: false,
        notificationMethods: ["browser", "sound"],
        tags: ["javascript", "fundamentals"],
        estimatedDuration: 60,
        relatedSkill: "JavaScript"
      },
      {
        id: "2",
        title: "Take React Quiz",
        description: "Test your knowledge on React hooks and state management",
        type: "quiz",
        priority: "medium",
        scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        frequency: "weekly",
        isActive: true,
        completed: false,
        notificationMethods: ["browser", "email"],
        tags: ["react", "quiz"],
        estimatedDuration: 30,
        relatedSkill: "React"
      }
    ];
    setReminders(sampleReminders);
  }, []);

  const createReminder = () => {
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title || "",
      description: newReminder.description || "",
      type: newReminder.type || "study",
      priority: newReminder.priority || "medium",
      scheduledTime: newReminder.scheduledTime || new Date(),
      frequency: newReminder.frequency || "once",
      isActive: true,
      completed: false,
      notificationMethods: newReminder.notificationMethods || ["browser"],
      tags: newReminder.tags || [],
      estimatedDuration: newReminder.estimatedDuration,
      relatedSkill: newReminder.relatedSkill
    };

    setReminders(prev => [...prev, reminder]);
    setNewReminder({
      title: "",
      description: "",
      type: "study",
      priority: "medium",
      frequency: "once",
      notificationMethods: ["browser", "sound"],
      tags: [],
      isActive: true,
      completed: false
    });
    setShowCreateModal(false);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    ));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-blue-100 text-blue-700 border-blue-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "study": return <BookOpen className="w-4 h-4" />;
      case "quiz": return <Brain className="w-4 h-4" />;
      case "milestone": return <Trophy className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const upcomingReminders = reminders.filter(r => !r.completed && r.isActive);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900">Smart Reminder System</h1>
        </motion.div>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
          Never miss a study session, quiz, or milestone with intelligent reminders and notifications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-neutral-100 rounded-xl p-1">
          {[
            { id: "upcoming", label: "Upcoming", count: upcomingReminders.length },
            { id: "completed", label: "Completed", count: completedReminders.length },
            { id: "settings", label: "Settings" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? "bg-neutral-100" : "bg-neutral-200"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Reminders */}
      {activeTab === "upcoming" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-neutral-900">Upcoming Reminders</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Reminder
            </button>
          </div>

          <div className="grid gap-4">
            {upcomingReminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(reminder.type)}
                      <h3 className="text-lg font-semibold text-neutral-900">{reminder.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getPriorityColor(reminder.priority)}`}>
                        {reminder.priority}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-3">{reminder.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {reminder.scheduledTime.toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {reminder.scheduledTime.toLocaleTimeString()}
                      </div>
                      {reminder.estimatedDuration && (
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {reminder.estimatedDuration} min
                        </div>
                      )}
                    </div>

                    {reminder.tags.length > 0 && (
                      <div className="flex gap-1 mt-3">
                        {reminder.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Check className="w-5 h-5 text-green-600" />
                    </button>
                    <button
                      onClick={() => setEditingReminder(reminder)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {upcomingReminders.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">No upcoming reminders</h3>
                <p className="text-neutral-500 mb-6">Create your first reminder to get started</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-colors"
                >
                  Create Reminder
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Completed Reminders */}
      {activeTab === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-neutral-900">Completed Reminders</h2>
          
          <div className="grid gap-4">
            {completedReminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card p-6 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Check className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 line-through">
                        {reminder.title}
                      </h3>
                      <p className="text-neutral-600">{reminder.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
                  >
                    Mark Incomplete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Settings */}
      {activeTab === "settings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-semibold text-neutral-900">Notification Settings</h2>
          
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Notification Methods</h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.browserNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      browserNotifications: e.target.checked
                    }))}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span>Browser notifications</span>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      emailNotifications: e.target.checked
                    }))}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-green-600" />
                    <span>Email notifications</span>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={notificationSettings.soundNotifications}
                    onChange={(e) => setNotificationSettings(prev => ({
                      ...prev,
                      soundNotifications: e.target.checked
                    }))}
                    className="w-4 h-4 rounded border-neutral-300"
                  />
                  <div className="flex items-center gap-2">
                    {notificationSettings.soundNotifications ? 
                      <Volume2 className="w-5 h-5 text-purple-600" /> : 
                      <VolumeX className="w-5 h-5 text-gray-600" />
                    }
                    <span>Sound notifications</span>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quiet Hours</h3>
              
              <label className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={notificationSettings.quietHours.enabled}
                  onChange={(e) => setNotificationSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 rounded border-neutral-300"
                />
                <span>Enable quiet hours</span>
              </label>

              {notificationSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Start time</label>
                    <input
                      type="time"
                      value={notificationSettings.quietHours.start}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">End time</label>
                    <input
                      type="time"
                      value={notificationSettings.quietHours.end}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Advance notice (minutes)
              </label>
              <select
                value={notificationSettings.advanceNotice}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  advanceNotice: parseInt(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
              >
                <option value={5}>5 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingReminder) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateModal(false);
              setEditingReminder(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
            >
              <h2 className="text-xl font-semibold text-neutral-900">
                {editingReminder ? "Edit Reminder" : "Create New Reminder"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    placeholder="Enter reminder title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea
                    value={newReminder.description}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg resize-none"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                    <select
                      value={newReminder.type}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    >
                      <option value="study">Study</option>
                      <option value="quiz">Quiz</option>
                      <option value="milestone">Milestone</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Priority</label>
                    <select
                      value={newReminder.priority}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    value={newReminder.scheduledTime ? 
                      new Date(newReminder.scheduledTime.getTime() - newReminder.scheduledTime.getTimezoneOffset() * 60000)
                        .toISOString().slice(0, 16) : ""}
                    onChange={(e) => setNewReminder(prev => ({ 
                      ...prev, 
                      scheduledTime: new Date(e.target.value) 
                    }))}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createReminder}
                  disabled={!newReminder.title}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {editingReminder ? "Update" : "Create"} Reminder
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReminder(null);
                  }}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
