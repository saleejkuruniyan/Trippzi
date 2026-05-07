"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { motion } from "framer-motion"
import { ShieldCheck, Lock, Eye, Zap } from "lucide-react"

export default function Privacy() {
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
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Privacy Policy</h1>
              <p className="text-zinc-500 font-medium max-w-sm mx-auto">How we protect and manage your data at Trippzi.</p>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pt-4">Effective Date: April 20, 2026</div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-1 space-y-6">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <Lock className="w-6 h-6 text-primary mb-4" />
                  <h3 className="font-bold mb-2">Secure by Default</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">We use industry-standard encryption to protect your personal and travel data.</p>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <Eye className="w-6 h-6 text-primary mb-4" />
                  <h3 className="font-bold mb-2">Transparency</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">We never sell your data. We only use it to curate your perfect adventure.</p>
                </div>
              </div>

              <div className="md:col-span-2 space-y-12 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">1. Information We Collect</h2>
                  <p className="text-sm">We collect information to provide better services to all our explorers. This includes:</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex gap-3 items-start"><Zap className="w-4 h-4 text-primary shrink-0 mt-1" /> <strong>Personal Identifiers:</strong> Name, email address, phone number, and mailing address provided during account creation or checkout.</li>
                    <li className="flex gap-3 items-start"><Zap className="w-4 h-4 text-primary shrink-0 mt-1" /> <strong>Visa Intelligence Data:</strong> Your nationality and passport country, which is critical for calculating accurate visa requirements and entry rules.</li>
                    <li className="flex gap-3 items-start"><Zap className="w-4 h-4 text-primary shrink-0 mt-1" /> <strong>Travel Preferences:</strong> Interests, budget levels, and preferred destinations used for intelligent curation.</li>
                    <li className="flex gap-3 items-start"><Zap className="w-4 h-4 text-primary shrink-0 mt-1" /> <strong>Usage Data:</strong> Interaction logs, search queries, and generated itineraries.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">2. How We Use Information</h2>
                  <p className="text-sm">Trippzi uses the collected data to:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Generate personalized, day-wise travel itineraries.</li>
                    <li>Verify and display real-time visa requirements based on your nationality.</li>
                    <li>Process secure payments via our partner, Razorpay.</li>
                    <li>Communicate updates, security alerts, and support responses.</li>
                    <li>Improve our intelligent curation algorithms through anonymized interaction patterns.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">3. Data Sharing & Security</h2>
                  <p className="text-sm">We do not sell your personal information. We share data only with trusted partners necessary to provide our service:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li><strong>Payment Processors:</strong> We use Razorpay for all transactions. Your full credit card or banking details are handled by them and never stored on our servers.</li>
                    <li><strong>Service Providers:</strong> Cloud hosting and AI processing partners who are contractually obligated to protect your data.</li>
                    <li><strong>Legal Compliance:</strong> We may disclose data if required by the laws of India or to protect the safety of our users.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">4. Your Rights</h2>
                  <p className="text-sm">You have the right to:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm">
                    <li>Access and update your personal information via your Profile settings.</li>
                    <li>Request the deletion of your account and all associated personal data.</li>
                    <li>Opt-out of marketing communications at any time.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">5. Intelligence Disclaimer</h2>
                  <p className="text-sm bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    Trippzi uses artificial intelligence to synthesize travel data. While we strive for accuracy, users are advised that information regarding visa rules, costs, and availability can change rapidly. Always verify critical information with official government sources before travel.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">6. Governing Law</h2>
                  <p className="text-sm">This Privacy Policy is governed by the laws of India. Any disputes arising from these policies will be subject to the jurisdiction of the courts in Malappuram, Kerala.</p>
                </section>

                <div className="pt-12 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
                  For any privacy-related inquiries, please contact us at support@trippzi.com
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
