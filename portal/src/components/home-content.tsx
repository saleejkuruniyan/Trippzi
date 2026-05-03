"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldCheck, CreditCard, Download, Zap } from "lucide-react"

export function HomePageContent() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-widest uppercase mb-8"
            >
              <Zap className="w-3 h-3 fill-current" /> AI-Powered Travel
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-7xl font-sans font-bold tracking-tight mb-8 leading-[1.1]"
            >
              Your Next Great <br />
              <span className="text-blue-600 italic">Adventure</span>, Predicted.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
            >
              We curate personalized, high-end travel itineraries based on your passport, budget, and passions. 
              Skip the planning, keep the discovery.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/generate" className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2">
                Plan My Trip
              </Link>
              <Link href="/destinations" className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all flex items-center justify-center">
                Explore Curated
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-500 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <ShieldCheck className="w-8 h-8" />, title: "Visa-Aware", desc: "Instantly check visa rules based on your passport before you book." },
              { icon: <CreditCard className="w-8 h-8" />, title: "Budget Optimized", desc: "AI-driven cost estimations and budget hacks for every destination." },
              { icon: <Download className="w-8 h-8" />, title: "Offline Access", desc: "Download high-quality PDFs and access your plans anywhere." }
            ].map((f, i) => (
              <motion.div 
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-sans font-bold mb-3">{f.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
