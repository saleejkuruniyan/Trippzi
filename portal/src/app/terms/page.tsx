"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { Gavel, AlertTriangle, CreditCard, Shield } from "lucide-react"

export default function Terms() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <header className="text-center space-y-4 mb-16">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Gavel className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Terms of Service</h1>
              <p className="text-zinc-500 font-medium max-w-sm mx-auto">The rules and agreements for your journey with Trippzi.</p>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pt-4">Effective Date: April 20, 2026</div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1 space-y-6">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <AlertTriangle className="w-6 h-6 text-amber-500 mb-4" />
                  <h3 className="font-bold mb-2">Verification Required</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">Always verify AI-generated travel details with official sources before booking.</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <CreditCard className="w-6 h-6 text-primary mb-4" />
                  <h3 className="font-bold mb-2">Non-Refundable</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">Digital itineraries are delivered instantly and are generally non-refundable.</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-12 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">1. Acceptance of Terms</h2>
                  <p className="text-sm">By accessing or using the Trippzi platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">2. Use of AI-Powered Services</h2>
                  <p className="text-sm">Trippzi provides intelligently curated travel itineraries synthesized through advanced algorithms. By using the service, you acknowledge that:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>The service is provided "as-is" for planning and inspirational purposes.</li>
                    <li>Trippzi does not guarantee the accuracy of pricing, availability, or operational hours of third-party attractions.</li>
                    <li>Visa information is provided as an intelligence aid and must be confirmed with the respective embassy or consulate of the destination country.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">3. User Accounts & Security</h2>
                  <p className="text-sm">You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate information, including your nationality, to ensure the accuracy of generated travel intelligence.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">4. Payments & Digital Products</h2>
                  <p className="text-sm">All payments are processed securely via Razorpay. Due to the immediate, digital nature of our itineraries:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Fees paid for individual itinerary unlocks or subscriptions are non-refundable.</li>
                    <li>Trippzi reserves the right to modify pricing for its services at any time.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">5. Intellectual Property</h2>
                  <p className="text-sm">All content on the platform, including logos, designs, text, and the underlying AI engine, is the property of Trippzi. Users are granted a limited license to use generated itineraries for personal, non-commercial travel purposes only.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">6. Limitation of Liability</h2>
                  <p className="text-sm">To the maximum extent permitted by law, Trippzi shall not be liable for any indirect, incidental, or consequential damages resulting from your travel decisions, missed flights, or denied entry based on the provided itineraries.</p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">7. Governing Law & Arbitration</h2>
                  <p className="text-sm">These terms are governed by the laws of India. Any dispute, controversy, or claim arising out of these terms shall be resolved through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996, with the venue in Malappuram, Kerala.</p>
                </section>

                <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Updated: April 2026. Trippzi is a trademark of its respective owners.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
