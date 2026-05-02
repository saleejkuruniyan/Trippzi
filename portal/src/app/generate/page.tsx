"use client"

import { useState } from "react"
import { generateItinerary } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, MapPin, Calendar, Wallet, Heart, ShieldCheck, Download } from "lucide-react"

export default function GeneratePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    destination: "",
    duration: 5,
    budget: "Budget",
    style: "Backpacking",
    interests: "",
    source_country: "India"
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await generateItinerary(formData)
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">AI Trip Planner</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-900 dark:text-zinc-50">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-transparent focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
                      placeholder="e.g. Tokyo, Japan"
                      value={formData.destination}
                      onChange={e => setFormData({...formData, destination: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 text-zinc-900 dark:text-zinc-50">Passport Country</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-transparent focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
                    placeholder="For visa rules"
                    value={formData.source_country}
                    onChange={e => setFormData({...formData, source_country: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <Calendar className="w-4 h-4" /> Duration (Days)
                  </label>
                  <input 
                    type="number" min="1" max="30"
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-transparent focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                    <Wallet className="w-4 h-4" /> Budget Style
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-transparent focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                  >
                    <option>Budget</option>
                    <option>Mid-range</option>
                    <option>Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                  <Heart className="w-4 h-4" /> Interests
                </label>
                <textarea 
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-transparent focus:ring-2 focus:ring-blue-500 h-24 text-zinc-900 dark:text-zinc-50"
                  placeholder="e.g. Anime, street food, temples, nightlife"
                  value={formData.interests}
                  onChange={e => setFormData({...formData, interests: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Crafting your trip...</> : 'Generate Personalized Itinerary'}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Result Display */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-xl">
              <header className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{result.itinerary.title || 'Your Itinerary'}</h1>
                  <p className="text-zinc-500">{result.itinerary.overview}</p>
                </div>
                <button className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </header>

              {/* Visa Alert */}
              <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 flex gap-4 mb-8">
                <ShieldCheck className="w-6 h-6 text-orange-600 shrink-0" />
                <div>
                  <p className="font-bold text-orange-800 dark:text-orange-400">Visa Requirements for {formData.source_country} citizens</p>
                  <p className="text-sm text-orange-700 dark:text-orange-500">
                    {result.visa_info.visa_required ? `Visa Required: ${result.visa_info.visa_type}` : 'No Visa Required / Visa on Arrival available.'}
                  </p>
                  <ul className="mt-2 text-xs text-orange-600 dark:text-orange-600 flex flex-wrap gap-x-4 gap-y-1">
                    {result.visa_info.documentation?.map((doc: string) => <li key={doc}>• {doc}</li>)}
                  </ul>
                </div>
              </div>

              {/* Daily Plan */}
              <div className="space-y-6">
                {result.itinerary.days?.map((day: any) => (
                  <div key={day.day_number} className="border-l-4 border-blue-500 pl-6 py-2">
                    <h3 className="font-bold text-lg mb-2">Day {day.day_number}: {day.theme}</h3>
                    <div className="space-y-4">
                      {day.activities?.map((act: any, idx: number) => (
                        <div key={idx} className="flex gap-4">
                          <span className="text-xs font-bold text-zinc-400 w-12">{act.time}</span>
                          <div>
                            <p className="font-semibold text-sm">{act.activity}</p>
                            <p className="text-xs text-zinc-500">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setResult(null)}
              className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium"
            >
              ← Start Over
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
