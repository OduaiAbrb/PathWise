"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/fetch-api";
import {
  Check,
  X,
  Crown,
  Zap,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Users,
  BookOpen,
  Target,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import {
  TIER_CONFIGS,
  FEATURE_MATRIX,
  UserTier,
  TierFeature,
} from "@/lib/tier-config";

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const currentTier = (session as { user?: { tier?: string } })?.user?.tier || "free";

  const handleUpgrade = async (tier: UserTier) => {
    if (!accessToken) {
      router.push("/login");
      return;
    }

    if (tier === "free") return;

    setIsLoading(tier);

    try {
      const response = await fetch(getApiUrl("/api/v1/payments/create-checkout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          tier,
          billing_cycle: billingCycle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkout_url) {
          window.location.href = data.checkout_url;
        }
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const getFeatureValue = (feature: TierFeature, tier: UserTier) => {
    const value = feature[tier];
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  const tierIcons = {
    free: <Star className="w-6 h-6" />,
    standard: <Zap className="w-6 h-6" />,
    premium: <Crown className="w-6 h-6" />,
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-black mb-4"
          >
            Choose Your Path
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Invest in your career. Get the tools and resources you need to land your dream job.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 inline-flex items-center gap-4 bg-gray-100 p-1 rounded-lg"
          >
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingCycle === "monthly"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingCycle === "yearly"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {(["free", "standard", "premium"] as UserTier[]).map((tier, index) => {
            const config = TIER_CONFIGS[tier];
            const isCurrentTier = currentTier === tier;
            const isPremium = tier === "premium";
            const price = billingCycle === "yearly" ? config.priceYearly / 12 : config.price;

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative border-2 rounded-xl p-8 ${
                  isPremium
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white"
                } ${isCurrentTier ? "ring-2 ring-offset-2 ring-black" : ""}`}
              >
                {isPremium && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-sm font-bold border-2 border-black">
                    MOST POPULAR
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute -top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    CURRENT PLAN
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${isPremium ? "bg-white/10" : "bg-gray-100"}`}>
                    {tierIcons[tier]}
                  </div>
                  <h3 className="text-2xl font-bold">{config.name}</h3>
                </div>

                <p className={`mb-6 ${isPremium ? "text-gray-300" : "text-gray-600"}`}>
                  {config.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${price.toFixed(2)}
                  </span>
                  <span className={isPremium ? "text-gray-300" : "text-gray-500"}>
                    /month
                  </span>
                  {billingCycle === "yearly" && tier !== "free" && (
                    <p className={`text-sm mt-1 ${isPremium ? "text-gray-400" : "text-gray-500"}`}>
                      Billed ${config.priceYearly}/year
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={isCurrentTier || isLoading === tier}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors mb-6 ${
                    isPremium
                      ? "bg-white text-black hover:bg-gray-100"
                      : isCurrentTier
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  } ${isLoading === tier ? "opacity-50 cursor-wait" : ""}`}
                >
                  {isLoading === tier
                    ? "Processing..."
                    : isCurrentTier
                    ? "Current Plan"
                    : tier === "free"
                    ? "Get Started"
                    : "Upgrade Now"}
                </button>

                <ul className="space-y-3">
                  {config.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        isPremium ? "text-green-400" : "text-green-600"
                      }`} />
                      <span className={`text-sm ${isPremium ? "text-gray-200" : "text-gray-700"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-2 border-black rounded-xl overflow-hidden"
        >
          <div className="bg-black text-white p-6">
            <h2 className="text-2xl font-bold">Compare All Features</h2>
            <p className="text-gray-300 mt-2">See exactly what you get with each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold">Standard</th>
                  <th className="text-center p-4 font-semibold bg-gray-50">Premium</th>
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((feature, index) => (
                  <tr
                    key={feature.id}
                    className={`border-b border-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{feature.name}</div>
                      <div className="text-sm text-gray-500">{feature.description}</div>
                    </td>
                    <td className="text-center p-4">{getFeatureValue(feature, "free")}</td>
                    <td className="text-center p-4">{getFeatureValue(feature, "standard")}</td>
                    <td className="text-center p-4 bg-gray-50/50">
                      {getFeatureValue(feature, "premium")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="flex flex-wrap justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>10,000+ Users</span>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and Apple Pay through our secure payment processor.",
              },
              {
                q: "Is there a refund policy?",
                a: "Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
              },
              {
                q: "Do I keep my progress if I downgrade?",
                a: "Absolutely! Your roadmap progress, completed skills, and portfolio are never deleted.",
              },
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-black mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
