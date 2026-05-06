"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, BrainCircuit, Wallet, Map } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Tell us where you want to go",
      desc: "Enter your destination and travel dates. We'll handle the rest."
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "AI Analysis",
      desc: "Our engine scans thousands of data points to curate the perfect trip."
    },
    {
      icon: <Wallet className="w-6 h-6" />,
      title: "Budget Planning",
      desc: "Get real-time cost estimations and local spending tips."
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Your Itinerary",
      desc: "A day-by-day guide with hidden gems and local favorites."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How it Works</h1>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              From dream to destination in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
