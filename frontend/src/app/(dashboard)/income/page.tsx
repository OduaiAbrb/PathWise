"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, PieChart, Plus, Target } from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";

interface IncomeStats {
  total_income: number;
  total_expenses: number;
  net_income: number;
  average_monthly: number;
  income_sources: Record<string, number>;
  monthly_breakdown: Array<{
    month: string;
    income: number;
    expenses: number;
    net: number;
  }>;
}

export default function IncomePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<IncomeStats | null>(null);
  const [roiData, setRoiData] = useState<any>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    amount: "",
    source: "",
    entry_type: "income",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    fetchStats();
    calculateROI();
  }, [accessToken]);

  const fetchStats = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("/api/v1/income/stats?months=12", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const calculateROI = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("/api/v1/income/calculate-roi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          initial_salary: 50000,
          current_salary: 75000,
          learning_investment: 5000,
          months_elapsed: 12,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setRoiData(data.data);
      }
    } catch (error) {
      console.error("Failed to calculate ROI:", error);
    }
  };

  const addEntry = async () => {
    if (!newEntry.amount || !newEntry.source) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/v1/income/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newEntry),
      });

      if (!response.ok) throw new Error("Failed to add entry");

      toast.success("Entry added!");
      setShowAddEntry(false);
      setNewEntry({
        amount: "",
        source: "",
        entry_type: "income",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      fetchStats();
    } catch (error) {
      toast.error("Failed to add entry");
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Income Tracker</h1>
            <p className="text-dark-400">Track your earnings and calculate learning ROI</p>
          </div>
          <Button onClick={() => setShowAddEntry(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Entry
          </Button>
        </motion.div>

        {/* Add Entry Modal */}
        {showAddEntry && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Add Income/Expense</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    value={newEntry.amount}
                    onChange={(e) => setNewEntry({ ...newEntry, amount: e.target.value })}
                    placeholder="Amount"
                    className="bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={newEntry.source}
                    onChange={(e) => setNewEntry({ ...newEntry, source: e.target.value })}
                    placeholder="Source (e.g., Salary, Freelance)"
                    className="bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={newEntry.entry_type}
                    onChange={(e) => setNewEntry({ ...newEntry, entry_type: e.target.value })}
                    className="bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                  <input
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                    className="bg-dark-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={addEntry}>Add</Button>
                  <Button variant="secondary" onClick={() => setShowAddEntry(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-primary-500/10 border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">
                  ${stats?.total_income.toLocaleString() || 0}
                </span>
              </div>
              <p className="text-dark-300 text-sm">Total Income</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-accent-500/10 border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-red-400" />
                <span className="text-3xl font-bold text-white">
                  ${stats?.total_expenses.toLocaleString() || 0}
                </span>
              </div>
              <p className="text-dark-300 text-sm">Total Expenses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-primary-400" />
                <span className="text-3xl font-bold text-white">
                  ${stats?.net_income.toLocaleString() || 0}
                </span>
              </div>
              <p className="text-dark-300 text-sm">Net Income</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-500/10 to-accent-500/10 border-secondary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-secondary-400" />
                <span className="text-3xl font-bold text-white">
                  ${stats?.average_monthly.toLocaleString() || 0}
                </span>
              </div>
              <p className="text-dark-300 text-sm">Avg Monthly</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ROI Analysis */}
          {roiData && (
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Learning ROI</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                    <span className="text-dark-400">ROI Percentage</span>
                    <span className="text-2xl font-bold text-green-400">
                      {roiData.roi_percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                    <span className="text-dark-400">Salary Increase</span>
                    <span className="text-white font-semibold">
                      ${roiData.salary_increase.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                    <span className="text-dark-400">Payback Period</span>
                    <span className="text-white font-semibold">
                      {roiData.payback_months} months
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-dark-800/50 rounded-lg">
                    <span className="text-dark-400">5-Year Value</span>
                    <span className="text-white font-semibold">
                      ${roiData.lifetime_value.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Income Sources */}
          {stats && (
            <Card className="bg-dark-900/50 border-dark-800">
              <CardContent className="p-6">
                <h3 className="text-white font-semibold mb-4">Income Sources</h3>
                <div className="space-y-3">
                  {Object.entries(stats.income_sources).map(([source, amount]) => (
                    <div key={source} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PieChart className="w-5 h-5 text-primary-400" />
                        <span className="text-white">{source}</span>
                      </div>
                      <span className="text-dark-400 font-medium">
                        ${amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
