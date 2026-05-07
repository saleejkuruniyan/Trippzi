"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Sparkles, Globe, ShieldCheck, Zap, Compass, Heart } from "lucide-react"
import Image from "next/image"

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">

          {/* Hero Section */}
          <section className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8"
            >
              <Compass className="w-12 h-12 text-primary" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none"
            >
              Travel <br /> <span className="text-primary">Redefined.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto text-zinc-500 text-lg md:text-xl font-medium leading-relaxed"
            >
              Trippzi is the world's most advanced travel curation engine, designed to transform information overload into precision-crafted adventures.
            </motion.p>
          </section>

          {/* Mission Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1000"
                alt="Travel Vision"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-black tracking-tight uppercase">Our Vision</h2>
              <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                <p>
                  In an era where travelers spend more time researching than exploring, we saw a fundamental breakdown in the travel experience. Most planning tools offer generic lists; we offer intelligence.
                </p>
                <p>
                  Trippzi was founded on the idea that travel should be personalized, frictionless, and deeply informed. We bridge the gap between vast global data and your unique identity as an explorer.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-8">
                  <div className="space-y-2">
                    <div className="text-4xl font-black text-primary">100+</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Countries Mapped</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl font-black text-primary">Sec</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">Planning Time</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Pillars */}
          <section className="space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight uppercase">The Trippzi Pillars</h2>
              <p className="text-zinc-500 font-medium">Built on three core principles of modern exploration.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-black uppercase">Intelligence</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">Our engine doesn't just "guess." It synthesizes real-time travel context, cultural nuances, and operational data to create optimized paths.</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-black uppercase">Precision</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">By integrating your nationality into our core logic, we provide exact visa requirements and entry intelligence tailored specifically to you.</p>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 hover:shadow-xl transition-all">
                <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="text-xl font-black uppercase">Soul</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-medium">Technology is our tool, but travel is our passion. We curate hidden gems and local secrets that typical algorithms often overlook.</p>
              </div>
            </div>
          </section>

          {/* Technology Spotlight */}
          <section className="bg-zinc-900 rounded-[3rem] p-8 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <Globe className="w-full h-full scale-150 text-white" />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-xs font-black uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> Next-Gen Technology
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase">The Engine Behind the Journey</h2>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                  We've built a proprietary multi-layer system that combines Large Language Models with real-time search capabilities. Every Trippzi itinerary is a synthesis of thousands of data points—from current currency rates to local festival dates.
                </p>
              </div>
              <div className="space-y-6">
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <h4 className="text-white font-bold mb-2 uppercase text-xs tracking-widest text-primary">Step 1: Contextual Search</h4>
                  <p className="text-sm text-zinc-500">We scan the current travel landscape for real-time prices and availability.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <h4 className="text-white font-bold mb-2 uppercase text-xs tracking-widest text-primary">Step 2: Intelligent Synthesis</h4>
                  <p className="text-sm text-zinc-500">Our engine curates the day-wise flow based on your style and budget.</p>
                </div>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                  <h4 className="text-white font-bold mb-2 uppercase text-xs tracking-widest text-primary">Step 3: Visa Validation</h4>
                  <p className="text-sm text-zinc-500">Real-time entry rules are cross-referenced with your passport country.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Location / Roots Section */}
          <section className="text-center space-y-8">
            <h2 className="text-4xl font-black tracking-tight uppercase">Our Roots</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
              Trippzi is a team of global citizens building for the next generation of explorers. We believe that the best technology is born from a place of passion and authentic curiosity.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
