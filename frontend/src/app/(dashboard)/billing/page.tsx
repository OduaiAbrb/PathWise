"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Crown,
  ArrowRight,
} from "lucide-react";
import { Button, Card, CardContent, Badge } from "@/components/ui";
import toast from "react-hot-toast";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "3 roadmaps",
      "10 AI messages/day",
      "Basic resources",
      "Community support",
    ],
    icon: Sparkles,
    color: "primary",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For serious learners",
    features: [
      "Unlimited roadmaps",
      "Unlimited AI messages",
      "Premium resources",
      "Priority support",
      "Resume analysis",
      "Job matching",
    ],
    icon: Zap,
    color: "secondary",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$29",
    period: "/month",
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team management",
      "Custom integrations",
      "Dedicated support",
      "Analytics dashboard",
      "API access",
    ],
    icon: Crown,
    color: "accent",
  },
];

export default function BillingPage() {
  const { data: session } = useSession();
  const [currentPlan] = useState("free");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === currentPlan) return;
    
    setIsLoading(planId);
    try {
      // This would integrate with LemonSqueezy
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Redirecting to checkout...");
      // window.location.href = checkoutUrl;
    } catch {
      toast.error("Failed to start checkout");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Choose Your Plan
          </h1>
          <p className="text-dark-400">
            Unlock your full learning potential with PathWise Pro
          </p>
        </motion.div>

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-dark-900/50 border-dark-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-dark-400 text-sm">Current Plan</p>
                    <p className="text-white font-semibold text-lg capitalize">
                      {currentPlan}
                    </p>
                  </div>
                </div>
                <Badge variant="primary">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            >
              <Card
                className={`bg-dark-900/50 border-dark-800 h-full relative ${
                  plan.popular ? "ring-2 ring-secondary-500" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-6">
                    <div
                      className={`w-12 h-12 bg-${plan.color}-500/10 rounded-xl flex items-center justify-center mb-4`}
                    >
                      <plan.icon className={`w-6 h-6 text-${plan.color}-400`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-dark-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-dark-400">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-6 flex-grow">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-dark-300"
                      >
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.id === currentPlan ? "ghost" : "primary"}
                    className="w-full"
                    disabled={plan.id === currentPlan || isLoading !== null}
                    onClick={() => handleUpgrade(plan.id)}
                    rightIcon={
                      plan.id !== currentPlan ? (
                        <ArrowRight className="w-4 h-4" />
                      ) : undefined
                    }
                  >
                    {isLoading === plan.id
                      ? "Processing..."
                      : plan.id === currentPlan
                      ? "Current Plan"
                      : "Upgrade"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-dark-400">
            Questions about billing?{" "}
            <a
              href="mailto:support@pathwise.ai"
              className="text-primary-400 hover:underline"
            >
              Contact support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
