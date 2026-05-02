"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Terms() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          <div className="space-y-8 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
              <p>By using Trippzi, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">2. AI-Generated Content</h2>
              <p>Trippzi uses artificial intelligence to generate travel itineraries. While we strive for accuracy, we cannot guarantee that all information (including prices, availability, and visa rules) is up-to-date or accurate. Users are responsible for verifying information before travel.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">3. Payment & Refunds</h2>
              <p>Payments for itineraries are non-refundable once the generation process has started. Subscription cancellations will take effect at the end of the current billing cycle.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">4. Intellectual Property</h2>
              <p>The content, logo, and technology of Trippzi are protected by intellectual property laws. You may use the generated itineraries for personal use only.</p>
            </section>
            <p className="pt-8 border-t border-zinc-200 dark:border-zinc-800">Last updated: May 2026</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
