"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Target,
  BookOpen,
  X,
  Trash2,
} from "lucide-react";

interface ScheduledTask {
  id: string;
  title: string;
  time: string;
  duration: number;
  type: "learning" | "project" | "review";
  completed: boolean;
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    time: "09:00",
    duration: 30,
    type: "learning" as ScheduledTask["type"],
  });

  useEffect(() => {
    const saved = localStorage.getItem('scheduler_tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      setTasks([
        { id: "1", title: "Learn REST API fundamentals", time: "09:00", duration: 60, type: "learning", completed: false },
        { id: "2", title: "Practice coding exercises", time: "14:00", duration: 45, type: "project", completed: true },
        { id: "3", title: "Review yesterday's notes", time: "18:00", duration: 30, type: "review", completed: false },
      ]);
    }
  }, []);

  const saveTasksToStorage = (updatedTasks: ScheduledTask[]) => {
    localStorage.setItem('scheduler_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: ScheduledTask = {
      id: Date.now().toString(),
      title: newTask.title,
      time: newTask.time,
      duration: newTask.duration,
      type: newTask.type,
      completed: false,
    };
    
    const updated = [...tasks, task].sort((a, b) => a.time.localeCompare(b.time));
    setTasks(updated);
    saveTasksToStorage(updated);
    
    setNewTask({ title: "", time: "09:00", duration: 30, type: "learning" });
    setShowAddModal(false);
  };

  const deleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    saveTasksToStorage(updated);
  };

  const quickAddTask = (title: string, duration: number, type: ScheduledTask["type"]) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const task: ScheduledTask = {
      id: Date.now().toString(),
      title,
      time,
      duration,
      type,
      completed: false,
    };
    
    const updated = [...tasks, task].sort((a, b) => a.time.localeCompare(b.time));
    setTasks(updated);
    saveTasksToStorage(updated);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const toggleTask = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    saveTasksToStorage(updated);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "learning": return "bg-blue-100 text-blue-700";
      case "project": return "bg-green-100 text-green-700";
      case "review": return "bg-purple-100 text-purple-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalMinutes = tasks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Learning Scheduler</h1>
        <p className="body-large">Plan your study sessions and track your time</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="card">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-neutral-100 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="text-center text-sm font-medium text-neutral-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, i) => (
                <button
                  key={i}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={`aspect-square p-2 rounded-lg text-sm font-medium transition-colors ${
                    !date
                      ? ""
                      : isSelected(date)
                      ? "bg-neutral-900 text-white"
                      : isToday(date)
                      ? "bg-neutral-100 text-neutral-900"
                      : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="card mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-900">
                {selectedDate.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
              </h3>
              <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm py-2">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    task.completed ? "bg-neutral-50" : "bg-white border border-neutral-200"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-neutral-300 hover:border-neutral-400"
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.time}
                      </span>
                      <span className="text-sm text-neutral-500">{task.duration} min</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(task.type)}`}>
                        {task.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Today's Progress */}
          <div className="card">
            <h3 className="font-semibold text-neutral-900 mb-4">Today's Progress</h3>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-neutral-900">
                {completedCount}/{tasks.length}
              </div>
              <p className="text-sm text-neutral-500">tasks completed</p>
            </div>
            <div className="progress-bar h-3 mb-4">
              <div
                className="progress-fill"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
              <Clock className="w-4 h-4" />
              {totalMinutes} min scheduled
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="card">
            <h3 className="font-semibold text-neutral-900 mb-4">Weekly Goal</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">12/15</p>
                <p className="text-sm text-neutral-500">hours this week</p>
              </div>
            </div>
            <div className="progress-bar h-2">
              <div className="progress-fill" style={{ width: "80%" }} />
            </div>
          </div>

          {/* Quick Add */}
          <div className="card">
            <h3 className="font-semibold text-neutral-900 mb-4">Quick Add</h3>
            <div className="space-y-2">
              {[
                { label: "30 min learning", icon: BookOpen, duration: 30, type: "learning" as const },
                { label: "1 hour project", icon: Target, duration: 60, type: "project" as const },
                { label: "15 min review", icon: Calendar, duration: 15, type: "review" as const },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => quickAddTask(item.label, item.duration, item.type)}
                  className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left transition-colors"
                >
                  <item.icon className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">Add Task</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g., Learn React hooks"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newTask.time}
                      onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Duration (min)
                    </label>
                    <select
                      value={newTask.duration}
                      onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    >
                      <option value={15}>15 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value as ScheduledTask["type"] })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  >
                    <option value="learning">Learning</option>
                    <option value="project">Project</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 btn-primary"
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
