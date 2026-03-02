"use client";

import { useState, useEffect } from "react";
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
  Save,
  AlertTriangle,
} from "lucide-react";
import { getApiUrl } from "@/lib/fetch-api";
import FormField from "@/components/FormField";
import LoadingSpinner from "@/components/LoadingSpinner";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    bio: "",
    targetRole: "",
    location: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const accessToken = (session as { accessToken?: string })?.accessToken;

  useEffect(() => {
    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user?.name || "",
        email: session.user?.email || "",
      }));
    }
    
    if (accessToken) {
      fetchProfileData();
    }
  }, [session, accessToken]);

  const fetchProfileData = async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(getApiUrl("/api/v1/users/profile"), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          bio: data.data?.bio || "",
          targetRole: data.data?.target_role || "",
          location: data.data?.location || "",
        }));
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleSave = async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await fetch(getApiUrl("/api/v1/users/profile"), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio: profileData.bio,
          target_role: profileData.targetRole,
          location: profileData.location,
        }),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.detail || "Failed to save profile" });
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(getApiUrl("/api/v1/users/notification-preferences"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notifications),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save notifications:", error);
    }
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
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
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
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Profile Information</h2>
                
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
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={profileData.email}
                      className="input bg-neutral-100 dark:bg-neutral-800 cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., San Francisco, CA"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Target Role</label>
                  <input
                    type="text"
                    value={profileData.targetRole}
                    onChange={(e) => setProfileData(prev => ({ ...prev, targetRole: e.target.value }))}
                    placeholder="e.g., Senior Backend Engineer"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Bio</label>
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="input resize-none"
                  />
                </div>

                {errors.general && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    {errors.general}
                  </div>
                )}

                <button 
                  onClick={handleSave} 
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Notification Preferences</h2>

                <div className="space-y-4">
                  {[
                    { key: "email", label: "Email Notifications", description: "Receive updates via email" },
                    { key: "push", label: "Push Notifications", description: "Browser push notifications" },
                    { key: "weekly", label: "Weekly Progress Report", description: "Summary of your learning progress" },
                    { key: "marketing", label: "Marketing Emails", description: "Tips, features, and promotions" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{item.label}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.description}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({
                          ...prev,
                          [item.key]: !prev[item.key as keyof typeof notifications]
                        }))}
                        className={`w-12 h-7 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications]
                            ? "bg-neutral-900 dark:bg-white"
                            : "bg-neutral-300 dark:bg-neutral-600"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white dark:bg-neutral-900 rounded-full transition-transform ${
                            notifications[item.key as keyof typeof notifications]
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={saveNotificationSettings} 
                  className="btn-primary"
                >
                  {saved ? (
                    <>
                      <Check className="w-5 h-5" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Preferences
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Security Settings</h2>

                <div className="space-y-4">
                  <button 
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Change Password</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Update your password regularly</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400" />
                    </div>
                  </button>

                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Two-Factor Authentication</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Add an extra layer of security</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium">Coming Soon</span>
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">Active Sessions</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">You are currently logged in on this device</p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">1 Active</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <button 
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-medium"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Billing & Subscription</h2>

                <div className="p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-neutral-800 dark:to-neutral-900 text-white rounded-xl border border-neutral-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-neutral-400">Current Plan</p>
                      <p className="text-2xl font-bold">Free</p>
                    </div>
                    <button className="btn bg-white text-neutral-900 hover:bg-neutral-100 text-sm px-4 py-2">
                      Upgrade to Pro
                    </button>
                  </div>
                  <p className="text-sm text-neutral-400">
                    1 active roadmap • Basic AI chat • Community resources
                  </p>
                </div>

                {/* Pro Plan Features */}
                <div className="p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl">
                  <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Pro Plan Includes:</h3>
                  <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Unlimited roadmaps</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Advanced AI mentor with interview prep</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Priority support</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Resume optimization tools</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Payment Method</h3>
                  <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                      <span className="text-neutral-600 dark:text-neutral-400">No payment method added</span>
                    </div>
                    <button className="text-sm font-medium text-neutral-900 dark:text-white hover:underline">
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-neutral-900 dark:text-white">Billing History</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">No billing history available</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-200 dark:border-neutral-700"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Delete Account</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to delete your account? This action cannot be undone. All your data, including roadmaps, progress, and settings will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!accessToken) return;
                  try {
                    const response = await fetch(getApiUrl("/api/v1/users/account"), {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${accessToken}` },
                    });
                    if (response.ok) {
                      window.location.href = "/";
                    } else {
                      alert("Failed to delete account. Please try again.");
                    }
                  } catch (error) {
                    alert("Network error. Please try again.");
                  }
                  setShowDeleteModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-200 dark:border-neutral-700"
          >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="input"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="input"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="input"
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
                  Password changed successfully!
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordError("");
                  setPasswordSuccess(false);
                }}
                className="flex-1 px-4 py-2 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setPasswordError("");
                  setPasswordSuccess(false);
                  
                  if (passwordData.newPassword !== passwordData.confirmPassword) {
                    setPasswordError("Passwords do not match");
                    return;
                  }
                  if (passwordData.newPassword.length < 8) {
                    setPasswordError("Password must be at least 8 characters");
                    return;
                  }
                  
                  if (!accessToken) return;
                  try {
                    const response = await fetch(getApiUrl("/api/v1/users/change-password"), {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        current_password: passwordData.currentPassword,
                        new_password: passwordData.newPassword,
                      }),
                    });
                    
                    if (response.ok) {
                      setPasswordSuccess(true);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setTimeout(() => setShowPasswordModal(false), 2000);
                    } else {
                      const data = await response.json();
                      setPasswordError(data.detail || "Failed to change password");
                    }
                  } catch (error) {
                    setPasswordError("Network error. Please try again.");
                  }
                }}
                className="flex-1 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
              >
                Change Password
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
