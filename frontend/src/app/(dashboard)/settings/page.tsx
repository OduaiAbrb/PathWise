"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Moon,
  Sun,
  Check,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: true,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="heading-2 mb-2">Settings</h1>
        <p className="body-large">Manage your account preferences</p>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1"
        >
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3"
        >
          <div className="card">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900">Profile Information</h2>
                
                <div className="flex items-center gap-4">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-neutral-500" />
                    </div>
                  )}
                  <div>
                    <button className="btn-secondary text-sm py-2">
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      defaultValue={session?.user?.name || ""}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      defaultValue={session?.user?.email || ""}
                      className="input"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Target Role</label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Backend Engineer"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="input resize-none"
                  />
                </div>

                <button onClick={handleSave} className="btn-primary">
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    { key: "email", label: "Email Notifications", description: "Receive updates via email" },
                    { key: "push", label: "Push Notifications", description: "Browser push notifications" },
                    { key: "weekly", label: "Weekly Progress Report", description: "Summary of your learning progress" },
                    { key: "marketing", label: "Marketing Emails", description: "Tips, features, and promotions" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                      <div>
                        <p className="font-medium text-neutral-900">{item.label}</p>
                        <p className="text-sm text-neutral-500">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof notifications]
                        }))}
                        className={`w-12 h-7 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications]
                            ? "bg-neutral-900"
                            : "bg-neutral-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notifications[item.key as keyof typeof notifications]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSave} className="btn-primary">
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved
                    </>
                  ) : (
                    "Save Preferences"
                  )}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900">Security Settings</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">Change Password</p>
                        <p className="text-sm text-neutral-500">Update your password regularly</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">Two-Factor Authentication</p>
                        <p className="text-sm text-neutral-500">Add an extra layer of security</p>
                      </div>
                      <span className="text-sm text-neutral-500">Not enabled</span>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900">Active Sessions</p>
                        <p className="text-sm text-neutral-500">Manage your logged-in devices</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200">
                  <button className="text-red-600 hover:text-red-700 font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900">Billing & Subscription</h2>

                <div className="p-6 bg-neutral-900 text-white rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-400">Current Plan</p>
                      <p className="text-2xl font-bold">Free</p>
                    </div>
                    <button className="btn bg-white text-neutral-900 hover:bg-neutral-100">
                      Upgrade to Pro
                    </button>
                  </div>
                  <p className="text-sm text-neutral-400">
                    1 active roadmap • Basic AI chat • Community resources
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-neutral-900">Payment Method</h3>
                  <div className="p-4 bg-neutral-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-neutral-500" />
                      <span className="text-neutral-600">No payment method added</span>
                    </div>
                    <button className="text-sm font-medium text-neutral-900 hover:underline">
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-neutral-900">Billing History</h3>
                  <p className="text-sm text-neutral-500">No billing history available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
