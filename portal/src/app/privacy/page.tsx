"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function Privacy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <div className="space-y-8 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you create an account, generate an itinerary, or contact support. This may include your name, email, nationality, and travel preferences.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">2. How We Use Your Data</h2>
              <p>We use your information to provide, maintain, and improve our services, including the generation of personalized itineraries and the verification of visa requirements.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">3. Data Sharing</h2>
              <p>We do not share your personal data with third parties except as necessary to provide our services (e.g., payment processing via Razorpay) or as required by law.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">4. Your Rights</h2>
              <p>You have the right to access, correct, or delete your personal information at any time via your account settings or by contacting our support team.</p>
            </section>
            <p className="pt-8 border-t border-zinc-200 dark:border-zinc-800">Last updated: May 2026</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
