"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getApiUrl } from "@/lib/fetch-api";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    BellOff,
    X,
    Zap,
    Mail,
    Calendar,
    Briefcase,
    Users,
    Check,
} from "lucide-react";

interface NotificationBannerProps {
    onDismiss?: () => void;
}

export default function NotificationBanner({ onDismiss }: NotificationBannerProps) {
    const { data: session } = useSession();
    const accessToken = (session as { accessToken?: string })?.accessToken;
    const [showBanner, setShowBanner] = useState(false);
    const [permission, setPermission] = useState<NotificationPermission>("default");
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        // Check if notifications are supported and not yet granted
        if ("Notification" in window) {
            setPermission(Notification.permission);
            if (Notification.permission === "default") {
                // Show banner after 30 seconds of first visit
                const timer = setTimeout(() => setShowBanner(true), 30000);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const requestPermission = async () => {
        if (!("Notification" in window)) return;

        setIsSubscribing(true);
        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === "granted") {
                // Register service worker and subscribe to push
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
                });

                // Send subscription to backend
                if (accessToken) {
                    await fetch(getApiUrl("/api/v1/notifications/push/subscribe"), {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
                                auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))),
                            },
                        }),
                    });
                }

                // Show a welcome notification
                new Notification("PathWise", {
                    body: "Notifications enabled! You'll get skill decay alerts, streak reminders, and job matches.",
                    icon: "/icon-192.png",
                });
            }
        } catch (err) {
            console.error("Failed to subscribe to push:", err);
        } finally {
            setIsSubscribing(false);
            setShowBanner(false);
        }
    };

    const dismiss = () => {
        setShowBanner(false);
        onDismiss?.();
    };

    if (!showBanner || permission === "granted") return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-6 right-6 z-50 max-w-sm"
            >
                <div className="bg-black text-white rounded-2xl p-6 shadow-2xl border border-white/10">
                    <button
                        onClick={dismiss}
                        className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Stay on track</h3>
                            <p className="text-white/70 text-sm">Get alerts that matter</p>
                        </div>
                    </div>

                    <div className="space-y-2 mb-5">
                        {[
                            { icon: Zap, text: "Skill decay warnings" },
                            { icon: Calendar, text: "Streak reminders" },
                            { icon: Briefcase, text: "Job match alerts" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                                <item.icon className="w-4 h-4 text-white/50" />
                                {item.text}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={requestPermission}
                            disabled={isSubscribing}
                            className="flex-1 px-4 py-3 bg-white text-black font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Bell className="w-4 h-4" />
                            {isSubscribing ? "Enabling..." : "Enable"}
                        </motion.button>
                        <button
                            onClick={dismiss}
                            className="px-4 py-3 text-white/60 hover:text-white font-medium transition-colors text-sm"
                        >
                            Later
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
