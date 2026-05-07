"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, BrainCircuit, Wallet, Map, ShieldCheck, Zap } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Select your path",
      desc: "Select your passport country, target destination, and specific cities. Define your duration and budget, and let our engine curate."
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: "Intelligent Curation",
      desc: "Our engine synthesizes real-time travel context and cultural IQ to build your plan."
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Visa Intelligence",
      desc: "We cross-reference your passport country with destination rules for exact entry requirements."
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Your Masterplan",
      desc: "Receive a day-by-day high-end guide with locations, costs, and pro tips."
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Zap className="w-8 h-8 text-primary" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">How it works</h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium leading-relaxed">
              From an idea to a fully-realized masterplan in under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <div className="text-8xl font-black">0{i+1}</div>
                </div>
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/80/20">
                  {step.icon}
                </div>
                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{step.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
             <div className="relative z-10 space-y-6">
                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight">Ready for your next adventure?</h2>
                <p className="text-zinc-400 max-w-xl mx-auto font-medium">Stop researching. Start exploring. Let our intelligence curate your perfect trip today.</p>
                <div className="pt-4">
                  <button 
                    onClick={() => window.location.href = '/generate'}
                    className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black text-xl tracking-tighter hover:bg-primary/90 transition-all shadow-2xl shadow-primary/80/20 active:scale-95"
                  >
                    GENERATE ITINERARY
                  </button>
                </div>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
