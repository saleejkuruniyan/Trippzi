"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Check, Sparkles, Zap } from "lucide-react"

import { useEffect, useState } from "react"

export default function Pricing() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const plans = [
    {
      name: "Single Trip",
      oldPrice: "₹49",
      price: "₹0.00",
      unit: "/ itinerary",
      features: ["1 Custom Itinerary", "PDF Download", "Visa Intelligence", "24h Support"],
      button: "Get Started",
      popular: false,
      desc: "Perfect for a quick weekend getaway."
    },
    {
      name: "Explorer Pro",
      oldPrice: "₹1,499",
      price: "₹0.00",
      unit: "/ month",
      features: ["Unlimited Itineraries", "Premium PDF Layouts", "Priority AI Processing", "Personalized Insights"],
      button: "Claim Free Access",
      popular: true,
      desc: "For the frequent, soul-searching traveler."
    },
    {
      name: "Business",
      oldPrice: "₹4,999",
      price: "₹0.00",
      unit: "/ month",
      features: ["Custom Branding", "API Access", "Bulk Generation", "Enterprise Security"],
      button: "Contact for Business",
      popular: false,
      desc: "Optimized for travel agencies and pros."
    }
  ]

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest mb-4"
            >
              <Sparkles className="w-4 h-4" /> Limited Time Promotion
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">Transparent Pricing</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
              Explore the world with our intelligence-driven planning, now accessible to everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`group relative p-10 rounded-[2.5rem] border transition-all ${plan.popular
                  ? "border-primary ring-1 ring-primary bg-white dark:bg-zinc-900 shadow-2xl"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl"
                  }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                    Most Popular
                  </span>
                )}

                <div className="space-y-2 mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tight">{plan.name}</h3>
                  <p className="text-sm text-zinc-500 font-medium">{plan.desc}</p>
                </div>

                <div className="mb-10 space-y-1">
                  <div className="text-sm font-bold text-zinc-400 line-through tracking-tighter">
                    {plan.oldPrice}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tighter text-primary">{plan.price}</span>
                    <span className="text-zinc-500 font-bold text-sm">{plan.unit}</span>
                  </div>
                </div>

                <ul className="space-y-5 mb-12">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                      <div className="mt-1 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => window.location.href = plan.name === "Business" ? 'mailto:support@trippzi.com' : '/generate'}
                  className={`w-full py-5 rounded-[2rem] font-black text-lg tracking-tighter transition-all flex items-center justify-center gap-2 active:scale-95 ${plan.popular
                    ? "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/80/20"
                    : "bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl shadow-zinc-950/20"
                    }`}
                >
                  <Zap className="w-5 h-5 fill-current" />
                  {plan.button.toUpperCase()}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-10">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
              * Striked prices reflect the regular subscription cost. Free access is part of our launch beta.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
