"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Check } from "lucide-react"

export default function Pricing() {
  const plans = [
    {
      name: "Single Trip",
      price: "₹750",
      features: ["1 Custom Itinerary", "PDF Download", "Visa Requirements", "24h Support"],
      button: "Buy Now",
      popular: false
    },
    {
      name: "Explorer Pro",
      price: "₹2,500",
      features: ["Unlimited Itineraries", "Premium PDF Layouts", "Visa Assistance", "Priority AI Engine"],
      button: "Start Free Trial",
      popular: true
    },
    {
      name: "Business",
      price: "₹8,000",
      features: ["Custom Branding", "API Access", "Bulk Generation", "Account Manager"],
      button: "Contact Sales",
      popular: false
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-zinc-500 dark:text-zinc-400">Choose the plan that fits your travel style.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border ${
                  plan.popular 
                    ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/50 dark:bg-blue-900/10" 
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">{plan.price}</div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <Check className="w-4 h-4 text-blue-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-xl font-bold transition-all ${
                  plan.popular ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90"
                }`}>
                  {plan.button}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
