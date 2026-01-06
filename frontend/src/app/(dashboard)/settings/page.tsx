"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { User, Mail, Bell, Shield, Save, Loader2 } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    emailNotifications: true,
    weeklyDigest: true,
    progressReminders: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-dark-400">Manage your account preferences</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-dark-900/50 border-dark-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Profile</h2>
                  <p className="text-dark-400 text-sm">Your personal information</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-dark-300 text-sm mb-2">Name</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                    <input
                      type="email"
                      value={settings.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3 bg-dark-800/50 border border-dark-700 rounded-xl text-dark-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-dark-500 text-sm mt-1">Email cannot be changed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-dark-900/50 border-dark-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary-500/10 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-secondary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Notifications</h2>
                  <p className="text-dark-400 text-sm">Manage your notification preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Email Notifications", description: "Receive updates via email" },
                  { key: "weeklyDigest", label: "Weekly Digest", description: "Get a summary of your progress" },
                  { key: "progressReminders", label: "Progress Reminders", description: "Reminders to continue learning" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-dark-800 last:border-0">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-dark-400 text-sm">{item.description}</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings[item.key as keyof typeof settings] ? "bg-primary-500" : "bg-dark-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          settings[item.key as keyof typeof settings] ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-dark-900/50 border-dark-800 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-500/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Security</h2>
                  <p className="text-dark-400 text-sm">Manage your account security</p>
                </div>
              </div>

              <div className="p-4 bg-dark-800/50 rounded-xl">
                <p className="text-dark-300 text-sm">
                  You are signed in with Google. Password management is handled through your Google account.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
