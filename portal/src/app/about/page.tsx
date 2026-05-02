"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-8">About Trippzi</h1>
            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-400 space-y-6 leading-relaxed">
              <p>
                Trippzi was founded on a simple belief: travel planning should be as exciting as the trip itself. 
                In a world of information overload, we saw a need for a tool that filters out the noise and 
                provides clear, actionable, and personalized travel content.
              </p>
              <p>
                Our team of travel enthusiasts and AI engineers combined their expertise to create the world's 
                first truly "smart" travel engine. We don't just generate lists; we build experiences that 
                take into account your nationality, your budget, and your unique personality.
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white pt-6">Our Mission</h2>
              <p>
                To democratize expert travel planning. We want to give everyone access to the kind of 
                knowledge previously reserved for high-end travel agents, all powered by the speed and 
                precision of artificial intelligence.
              </p>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white pt-6">The Technology</h2>
              <p>
                By leveraging advanced LLMs and real-time documentation databases, Trippzi ensures that every 
                itinerary is not only beautiful but practical and legally compliant.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
