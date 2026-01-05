"use client";

import { motion } from "framer-motion";
import { Button, Badge } from "@/components/ui";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for exploring what PathWise can do",
    features: [
      "1 roadmap generation per month",
      "Basic resource curation (top 5 per skill)",
      "10 AI Q&A questions per month",
      "Progress tracking",
      "Community access",
    ],
    cta: "Get Started Free",
    variant: "secondary" as const,
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    yearlyPrice: "$99/year",
    description: "Everything you need to land your dream job",
    features: [
      "Unlimited roadmap generations",
      "Full resource library access",
      "Unlimited AI Q&A assistance",
      "Resume gap analyzer",
      "Job scanner with alerts",
      "Project templates & assessments",
      "Weekly email coaching",
      "Priority support",
    ],
    cta: "Start Pro Trial",
    variant: "primary" as const,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations at scale",
    features: [
      "Everything in Pro",
      "Team dashboards & analytics",
      "Custom role templates",
      "API access",
      "White-label option",
      "Dedicated account manager",
      "Custom onboarding",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    variant: "secondary" as const,
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Simple,{" "}
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </motion.h2>
          <motion.p
            className="text-lg text-dark-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel
            anytime.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              className={`relative bg-dark-900/50 backdrop-blur-sm border rounded-2xl p-8 ${
                plan.popular
                  ? "border-primary-500/50 shadow-xl shadow-primary-500/10"
                  : "border-dark-800"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge variant="info" className="shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Plan header */}
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-dark-400">{plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-sm text-primary-400 mt-1">
                    or {plan.yearlyPrice} (save 17%)
                  </p>
                )}
                <p className="text-dark-400 text-sm mt-3">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                    <span className="text-dark-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={plan.name === "Enterprise" ? "/contact" : "/signup"}>
                <Button
                  variant={plan.variant}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-dark-500 text-sm">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-accent-400" />
              <span>Secure payments via LemonSqueezy</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
