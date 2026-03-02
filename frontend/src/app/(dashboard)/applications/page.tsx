"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Building,
  Mail,
  Phone,
  User,
  MapPin,
  DollarSign
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";

interface Application {
  id: string;
  company: string;
  position: string;
  location: string;
  salary?: string;
  status: "applied" | "screening" | "interview" | "offer" | "rejected" | "withdrawn";
  appliedDate: string;
  lastUpdate: string;
  jobUrl?: string;
  notes: string;
  contacts: Contact[];
  interviews: Interview[];
  nextAction?: string;
  nextActionDate?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  linkedIn?: string;
}

interface Interview {
  id: string;
  type: "phone" | "video" | "onsite" | "technical" | "final";
  date: string;
  duration: number;
  interviewer: string;
  notes: string;
  outcome: "pending" | "positive" | "negative" | "neutral";
}

export default function ApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (accessToken) {
      fetchApplications();
    }
  }, [accessToken]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/applications"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      } else {
        // Show empty state when API not available
        setApplications([]);
      }
    } catch (error) {
      // Show empty state on error
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockApplications = (): Application[] => [
    {
      id: "1",
      company: "TechCorp",
      position: "Senior Frontend Developer",
      location: "San Francisco, CA",
      salary: "$120k - $160k",
      status: "interview",
      appliedDate: "2024-01-10",
      lastUpdate: "2024-01-15",
      jobUrl: "https://techcorp.com/careers/1",
      notes: "Great company culture, flexible WFH policy",
      contacts: [
        {
          id: "c1",
          name: "Sarah Johnson",
          role: "Engineering Manager",
          email: "sarah@techcorp.com",
          linkedIn: "linkedin.com/in/sarahjohnson"
        }
      ],
      interviews: [
        {
          id: "i1",
          type: "phone",
          date: "2024-01-12",
          duration: 30,
          interviewer: "Sarah Johnson",
          notes: "Good conversation, discussed React experience",
          outcome: "positive"
        }
      ],
      nextAction: "Technical interview",
      nextActionDate: "2024-01-18"
    },
    {
      id: "2",
      company: "StartupXYZ",
      position: "Full Stack Engineer", 
      location: "Remote",
      salary: "$90k - $130k",
      status: "applied",
      appliedDate: "2024-01-08",
      lastUpdate: "2024-01-08",
      jobUrl: "https://startupxyz.com/jobs/2",
      notes: "Early stage startup, equity opportunity",
      contacts: [],
      interviews: [],
      nextAction: "Follow up if no response by Friday"
    },
    {
      id: "3",
      company: "BigTech Inc",
      position: "Software Engineer II",
      location: "Seattle, WA",
      salary: "$140k - $180k",
      status: "rejected",
      appliedDate: "2024-01-05",
      lastUpdate: "2024-01-14",
      notes: "Didn't pass coding interview, need to practice algorithms",
      contacts: [],
      interviews: [
        {
          id: "i2",
          type: "technical",
          date: "2024-01-13",
          duration: 60,
          interviewer: "Tech Team",
          notes: "Struggled with dynamic programming question",
          outcome: "negative"
        }
      ]
    }
  ];

  const getStatusColor = (status: Application['status']) => {
    const colors = {
      applied: "bg-blue-100 text-blue-800",
      screening: "bg-yellow-100 text-yellow-800", 
      interview: "bg-purple-100 text-purple-800",
      offer: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      withdrawn: "bg-gray-100 text-gray-800"
    };
    return colors[status];
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case "applied": return <Clock className="w-4 h-4" />;
      case "screening": return <AlertCircle className="w-4 h-4" />;
      case "interview": return <User className="w-4 h-4" />;
      case "offer": return <CheckCircle2 className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "withdrawn": return <XCircle className="w-4 h-4" />;
    }
  };

  const updateApplicationStatus = async (appId: string, newStatus: Application['status']) => {
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: newStatus, lastUpdate: new Date().toISOString().split('T')[0] } : app
    ));

    try {
      await fetch(getApiUrl(`/api/v1/applications/${appId}`), {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (error) {
      // Optimistic update already applied
    }
  };

  const filteredApplications = statusFilter === "all" 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

  const stats = {
    total: applications.length,
    active: applications.filter(a => !["rejected", "withdrawn"].includes(a.status)).length,
    interviews: applications.filter(a => a.status === "interview").length,
    offers: applications.filter(a => a.status === "offer").length
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2 mb-2">Application Tracker</h1>
            <p className="body-large">Track your job applications and interviews</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">Total Applications</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-green-800">Active</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.interviews}</div>
          <div className="text-sm text-purple-800">Interviews</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-yellow-600">{stats.offers}</div>
          <div className="text-sm text-yellow-800">Offers</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-6 overflow-x-auto"
      >
        {[
          { value: "all", label: "All" },
          { value: "applied", label: "Applied" },
          { value: "screening", label: "Screening" },
          { value: "interview", label: "Interview" },
          { value: "offer", label: "Offer" },
          { value: "rejected", label: "Rejected" }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === filter.value
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </motion.div>

      {/* Applications List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Building className="w-6 h-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{app.position}</h3>
                        <p className="text-gray-600 font-medium">{app.company}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {app.location}
                          </span>
                          {app.salary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {app.salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Applied {new Date(app.appliedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {app.notes && (
                <p className="text-gray-600 mb-4 text-sm">{app.notes}</p>
              )}

              {app.nextAction && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Next Action:</span>
                    <span className="text-sm">{app.nextAction}</span>
                    {app.nextActionDate && (
                      <span className="text-xs">by {new Date(app.nextActionDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Status Update */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <select
                  value={app.status}
                  onChange={(e) => updateApplicationStatus(app.id, e.target.value as Application['status'])}
                  className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-1"
                >
                  <option value="applied">Applied</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>

                <div className="flex items-center gap-2">
                  {app.jobUrl && (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => setEditingApp(app)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-600 mb-4">Start tracking your job applications</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Your First Application
          </button>
        </div>
      )}
    </div>
  );
}
