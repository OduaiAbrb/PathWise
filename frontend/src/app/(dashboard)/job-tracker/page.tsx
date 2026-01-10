"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Users,
  TrendingUp,
  Building2,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  job_url?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  status: string;
  notes?: string;
  applied_at?: string;
  interviews: Array<{
    id: string;
    date: string;
    type: string;
    notes?: string;
    outcome: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface Stats {
  total: number;
  saved: number;
  applied: number;
  interviewing: number;
  offers: number;
  rejected: number;
}

const STATUS_CONFIG = {
  saved: { label: "Saved", color: "bg-gray-100 text-gray-700", icon: Clock },
  applied: { label: "Applied", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  phone_screen: { label: "Phone Screen", color: "bg-purple-100 text-purple-700", icon: Phone },
  interview: { label: "Interview", color: "bg-yellow-100 text-yellow-700", icon: Users },
  offer: { label: "Offer", color: "bg-green-100 text-green-700", icon: TrendingUp },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  withdrawn: { label: "Withdrawn", color: "bg-gray-100 text-gray-500", icon: XCircle },
};

export default function JobTrackerPage() {
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    company_name: "",
    job_title: "",
    job_url: "",
    location: "",
    salary_min: "",
    salary_max: "",
    job_type: "full-time",
    notes: "",
    status: "saved",
  });

  useEffect(() => {
    if (accessToken) {
      fetchApplications();
    }
  }, [accessToken]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/job-tracker"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setApplications(data.data.applications || []);
        setStats(data.data.stats || null);
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
      salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
    };

    try {
      const url = editingApp
        ? getApiUrl(`/api/v1/job-tracker/${editingApp.id}`)
        : getApiUrl("/api/v1/job-tracker");

      const response = await fetch(url, {
        method: editingApp ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchApplications();
        setShowAddModal(false);
        setEditingApp(null);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save application:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/v1/job-tracker/${id}`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error("Failed to delete application:", error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/v1/job-tracker/${id}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: "",
      job_title: "",
      job_url: "",
      location: "",
      salary_min: "",
      salary_max: "",
      job_type: "full-time",
      notes: "",
      status: "saved",
    });
  };

  const openEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      company_name: app.company_name,
      job_title: app.job_title,
      job_url: app.job_url || "",
      location: app.location || "",
      salary_min: app.salary_min?.toString() || "",
      salary_max: app.salary_max?.toString() || "",
      job_type: app.job_type || "full-time",
      notes: app.notes || "",
      status: app.status,
    });
    setShowAddModal(true);
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      app.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Job Application Tracker</h1>
            <p className="text-gray-600 mt-1">Track your job search progress</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingApp(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 font-semibold hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Application
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total", value: stats.total, color: "bg-gray-100" },
              { label: "Saved", value: stats.saved, color: "bg-gray-100" },
              { label: "Applied", value: stats.applied, color: "bg-blue-100" },
              { label: "Interviewing", value: stats.interviewing, color: "bg-yellow-100" },
              { label: "Offers", value: stats.offers, color: "bg-green-100" },
              { label: "Rejected", value: stats.rejected, color: "bg-red-100" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} p-4 rounded-lg`}>
                <div className="text-2xl font-bold text-black">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 focus:border-black outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 focus:border-black outline-none bg-white"
          >
            <option value="all">All Status</option>
            <option value="saved">Saved</option>
            <option value="applied">Applied</option>
            <option value="phone_screen">Phone Screen</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your job applications</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 font-semibold"
            >
              Add Your First Application
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const statusConfig = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.saved;
              const StatusIcon = statusConfig.icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-gray-200 p-4 hover:border-black transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <h3 className="font-bold text-lg text-black">{app.company_name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-2">{app.job_title}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {app.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {app.location}
                          </span>
                        )}
                        {(app.salary_min || app.salary_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {app.salary_min && app.salary_max
                              ? `$${app.salary_min.toLocaleString()} - $${app.salary_max.toLocaleString()}`
                              : app.salary_min
                              ? `$${app.salary_min.toLocaleString()}+`
                              : `Up to $${app.salary_max?.toLocaleString()}`}
                          </span>
                        )}
                        {app.applied_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {new Date(app.applied_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.job_url && (
                        <a
                          href={app.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-100 rounded"
                        >
                          <ExternalLink className="w-5 h-5 text-gray-500" />
                        </a>
                      )}
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Edit2 className="w-5 h-5 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Quick status change */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 flex-wrap">
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(app.id, status)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          app.status === status
                            ? config.color
                            : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {config.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
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
                className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-black">
                    {editingApp ? "Edit Application" : "Add New Application"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job URL
                    </label>
                    <input
                      type="url"
                      value={formData.job_url}
                      onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none"
                      placeholder="City, State or Remote"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Salary
                      </label>
                      <input
                        type="number"
                        value={formData.salary_min}
                        onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Salary
                      </label>
                      <input
                        type="number"
                        value={formData.salary_max}
                        onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none"
                        placeholder="80000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Type
                      </label>
                      <select
                        value={formData.job_type}
                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none bg-white"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="remote">Remote</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none bg-white"
                      >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="phone_screen">Phone Screen</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 focus:border-black outline-none resize-none"
                      rows={3}
                      placeholder="Any notes about this application..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingApp(null);
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 font-semibold hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-black text-white font-semibold hover:bg-gray-800"
                    >
                      {editingApp ? "Save Changes" : "Add Application"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
