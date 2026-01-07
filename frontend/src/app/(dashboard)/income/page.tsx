"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Plus,
  Calendar,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from "lucide-react";

interface IncomeEntry {
  id: string;
  source: string;
  amount: number;
  date: string;
  type: "freelance" | "salary" | "bonus" | "other";
}

export default function IncomePage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    source: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    type: "freelance" as IncomeEntry["type"],
  });

  useEffect(() => {
    const saved = localStorage.getItem('income_entries');
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      setEntries([
        { id: "1", source: "Freelance Project - API Development", amount: 2500, date: "2024-01-15", type: "freelance" },
        { id: "2", source: "Monthly Salary", amount: 5000, date: "2024-01-01", type: "salary" },
        { id: "3", source: "Code Review Consultation", amount: 300, date: "2024-01-10", type: "freelance" },
        { id: "4", source: "Year-end Bonus", amount: 3000, date: "2024-01-05", type: "bonus" },
      ]);
    }
  }, []);

  const addEntry = () => {
    if (!newEntry.source || !newEntry.amount) return;
    
    const entry: IncomeEntry = {
      id: Date.now().toString(),
      source: newEntry.source,
      amount: parseFloat(newEntry.amount),
      date: newEntry.date,
      type: newEntry.type,
    };
    
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem('income_entries', JSON.stringify(updated));
    
    setNewEntry({
      source: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      type: "freelance",
    });
    setShowAddModal(false);
  };

  const totalIncome = entries.reduce((acc, e) => acc + e.amount, 0);
  const freelanceIncome = entries.filter(e => e.type === "freelance").reduce((acc, e) => acc + e.amount, 0);
  const salaryIncome = entries.filter(e => e.type === "salary").reduce((acc, e) => acc + e.amount, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "freelance": return "bg-blue-100 text-blue-700";
      case "salary": return "bg-green-100 text-green-700";
      case "bonus": return "bg-purple-100 text-purple-700";
      default: return "bg-neutral-100 text-neutral-700";
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="heading-2 mb-2">Income Tracker</h1>
            <p className="body-large">Track your earnings as you grow your skills</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-5 h-5" />
            Add Income
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6 mb-8"
      >
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total This Month</p>
              <p className="text-2xl font-bold text-neutral-900">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-green-600">
            <ArrowUpRight className="w-4 h-4" />
            +12% from last month
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Freelance Income</p>
              <p className="text-2xl font-bold text-neutral-900">
                ${freelanceIncome.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-sm text-blue-600">
            <ArrowUpRight className="w-4 h-4" />
            +25% from last month
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Monthly Goal</p>
              <p className="text-2xl font-bold text-neutral-900">
                ${salaryIncome.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar h-2">
              <div className="progress-fill" style={{ width: "75%" }} />
            </div>
            <p className="text-xs text-neutral-500 mt-1">75% of $15,000 goal</p>
          </div>
        </div>
      </motion.div>

      {/* Income Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <h2 className="font-semibold text-neutral-900 mb-4">Recent Income</h2>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-neutral-200">
                      <DollarSign className="w-5 h-5 text-neutral-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{entry.source}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-neutral-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(entry.type)}`}>
                          {entry.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-green-600">
                    +${entry.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card">
            <h2 className="font-semibold text-neutral-900 mb-4">Income Sources</h2>
            <div className="space-y-4">
              {[
                { label: "Salary", amount: salaryIncome, color: "bg-green-500", percent: Math.round((salaryIncome / totalIncome) * 100) },
                { label: "Freelance", amount: freelanceIncome, color: "bg-blue-500", percent: Math.round((freelanceIncome / totalIncome) * 100) },
                { label: "Bonus", amount: 3000, color: "bg-purple-500", percent: Math.round((3000 / totalIncome) * 100) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-600">{item.label}</span>
                    <span className="font-medium text-neutral-900">{item.percent}%</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    ${item.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Impact */}
          <div className="card mt-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Skills Impact</h2>
            <p className="text-sm text-neutral-600 mb-4">
              Track how your new skills translate to income
            </p>
            <div className="space-y-3">
              {[
                { skill: "Python", impact: "+$1,500/mo" },
                { skill: "React", impact: "+$800/mo" },
                { skill: "AWS", impact: "+$600/mo" },
              ].map((item) => (
                <div
                  key={item.skill}
                  className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                >
                  <span className="text-sm text-neutral-700">{item.skill}</span>
                  <span className="text-sm font-medium text-green-600">{item.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add Income Modal */}
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
                <h2 className="text-xl font-semibold text-neutral-900">Add Income Entry</h2>
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
                    Source
                  </label>
                  <input
                    type="text"
                    value={newEntry.source}
                    onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value })}
                    placeholder="e.g., Freelance Project, Monthly Salary"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Type
                  </label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as IncomeEntry["type"] })}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                  >
                    <option value="freelance">Freelance</option>
                    <option value="salary">Salary</option>
                    <option value="bonus">Bonus</option>
                    <option value="other">Other</option>
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
                  onClick={addEntry}
                  disabled={!newEntry.source || !newEntry.amount}
                  className="flex-1 btn-primary"
                >
                  Add Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
